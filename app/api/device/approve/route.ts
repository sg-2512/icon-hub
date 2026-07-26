import { getErrorText, hashOpaqueToken, parseExtensionProduct } from '@/lib/device-auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) {
        return Response.json({ error: 'Invalid request origin.' }, { status: 403 })
      }
    } catch {
      return Response.json({ error: 'Invalid request origin.' }, { status: 403 })
    }
  }

  const supabase = await createServerSupabaseClient()
  const admin = createSupabaseAdminClient()
  if (!supabase || !admin) {
    return Response.json({ error: 'Extension authentication is not configured.' }, { status: 503 })
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (claimsError || typeof userId !== 'string') {
    return Response.json({ error: 'Sign in before approving this device.' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const code = typeof body.code === 'string' ? body.code.trim() : ''
  const product = parseExtensionProduct(body.product)
  if (!code || !product) {
    return Response.json({ error: 'Missing device code or product.' }, { status: 400 })
  }

  try {
    const codeHash = hashOpaqueToken(code)
    const { data: device, error: deviceError } = await admin
      .from('device_codes')
      .select('product,approved_by,consumed_at,expires_at')
      .eq('code_hash', codeHash)
      .maybeSingle()

    const validDbProducts = ['vscode', 'figma', 'chrome', 'framer']
    const expectedDbProduct = validDbProducts.includes(product) ? product : 'figma'

    if (!device || (device.product !== product && device.product !== expectedDbProduct)) {
      return Response.json({ error: 'This sign-in link is invalid.' }, { status: 400 })
    }
    if (new Date(device.expires_at).getTime() <= Date.now()) {
      return Response.json({ error: 'This sign-in link expired. Start sign-in again from the app.' }, { status: 410 })
    }
    if (device.consumed_at) {
      return Response.json({ error: 'This sign-in link was already used. Start sign-in again from the app.' }, { status: 410 })
    }
    if (device.approved_by && device.approved_by !== userId) {
      return Response.json({ error: 'This sign-in link was approved by another account.' }, { status: 409 })
    }

    const { data, error } = await admin.rpc('approve_device_code', {
      p_code_hash: codeHash,
      p_user_id: userId,
    })

    if (error) throw error
    const entitlement = Array.isArray(data) ? data[0] : data
    if (!entitlement) throw new Error('No entitlement was returned.')

    return Response.json({
      product: entitlement.product_id,
      tier: entitlement.entitlement_tier,
      status: entitlement.entitlement_status,
      founderNumber: entitlement.entitlement_founder_number,
      expiresAt: entitlement.entitlement_expires_at,
    })
  } catch (error) {
    console.error('Could not approve device:', error)
    const message = getErrorText(error)
    const status = message.includes('expired') ? 410 : 400
    const safeMessage =
      message.includes('expired_device_code') ? 'This sign-in link expired. Start sign-in again from the app.' :
      message.includes('consumed_device_code') ? 'This sign-in link was already used. Start sign-in again from the app.' :
      message.includes('device_code_already_approved') ? 'This sign-in link was approved by another account.' :
      message.includes('approve_device_code') || message.includes('claim_product_entitlement') || message.includes('schema cache')
        ? 'Device approval is not fully configured. Run the latest Supabase migrations and try again.' :
      'Could not approve this device.'
    return Response.json({ error: safeMessage }, { status })
  }
}
