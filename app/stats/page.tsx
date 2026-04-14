import { icons } from '../../lib/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Icon Library Stats & Rankings (2026) — GitHub Stars, Downloads, Icon Count',
  description: 'Live stats and rankings for all major open source icon libraries. GitHub stars, weekly npm downloads, icon counts, license types and framework support compared.',
}

export default function StatsPage() {
  const byStars = [...icons].sort((a, b) => b.stars - a.stars)
  const byIcons = [...icons].sort((a, b) => b.iconCount - a.iconCount)
  const totalIcons = icons.reduce((sum, i) => sum + i.iconCount, 0)
  const totalStars = icons.reduce((sum, i) => sum + i.stars, 0)
  const tsCount = icons.filter(i => i.typescript).length
  const treeCount = icons.filter(i => i.treeshakable).length
  const figmaCount = icons.filter(i => i.figmaPlugin).length

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // STATS & RANKINGS
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Icon Library<br />
          <span style={{ color: 'var(--accent)' }}>Stats & Rankings</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '560px' }}>
          Data-driven comparison of all major open source icon libraries. Updated for 2026.
        </p>
      </section>

      {/* Summary Stats */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          ECOSYSTEM OVERVIEW
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { label: 'Total Libraries', value: icons.length.toString(), color: 'var(--accent)' },
            { label: 'Total Icons', value: totalIcons.toLocaleString() + '+', color: 'var(--accent)' },
            { label: 'Total GitHub Stars', value: (totalStars / 1000).toFixed(0) + 'k+', color: 'var(--accent)' },
            { label: 'With TypeScript', value: `${tsCount}/${icons.length}`, color: 'var(--cyan)' },
            { label: 'Tree-Shakable', value: `${treeCount}/${icons.length}`, color: 'var(--green)' },
            { label: 'Figma Plugin', value: `${figmaCount}/${icons.length}`, color: 'var(--yellow)' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-card)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: stat.color, marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ranked by Stars */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          RANKED BY GITHUB STARS
        </h2>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 80px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '12px 20px', gap: '16px' }}>
            {['#', 'Library', 'Stars', 'Icons', 'License'].map(h => (
              <div key={h} style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}>{h}</div>
            ))}
          </div>
          {byStars.map((icon, index) => (
            <div key={icon.slug} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px 80px', padding: '16px 20px', gap: '16px', borderBottom: index < byStars.length - 1 ? '1px solid var(--border)' : 'none', background: index === 0 ? 'var(--accent-dim)' : 'var(--bg-card)', alignItems: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: index === 0 ? 'var(--accent)' : 'var(--text-dim)', fontWeight: index === 0 ? 700 : 400 }}>
                {index === 0 ? '★' : `${index + 1}`}
              </div>
              <div>
                <Link href={`/icons/${icon.slug}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '15px', display: 'block', marginBottom: '2px' }}>
                  {icon.name}
                </Link>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {icon.typescript && <span style={{ fontSize: '10px', color: 'var(--cyan)', fontFamily: 'JetBrains Mono, monospace' }}>TS</span>}
                  {icon.treeshakable && <span style={{ fontSize: '10px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>tree-shake</span>}
                  {icon.figmaPlugin && <span style={{ fontSize: '10px', color: 'var(--yellow)', fontFamily: 'JetBrains Mono, monospace' }}>figma</span>}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>
                  ⭐ {icon.stars.toLocaleString()}
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '2px', width: `${(icon.stars / byStars[0].stars) * 100}%` }} />
                </div>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--text)' }}>
                ◆ {icon.iconCount.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--green)' }}>
                {icon.license}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ranked by Icon Count */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          RANKED BY ICON COUNT
        </h2>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 120px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '12px 20px', gap: '16px' }}>
            {['#', 'Library', 'Icon Count', 'Style'].map(h => (
              <div key={h} style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px' }}>{h}</div>
            ))}
          </div>
          {byIcons.map((icon, index) => (
            <div key={icon.slug} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 140px 120px', padding: '16px 20px', gap: '16px', borderBottom: index < byIcons.length - 1 ? '1px solid var(--border)' : 'none', background: index === 0 ? 'var(--accent-dim)' : 'var(--bg-card)', alignItems: 'center' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: index === 0 ? 'var(--accent)' : 'var(--text-dim)', fontWeight: index === 0 ? 700 : 400 }}>
                {index === 0 ? '★' : `${index + 1}`}
              </div>
              <Link href={`/icons/${icon.slug}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}>
                {icon.name}
              </Link>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: 'var(--text)', marginBottom: '4px' }}>
                  {icon.iconCount.toLocaleString()}
                </div>
                <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--green)', borderRadius: '2px', width: `${(icon.iconCount / byIcons[0].iconCount) * 100}%` }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {icon.style.map(s => (
                  <span key={s} style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '3px' }}>{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Matrix */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          FEATURE MATRIX
        </h2>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Library', 'TypeScript', 'Tree-Shake', 'Figma', 'React', 'Vue', 'Svelte', 'License'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {icons.map((icon, index) => (
                <tr key={icon.slug} style={{ background: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)', borderBottom: index < icons.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/icons/${icon.slug}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                      {icon.name}
                    </Link>
                  </td>
                  {[icon.typescript, icon.treeshakable, icon.figmaPlugin].map((val, i) => (
                    <td key={i} style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: val ? 'var(--green)' : 'var(--red)' }}>
                      {val ? '✓' : '✗'}
                    </td>
                  ))}
                  {['react', 'vue', 'svelte'].map(fw => (
                    <td key={fw} style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: icon.frameworks.includes(fw) ? 'var(--green)' : 'var(--red)' }}>
                      {icon.frameworks.includes(fw) ? '✓' : '✗'}
                    </td>
                  ))}
                  <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: 'var(--green)' }}>
                    {icon.license}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          DEEP DIVE INTO ANY LIBRARY
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {icons.map(icon => (
            <Link key={icon.slug} href={`/icons/${icon.slug}`} className="card-hover" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 18px', textDecoration: 'none', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{icon.name}</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>→</span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}