import snapshot from '../../../data/icon-search.snapshot.json'
import {
  ICON_SITEMAP_PAGE_COUNT,
  ICON_SITEMAP_TOTAL,
} from '../../../lib/icon-sitemap'
import { SITE_URL } from '../../../lib/seo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function buildSitemapIndex() {
  const sitemaps = Array.from(
    { length: ICON_SITEMAP_PAGE_COUNT },
    (_, index) => [
      '<sitemap>',
      `<loc>${SITE_URL}/icons/icon-sitemaps/${index + 1}</loc>`,
      `<lastmod>${snapshot.generatedAt}</lastmod>`,
      '</sitemap>',
    ].join(''),
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps,
    '</sitemapindex>',
  ].join('')
}

export function GET() {
  return new Response(buildSitemapIndex(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      'X-Sitemap-Entries': String(ICON_SITEMAP_TOTAL),
    },
  })
}
