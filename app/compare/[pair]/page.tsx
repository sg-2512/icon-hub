import { icons } from '../../../lib/icons'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SEARCHABLE_ICON_COUNT } from '../../../data/library-catalog'

export async function generateStaticParams() {
  const pairs = []
  for (let i = 0; i < icons.length; i++) {
    for (let j = i + 1; j < icons.length; j++) {
      pairs.push({ pair: `${icons[i].slug}-vs-${icons[j].slug}` })
    }
  }
  return pairs
}

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params
  const [slugA, , slugB] = pair.split('-vs-')
  const libA = icons.find(i => i.slug === slugA)
  const libB = icons.find(i => i.slug === slugB)
  if (!libA || !libB) return {}
  return {
    title: `${libA.name} vs ${libB.name} — Detailed Comparison for React (2026)`,
    description: `Comprehensive comparison of ${libA.name} (${libA.iconCount.toLocaleString('en-US')} icons) and ${libB.name} (${libB.iconCount.toLocaleString('en-US')} icons). We compare licenses, bundle sizes, tree-shaking, TypeScript support, and React import syntax to help you decide.`,
    alternates: {
      canonical: `https://iconsearch.info/compare/${pair}`,
    },
    openGraph: {
      title: `${libA.name} vs ${libB.name} — Detailed Comparison for React`,
      description: `Comprehensive comparison of ${libA.name} and ${libB.name}. We compare licenses, bundle sizes, tree-shaking, and syntax.`,
      url: `https://iconsearch.info/compare/${pair}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${libA.name} vs ${libB.name} Comparison`,
      description: `Compare licenses, bundle sizes, tree-shaking, and React usage for ${libA.name} and ${libB.name}.`,
      creator: '@IconSearchinfo',
    },
  }
}

// Helper: get a license explanation string
function getLicenseInfo(license: string, name: string): string {
  if (license === 'MIT') return `${name} uses the MIT License — one of the most permissive open-source licenses. You can use it in any commercial project, modify the icons, and redistribute them freely. The only requirement is preserving the copyright notice in copies of the software.`
  if (license === 'ISC') return `${name} uses the ISC License, which is functionally equivalent to the MIT License but written in simpler language. You are free to use it in commercial projects, modify icons, and redistribute without restriction. The only condition is preserving the copyright notice.`
  if (license.includes('Apache')) return `${name} uses the Apache 2.0 License, which allows free commercial use, modification, and distribution. It also includes an express patent grant. You must include a copy of the license and provide attribution when redistributing original files.`
  if (license.includes('CC0')) return `${name} uses CC0 1.0 (Public Domain). All copyrights have been waived. You can copy, modify, distribute, and use the icons for any purpose — including commercial — without attribution.`
  return `${name} uses the ${license} license, a permissive open-source license that allows free commercial use in web and mobile applications.`
}

