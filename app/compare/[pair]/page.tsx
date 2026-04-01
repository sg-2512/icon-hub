import { icons } from '../../../lib/icons'
import Link from 'next/link'

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
  const [slugA, slugB] = pair.split('-vs-')
  const a = icons.find(i => i.slug === slugA)
  const b = icons.find(i => i.slug === slugB)
  if (!a || !b) return {}
  return {
    title: `${a.name} vs ${b.name} (2026) — Detailed Comparison`,
    description: `${a.name} vs ${b.name}: icon count, TypeScript support, tree-shaking, bundle size, framework support and more. Find the best icon library for your project.`,
  }
}

export default async function ComparisonPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params
  const [slugA, slugB] = pair.split('-vs-')
  const a = icons.find(i => i.slug === slugA)
  const b = icons.find(i => i.slug === slugB)

  if (!a || !b) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>
        <h1 style={{ color: 'var(--text)' }}>Comparison not found</h1>
        <Link href="/" style={{ color: 'var(--accent)' }}>← Back to home</Link>
      </main>
    )
  }

  const rows = [
    { label: 'Total Icons', a: a.iconCount.toLocaleString(), b: b.iconCount.toLocaleString(), winner: a.iconCount > b.iconCount ? 'a' : 'b' },
    { label: 'GitHub Stars', a: a.stars.toLocaleString(), b: b.stars.toLocaleString(), winner: a.stars > b.stars ? 'a' : 'b' },
    { label: 'License', a: a.license, b: b.license, winner: 'none' },
    { label: 'TypeScript', a: a.typescript ? '✓ Yes' : '✗ No', b: b.typescript ? '✓ Yes' : '✗ No', winner: a.typescript && !b.typescript ? 'a' : !a.typescript && b.typescript ? 'b' : 'none' },
    { label: 'Tree Shakable', a: a.treeshakable ? '✓ Yes' : '✗ No', b: b.treeshakable ? '✓ Yes' : '✗ No', winner: a.treeshakable && !b.treeshakable ? 'a' : !a.treeshakable && b.treeshakable ? 'b' : 'none' },
    { label: 'Figma Plugin', a: a.figmaPlugin ? '✓ Yes' : '✗ No', b: b.figmaPlugin ? '✓ Yes' : '✗ No', winner: a.figmaPlugin && !b.figmaPlugin ? 'a' : !a.figmaPlugin && b.figmaPlugin ? 'b' : 'none' },
    { label: 'Styles', a: a.style.join(', '), b: b.style.join(', '), winner: 'none' },
    { label: 'Frameworks', a: a.frameworks.join(', '), b: b.frameworks.join(', '), winner: a.frameworks.length > b.frameworks.length ? 'a' : 'b' },
  ]

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Breadcrumb */}
      <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
        ← back to all libraries
      </Link>

      {/* Hero */}
      <section style={{ margin: '24px 0 48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // COMPARISON
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          {a.name} <span style={{ color: 'var(--text-muted)' }}>vs</span> {b.name}
          <span style={{ color: 'var(--text-muted)', fontSize: '20px', fontWeight: 400 }}> (2026)</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px' }}>
          A detailed comparison of {a.name} and {b.name} covering icon count, TypeScript support, bundle size, framework compatibility and more.
        </p>
      </section>

      {/* Quick Stats */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '24px', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>{a.name}</div>
            <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)', marginBottom: '4px' }}>{a.iconCount.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>icons</div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {a.stars.toLocaleString()} stars</div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }}>VS</div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '12px' }}>{b.name}</div>
            <div style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)', marginBottom: '4px' }}>{b.iconCount.toLocaleString()}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>icons</div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {b.stars.toLocaleString()} stars</div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          FEATURE COMPARISON
        </h2>
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

      {/* Which to Choose */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          WHICH SHOULD YOU CHOOSE?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>CHOOSE {a.name.toUpperCase()} IF...</div>
            {a.pros.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>CHOOSE {b.name.toUpperCase()} IF...</div>
            {b.pros.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: 'var(--green)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          INSTALLATION
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>{a.name}</div>
            <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)', overflowX: 'auto' }}>
              {a.installCommand}
            </pre>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '8px' }}>{b.name}</div>
            <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)', overflowX: 'auto' }}>
              {b.installCommand}
            </pre>
          </div>
        </div>
      </section>

      {/* More Comparisons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          MORE COMPARISONS
        </h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {icons.filter(i => i.slug !== a.slug && i.slug !== b.slug).map(i => (
            <Link key={i.slug} href={`/compare/${a.slug}-vs-${i.slug}`} style={{
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
              {a.name} vs {i.name}
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}