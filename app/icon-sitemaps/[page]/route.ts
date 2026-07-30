import { SITE_URL } from '../../../lib/seo'

export async function GET(
  _request: Request,
  context: { params: Promise<{ page: string }> },
) {
  const { page } = await context.params
  const normalizedPage = page.endsWith('.xml') ? page : `${page}.xml`
  return Response.redirect(
    new URL(`/icons/icon-sitemaps/${encodeURIComponent(normalizedPage)}`, SITE_URL),
    308,
  )
}
