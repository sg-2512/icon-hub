import { icons } from '../../lib/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Icon Library Comparisons (2026) — Side by Side Comparison Tool',
  description: 'Compare any two icon libraries side by side. Lucide vs Heroicons, Tabler vs Phosphor, and 180+ more comparisons with real data.',
}

export default function ComparePage() {
  const pairs: [typeof icons[0], typeof icons[0]][] = []
  for (let i = 0; i < icons.length; i++) {
    for (let j = i + 1; j < icons.length; j++) {
      pairs.push([icons[i], icons[j]])
    }
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // COMPARISONS
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Icon Library<br />
          <span style={{ color: 'var(--accent)' }}>Comparisons</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '560px', marginBottom: '16px' }}>
          {pairs.length} side-by-side comparisons covering icon count, TypeScript support, bundle size, framework compatibility and more.
        </p>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '12px 16px', display: 'inline-block' }}>
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            // {icons.length} libraries × all combinations = {pairs.length} detailed comparisons
          </span>
        </div>
      </section>

      {/* Stats */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { label: 'Total Comparisons', value: pairs.length.toString() },
            { label: 'Libraries Covered', value: icons.length.toString() },
            { label: 'Data Points Each', value: '8+' },
            { label: 'Updated', value: '2026' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-card)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Comparisons */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          MOST POPULAR
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {[
            ['lucide-icons', 'heroicons'],
            ['lucide-icons', 'tabler-icons'],
            ['heroicons', 'tabler-icons'],
            ['phosphor-icons', 'lucide-icons'],
            ['feather-icons', 'lucide-icons'],
            ['remix-icon', 'lucide-icons'],
          ].map(([a, b]) => {
            const libA = icons.find(i => i.slug === a)
            const libB = icons.find(i => i.slug === b)
            if (!libA || !libB) return null
            return (
              <Link key={`${a}-${b}`} href={`/compare/${a}-vs-${b}`} className="card-hover" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '20px',
                textDecoration: 'none',
                color: 'var(--text)',
                display: 'block',
                transition: 'background 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--accent-dim)', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>
                    POPULAR
                  </span>
                  <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
                  {libA.name} vs {libB.name}
                </h3>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    ◆ {libA.iconCount.toLocaleString()} vs {libB.iconCount.toLocaleString()} icons
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* All Comparisons by Library */}
      {icons.map(icon => {
        const related = pairs.filter(([a, b]) => a.slug === icon.slug || b.slug === icon.slug)
        return (
          <section key={icon.slug} style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700 }}>
                <Link href={`/icons/${icon.slug}`} style={{ color: 'var(--text)', textDecoration: 'none' }}>
                  {icon.name}
                </Link>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '13px', marginLeft: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                  vs everything
                </span>
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {related.length} comparisons
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {icons.filter(i => i.slug !== icon.slug).map(other => {
                const slugA = icon.slug < other.slug ? icon.slug : other.slug
                const slugB = icon.slug < other.slug ? other.slug : icon.slug
                return (
                  <Link key={other.slug} href={`/compare/${slugA}-vs-${slugB}`} className="link-hover" style={{
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
                    vs {other.name} →
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}

    </main>
  )
}