import {
  buildIconSitemapPage,
  ICON_SITEMAP_PAGE_COUNT,
} from '../../../../lib/icon-sitemap'
import { SITE_URL } from '../../../../lib/seo'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

export function generateStaticParams() {
  return Array.from({ length: ICON_SITEMAP_PAGE_COUNT }, (_, index) => ({
    page: `${index + 1}.xml`,
  }))
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ page: string }> },
) {
  const { page } = await context.params
  const xmlPageMatch = /^([1-9]\d*)\.xml$/.exec(page)

  if (!xmlPageMatch) {
    const legacyPageNumber = Number(page)

    if (
      Number.isInteger(legacyPageNumber)
      && legacyPageNumber >= 1
      && legacyPageNumber <= ICON_SITEMAP_PAGE_COUNT
    ) {
      return Response.redirect(
        new URL(`/icons/icon-sitemaps/${legacyPageNumber}.xml`, SITE_URL),
        308,
      )
    }

    return new Response('Sitemap page not found.', {
      status: 404,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    })
  }

  const pageNumber = Number(xmlPageMatch[1])
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
      'Content-Length': String(Buffer.byteLength(xml, 'utf8')),
      'X-Sitemap-Page': String(pageNumber),
    },
  })
}
