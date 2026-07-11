import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { gunzipSync } from 'zlib'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCleanSvgUrl } from '../../../../lib/icon-preview'

export const dynamicParams = true

// 1. The 100 most popular developer search terms to pre-render statically at build time
const POPULAR_TAGS = [
  'arrow', 'settings', 'user', 'bell', 'heart', 'cloud', 'security', 'commerce', 'edit', 'media',
  'alert', 'weather', 'device', 'design', 'communication', 'building', 'health', 'finance', 'search', 'home',
  'star', 'trash', 'lock', 'key', 'eye', 'check', 'plus', 'minus', 'download', 'upload',
  'share', 'mail', 'message', 'chat', 'phone', 'call', 'send', 'inbox', 'envelope', 'folder',
  'cpu', 'bot', 'chip', 'robot', 'keyboard', 'laptop', 'tablet', 'monitor', 'wifi', 'battery',
  'tv', 'plug', 'database', 'server', 'terminal', 'code', 'file', 'shield', 'auth', 'unlock',
  'password', 'cart', 'shop', 'card', 'price', 'wallet', 'dollar', 'euro', 'money', 'bag',
  'bank', 'coins', 'percent', 'chart', 'graph', 'analytics', 'target', 'gift', 'delivery', 'tag',
  'play', 'music', 'video', 'sound', 'audio', 'volume', 'camera', 'image', 'picture', 'disc',
  'film', 'mic', 'sun', 'rain', 'snow', 'wind', 'temp', 'leaf', 'tree', 'flower'
]

export async function generateStaticParams() {
  return POPULAR_TAGS.map(tag => ({ tag: `${tag}-icons` }))
}

// In-memory cache for loading the 354,523 icons
let cachedIcons: any[] | null = null

function loadIconsDatabase(): any[] {
  if (cachedIcons) return cachedIcons
  const canonicalPathGz = join(process.cwd(), 'data/canonical-icon-search.json.gz')
  if (existsSync(canonicalPathGz)) {
    try {
      const compressedData = readFileSync(canonicalPathGz)
      const decompressedData = gunzipSync(compressedData).toString('utf-8')
      const list = JSON.parse(decompressedData)
      cachedIcons = Array.isArray(list) ? list : []
      return cachedIcons
    } catch (e) {
      console.error('Error loading canonical database for pSEO collection:', e)
    }
  }
  return []
}

