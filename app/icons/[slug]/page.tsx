import { icons } from '../../../lib/icons'
import { lucideIconsData } from '../../../data/libraries/lucide-icons'
import { heroiconsData } from '../../../data/libraries/heroicons'
import { tablerIconsData } from '../../../data/libraries/tabler-icons'
import { phosphorIconsData } from '../../../data/libraries/phosphor-icons'
import { remixIconData } from '../../../data/libraries/remix-icon'
import { featherIconsData } from '../../../data/libraries/feather-icons'
import { bootstrapIconsData } from '../../../data/libraries/bootstrap-icons'
import { radixIconsData } from '../../../data/libraries/radix-icons'
import { iconoirData } from '../../../data/libraries/iconoir'
import { ioniconsData } from '../../../data/libraries/ionicons'
import { octiconsData } from '../../../data/libraries/octicons'
import { antDesignIconsData } from '../../../data/libraries/ant-design-icons'
import { deviconsData } from '../../../data/libraries/devicons'
import { teenyiconsData } from '../../../data/libraries/teenyicons'
import { circumIconsData } from '../../../data/libraries/circum-icons'
import { elusiveIconsData } from '../../../data/libraries/elusive-icons'

import Link from 'next/link'
import { notFound } from 'next/navigation'

const libraryData: Record<string, any> = {
  'lucide-icons': lucideIconsData,
  'heroicons': heroiconsData,
  'tabler-icons': tablerIconsData,
  'phosphor-icons': phosphorIconsData,
  'remix-icon': remixIconData,
  'feather-icons': featherIconsData,
  'bootstrap-icons': bootstrapIconsData,
  'radix-icons': radixIconsData,
  'iconoir': iconoirData,
  'ionicons': ioniconsData,
  'octicons': octiconsData,
  'ant-design-icons': antDesignIconsData,
  'devicons': deviconsData,
  'teenyicons': teenyiconsData,
  'circum-icons': circumIconsData,
  'elusive-icons': elusiveIconsData,
}

