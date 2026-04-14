import { icons } from '../../lib/icons'
import Link from 'next/link'

export const metadata = {
  title: 'Best TypeScript Icon Libraries (2026) — Typed SVG Icons for React',
  description: 'The best icon libraries with full TypeScript support for React and Next.js. Autocomplete, type safety, and zero runtime errors.',
}

export default function TypescriptIconsPage() {
  const tsIcons = icons.filter(i => i.typescript)
  const nonTsIcons = icons.filter(i => !i.typescript)

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // TYPESCRIPT
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Best Icon Libraries<br />
          <span style={{ color: 'var(--accent)' }}>with TypeScript</span> (2026)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '560px', marginBottom: '16px' }}>
          {tsIcons.length} icon libraries with full TypeScript support — autocomplete in VS Code, typed props, and zero runtime surprises.
        </p>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '12px 16px', display: 'inline-block' }}>
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            // TypeScript support means full autocomplete — type "Lu" and VS Code shows all Lucide icons instantly.
          </span>
        </div>
      </section>

      {/* Why TypeScript matters */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          WHY TYPESCRIPT SUPPORT MATTERS
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          {[
            { title: 'Autocomplete', desc: 'VS Code shows all available icons as you type the import name. No more guessing icon names.' },
            { title: 'Typed Props', desc: 'Size, color, strokeWidth — all props are typed so you catch errors at compile time, not runtime.' },
            { title: 'Refactoring', desc: 'Rename an icon across your entire codebase safely with TypeScript\'s refactoring tools.' },
            { title: 'Documentation', desc: 'Hover over any icon in VS Code to see its available props and types inline.' },
          ].map(item => (
            <div key={item.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--accent)', fontSize: '12px', marginBottom: '8px' }}>✓ {item.title}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TypeScript libraries */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          ✓ LIBRARIES WITH TYPESCRIPT SUPPORT
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {tsIcons.map((icon, index) => (
            <div key={icon.slug} style={{ background: 'var(--bg-card)', padding: '24px 28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>#{index + 1}</span>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{icon.name}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--cyan)', background: '#22d3ee15', border: '1px solid var(--cyan)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>TS ✓</span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>◆ {icon.iconCount.toLocaleString()} icons</span>
                  <span style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>{icon.license}</span>
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px', maxWidth: '600px' }}>{icon.description}</p>
              <Link href={`/icons/${icon.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                Full Guide →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Non-TypeScript libraries */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          ✗ LIBRARIES WITHOUT TYPESCRIPT SUPPORT
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {nonTsIcons.map(icon => (
            <div key={icon.slug} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '15px', marginRight: '12px' }}>{icon.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{icon.iconCount.toLocaleString()} icons · {icon.license}</span>
              </div>
              <Link href={`/icons/${icon.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                View anyway →
              </Link>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}