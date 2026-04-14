import { icons } from '../../lib/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Best Icon Libraries for Tailwind CSS (2026) — Free & Open Source',
  description: 'The best free icon libraries that work perfectly with Tailwind CSS. Heroicons, Lucide, Tabler and more with Tailwind integration examples.',
}

export default function TailwindIconsPage() {
  const tailwindFriendly = icons.filter(i => i.frameworks.includes('react'))

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // TAILWIND CSS
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Best Icon Libraries<br />
          <span style={{ color: 'var(--accent)' }}>for Tailwind CSS</span> (2026)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '560px', marginBottom: '16px' }}>
          All icon libraries below accept className props and work seamlessly with Tailwind utility classes for sizing, color, and spacing.
        </p>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '12px 16px', display: 'inline-block' }}>
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            // TL;DR — Heroicons is made by the Tailwind team. Lucide is the best general alternative.
          </span>
        </div>
      </section>

      {/* Tailwind tip */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          HOW ICONS WORK WITH TAILWIND
        </h2>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8, marginBottom: '16px' }}>
            Icons that accept <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', fontSize: '13px' }}>className</code> props use <code style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', fontSize: '13px' }}>currentColor</code> for their stroke or fill. This means you control color with Tailwind text utilities and size with width/height utilities.
          </p>
          <pre style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)', overflowX: 'auto' }}>
            {`// Lucide with Tailwind
<Home className="h-5 w-5 text-blue-500" />
<Settings className="h-6 w-6 text-gray-400 hover:text-gray-600" />

// Heroicons with Tailwind  
<HomeIcon className="h-6 w-6 text-indigo-500" />
<BellIcon className="h-5 w-5 text-gray-300" />`}
          </pre>
        </div>
      </section>

      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          ALL TAILWIND-COMPATIBLE LIBRARIES
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {tailwindFriendly.map((icon, index) => (
            <div key={icon.slug} style={{ background: 'var(--bg-card)', padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', minWidth: '28px' }}>#{index + 1}</span>
                  <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{icon.name}</h2>
                  {icon.slug === 'heroicons' && (
                    <span style={{ fontSize: '11px', background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                      MADE BY TAILWIND TEAM
                    </span>
                  )}
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

      <section>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          POPULAR COMPARISONS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {[['lucide-icons', 'heroicons'], ['heroicons', 'tabler-icons'], ['lucide-icons', 'tabler-icons'], ['heroicons', 'phosphor-icons']].map(([a, b]) => (
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