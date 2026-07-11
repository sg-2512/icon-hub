import {
  EXTENSION_SESSION_TTL_MS,
  getErrorText,
  hashOpaqueToken,
  publicJson,
  publicOptions,
  randomToken,
} from '@/lib/device-auth'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export function OPTIONS() {
  return publicOptions()
}

export async function POST(request: Request) {
  const admin = createSupabaseAdminClient()
  if (!admin) {
    return publicJson({ error: 'Extension authentication is not configured.' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return publicJson({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const deviceCode = typeof body.deviceCode === 'string' ? body.deviceCode.trim() : ''
  if (!deviceCode) return publicJson({ error: 'Missing device code.' }, { status: 400 })

  try {
    const codeHash = hashOpaqueToken(deviceCode)
    const { data: device, error } = await admin
      .from('device_codes')
      .select('approved_by,consumed_at,expires_at')
      .eq('code_hash', codeHash)
      .maybeSingle()

    if (error || !device) return publicJson({ status: 'invalid' }, { status: 404 })
    if (new Date(device.expires_at).getTime() <= Date.now()) {
      return publicJson({ status: 'expired' }, { status: 410 })
    }
    if (device.consumed_at) return publicJson({ status: 'consumed' }, { status: 410 })
    if (!device.approved_by) return publicJson({ status: 'pending' })

    const sessionToken = randomToken(48)
    const sessionExpiresAt = new Date(Date.now() + EXTENSION_SESSION_TTL_MS)
    const { data, error: consumeError } = await admin.rpc('consume_device_code', {
      p_code_hash: codeHash,
      p_token_hash: hashOpaqueToken(sessionToken),
      p_session_expires_at: sessionExpiresAt.toISOString(),
    })

    if (consumeError) throw consumeError
    const result = Array.isArray(data) ? data[0] : data
    if (!result) throw new Error('No session was returned.')

    const { data: userResult } = await admin.auth.admin.getUserById(result.session_user_id)

    return publicJson({
      status: 'authorized',
      token: sessionToken,
      access: {
        email: userResult.user?.email || '',
        product: result.session_product,
        tier: result.entitlement_tier,
        founderNumber: result.entitlement_founder_number,
        expiresAt: result.session_expires_at,
      },
    })
  } catch (error) {
    console.error('Could not finish device sign-in:', error)
    const message = getErrorText(error)
    const safeMessage =
      message.includes('expired_device_code') ? 'The sign-in link expired. Please try again.' :
      message.includes('consumed_device_code') ? 'The sign-in link was already used. Please try again.' :
      message.includes('consume_device_code') || message.includes('schema cache')
        ? 'Device sign-in is not fully configured. Run the latest Supabase migrations and try again.' :
      'Could not finish sign-in.'
    return publicJson({ error: safeMessage }, { status: 400 })
  }
}