export default async function ComparisonPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params
  const [slugA, slugB] = pair.split('-vs-')
  const a = icons.find(i => i.slug === slugA)
  const b = icons.find(i => i.slug === slugB)

  if (!a || !b) notFound()

  const hasLucide = a.slug === 'lucide-icons' || b.slug === 'lucide-icons'

  const rows = [
    { label: 'Total Icons', a: a.iconCount.toLocaleString('en-US'), b: b.iconCount.toLocaleString('en-US'), winner: a.iconCount > b.iconCount ? 'a' : a.iconCount < b.iconCount ? 'b' : 'none' },
    { label: 'GitHub Stars', a: a.stars.toLocaleString('en-US'), b: b.stars.toLocaleString('en-US'), winner: a.stars > b.stars ? 'a' : a.stars < b.stars ? 'b' : 'none' },
    { label: 'License', a: a.license, b: b.license, winner: 'none' },
    { label: 'TypeScript', a: a.typescript ? '✓ Yes' : '✗ No', b: b.typescript ? '✓ Yes' : '✗ No', winner: a.typescript && !b.typescript ? 'a' : !a.typescript && b.typescript ? 'b' : 'none' },
    { label: 'Tree Shakable', a: a.treeshakable ? '✓ Yes' : '✗ No', b: b.treeshakable ? '✓ Yes' : '✗ No', winner: a.treeshakable && !b.treeshakable ? 'a' : !a.treeshakable && b.treeshakable ? 'b' : 'none' },
    { label: 'Figma Plugin', a: a.figmaPlugin ? '✓ Yes' : '✗ No', b: b.figmaPlugin ? '✓ Yes' : '✗ No', winner: a.figmaPlugin && !b.figmaPlugin ? 'a' : !a.figmaPlugin && b.figmaPlugin ? 'b' : 'none' },
    { label: 'Styles', a: a.style.join(', '), b: b.style.join(', '), winner: a.style.length > b.style.length ? 'a' : a.style.length < b.style.length ? 'b' : 'none' },
    { label: 'Frameworks', a: a.frameworks.join(', '), b: b.frameworks.join(', '), winner: a.frameworks.length > b.frameworks.length ? 'a' : a.frameworks.length < b.frameworks.length ? 'b' : 'none' },
  ]

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Which is better: ${a.name} or ${b.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Choosing between ${a.name} and ${b.name} depends entirely on your project's technical requirements and design aesthetic. ${a.name} provides ${a.iconCount.toLocaleString('en-US')} icons and is notable for ${a.pros[0].toLowerCase()}, while ${b.name} offers ${b.iconCount.toLocaleString('en-US')} icons and is best known for ${b.pros[0].toLowerCase()}.`
        }
      },
      {
        "@type": "Question",
        "name": `Can I use ${a.name} and ${b.name} for commercial projects?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes. Both icon libraries are highly permissive and free for commercial use. ${a.name} operates under the ${a.license} license, and ${b.name} operates under the ${b.license} license. You can safely use either in your SaaS apps, mobile applications, or client projects.`
        }
      },
      {
        "@type": "Question",
        "name": `Are ${a.name} and ${b.name} tree-shakable in React?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${a.name} ${a.treeshakable ? 'supports' : 'does not support'} tree-shaking, and ${b.name} ${b.treeshakable ? 'supports' : 'does not support'} tree-shaking. Tree-shaking is crucial for keeping your JavaScript bundle sizes small by only including the specific SVG icons you import into your components.`
        }
      }
    ]
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Structured Data: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://iconsearch.info" },
            { "@type": "ListItem", "position": 2, "name": "Compare", "item": "https://iconsearch.info/compare" },
            { "@type": "ListItem", "position": 3, "name": `${a.name} vs ${b.name}`, "item": `https://iconsearch.info/compare/${pair}` },
          ]
        })}}
      />

      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link href="/compare" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Compare</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>{a.name} vs {b.name}</span>
      </nav>

      {/* Hero */}
      <section style={{ margin: '0 0 48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // IN-DEPTH ICON LIBRARY COMPARISON
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
          <Link href={`/icons/${a.slug}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>{a.name}</Link>
          {' '}<span style={{ color: 'var(--text-muted)' }}>vs</span>{' '}
          <Link href={`/icons/${b.slug}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>{b.name}</Link>
          <span style={{ color: 'var(--text-muted)', fontSize: '20px', fontWeight: 400 }}> (2026)</span>
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '800px', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>
            When building modern web applications, choosing the right icon library can significantly impact both your application's aesthetic and its performance. In this comprehensive comparison, we pit <strong>{a.name}</strong> against <strong>{b.name}</strong> to help you make an informed decision for your React, Next.js, Vue, or Svelte project.
          </p>
          <p>
            Together, these libraries represent some of the most popular open-source UI assets available today. {a.name} boasts an impressive {a.iconCount.toLocaleString('en-US')} icons (licensed under {a.license}), while {b.name} counters with {b.iconCount.toLocaleString('en-US')} highly-polished icons (licensed under {b.license}).
          </p>
          <p>
            Below, we dive into the technical details: bundle size impacts, tree-shaking capabilities, TypeScript support, explicit commercial licensing rules, and real-world implementation examples.
          </p>
        </div>
      </section>

      {/* Lucide Migration Banner */}
      {hasLucide && (
        <section style={{ marginBottom: '48px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
              ⚠️ Upgrading to Lucide React v1.0?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              The lucide-react 1.0 release introduced breaking changes — many icons were renamed (e.g. <code style={{ background: 'var(--code-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>BarChart2</code> → <code style={{ background: 'var(--code-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>ChartBar</code>, <code style={{ background: 'var(--code-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>PlusCircle</code> → <code style={{ background: 'var(--code-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>CirclePlus</code>). If your build fails with <code style={{ background: 'var(--code-bg)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{`module '"lucide-react"' has no exported member`}</code>, read our migration guide.
            </p>
            <Link href="/blog/lucide-react-1-migration-guide" style={{ color: 'var(--accent)', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
              Read the Lucide-React v1.0 Migration Guide →
            </Link>
          </div>
        </section>
      )}

      {/* Quick Stats — Clickable */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center' }}>
          <Link href={`/icons/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center', transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>{a.name}</div>
              <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)', marginBottom: '4px' }}>{a.iconCount.toLocaleString('en-US')}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>icons</div>
              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {a.stars.toLocaleString('en-US')} stars · {a.license}</div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--accent)' }}>View full guide →</div>
            </div>
          </Link>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>VS</div>
          <Link href={`/icons/${b.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center', transition: 'border-color 0.2s' }}>
              <div style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>{b.name}</div>
              <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)', marginBottom: '4px' }}>{b.iconCount.toLocaleString('en-US')}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>icons</div>
              <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {b.stars.toLocaleString('en-US')} stars · {b.license}</div>
              <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--accent)' }}>View full guide →</div>
            </div>
          </Link>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          TECHNICAL FEATURE COMPARISON
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
          When comparing {a.name} and {b.name}, developer experience features like TypeScript definitions and tree-shaking support are just as important as the icon count. Review the matrix below to see how they stack up.
        </p>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}>FEATURE</div>
            <div style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', borderLeft: '1px solid var(--border)' }}>{a.name}</div>
            <div style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', borderLeft: '1px solid var(--border)' }}>{b.name}</div>
          </div>
          {rows.map((row, i) => (
            <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{row.label}</div>
              <div style={{ padding: '14px 20px', fontSize: '13px', borderLeft: '1px solid var(--border)', color: row.winner === 'a' ? 'var(--green)' : row.a.includes('✗') ? 'var(--red)' : 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                {row.winner === 'a' && <span style={{ marginRight: '6px' }}>★</span>}
                {row.a}
              </div>
              <div style={{ padding: '14px 20px', fontSize: '13px', borderLeft: '1px solid var(--border)', color: row.winner === 'b' ? 'var(--green)' : row.b.includes('✗') ? 'var(--red)' : 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
                {row.winner === 'b' && <span style={{ marginRight: '6px' }}>★</span>}
                {row.b}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Design & Aesthetics Deep-Dive */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          DESIGN AESTHETICS & VISUAL STYLE
        </h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
          <p style={{ marginBottom: '16px' }}>
            Beyond the code, the visual identity of your application is heavily influenced by your choice of iconography. <strong>{a.name}</strong> primarily features a {a.style.length > 0 ? a.style[0].toLowerCase() : 'clean'} aesthetic, whereas <strong>{b.name}</strong> leans toward a {b.style.length > 0 ? b.style[0].toLowerCase() : 'versatile'} look.
          </p>
          <p style={{ marginBottom: '16px' }}>
            {a.name} is designed with strict geometric rules and a consistent grid, ensuring that all {a.iconCount.toLocaleString('en-US')} icons share the same visual weight. This makes it particularly well-suited for professional dashboards, enterprise SaaS products, and minimal user interfaces.
          </p>
          <p>
            On the other hand, {b.name} offers a more distinct personality. With its {b.iconCount.toLocaleString('en-US')} carefully crafted icons, it can bring warmth and character to consumer-facing mobile apps, marketing websites, and creative portfolios.
          </p>
        </div>
      </section>

      {/* Licensing & Commercial Use Deep-Dive */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          LICENSING & COMMERCIAL USE DEEP-DIVE
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
          Legal compliance is critical when selecting assets for a commercial software project. Understanding the nuances between the {a.license} license used by {a.name} and the {b.license} license used by {b.name} will ensure your project remains risk-free.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>{a.name}</span>
              <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--green)', background: '#4ade8015', padding: '4px 10px', borderRadius: '4px' }}>{a.license}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              {getLicenseInfo(a.license, a.name)}
            </p>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px' }}>✓ COMMERCIAL USE</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Free for personal, commercial, and SaaS projects without recurring fees.</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>{b.name}</span>
              <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--green)', background: '#4ade8015', padding: '4px 10px', borderRadius: '4px' }}>{b.license}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              {getLicenseInfo(b.license, b.name)}
            </p>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '6px' }}>✓ COMMERCIAL USE</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Free for personal, commercial, and SaaS projects without recurring fees.</div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link href="/licenses" style={{ color: 'var(--accent)', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>
            Read our complete Icon Library License Guide (MIT vs ISC vs Apache) →
          </Link>
        </div>
      </section>

      {/* Performance & Bundle Size */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          PERFORMANCE & BUNDLE SIZE
        </h2>
        <div style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
          <p style={{ marginBottom: '16px' }}>
            Modern front-end frameworks like React and Next.js heavily penalize large JavaScript bundles. This makes <strong>tree-shaking</strong>—the ability of a bundler to remove unused code—a crucial factor when choosing between {a.name} and {b.name}.
          </p>
          <ul style={{ paddingLeft: '24px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <strong>{a.name} Performance:</strong> {a.treeshakable ? `Because ${a.name} supports tree-shaking, importing a single icon will only add a tiny fraction of a kilobyte to your final bundle. You can safely install the entire package without performance concerns.` : `Note that ${a.name} does not natively support tree-shaking out of the box in all environments. This means you must be careful with your import syntax to avoid accidentally bundling all ${a.iconCount.toLocaleString('en-US')} icons.`}
            </li>
            <li>
              <strong>{b.name} Performance:</strong> {b.treeshakable ? `Similarly, ${b.name} is fully tree-shakable. Your Webpack or Turbopack build step will strip out any unused icons, ensuring your First Contentful Paint (FCP) metrics remain exceptional.` : `Conversely, ${b.name} lacks complete tree-shaking support. To maintain high performance, consider importing individual SVG files directly rather than using the main package export.`}
            </li>
          </ul>
        </div>
      </section>

      {/* React Import Syntax */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          REACT IMPORT SYNTAX & INTEGRATION
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
          Here is how you actually write the code to import and use each library in a React or Next.js component. Both libraries offer distinct APIs and integration patterns.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>{a.name} Integration</div>
            <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)', overflowX: 'auto', lineHeight: 1.7 }}>
              {a.usageExample}
            </pre>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>{b.name} Integration</div>
            <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text)', overflowX: 'auto', lineHeight: 1.7 }}>
              {b.usageExample}
            </pre>
          </div>
        </div>
      </section>

      {/* Which to Choose */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          FINAL VERDICT: WHICH SHOULD YOU CHOOSE?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7, marginBottom: '24px' }}>
          Still undecided? Here is our definitive breakdown of when to use {a.name} versus when to opt for {b.name}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>CHOOSE {a.name.toUpperCase()} IF...</div>
            {a.pros.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
              <Link href={`/icons/${a.slug}`} style={{ color: 'var(--accent)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', fontWeight: 600 }}>
                Read the full {a.name} guide →
              </Link>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>CHOOSE {b.name.toUpperCase()} IF...</div>
            {b.pros.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
              <Link href={`/icons/${b.slug}`} style={{ color: 'var(--accent)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none', fontWeight: 600 }}>
                Read the full {b.name} guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '24px' }}>
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Which is better: {a.name} or {b.name}?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              Choosing between {a.name} and {b.name} depends entirely on your project's technical requirements and design aesthetic. {a.name} provides {a.iconCount.toLocaleString('en-US')} icons and is notable for {a.pros[0].toLowerCase()}, while {b.name} offers {b.iconCount.toLocaleString('en-US')} icons and is best known for {b.pros[0].toLowerCase()}.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Are {a.name} and {b.name} completely free to use?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              Yes. Both libraries are highly permissive open-source projects. {a.name} is licensed under {a.license}, and {b.name} is licensed under {b.license}. Both licenses permit free commercial usage, modification, and redistribution in both personal and enterprise projects.
            </p>
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>Do these libraries support TypeScript natively?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>
              {a.typescript ? `Yes, ${a.name} includes excellent built-in TypeScript definitions.` : `No, ${a.name} does not natively provide TypeScript typings out of the box.`} {b.typescript ? `Similarly, ${b.name} offers robust native TypeScript support for an improved developer experience.` : `Meanwhile, ${b.name} also lacks strict built-in TypeScript support.`}
            </p>
          </div>
        </div>
      </section>

      {/* Editorial: When to Choose Each Library */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          OUR RECOMMENDATION
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '12px' }}>✓ CHOOSE {a.name.toUpperCase()} IF YOU...</div>
            <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Need a library with {a.iconCount.toLocaleString('en-US')} icons and {a.style.join('/')} style options</li>
              <li>{a.treeshakable ? 'Want tree-shakable imports to keep bundles small' : 'Prioritize icon variety over bundle optimization'}</li>
              <li>{a.typescript ? 'Require first-class TypeScript support in your codebase' : 'Are working with a JavaScript-only project'}</li>
              <li>Are building with {a.frameworks.join(', ')}</li>
              {a.figmaPlugin && <li>Need a Figma plugin for designer-developer handoff</li>}
            </ul>
            <div style={{ marginTop: '16px' }}>
              <Link href={`/icons/${a.slug}`} style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>
                Read full {a.name} guide →
              </Link>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '12px' }}>✓ CHOOSE {b.name.toUpperCase()} IF YOU...</div>
            <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <li>Need a library with {b.iconCount.toLocaleString('en-US')} icons and {b.style.join('/')} style options</li>
              <li>{b.treeshakable ? 'Want tree-shakable imports to keep bundles small' : 'Prioritize icon variety over bundle optimization'}</li>
              <li>{b.typescript ? 'Require first-class TypeScript support in your codebase' : 'Are working with a JavaScript-only project'}</li>
              <li>Are building with {b.frameworks.join(', ')}</li>
              {b.figmaPlugin && <li>Need a Figma plugin for designer-developer handoff</li>}
            </ul>
            <div style={{ marginTop: '16px' }}>
              <Link href={`/icons/${b.slug}`} style={{ color: 'var(--accent)', fontSize: '13px', textDecoration: 'none', fontWeight: 700 }}>
                Read full {b.name} guide →
              </Link>
            </div>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginTop: '20px' }}>
          Still unsure? Try our <Link href="/best-for-you" style={{ color: 'var(--accent)', textDecoration: 'none' }}>interactive quiz</Link> to get a personalized recommendation, or <Link href="/icon-search" style={{ color: 'var(--accent)', textDecoration: 'none' }}>search {SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icons</Link> from both libraries side by side. You can also check our <Link href="/stats" style={{ color: 'var(--accent)', textDecoration: 'none' }}>live stats dashboard</Link> for real-time download and GitHub star trends.
        </p>
      </section>

      {/* Installation */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          NPM INSTALLATION COMMANDS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>Install {a.name}</div>
            <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)', overflowX: 'auto' }}>
              {a.installCommand}
            </pre>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>Install {b.name}</div>
            <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)', overflowX: 'auto' }}>
              {b.installCommand}
            </pre>
          </div>
        </div>
      </section>

      {/* Quick Internal Links */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          RELATED RESOURCES
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link href={`/icons/${a.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            {a.name} — Comprehensive License, Installation & React Guide
            <span style={{ color: 'var(--accent)' }}>→</span>
          </Link>
          <Link href={`/icons/${b.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            {b.name} — Comprehensive License, Installation & React Guide
            <span style={{ color: 'var(--accent)' }}>→</span>
          </Link>
          <Link href="/icon-search" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            Search 15,000+ Icons Across All Libraries Instantly
            <span style={{ color: 'var(--accent)' }}>→</span>
          </Link>
          <Link href="/licenses" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            Icon Library License Guide — MIT vs Apache vs ISC Explained
            <span style={{ color: 'var(--accent)' }}>→</span>
          </Link>
          <Link href="/best-for-you" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px' }}>
            Find the Best Icons For Your Project — Interactive Wizard
            <span style={{ color: 'var(--accent)' }}>→</span>
          </Link>
        </div>
      </section>

      {/* More Comparisons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          EXPLORE MORE COMPARISONS
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {icons.filter(i => i.slug !== a.slug && i.slug !== b.slug).map(i => (
            <Link key={i.slug} href={`/compare/${a.slug}-vs-${i.slug}`} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px 18px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {a.name} vs {i.name}
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
