import { createHash, randomBytes } from 'node:crypto'

export const DEVICE_CODE_TTL_MS = 30 * 60 * 1000
export const EXTENSION_SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000
export const DEVICE_POLL_INTERVAL_SECONDS = 3

export type ExtensionProduct =
  | 'vscode'
  | 'figma'
  | 'chrome'
  | 'framer'
  | 'raycast'
  | 'mcp'
  | 'jetbrains'
  | 'storybook'
  | 'canva'
  | 'tailwind'
  | 'webflow'
  | 'adobe'
  | 'wordpress'
  | 'penpot'

export function parseExtensionProduct(value: unknown): ExtensionProduct | null {
  return value === 'vscode' ||
    value === 'figma' ||
    value === 'chrome' ||
    value === 'framer' ||
    value === 'raycast' ||
    value === 'mcp' ||
    value === 'jetbrains' ||
    value === 'storybook' ||
    value === 'canva' ||
    value === 'tailwind' ||
    value === 'webflow' ||
    value === 'adobe' ||
    value === 'wordpress' ||
    value === 'penpot'
    ? value
    : null
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

export function hashOpaqueToken(token: string) {
  const pepper = process.env.DEVICE_TOKEN_PEPPER
  if (!pepper || pepper.length < 32) {
    throw new Error('DEVICE_TOKEN_PEPPER must contain at least 32 characters.')
  }

  return createHash('sha256')
    .update(`${pepper}:${token}`, 'utf8')
    .digest('hex')
}

export function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || ''
  const [scheme, token] = authorization.split(' ', 2)
  return scheme?.toLowerCase() === 'bearer' && token ? token.trim() : null
}

export function getRequestFingerprint(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const ip = forwardedFor || request.headers.get('x-real-ip') || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return hashOpaqueToken(`${ip}|${userAgent}`)
}

export function publicSiteUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configured) return configured.replace(/\/+$/, '')
  return new URL(request.url).origin
}

export const publicApiHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-iconsearch-product',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'no-store',
}

export function publicJson(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  Object.entries(publicApiHeaders).forEach(([name, value]) => headers.set(name, value))
  return Response.json(body, { ...init, headers })
}

export function publicOptions() {
  return new Response(null, { status: 204, headers: publicApiHeaders })
}

export function getErrorText(error: unknown) {
  if (error instanceof Error) return error.message

  if (error && typeof error === 'object') {
    const values = ['message', 'details', 'hint', 'code']
      .map((key) => {
        const value = (error as Record<string, unknown>)[key]
        return typeof value === 'string' ? value : ''
      })
      .filter(Boolean)

    if (values.length > 0) return values.join(' ')
  }

  return ''
}