export async function generateStaticParams() {
  return icons.map(icon => ({ slug: icon.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const icon = icons.find(i => i.slug === slug)
  if (!icon) return {}
  return {
    title: `${icon.name} — License, Installation & React Guide (2026)`,
    description: `${icon.name} is ${icon.license} licensed. Free for commercial use. Complete installation guide for React and Next.js, ${icon.iconCount} icons, TypeScript support. Official source confirmed.`,
    alternates: {
      canonical: `https://iconsearch.info/icons/${slug}`,
    },
    openGraph: {
      title: `${icon.name} — License, Installation & React Guide`,
      description: `${icon.name} is ${icon.license} licensed. Free for commercial use. Complete installation guide for React and Next.js, ${icon.iconCount} icons, TypeScript support.`,
      url: `https://iconsearch.info/icons/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${icon.name} — License, Installation & React Guide`,
      description: `${icon.name} is ${icon.license} licensed. Free for commercial use.`,
      creator: '@IconSearchinfo',
    },
  }
}

export default async function LibraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const icon = icons.find(i => i.slug === slug)
  if (!icon) notFound()

  const data = libraryData[slug]

  // Basic page for libraries without detailed data yet
  if (!data) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
          ← back to all libraries
        </Link>
        <h1 style={{ fontSize: '48px', fontWeight: 800, margin: '24px 0 12px' }}>{icon.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', marginBottom: '40px' }}>{icon.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', borderRadius: '12px', overflow: 'hidden', marginBottom: '40px' }}>
          {[
            { label: 'Icons', value: icon.iconCount.toLocaleString() },
            { label: 'GitHub Stars', value: icon.stars.toLocaleString() },
            { label: 'License', value: icon.license },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-card)', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Installation</h2>
        <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--green)', marginBottom: '40px' }}>
          {icon.installCommand}
        </pre>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Compare with others</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {icons.filter(i => i.slug !== slug).map(i => (
            <Link key={i.slug} href={`/compare/${slug}-vs-${i.slug}`} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '8px 14px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              vs {i.name} →
            </Link>
          ))}
        </div>
      </main>
    )
  }

  // Full detailed page for libraries with rich data
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

      {/* Structured Data: BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://iconsearch.info" },
            { "@type": "ListItem", "position": 2, "name": "Icon Libraries", "item": "https://iconsearch.info/free-svg-icons" },
            { "@type": "ListItem", "position": 3, "name": data.name, "item": `https://iconsearch.info/icons/${slug}` },
          ]
        })}}
      />

      {/* Structured Data: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": (data.faqs as any[]).map((faq: any) => ({
            "@type": "Question",
            "name": faq.q,
            "acceptedAnswer": { "@type": "Answer", "text": faq.a }
          }))
        })}}
      />

      {/* Structured Data: SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": data.name,
          "applicationCategory": "DeveloperApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "description": `${data.name} is a free, open-source SVG icon library with ${data.stats.iconCount.toLocaleString()} icons. Licensed under ${data.stats.license}.`,
          "url": data.links.website,
          "aggregateRating": undefined
        })}}
      />

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link href="/free-svg-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Libraries</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>{data.name}</span>
      </div>

      {/* Hero */}
      <section style={{ margin: '24px 0 48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // ICON LIBRARY
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px' }}>
          {data.name}
        </h1>
        <p style={{ color: 'var(--accent)', fontSize: '18px', marginBottom: '20px', fontFamily: 'JetBrains Mono, monospace' }}>
          {data.tagline}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {icon.frameworks.map(f => (
            <span key={f} style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              padding: '3px 10px',
              borderRadius: '100px',
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>{f}</span>
          ))}
          <span style={{
            background: '#4ade8015',
            border: '1px solid var(--green)',
            color: 'var(--green)',
            padding: '3px 10px',
            borderRadius: '100px',
            fontSize: '11px',
            fontFamily: 'JetBrains Mono, monospace',
          }}>{icon.license}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <a href={data.links.github} target="_blank" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
          }}>GitHub →</a>
          <a href={data.links.website} target="_blank" style={{
            background: 'var(--accent)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
          }}>Official Site →</a>
        </div>
      </section>

      {/* Stats */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          STATS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { label: 'Icons', value: data.stats.iconCount.toLocaleString() },
            { label: 'GitHub Stars', value: data.stats.stars.toLocaleString() },
            { label: 'Weekly Downloads', value: (data.stats.weeklyDownloads / 1000000).toFixed(1) + 'M' },
            { label: 'License', value: data.stats.license },
            { label: 'Bundle Size', value: data.stats.bundleSize },
            { label: 'Since', value: data.stats.firstRelease },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-card)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Description */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          OVERVIEW
        </h2>
        {[data.description.intro, data.description.history, data.description.detail, data.description.focus, data.description.technical, data.description.verdict].filter(Boolean).map((para, i) => (
          <p key={i} style={{ color: para === data.description.verdict ? 'var(--text)' : 'var(--text-muted)', fontSize: '16px', lineHeight: 1.8, marginBottom: '16px', background: para === data.description.verdict ? 'var(--accent-dim)' : 'transparent', border: para === data.description.verdict ? '1px solid var(--accent)' : 'none', borderRadius: para === data.description.verdict ? '8px' : '0', padding: para === data.description.verdict ? '16px' : '0' }}>
            {para === data.description.verdict && <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', display: 'block', marginBottom: '8px' }}>// VERDICT</span>}
            <span dangerouslySetInnerHTML={{ __html: para as string }} />
          </p>
        ))}
      </section>

      {/* Dynamic Lucide v1.x Migration Banner */}
      {slug === 'lucide-icons' && (
        <section style={{ marginBottom: '48px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
            border: '1px solid var(--accent)',
            borderRadius: '12px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>
              ⚠️ Upgrading to Lucide React v1.0.0+?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              The Lucide React 1.0 release introduced major breaking changes and renamed several key icons (for example, <code>BarChart2</code> is now <code>ChartBar</code>, <code>PlusCircle</code> is <code>BadgePlus</code> or <code>CirclePlus</code>, and <code>Instagram</code> or <code>Linkedin</code> exports might be missing/modified).
            </p>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Avoid Next.js compilation issues by reading our comprehensive step-by-step upgrade guide.
            </p>
            <div>
              <Link href="/blog/lucide-react-1-migration-guide" style={{
                color: 'var(--accent)',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                Read the Lucide-React v1.0 Migration & Renamed Icons Guide →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* License Overview */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          OFFICIAL LICENSE & COMMERCIAL USE
        </h2>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: 700 }}>License Type</span>
            <span style={{ fontSize: '14px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--green)', background: '#4ade8015', padding: '4px 10px', borderRadius: '4px' }}>{data.stats.license} License</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
            {data.stats.license === 'MIT' && `The MIT License is a highly popular, extremely permissive open-source license. Under the MIT License, you are officially allowed to use ${data.name} in any personal, commercial, or corporate software projects completely free of charge. You can modify the icons, distribute them, sell software containing them, and even sublicense them. The only requirement is that you must preserve the original copyright notice and permission notice in all copies of the software.`}
            {data.stats.license === 'ISC' && `The ISC License is a highly permissive open-source license, functionally equivalent to the MIT and BSD 2-Clause licenses but written in simpler language. You are completely free to use ${data.name} for any commercial or private projects without royalties or fees. You can redistribute the original or modified icons without restrictions. The only condition is preserving the copyright notice and this permission notice in all copies.`}
            {data.stats.license === 'Apache 2.0' && `The Apache 2.0 License is a permissive license that allows free commercial use, modification, and distribution of the ${data.name} icons. It also grants you an express, perpetual, worldwide, non-exclusive patent license. You can package and distribute the icons in commercial products. Note that you must provide a copy of the license and clear attribution if you redistribute the original files.`}
            {data.stats.license === 'CC0 1.0 (Public Domain)' && `CC0 1.0 is a Universal Public Domain Dedication. The creators of ${data.name} have waived all copyrights and related rights worldwide. You are officially allowed to copy, modify, distribute, and perform the work, even for commercial purposes, without asking permission or providing attribution. It is the most open license available.`}
            {!['MIT', 'ISC', 'Apache 2.0', 'CC0 1.0 (Public Domain)'].includes(data.stats.license) && `${data.name} is licensed under the ${data.stats.license} license, which is a developer-friendly permissive open-source license. You are permitted to use it free of charge in your web and mobile applications, including commercial and SaaS products, without strict attribution requirements.`}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>✓ Permissions</div>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <li>Commercial Use Allowed</li>
                <li>Modification Allowed</li>
                <li>Redistribution Allowed</li>
                <li>Sublicensing Allowed</li>
              </ul>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>⚠️ Requirements</div>
              <ul style={{ paddingLeft: '16px', margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {data.stats.license === 'CC0 1.0 (Public Domain)' ? (
                  <li>No attribution required (Public Domain)</li>
                ) : (
                  <li>Must keep copyright notice in source files</li>
                )}
                <li>License remains active on copy/use</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Installation */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          INSTALLATION
        </h2>
        {Object.entries(data.installation).map(([framework, install]) => (
          <div key={framework} style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px', textTransform: 'uppercase' }}>
              {framework}
            </div>
            <pre style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              color: 'var(--green)',
              overflowX: 'auto',
            }}>
              {typeof install === 'object' && install !== null && 'command' in install
                ? (install as any).command
                : ''}

              {typeof install === 'object' && install !== null && 'note' in install && (install as any).note
                ? `\n\n// Note: ${(install as any).note}`
                : ''}
            </pre>
          </div>
        ))}
      </section>

      {/* Code Examples */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          CODE EXAMPLES
        </h2>
        {Object.entries(data.codeExamples).map(([title, code]) => (
          <div key={title} style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px', textTransform: 'uppercase' }}>
              {title.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <pre style={{
              background: 'var(--code-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              color: 'var(--text)',
              overflowX: 'auto',
              lineHeight: 1.7,
            }}>
              {String(code)}
            </pre>
          </div>
        ))}
      </section>

      {/* Pros & Cons */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          PROS & CONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>PROS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(data.pros as any[]).map((pro) => (
                <div key={pro.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--green)' }}>✓ {pro.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{pro.detail}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>CONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(data.cons as any[]).map((con) => (
                <div key={con.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: 'var(--red)' }}>✗ {con.title}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{con.detail}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who Should Use */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          WHO SHOULD USE THIS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>USE IF YOU...</div>
            {(data.whoShouldUse as any[]).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0 }}>→</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>AVOID IF YOU...</div>
            {(data.whoShouldNot as any[]).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: 'var(--red)', flexShrink: 0 }}>✗</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          FREQUENTLY ASKED QUESTIONS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(data.faqs as any[]).map((faq, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '10px', color: 'var(--text)' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginRight: '8px' }}>Q.</span>
                {faq.q}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                <span style={{ color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', marginRight: '8px' }}>A.</span>
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparisons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          COMPARE WITH ALTERNATIVES
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {icons.filter(i => i.slug !== slug).map(i => (
            <Link key={i.slug} href={`/compare/${slug}-vs-${i.slug}`} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 16px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {data.name} vs {i.name}
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>
      {/* Internal Interlinking Module */}
      <section style={{ marginBottom: '48px', paddingTop: '48px', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          EXPLORE MORE
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>Framework Integration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/react-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Using SVG Icons in React</Link>
              <Link href="/nextjs-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Next.js Icons Guide</Link>
              <Link href="/typescript-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Strictly Typed Icons</Link>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>Browse By Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/use-cases/icons-for-saas" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Best Icons for SaaS</Link>
              <Link href="/icons/category/ui-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>General UI Icons</Link>
              <Link href="/directory" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '14px', marginTop: '4px' }}>View Full Site Directory →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
