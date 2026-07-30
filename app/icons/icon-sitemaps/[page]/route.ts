import { buildIconSitemapPage } from '../../../../lib/icon-sitemap'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  context: { params: Promise<{ page: string }> },
) {
  const { page } = await context.params
  const pageNumber = Number(page)
  const xml = buildIconSitemapPage(pageNumber)

  if (!xml) {
    return new Response('Sitemap page not found.', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      'X-Sitemap-Page': String(pageNumber),
    },
  })
}
