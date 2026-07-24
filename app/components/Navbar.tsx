'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Browse', href: '/free-svg-icons' },
    { label: 'Best For You', href: '/best-for-you' },
    { label: 'Categories', href: '/icons/category' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Stats', href: '/stats' },
    { label: 'Icon Search', href: '/icon-search' },
  ]

  return (
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
      background: 'rgba(9, 9, 11, 0.7)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>

      {/* Logo */}
      <Link href="/" style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700,
        fontSize: '18px',
        color: 'var(--text)',
        textDecoration: 'none',
        flexShrink: 0,
      }}>
        <span style={{ color: 'var(--accent)' }}>&lt;</span>
        IconSearch
        <span style={{ color: 'var(--accent)' }}>/&gt;</span>
      </Link>

      {/* Desktop Links */}
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}
        className="desktop-nav"
      >
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="nav-link"
            style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '12px',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid transparent',
              transition: 'all 0.2s',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Hamburger Button */}
      <button suppressHydrationWarning
        className="mobile-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          background: 'none',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          padding: '6px 12px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '16px',
          display: 'none',
        }}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div
          className="mobile-menu"
          style={{
            position: 'fixed',
            top: '60px',
            left: 0,
            right: 0,
            background: 'var(--bg)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            zIndex: 99,
          }}
        >
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '15px',
                padding: '12px 16px',
                borderRadius: '8px',
                fontFamily: 'JetBrains Mono, monospace',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

    </nav>
  )
}