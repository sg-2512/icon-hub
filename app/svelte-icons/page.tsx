import { icons } from '../../lib/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Best Icon Libraries for Svelte (2026) — Free & Open Source',
  description: 'Find the best free icon libraries for Svelte and SvelteKit. Compare Lucide, Tabler and more with installation guides.',
}

export default function SvelteIconsPage() {
  const svelteIcons = icons.filter(i => i.frameworks.includes('svelte'))

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // SVELTE
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Best Icon Libraries<br />
          <span style={{ color: 'var(--accent)' }}>for Svelte</span> (2026)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '560px', marginBottom: '16px' }}>
          {svelteIcons.length} icon libraries with official Svelte support. Works with both Svelte 4, Svelte 5, and SvelteKit.
        </p>
        <div style={{ background: '#f87171' + '15', border: '1px solid var(--red)', borderRadius: '8px', padding: '12px 16px', display: 'inline-block' }}>
          <span style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
            ⚠ Svelte has fewer official packages than React. Always check for an official package before using a community wrapper.
          </span>
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {svelteIcons.map((icon, index) => (
            <div key={icon.slug} style={{ background: 'var(--bg-card)', padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>#{index + 1}</span>
                  <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{icon.name}</h2>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>⭐ {icon.stars.toLocaleString()}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>◆ {icon.iconCount.toLocaleString()} icons</span>
                  <span style={{ fontSize: '11px', color: 'var(--green)', background: '#4ade8015', border: '1px solid var(--green)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>{icon.license}</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px', maxWidth: '700px' }}>{icon.description}</p>
              <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)', marginBottom: '16px', overflowX: 'auto' }}>
                {icon.installCommand}
              </pre>
              <Link href={`/icons/${icon.slug}`} style={{ background: 'var(--accent)', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', display: 'inline-block' }}>
                Full Guide →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          // RECOMMENDATION FOR SVELTE
        </h2>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
            For Svelte projects, <span style={{ color: 'var(--text)', fontWeight: 700 }}>Lucide Svelte</span> is the top pick — install via <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--green)', fontSize: '13px' }}>npm install lucide-svelte</code>. It is the only major icon library with an official, actively maintained Svelte package.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            <span style={{ color: 'var(--text)', fontWeight: 700 }}>Tabler Icons Svelte</span> is the best alternative if you need the largest icon selection. Both work with SvelteKit out of the box.
          </p>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          POPULAR COMPARISONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {[['lucide-icons', 'tabler-icons'], ['lucide-icons', 'heroicons'], ['tabler-icons', 'phosphor-icons']].map(([a, b]) => (
            <Link key={`${a}-${b}`} href={`/compare/${a}-vs-${b}`} className="link-hover" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 18px', textDecoration: 'none', color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
              <span>{a.replace(/-/g, ' ')} vs {b.replace(/-/g, ' ')}</span>
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}