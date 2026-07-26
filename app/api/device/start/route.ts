import {
  DEVICE_CODE_TTL_MS,
  DEVICE_POLL_INTERVAL_SECONDS,
  getRequestFingerprint,
  hashOpaqueToken,
  parseExtensionProduct,
  publicJson,
  publicOptions,
  publicSiteUrl,
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

  const product = parseExtensionProduct(body.product)
  if (!product) {
    return publicJson(
      {
        error:
          'Product must be vscode, figma, chrome, framer, raycast, mcp, jetbrains, storybook, canva, tailwind, webflow, adobe, wordpress, or penpot.',
      },
      { status: 400 }
    )
  }

  try {
    const fingerprint = getRequestFingerprint(request)
    const since = new Date(Date.now() - DEVICE_CODE_TTL_MS).toISOString()
    const { count } = await admin
      .from('device_codes')
      .select('id', { count: 'exact', head: true })
      .eq('request_fingerprint', fingerprint)
      .gte('created_at', since)

    if ((count || 0) >= 100) {
      return publicJson({ error: 'Too many sign-in attempts. Try again shortly.' }, { status: 429 })
    }

    const deviceCode = randomToken()
    const expiresAt = new Date(Date.now() + DEVICE_CODE_TTL_MS)
    const clientName =
      typeof body.clientName === 'string'
        ? body.clientName.trim().slice(0, 80) || 'IconSearch'
        : 'IconSearch'

    // Auto-ensure product exists in products table
    await admin.from('products').upsert(
      { id: product, name: `IconSearch for ${product.charAt(0).toUpperCase() + product.slice(1)}`, founder_limit: 500 },
      { onConflict: 'id' }
    )

    const { error } = await admin.from('device_codes').insert({
      code_hash: hashOpaqueToken(deviceCode),
      product,
      client_name: clientName,
      request_fingerprint: fingerprint,
      expires_at: expiresAt.toISOString(),
    })

    if (error) throw error

    const verificationUrl = new URL('/connect', publicSiteUrl(request))
    verificationUrl.searchParams.set('product', product)
    verificationUrl.searchParams.set('code', deviceCode)

    return publicJson({
      deviceCode,
      verificationUri: new URL('/connect', publicSiteUrl(request)).toString(),
      verificationUriComplete: verificationUrl.toString(),
      expiresIn: Math.floor(DEVICE_CODE_TTL_MS / 1000),
      interval: DEVICE_POLL_INTERVAL_SECONDS,
    })
  } catch (error) {
    console.error('Could not start extension authentication:', error)
    const message = error instanceof Error ? error.message : String(error)
    return publicJson({ error: 'Could not start sign-in.', details: message }, { status: 500 })
  }
}
