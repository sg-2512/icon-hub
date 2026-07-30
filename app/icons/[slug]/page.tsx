import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { gunzipSync } from 'zlib'
import { notFound } from 'next/navigation'
import { allLibraries, resolveLibraryMeta, type IconLibraryMeta } from '../../../data/library-catalog'
import { createPageMetadata, SITE_URL } from '../../../lib/seo'
import CollectionPageClient from './CollectionPageClient'

export const dynamicParams = true

export async function generateStaticParams() {
  const topLibraries = allLibraries.slice(0, 80)
  const paramsSet = new Set<string>()
  
  topLibraries.forEach((lib) => {
    paramsSet.add(lib.slug)
    paramsSet.add(lib.id)
  })

  return Array.from(paramsSet).map((slug) => ({ slug }))
}

type RawDbIcon = {
  id?: string
  name?: string
  displayName?: string
  library?: string
  libraryName?: string
  license?: string
  tags?: string[]
  svgUrl?: string
}

type CollectionIcon = {
  id: string
  name: string
  displayName: string
  library: string
  libraryName: string
  license: string
  tags?: string[]
  svgUrl: string
}

let cachedDb: CollectionIcon[] | null = null

function loadIconsDatabase(): CollectionIcon[] {
  if (cachedDb) return cachedDb
  const gzPath = join(process.cwd(), 'data/canonical-icon-search.json.gz')
  if (existsSync(gzPath)) {
    try {
      const compressedData = readFileSync(gzPath)
      const decompressedData = gunzipSync(compressedData).toString('utf-8')
      const rawList = JSON.parse(decompressedData) as RawDbIcon[]
      if (Array.isArray(rawList)) {
        cachedDb = rawList.map((item) => ({
          id: item.id || `${item.library}-${item.name}`,
          name: item.name || '',
          displayName: item.displayName || item.name || '',
          library: item.library || '',
          libraryName: item.libraryName || '',
          license: item.license || 'MIT',
          tags: item.tags || [],
          svgUrl: item.svgUrl || `/api/svg/${item.library}/${item.name}`,
        }))
        return cachedDb
      }
    } catch (e) {
      console.error('Error reading canonical database for library page:', e)
    }
  }
  return []
}

function getIconsForLibrary(meta: IconLibraryMeta): CollectionIcon[] {
  const db = loadIconsDatabase()
  const targetId = meta.id.toLowerCase()
  const targetSlug = meta.slug.toLowerCase()

  const matched = db.filter((icon) => {
    const iconLib = icon.library.toLowerCase()
    return iconLib === targetId || iconLib === targetSlug || iconLib === `iconify-${targetSlug}`
  })

  return matched
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = resolveLibraryMeta(slug)
  if (!meta) return {}

  return createPageMetadata({
    title: `${meta.name}: ${meta.license} License & ${meta.iconCount.toLocaleString('en-US')} Free SVG Icons`,
    description: `Browse ${meta.iconCount.toLocaleString('en-US')} ${meta.name} SVG icons under the ${meta.license} license. Customize color and stroke width, then copy JSX or download SVG, PNG, and WebP.`,
    path: `/icons/${meta.slug}`,
    imageAlt: `${meta.name} SVG icon collection on IconSearch`,
  })
}

export default async function LibraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = resolveLibraryMeta(slug)

  if (!meta) {
    notFound()
  }

  const icons = getIconsForLibrary(meta)
  const canonicalUrl = `${SITE_URL}/icons/${encodeURIComponent(meta.slug)}`

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#collection`,
        name: meta.name,
        description: `Collection of ${meta.iconCount} open-source vector SVG icons in ${meta.name}.`,
        url: canonicalUrl,
        inLanguage: 'en',
        isPartOf: {
          '@id': `${SITE_URL}/#website`,
        },
        breadcrumb: {
          '@id': `${canonicalUrl}#breadcrumb`,
        },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: icons.length,
          itemListElement: icons.slice(0, 24).map((icon, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${canonicalUrl}/${encodeURIComponent(icon.name)}`,
            name: icon.displayName || icon.name,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Icon Libraries', item: `${SITE_URL}/free-svg-icons` },
          { '@type': 'ListItem', position: 3, name: meta.name, item: canonicalUrl },
        ],
      },
    ],
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema).replace(/</g, '\\u003c') }}
      />
      <CollectionPageClient meta={meta} icons={icons} />
    </main>
  )
}
