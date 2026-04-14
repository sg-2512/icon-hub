import { categories } from '../../../../data/categories'
import { icons } from '../../../../lib/icons'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return categories.map(cat => ({ slug: cat.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = categories.find(c => c.slug === slug)
  if (!cat) return {}
  return {
    title: `${cat.name} — Best Free SVG Icon Libraries (2026)`,
    description: cat.description,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = categories.find(c => c.slug === slug)
  if (!cat) notFound()

  const recommended = icons.filter(i => cat.recommendedLibraries.includes(i.slug))
  const others = icons.filter(i => !cat.recommendedLibraries.includes(i.slug))

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '24px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link href="/free-svg-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>icons</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>{cat.slug}</span>
      </div>

      {/* Hero */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // CATEGORY
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Free <span style={{ color: 'var(--accent)' }}>{cat.name}</span><br />for Web Projects (2026)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', lineHeight: 1.7, marginBottom: '24px' }}>
          {cat.longDescription}
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cat.keywords.slice(0, 4).map(kw => (
            <span key={kw} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {kw}
            </span>
          ))}
        </div>
      </section>

      {/* Popular Icons in This Category */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          COMMON ICONS IN THIS CATEGORY
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cat.popularIcons.map(icon => (
            <span key={icon} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '8px 14px',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text-muted)',
            }}>
              {icon}
            </span>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          COMMON USE CASES
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {cat.useCases.map(uc => (
            <span key={uc} style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--accent)',
            }}>
              {uc}
            </span>
          ))}
        </div>
      </section>

      {/* Recommended Libraries */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          RECOMMENDED FOR {cat.name.toUpperCase()}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {recommended.map((lib, index) => (
            <div key={lib.slug} style={{ background: 'var(--bg-card)', padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    background: index === 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: index === 0 ? 'white' : 'var(--text-dim)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}>
                    {index === 0 ? '★ TOP PICK' : `#${index + 1}`}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 700 }}>{lib.name}</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {lib.stars.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>◆ {lib.iconCount.toLocaleString()} icons</span>
                  <span style={{ fontSize: '11px', color: 'var(--green)', background: '#4ade8015', border: '1px solid var(--green)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {lib.license}
                  </span>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '14px', maxWidth: '700px' }}>
                {lib.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href={`/icons/${lib.slug}`} style={{
                  background: index === 0 ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: index === 0 ? 'white' : 'var(--text-muted)',
                  border: `1px solid ${index === 0 ? 'var(--accent)' : 'var(--border)'}`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  Full Guide →
                </Link>
                {lib.typescript && <span style={{ fontSize: '12px', color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace' }}>✓ TypeScript</span>}
                {lib.treeshakable && <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>✓ Tree-shakable</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* All Libraries */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          ALL LIBRARIES WITH {cat.name.toUpperCase()}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {others.map(lib => (
            <Link key={lib.slug} href={`/icons/${lib.slug}`} className="card-hover" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '18px 20px',
              textDecoration: 'none',
              color: 'var(--text)',
              display: 'block',
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '15px' }}>{lib.name}</h3>
                <span style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>{lib.license}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {lib.stars.toLocaleString()}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>◆ {lib.iconCount.toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparisons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          COMPARE TOP PICKS
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {recommended.length >= 2 && (
            <Link href={`/compare/${recommended[0].slug}-vs-${recommended[1].slug}`} className="link-hover" style={{
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
              transition: 'all 0.2s',
            }}>
              {recommended[0].name} vs {recommended[1].name}
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          )}
          {recommended.length >= 3 && (
            <Link href={`/compare/${recommended[0].slug}-vs-${recommended[2].slug}`} className="link-hover" style={{
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
              transition: 'all 0.2s',
            }}>
              {recommended[0].name} vs {recommended[2].name}
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          )}
        </div>
      </section>

      {/* All Categories */}
      <section>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          BROWSE OTHER CATEGORIES
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(await import('../../../../data/categories')).categories
            .filter(c => c.slug !== slug)
            .map(c => (
              <Link key={c.slug} href={`/icons/category/${c.slug}`} className="link-hover" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 14px',
                textDecoration: 'none',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.2s',
              }}>
                {c.name} →
              </Link>
            ))}
        </div>
      </section>

    </main>
  )
}