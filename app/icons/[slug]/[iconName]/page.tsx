import { notFound } from 'next/navigation'
import Link from 'next/link'
import { loadIcons } from '../../../api/icon-search/route'
import IconDetailClient from './IconDetailClient'
import { namedLibraries } from '../../../../data/library-catalog'
import { getCleanSvgUrl } from '../../../../lib/icon-preview'

export const dynamic = 'force-dynamic'

const namedLibrarySlugs = new Set(namedLibraries.map((library) => library.slug))

function getLibraryHref(slug: string): string {
  if (namedLibrarySlugs.has(slug)) return `/icons/${slug}`
  if (slug.startsWith('iconify-')) {
    return `/icon-search?lib=iconify&iconifySet=${encodeURIComponent(slug.replace(/^iconify-/, ''))}`
  }
  if (slug === 'material-icons') return '/icon-search?lib=iconify&iconifySet=material-symbols'
  if (slug === 'simple-icons') return '/icon-search?lib=iconify&iconifySet=simple-icons'
  return '/icon-search'
}

function getDbLibrariesForSlug(slug: string): string[] {
  switch (slug) {
    case 'lucide-icons': return ['lucide-icons']
    case 'heroicons': return ['heroicons']
    case 'tabler-icons': return ['tabler-icons']
    case 'phosphor-icons': return ['phosphor-icons']
    case 'remix-icon': return ['remix-icon']
    case 'feather-icons': return ['feather-icons']
    case 'bootstrap-icons': return ['bootstrap-icons']
    case 'radix-icons': return ['radix-icons']
    case 'font-awesome': return [
      'iconify-fa6-solid', 'iconify-fa6-regular', 'iconify-fa6-brands',
      'iconify-fa-solid', 'iconify-fa-regular', 'iconify-fa-brands',
      'iconify-fa', 'iconify-fa7-solid', 'iconify-fa7-regular', 'iconify-fa7-brands'
    ]
    case 'material-icons': return [
      'iconify-material-symbols', 'iconify-material-symbols-light', 'iconify-ic'
    ]
    case 'simple-icons': return ['iconify-simple-icons']
    case 'iconoir': return ['iconoir', 'iconify-iconoir']
    case 'ionicons': return ['ionicons', 'iconify-ion']
    case 'octicons': return ['octicons', 'iconify-octicon']
    case 'ant-design-icons': return ['ant-design-icons', 'iconify-ant-design']
    default:
      return [slug, `iconify-${slug}`]
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string, iconName: string }> }) {
  const { slug, iconName } = await params
  const allIcons = loadIcons()
  const dbLibs = getDbLibrariesForSlug(slug)
  const icon = allIcons.find(i =>
    dbLibs.includes(i.library) && i.name.toLowerCase() === iconName.toLowerCase()
  )

  if (!icon) {
    return {
      title: 'Icon Not Found - IconSearch',
    }
  }

  const displayName = icon.displayName || icon.name
  const title = `${displayName} SVG Icon — Customize, Copy & Download Free (${icon.libraryName})`
  const description = `Download the free ${displayName} SVG icon from ${icon.libraryName}. Customize color, size, and stroke width. Copy raw SVG code, React component JSX, or Base64 instantly.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://iconsearch.info/icons/${slug}/${iconName}`,
    },
    openGraph: {
      title,
      description,
      url: `https://iconsearch.info/icons/${slug}/${iconName}`,
      siteName: 'IconSearch',
      images: [
        {
          url: icon.svgUrl,
          width: 256,
          height: 256,
          alt: `${displayName} icon preview`,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [icon.svgUrl],
    }
  }
}

export default async function IconDetailPage({ params }: { params: Promise<{ slug: string, iconName: string }> }) {
  const { slug, iconName } = await params
  const allIcons = loadIcons()
  const dbLibs = getDbLibrariesForSlug(slug)

  const icon = allIcons.find(i =>
    dbLibs.includes(i.library) && i.name.toLowerCase() === iconName.toLowerCase()
  )

  if (!icon) notFound()

  // Fetch raw SVG on server side for inline injection
  let rawSvg = ''
  try {
    const cleanUrl = getCleanSvgUrl(icon.svgUrl, icon.library)
    const res = await fetch(cleanUrl, { next: { revalidate: 86400 } })
    if (res.ok) {
      rawSvg = await res.text()
    }
  } catch (e) {
    console.error('Failed to fetch SVG for icon:', icon.id, e)
  }

  // Find related icons: from same library, sharing tags or similar names
  const relatedIcons = allIcons
    .filter(i => i.library === icon.library && i.id !== icon.id)
    .filter(i => {
      const sharedTags = i.tags?.filter((t: string) => icon.tags?.includes(t)) || []
      return sharedTags.length > 0 || i.name.includes(icon.name) || icon.name.includes(i.name)
    })
    .slice(0, 12)

  // Fallback if not enough matching tags
  if (relatedIcons.length < 6) {
    const fallback = allIcons
      .filter(i => i.library === icon.library && i.id !== icon.id)
      .slice(0, 12)
    relatedIcons.push(...fallback.filter(fi => !relatedIcons.some(ri => ri.id === fi.id)))
  }
  const finalRelated = relatedIcons.slice(0, 12)

  const displayName = icon.displayName || icon.name
  const libraryHref = getLibraryHref(slug)

  // JSON-LD Structured Data
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://iconsearch.info" },
      { "@type": "ListItem", "position": 2, "name": "Icon Libraries", "item": "https://iconsearch.info/free-svg-icons" },
      { "@type": "ListItem", "position": 3, "name": icon.libraryName, "item": `https://iconsearch.info${libraryHref}` },
      { "@type": "ListItem", "position": 4, "name": `${displayName} Icon`, "item": `https://iconsearch.info/icons/${slug}/${iconName}` }
    ]
  }

  const jsonLdImage = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": `${displayName} SVG Icon`,
    "description": `Free vector SVG icon ${displayName} from ${icon.libraryName} collection. MIT/open-source licensed.`,
    "contentUrl": icon.svgUrl,
    "thumbnailUrl": icon.svgUrl,
    "license": "https://iconsearch.info/licenses",
    "acquireLicensePage": "https://iconsearch.info/licenses"
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdImage) }}
      />

      {/* Breadcrumb & Back to Search container */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <Link href="/free-svg-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Libraries</Link>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <Link href={libraryHref} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{icon.libraryName}</Link>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span style={{ color: 'var(--accent)' }}>{iconName}</span>
        </div>

        <Link
          href="/icon-search"
          style={{
            color: 'var(--accent)',
            textDecoration: 'none',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid var(--border)',
            padding: '6px 12px',
            borderRadius: '8px',
            background: 'var(--bg-card)',
            transition: 'all 0.15s ease'
          }}
          className="link-hover"
        >
          <span>← Back to Search</span>
        </Link>
      </div>

      <IconDetailClient
        icon={icon}
        initialSvg={rawSvg}
        relatedIcons={finalRelated}
        librarySlug={slug}
      />
    </main>
  )
}
