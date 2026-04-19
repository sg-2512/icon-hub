import { icons } from '../../../lib/icons'
import { lucideIconsData } from '../../../data/libraries/lucide-icons'
import { heroiconsData } from '../../../data/libraries/heroicons'
import { tablerIconsData } from '../../../data/libraries/tabler-icons'
import { phosphorIconsData } from '../../../data/libraries/phosphor-icons'
import { remixIconData } from '../../../data/libraries/remix-icon'
import { featherIconsData } from '../../../data/libraries/feather-icons'
import { bootstrapIconsData } from '../../../data/libraries/bootstrap-icons'
import { radixIconsData } from '../../../data/libraries/radix-icons'
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
}

export async function generateStaticParams() {
  return icons.map(icon => ({ slug: icon.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const icon = icons.find(i => i.slug === slug)
  if (!icon) return {}
  return {
    title: `${icon.name} — Complete Guide, Installation & Examples (2026)`,
    description: `${icon.name} complete guide 2026 — installation for ${icon.frameworks.slice(0,2).join(' and ')}, ${icon.iconCount} icons, ${icon.license} license, TypeScript ${icon.typescript ? 'supported' : 'not supported'}. Compare with alternatives.`,
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

      {/* Breadcrumb */}
      <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
        ← back to all libraries
      </Link>

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
        {[data.description.intro, data.description.detail, data.description.technical, data.description.verdict].map((para, i) => (
          <p key={i} style={{ color: i === 3 ? 'var(--text)' : 'var(--text-muted)', fontSize: '16px', lineHeight: 1.8, marginBottom: '16px', background: i === 3 ? 'var(--accent-dim)' : 'transparent', border: i === 3 ? '1px solid var(--accent)' : 'none', borderRadius: i === 3 ? '8px' : '0', padding: i === 3 ? '16px' : '0' }}>
            {i === 3 && <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', display: 'block', marginBottom: '8px' }}>// VERDICT</span>}
            {para}
          </p>
        ))}
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
    </main>
  )
}
