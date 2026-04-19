'use client'

import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { label: 'Browse', href: '/free-svg-icons' },
    { label: 'Compare', href: '/compare' },
    { label: 'Best For You', href: '/best-for-you' },
    { label: 'Categories', href: '/icons/category' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Stats', href: '/stats' },
    { label: 'Blog', href: '/blog' },
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
      background: 'rgba(10,10,15,0.95)',
      backdropFilter: 'blur(12px)',
    }}>

      {/* Logo */}
      <a href="/" style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 700,
        fontSize: '18px',
        color: 'var(--text)',
        textDecoration: 'none',
        flexShrink: 0,
      }}>
        <span style={{ color: 'var(--accent)' }}>&lt;</span>
        IconHub
        <span style={{ color: 'var(--accent)' }}>/&gt;</span>
      </a>

      {/* Desktop Links */}
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center',
      }}
        className="desktop-nav"
      >
        {links.map(link => (
          <a

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
          </a>
        ))}
      </div>

      {/* Mobile Hamburger Button */}
      <button
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
            <a
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
            </a>
          ))}
        </div>
      )}

    </nav>
  )
}