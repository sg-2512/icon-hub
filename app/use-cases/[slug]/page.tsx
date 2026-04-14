import { useCases } from '../../../data/usecases'
import { icons } from '../../../lib/icons'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return useCases.map(uc => ({ slug: uc.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const uc = useCases.find(u => u.slug === slug)
  if (!uc) return {}
  return {
    title: `${uc.name} — Best Free Icon Libraries (2026)`,
    description: uc.description,
  }
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const uc = useCases.find(u => u.slug === slug)
  if (!uc) notFound()

  const recommended = icons.filter(i => uc.recommendedLibraries.includes(i.slug))
  const others = icons.filter(i => !uc.recommendedLibraries.includes(i.slug))

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link href="/use-cases" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>use-cases</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>{uc.slug}</span>
      </div>

      {/* Hero */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // USE CASE
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          <span style={{ color: 'var(--accent)' }}>{uc.name}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '640px', lineHeight: 1.7, marginBottom: '24px' }}>
          {uc.longDescription}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {uc.keywords.slice(0, 4).map(kw => (
            <span key={kw} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              {kw}
            </span>
          ))}
        </div>
      </section>

      {/* Why it matters */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          WHY THIS MATTERS
        </h2>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '24px' }}>
          <p style={{ color: 'var(--text)', fontSize: '16px', lineHeight: 1.8 }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginRight: '8px' }}>//</span>
            {uc.whyItMatters}
          </p>
        </div>
      </section>

      {/* Recommended Libraries */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          RECOMMENDED FOR {uc.name.toUpperCase()}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {recommended.map((lib, index) => (
            <div key={lib.slug} style={{ background: 'var(--bg-card)', padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ background: index === 0 ? 'var(--accent)' : 'var(--bg-secondary)', color: index === 0 ? 'white' : 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    {index === 0 ? '★ TOP PICK' : `#${index + 1}`}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{lib.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {lib.stars.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>◆ {lib.iconCount.toLocaleString()} icons</span>
                  <span style={{ fontSize: '11px', color: 'var(--green)', background: '#4ade8015', border: '1px solid var(--green)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{lib.license}</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '14px', maxWidth: '700px' }}>{lib.description}</p>
              <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)', marginBottom: '14px', overflowX: 'auto' }}>
                {lib.installCommand}
              </pre>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href={`/icons/${lib.slug}`} style={{ background: index === 0 ? 'var(--accent)' : 'var(--bg-secondary)', color: index === 0 ? 'white' : 'var(--text-muted)', border: `1px solid ${index === 0 ? 'var(--accent)' : 'var(--border)'}`, padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                  Full Guide →
                </Link>
                {lib.typescript && <span style={{ fontSize: '12px', color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace' }}>✓ TypeScript</span>}
                {lib.treeshakable && <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>✓ Tree-shakable</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Design Tips */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          DESIGN TIPS
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {uc.designTips.map((tip, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', flexShrink: 0, marginTop: '2px' }}>0{i + 1}</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Must Have Icons */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          MUST-HAVE ICONS FOR THIS USE CASE
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {uc.mustHaveIcons.map(icon => (
            <span key={icon} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)' }}>
              {icon}
            </span>
          ))}
        </div>
      </section>

      {/* Mistakes to Avoid */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          COMMON MISTAKES TO AVOID
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {uc.avoidMistakes.map((mistake, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 18px' }}>
              <span style={{ color: 'var(--red)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>✗</span>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{mistake}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other Libraries */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          OTHER LIBRARIES TO CONSIDER
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
          {others.map(lib => (
            <Link key={lib.slug} href={`/icons/${lib.slug}`} className="card-hover" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px', textDecoration: 'none', color: 'var(--text)', display: 'block', transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '15px' }}>{lib.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>{lib.license}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>◆ {lib.iconCount.toLocaleString()} icons</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Browse other use cases */}
      <section>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          BROWSE OTHER USE CASES
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {useCases.filter(u => u.slug !== slug).map(u => (
            <Link key={u.slug} href={`/use-cases/${u.slug}`} className="link-hover" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', textDecoration: 'none', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.2s' }}>
              {u.name} →
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}