// Filter icons by matching tag with 100 limit for speed
function getMatchingIconsForTag(tag: string): any[] {
  const allIcons = loadIconsDatabase()
  const cleanTag = tag.toLowerCase().trim()
  
  // Filter for matching names or tags, ensuring they are verified legalSafe for commercial use
  const filtered = allIcons.filter(icon => {
    if (!icon.legalSafe) return false
    const name = icon.name.toLowerCase()
    const tags = icon.tags ? icon.tags.map((t: string) => t.toLowerCase()) : []
    return name.includes(cleanTag) || tags.some((t: string) => t === cleanTag)
  })
  
  // Limit to 100 for high-performance and lightweight pages
  return filtered.slice(0, 100)
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const cleanTag = tag.replace('-icons', '').toLowerCase()
  const capitalized = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1)
  
  return {
    title: `100+ Free ${capitalized} SVG Icons — Customizer & React Code (2026)`,
    description: `Browse and export the best free, MIT licensed ${cleanTag} icons. Adjust colors, stroke-width, and sizes dynamically. Instant download SVG sprites, JSX, Vue and clean Tailwind codes.`,
    alternates: {
      canonical: `https://iconsearch.info/icons/collection/${tag}`,
    },
    openGraph: {
      title: `100+ Free ${capitalized} SVG Icons — Customizer & React Code`,
      description: `Browse, customize, and export the best free ${cleanTag} SVG icons.`,
      url: `https://iconsearch.info/icons/collection/${tag}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `100+ Free ${capitalized} SVG Icons`,
      description: `Customize and download free ${cleanTag} icons.`,
      creator: '@IconSearchinfo',
    },
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params
  const cleanTag = tag.replace('-icons', '').toLowerCase()
  const capitalized = cleanTag.charAt(0).toUpperCase() + cleanTag.slice(1)
  
  const matchingIcons = getMatchingIconsForTag(cleanTag)
  
  if (matchingIcons.length === 0) {
    notFound()
  }

  // Format clean JSON-LD structured schemas
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://iconsearch.info" },
      { "@type": "ListItem", "position": 2, "name": "Collections", "item": "https://iconsearch.info/icons/category" },
      { "@type": "ListItem", "position": 3, "name": `${capitalized} Icons`, "item": `https://iconsearch.info/icons/collection/${tag}` },
    ]
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Can I use these ${cleanTag} icons commercially?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, absolutely. All ${matchingIcons.length} ${cleanTag} icons displayed in this curated collection utilize highly permissive open-source licenses (MIT, ISC, or CC0), allowing unlimited free commercial and private usage without mandatory attribution.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I import these ${cleanTag} icons into React or Next.js?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Each icon in our registry includes customized integration guides. You can easily click any icon in the collection to inspect its specific package name, import syntax, and copy-paste it directly as a clean SVG or JSX component.`
        }
      }
    ]
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>
      
      {/* Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Visual Breadcrumb navigation */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link href="/icons/category" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Collections</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>{capitalized} Icons</span>
      </nav>

      {/* Hero Intro */}
      <section style={{ margin: '0 0 48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // CURATED NICHE COLLECTION
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4.5vw, 52px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px' }}>
          Free <span style={{ color: 'var(--accent)' }}>{capitalized} SVG Icons</span> for Modern Web UIs
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '850px', lineHeight: 1.8 }}>
          Finding consistent and legal {cleanTag} icons for technical web products is now simple. We compiled over 
          <strong> {matchingIcons.length} premium, commercially-safe {cleanTag} icons</strong> across Lucide, Heroicons, Tabler, 
          Phosphor, and Radix. You can search, inspect their package size, and copy their code directly. Use our central 
          <Link href="/icon-search" style={{ color: 'var(--accent)', textDecoration: 'none', margin: '0 4px' }}>interactive customizer</Link> 
          to adjust strokes and colors dynamically before exporting.
        </p>
      </section>

      {/* Interactive Collection Grid */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '24px' }}>
          {capitalized.toUpperCase()} ICONS CATALOG ({matchingIcons.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '12px',
        }}>
          {matchingIcons.map(icon => (
            <Link 
              key={icon.id}
              href={`/icon-search?q=${icon.name}&lib=${icon.library}`}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                textDecoration: 'none',
                transition: 'all 0.2s',
                textAlign: 'center',
                overflow: 'hidden'
              }}
              className="card-hover-pseo"
            >
              {/* Load clean SVG preview instantly from CDN */}
              <div style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '8px',
                border: '1px solid var(--border)',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={getCleanSvgUrl(icon.svgUrl, icon.library)} 
                  alt={icon.displayName} 
                  width="24" 
                  height="24"
                  style={{
                    filter: 'invert(1) opacity(0.8)',
                    maxWidth: '100%',
                    maxHeight: '100%',
                  }}
                />
              </div>
              <span style={{ 
                fontSize: '11px', 
                color: 'var(--text)', 
                fontFamily: 'JetBrains Mono, monospace',
                wordBreak: 'break-all',
                lineHeight: 1.2
              }}>
                {icon.displayName}
              </span>
              <span style={{ 
                fontSize: '9px', 
                color: 'var(--text-dim)', 
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {icon.library.replace('-icons', '')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions Visual Section */}
      <section style={{ marginBottom: '60px', paddingBottom: '60px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '24px' }}>
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
              Are these {cleanTag} icons free to use commercially?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Yes, all icons cataloged under the {cleanTag} collection page are certified open-source, utilizing highly permissive licenses such as MIT, ISC, or public domain dedications. This covers SaaS dashboards, landing pages, corporate applications, and print designs completely royalty-free.
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)' }}>
              How do I use these in Tailwind CSS or React?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              Simply click on any icon above to open it directly in our editor workspace. From there, you can adjust the stroke weight or scale, and copy the ready-to-paste Tailwind code or clean inline SVG markup instantly without installing extra npm packages.
            </p>
          </div>
        </div>
      </section>

      {/* Internal Linking Footer to pass SEO juice */}
      <section style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)', border: '1px solid var(--border)', borderRadius: '16px', padding: '36px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '24px' }}>
          EXPLORE MORE ICON COLLECTIONS & RESOURCES
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>Top Library Guides</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/icons/lucide-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Lucide Icons React Guide</Link>
              <Link href="/icons/heroicons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Heroicons Integration Guide</Link>
              <Link href="/icons/tabler-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Tabler Icons NPM Guide</Link>
              <Link href="/icons/phosphor-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Phosphor Icons React Guide</Link>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>Popular Collections</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/icons/collection/arrow-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Curated Arrow Icons</Link>
              <Link href="/icons/collection/security-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Security & Shield Icons</Link>
              <Link href="/icons/collection/commerce-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Finance & Cart Icons</Link>
              <Link href="/icons/collection/weather-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Weather & Nature Icons</Link>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>Optimizations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/typescript-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Strictly Typed Icons Guide</Link>
              <Link href="/licenses" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>License Reference Sheet</Link>
              <Link href="/best-for-you" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>Interactive Icon Quiz →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
