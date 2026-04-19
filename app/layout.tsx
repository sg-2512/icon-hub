import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IconHub — Best Free Icon Libraries for Developers',
  description: 'Compare and find the best free open source icon libraries for React, Next.js, Vue and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "IconHub",
              "alternateName": "IconsHub",
              "url": "https://iconshub.netlify.app"
            })
          }}
        />
      </head>
      <body>
        <nav style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 48px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(10,10,15,0.85)',
          backdropFilter: 'blur(12px)',
        }}>
          <a href="/" style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            fontSize: '18px',
            color: 'var(--text)',
            textDecoration: 'none',
          }}>
            <span style={{ color: 'var(--accent)' }}>&lt;</span>
            IconHub
            <span style={{ color: 'var(--accent)' }}>/&gt;</span>
          </a>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[
              { label: 'Browse', href: '/free-svg-icons' },
              { label: 'Compare', href: '/compare' },
              { label: 'Categories', href: '/icons/category' },
              { label: 'Use Cases', href: '/use-cases' },
              { label: 'Stats', href: '/stats' },
              { label: 'Blog', href: '/blog' },
            ].map(link => (
              <a key={link.href} href={link.href} className="nav-link" style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '13px',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid transparent',
                transition: 'all 0.2s',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <div style={{ minHeight: 'calc(100vh - 60px - 80px)' }}>
          {children}
        </div>

        <footer style={{
          borderTop: '1px solid var(--border)',
          padding: '48px',
          marginTop: '80px',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Footer Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '40px', marginBottom: '48px' }}>

              {/* Brand */}
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '16px', color: 'var(--text)', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--accent)' }}>&lt;</span>IconHub<span style={{ color: 'var(--accent)' }}>/&gt;</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                  Independent resource for comparing open source icon libraries.
                </p>
              </div>

              {/* Libraries */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
                  LIBRARIES
                </div>
                {[
                  { label: 'Lucide Icons', href: '/icons/lucide-icons' },
                  { label: 'Heroicons', href: '/icons/heroicons' },
                  { label: 'Tabler Icons', href: '/icons/tabler-icons' },
                  { label: 'Phosphor Icons', href: '/icons/phosphor-icons' },
                  { label: 'All Libraries', href: '/free-svg-icons' },
                ].map(link => (
                  <a key={link.href} href={link.href} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Frameworks */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
                  FRAMEWORKS
                </div>
                {[
                  { label: 'React Icons', href: '/react-icons' },
                  { label: 'Next.js Icons', href: '/nextjs-icons' },
                  { label: 'Vue Icons', href: '/vue-icons' },
                  { label: 'Svelte Icons', href: '/svelte-icons' },
                  { label: 'Tailwind Icons', href: '/tailwind-icons' },
                ].map(link => (
                  <a key={link.href} href={link.href} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Use Cases */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
                  USE CASES
                </div>
                {[
                  { label: 'Icons for SaaS', href: '/use-cases/icons-for-saas' },
                  { label: 'Icons for Dashboards', href: '/use-cases/icons-for-dashboards' },
                  { label: 'Icons for Mobile', href: '/use-cases/icons-for-mobile-apps' },
                  { label: 'Icons for Dark Mode', href: '/use-cases/icons-for-dark-mode' },
                  { label: 'All Use Cases', href: '/use-cases' },
                ].map(link => (
                  <a key={link.href} href={link.href} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Resources */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
                  RESOURCES
                </div>
                {[
                  { label: 'Browse', href: '/free-svg-icons' },
                  { label: 'Compare', href: '/compare' },
                  { label: 'Best For You', href: '/best-for-you' },
                  { label: 'Categories', href: '/icons/category' },
                  { label: 'Use Cases', href: '/use-cases' },
                  { label: 'Stats', href: '/stats' },
                  { label: 'Blog', href: '/blog' },
                  { label: 'TypeScript Icons', href: '/typescript-icons' },
                ].map(link => (
                  <a key={link.href} href={link.href} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {link.label}
                  </a>
                ))}
              </div>

            </div>

            {/* Bottom bar */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: 'var(--accent)' }}>// </span>
                IconHub is an independent resource not affiliated with any icon library project.
              </span>
              <div style={{ display: 'flex', gap: '20px' }}>
                {[
                  { label: 'Best For You', href: '/best-for-you' },
                  { label: 'Privacy Policy', href: '/privacy-policy' },
                  { label: 'Terms', href: '/terms' },
                  { label: 'Contact', href: '/contact' },
                ].map(link => (
                  <a key={link.href} href={link.href} style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </footer>
      </body>
    </html>
  )
}