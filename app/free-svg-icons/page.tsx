import { icons } from '../../lib/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Free SVG Icons for Web Projects (2026) — Open Source Collections',
  description: 'Browse the best free SVG icon libraries for web projects. All libraries are open source, free for commercial use, and work with React, Next.js and Vue.',
}

export default function FreeSvgIconsPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // BROWSE
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Free SVG Icons<br />
          <span style={{ color: 'var(--accent)' }}>for Web Projects</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '560px', marginBottom: '24px' }}>
          {icons.reduce((sum, i) => sum + i.iconCount, 0).toLocaleString()}+ free SVG icons across {icons.length} open source libraries. All free for commercial use.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['MIT License', 'ISC License', 'Apache 2.0', 'TypeScript', 'React', 'Next.js', 'Vue', 'Svelte'].map(tag => (
            <span key={tag} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {[
            { label: 'Total Icons', value: icons.reduce((sum, i) => sum + i.iconCount, 0).toLocaleString() + '+' },
            { label: 'Libraries', value: icons.length.toString() },
            { label: 'All Free', value: '100%' },
            { label: 'Commercial Use', value: '✓ Yes' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-card)', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* All Libraries */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          ALL FREE ICON LIBRARIES
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {icons.map(icon => (
            <Link key={icon.slug} href={`/icons/${icon.slug}`} className="card-hover" style={{
              background: 'var(--bg-card)',
              padding: '24px',
              textDecoration: 'none',
              color: 'var(--text)',
              display: 'block',
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{icon.name}</h3>
                <span style={{ fontSize: '11px', color: 'var(--green)', background: '#4ade8015', border: '1px solid var(--green)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {icon.license}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
                {icon.description}
              </p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {icon.stars.toLocaleString()}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>◆ {icon.iconCount.toLocaleString()} icons</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {icon.frameworks.map(f => (
                  <span key={f} style={{ fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent)', padding: '1px 6px', borderRadius: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {f}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Comparisons */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          POPULAR COMPARISONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {[
            ['lucide-icons', 'heroicons'],
            ['lucide-icons', 'tabler-icons'],
            ['heroicons', 'tabler-icons'],
            ['phosphor-icons', 'lucide-icons'],
            ['feather-icons', 'lucide-icons'],
            ['remix-icon', 'tabler-icons'],
          ].map(([a, b]) => (
            <Link key={`${a}-${b}`} href={`/compare/${a}-vs-${b}`} className="link-hover" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 18px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}>
              <span>{a.replace(/-/g, ' ')} vs {b.replace(/-/g, ' ')}</span>
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}