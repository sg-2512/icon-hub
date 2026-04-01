import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IconHub — Best Free Icon Libraries for Developers',
  description: 'Compare and find the best free open source icon libraries for React, Next.js, Vue and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {[
              { label: 'Browse', href: '/free-svg-icons' },
              { label: 'React', href: '/react-icons' },
              { label: 'Next.js', href: '/nextjs-icons' },
            ].map(link => (
              <a key={link.href} href={link.href} className="nav-link" style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '13px',
                padding: '6px 12px',
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
          padding: '32px 48px',
          marginTop: '80px',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              <span style={{ color: 'var(--accent)' }}>// </span>
              IconHub is an independent resource not affiliated with any icon library project.
            </span>
            <div style={{ display: 'flex', gap: '20px' }}>
              {[
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Terms & Conditions', href: '/terms' },
                { label: 'Contact', href: '/contact' },
                { label: 'Blog', href: '/blog' },
              ].map(link => (
                <a key={link.href} href={link.href} style={{ color: 'var(--text-dim)', textDecoration: 'none', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}