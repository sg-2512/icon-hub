'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'
import Sidebar from './Sidebar'
import { footerLegalLinks, internalLinkGroups } from '../../data/internal-links'

const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false })

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const standalone = pathname === '/connect'

  if (standalone) {
    return <div className="standalone-main">{children}</div>
  }

  return (
    <>
      <Sidebar />
      <div className="app-main">
        {children}

        <footer className="app-footer">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))', gap: '40px', marginBottom: '48px' }}>
              <div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '16px', color: 'var(--text)', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--accent)' }}>&lt;</span>IconSearch<span style={{ color: 'var(--accent)' }}>/&gt;</span>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                  Independent resource for comparing open source icon libraries.
                </p>
              </div>

              {internalLinkGroups.map(group => (
                <div key={group.title}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
                    {group.title}
                  </div>
                  {group.links.map(link => (
                    <Link key={link.href} href={link.href} style={{ display: 'block', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                <span style={{ color: 'var(--accent)' }}>{'// '}</span>
                IconSearch is an independent resource not affiliated with any icon library project.
              </span>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {footerLegalLinks.map(link => (
                  <Link key={link.href} href={link.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
      <CartDrawer />
    </>
  )
}
