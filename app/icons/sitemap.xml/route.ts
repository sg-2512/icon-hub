import snapshot from '../../../data/icon-search.snapshot.json'
import {
  ICON_SITEMAP_PAGE_COUNT,
  ICON_SITEMAP_TOTAL,
} from '../../../lib/icon-sitemap'
import { SITE_URL } from '../../../lib/seo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

let cachedXml: string | null = null

function buildSitemapXml() {
  if (cachedXml) return cachedXml

  const sitemaps = Array.from(
    { length: ICON_SITEMAP_PAGE_COUNT },
    (_, index) => [
      '<sitemap>',
      `<loc>${SITE_URL}/icons/icon-sitemaps/${index + 1}</loc>`,
      `<lastmod>${snapshot.generatedAt}</lastmod>`,
      '</sitemap>',
    ].join(''),
  )

  cachedXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps,
    '</sitemapindex>',
  ].join('')

  return cachedXml
}

export function GET() {
  return new Response(buildSitemapXml(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      'X-Sitemap-Entries': String(ICON_SITEMAP_TOTAL),
    },
  })
}
