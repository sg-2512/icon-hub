import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import { resolveLibraryMeta } from '../data/library-catalog'
import snapshot from '../data/icon-search.snapshot.json'
import { SITE_URL } from './seo'

export const ICON_SITEMAP_PAGE_SIZE = 10_000
export const ICON_SITEMAP_TOTAL = snapshot.totalIcons
export const ICON_SITEMAP_PAGE_COUNT = Math.ceil(
  ICON_SITEMAP_TOTAL / ICON_SITEMAP_PAGE_SIZE,
)

type RawSitemapIcon = {
  library?: string
  name?: string
}

type SitemapIcon = {
  library: string
  name: string
}

let cachedIcons: SitemapIcon[] | null = null
const librarySlugCache = new Map<string, string>()

function loadSitemapIcons(): SitemapIcon[] {
  if (cachedIcons) return cachedIcons

  const filePath = join(process.cwd(), 'data', 'canonical-icon-search.json.gz')
  const parsed = JSON.parse(
    gunzipSync(readFileSync(filePath)).toString('utf8'),
  ) as unknown
  const rawIcons: RawSitemapIcon[] = Array.isArray(parsed) ? parsed : []

  cachedIcons = rawIcons
    .filter((icon): icon is SitemapIcon => Boolean(icon.library && icon.name))
    .map(({ library, name }) => ({ library, name }))

  return cachedIcons
}

function getCanonicalLibrarySlug(library: string): string {
  const cachedSlug = librarySlugCache.get(library)
  if (cachedSlug) return cachedSlug

  const slug = resolveLibraryMeta(library)?.slug || library
  librarySlugCache.set(library, slug)
  return slug
}

export function buildIconSitemapPage(pageNumber: number): string | null {
  if (
    !Number.isInteger(pageNumber)
    || pageNumber < 1
    || pageNumber > ICON_SITEMAP_PAGE_COUNT
  ) {
    return null
  }

  const icons = loadSitemapIcons()
  const start = (pageNumber - 1) * ICON_SITEMAP_PAGE_SIZE
  const pageIcons = icons.slice(start, start + ICON_SITEMAP_PAGE_SIZE)

  const urls = pageIcons.map((icon) => {
    const canonicalLibrary = encodeURIComponent(getCanonicalLibrarySlug(icon.library))
    const sourceLibrary = encodeURIComponent(icon.library)
    const name = encodeURIComponent(icon.name)
    const pageUrl = `${SITE_URL}/icons/${canonicalLibrary}/${name}`
    const imageUrl = `${SITE_URL}/api/svg/${sourceLibrary}/${name}`

    return [
      '<url>',
      `<loc>${pageUrl}</loc>`,
      `<lastmod>${snapshot.generatedAt}</lastmod>`,
      '<image:image>',
      `<image:loc>${imageUrl}</image:loc>`,
      '</image:image>',
      '</url>',
    ].join('')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...urls,
    '</urlset>',
  ].join('')
}
