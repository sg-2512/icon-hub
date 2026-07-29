'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { Home, KeyRound, List, LogIn, Search, UserCheck } from 'lucide-react'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase'
import { formatIconifyCollectionName, namedLibraries } from '../../data/library-catalog'

const AuthModal = dynamic(() => import('./AuthModal'), { ssr: false })


const navLinks = [
  { label: 'Home', href: '/', Icon: Home, color: '#9aa8ff' },
  { label: 'Search', href: '/icon-search', Icon: Search, color: '#53c9ff' },
  { label: 'Browse', href: '/free-svg-icons', Icon: List, color: '#50d3a2' },
]

const integrationLinks = [
  { label: 'Figma plugin', href: '/figma-plugin', iconSrc: '/integration-logos/figma.svg' },
  { label: 'Sketch plugin', href: '/sketch-plugin', iconSrc: '/integration-logos/sketch.svg' },
  { label: 'VS Code extension', href: '/vscode-extension', iconSrc: '/integration-logos/vscode.svg' },
  { label: 'Chrome extension', href: '/chrome-extension', iconSrc: '/integration-logos/chrome.svg' },
  { label: 'Framer plugin', href: '/framer-plugin', iconSrc: '/integration-logos/framer.svg' },
  { label: 'Webflow extension', href: '/webflow-extension', iconSrc: '/integration-logos/webflow.svg' },
  { label: 'PowerPoint add-in', href: '/powerpoint-addin', iconSrc: '/integration-logos/powerpoint.svg' },
  { label: 'Google Slides add-on', href: '/google-slides-addon', iconSrc: '/integration-logos/google-slides.svg' },
  { label: 'Raycast extension', href: '/raycast-extension', iconSrc: '/integration-logos/raycast.svg' },
  { label: 'Tailwind plugin', href: '/tailwind-plugin', iconSrc: '/integration-logos/tailwind.svg' },
  { label: 'MCP server', href: '/mcp-server', iconSrc: '/integration-logos/mcp.svg' },
  { label: 'JetBrains plugin', href: '/jetbrains-plugin', iconSrc: '/integration-logos/jetbrains.svg' },
  { label: 'Storybook addon', href: '/storybook-addon', iconSrc: '/integration-logos/storybook.svg' },
  { label: 'Canva app', href: '/canva-app', iconSrc: '/integration-logos/canva.svg' },
  { label: 'WordPress plugin', href: '/wordpress-plugin', iconSrc: '/integration-logos/wordpress.svg' },
  { label: 'Shopify extension', href: '/shopify-extension', iconSrc: '/integration-logos/shopify.svg' },
  { label: 'Adobe Express add-on', href: '/adobe-plugin', iconSrc: '/integration-logos/adobe.svg' },
  { label: 'Obsidian plugin', href: '/obsidian-plugin', iconSrc: '/integration-logos/obsidian.svg' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [iconifySets, setIconifySets] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      const supabase = await createClient()
      if (!supabase) return
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null)
      })
      return () => subscription.subscription.unsubscribe()
    })()
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => setMobileOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/icon-search?limit=1&legalOnly=0', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`Catalog returned ${response.status}`)))
      .then((data) => {
        const sets = Array.isArray(data?.facets?.iconifySets) ? data.facets.iconifySets : []
        setIconifySets(sets)
      })
      .catch((error) => {
        if ((error as Error).name !== 'AbortError') {
          console.error('Could not load Iconify collections', error)
        }
      })

    return () => controller.abort()
  }, [])

  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const readCartCount = () => {
      try {
        const rawPacks = localStorage.getItem('icon-hub-workspace-packs')
        const activeId = localStorage.getItem('icon-hub-workspace-active-pack')
        if (rawPacks) {
          const packs = JSON.parse(rawPacks)
          const active = packs.find((p: { id: string; items?: unknown[] }) => p.id === activeId) || packs[0]
          setCartCount(Array.isArray(active?.items) ? active.items.length : 0)
        }
      } catch {}
    }
    readCartCount()
    const handleCartUpdated = () => readCartCount()
    window.addEventListener('cart-updated', handleCartUpdated)
    window.addEventListener('storage', handleCartUpdated)
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdated)
      window.removeEventListener('storage', handleCartUpdated)
    }
  }, [])

  return (
    <>
      {/* Sticky Top Header on Mobile */}
      <header className="mobile-top-header">
        <button
          suppressHydrationWarning
          onClick={() => setMobileOpen(!mobileOpen)}
          className="mobile-top-toggle"
          aria-label="Toggle navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            {mobileOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </>
            )}
          </svg>
        </button>
        <Link href="/" className="mobile-top-brand">
          <Image src="/iconsearch-logo-128.png" width={24} height={24} alt="IconSearch logo" priority style={{ borderRadius: '6px', flexShrink: 0 }} />
          <span>Iconsearch</span>
        </Link>
        <button
          suppressHydrationWarning
          onClick={() => window.dispatchEvent(new CustomEvent('cart-toggle'))}
          className="mobile-top-cart"
          aria-label="Toggle Cart"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
        </button>
      </header>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`app-sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image src="/iconsearch-logo-128.png" width={32} height={32} alt="" priority />
          <Link href="/" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.5px', fontFamily: 'Inter, sans-serif' }}>
            Iconsearch
          </Link>
        </div>

        {/* Top Sign In / Account Action Button */}
        <div style={{ padding: '0 12px 16px' }}>
          {user ? (
            <Link
              href="/account"
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              <UserCheck size={16} /> Account
            </Link>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '10px',
                background: 'var(--accent, #818cf8)',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxSizing: 'border-box',
                boxShadow: '0 4px 14px rgba(129,140,248,0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <LogIn size={16} /> Sign In
            </button>
          )}
        </div>





        {/* Nav Links */}
        <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '20px' }}>
          {navLinks.map(({ label, href, Icon, color }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={1.9}
                  aria-hidden="true"
                  style={{
                    color,
                    flexShrink: 0,
                    filter: `drop-shadow(0 1px 5px ${color}35)`,
                  }}
                />
                {label}
              </Link>
            )
          })}
          <div style={{ padding: '14px 8px 7px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.3px' }}>
              Integrations
            </span>
          </div>
          {integrationLinks.map(({ label, href, iconSrc }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                style={{
                  minHeight: '34px',
                  padding: '7px 12px',
                  borderRadius: '7px',
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                }}
              >
                {/* Local SVG brand assets render directly to preserve their native colors. */}
                <img
                  src={iconSrc}
                  width={18}
                  height={18}
                  alt=""
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    objectFit: 'contain',
                  }}
                />
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border)', margin: '0 20px 16px' }} />

        {/* Libraries List */}
        <div style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '0 8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Libraries
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {namedLibraries.map(lib => {
              const isActive = pathname === `/icons/${lib.slug}`
              return (
                <Link
                  key={lib.slug}
                  href={`/icons/${lib.slug}`}
                  style={{
                    fontSize: '13px',
                    color: isActive ? 'var(--text)' : 'var(--text-muted)',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '7px 12px',
                    borderRadius: '6px',
                    transition: 'all 0.15s ease',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: lib.color, flexShrink: 0 }} />
                  {lib.name}
                </Link>
              )
            })}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', padding: '14px 8px 4px' }}>
            <label htmlFor="sidebar-iconify-collection" style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.3px', marginBottom: '8px' }}>
              Iconify Collections
            </label>
            <select
              id="sidebar-iconify-collection"
              suppressHydrationWarning
              aria-label="Browse Iconify collections"
              defaultValue=""
              onChange={(event) => {
                const collection = event.target.value
                if (!collection) return
                router.push(`/icon-search?lib=iconify&iconifySet=${encodeURIComponent(collection)}`)
                setMobileOpen(false)
              }}
              style={{
                width: '100%',
                minWidth: 0,
                border: '1px solid var(--border)',
                borderRadius: '7px',
                padding: '8px 9px',
                color: 'var(--text)',
                background: 'var(--bg-card)',
                fontSize: '12px',
                fontFamily: 'var(--font-inter), Inter, sans-serif',
                cursor: 'pointer',
              }}
            >
              <option value="">
                {iconifySets.length ? `${iconifySets.length} collections` : 'Loading collections...'}
              </option>
              {iconifySets.map((set) => (
                <option key={set} value={set}>
                  {formatIconifyCollectionName(set)}
                </option>
              ))}
            </select>
            <Link
              href="/icon-search?lib=iconify"
              style={{ display: 'block', marginTop: '8px', color: 'var(--accent)', textDecoration: 'none', fontSize: '12px', padding: '4px 2px' }}
            >
              Browse all Iconify icons
            </Link>
          </div>
        </div>

        {/* Bottom section */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            {[
              { label: 'About', href: '/about' },
              { label: 'Privacy', href: '/privacy-policy' },
              { label: 'Contact', href: '/contact' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>


      </aside>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authUser) => {
          setUser(authUser)
          setIsAuthModalOpen(false)
        }}
      />
    </>
  )
}

