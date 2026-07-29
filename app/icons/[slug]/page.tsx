import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { gunzipSync } from 'zlib'
import { notFound } from 'next/navigation'
import { allLibraries, resolveLibraryMeta, type IconLibraryMeta } from '../../../data/library-catalog'
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

  return {
    title: `${meta.name} — Free Vector SVG Icon Collection (${meta.iconCount.toLocaleString('en-US')})`,
    description: `Explore ${meta.iconCount.toLocaleString('en-US')} high quality, open-source ${meta.name} icons. Licensed under ${meta.license}. Customize colors, stroke width, download SVG, PNG, WebP, or copy JSX React code.`,
    alternates: {
      canonical: `https://iconsearch.info/icons/${meta.slug}`,
    },
    openGraph: {
      title: `${meta.name} — Vector SVG Icon Collection`,
      description: `Browse and customize ${meta.iconCount.toLocaleString('en-US')} free ${meta.name} icons.`,
      url: `https://iconsearch.info/icons/${meta.slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${meta.name} Collection`,
      description: `${meta.iconCount.toLocaleString('en-US')} free vector icons in ${meta.name}.`,
    },
  }
}

export default async function LibraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const meta = resolveLibraryMeta(slug)

  if (!meta) {
    notFound()
  }

  const icons = getIconsForLibrary(meta)

  // Structured Data Schema
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: meta.name,
    description: `Collection of ${meta.iconCount} open-source vector SVG icons in ${meta.name}.`,
    url: `https://iconsearch.info/icons/${meta.slug}`,
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <CollectionPageClient meta={meta} icons={icons} />
    </main>
  )
}
