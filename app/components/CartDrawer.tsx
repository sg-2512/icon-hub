import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import AuthModal from './AuthModal'
import { createClient } from '../../lib/supabase'
import { generateZipPackage } from '../../lib/exporter'
import { trackExport } from '../../lib/analytics'
import { getBestIconPreviewUrl } from '../../lib/icon-preview'


/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface IconData {
  id: string
  name: string
  displayName: string
  library: string
  libraryName: string
  npmPackage: string
  license: string
  tags?: string[]
  reactImport: string
  reactUsage: string
  svgUrl: string
  legalSafe?: boolean
  licenseUrl?: string
}

interface CartItem {
  key: string
  icon: IconData
  size: number
  stroke: number
  color: string
}

interface Pack {
  id: string
  name: string
  items: CartItem[]
  createdAt?: string
}

/* ------------------------------------------------------------------ */
/*  Keyframes injected once                                            */
/* ------------------------------------------------------------------ */

const STYLE_ID = 'cart-drawer-keyframes'

function injectKeyframes() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    @keyframes cart-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(129,140,248,0.55); }
      70%  { box-shadow: 0 0 0 14px rgba(129,140,248,0); }
      100% { box-shadow: 0 0 0 0 rgba(129,140,248,0); }
    }
    @keyframes cart-fade-in {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes cart-empty-bounce {
      0%, 100% { transform: translateY(0); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const PACKS_KEY = 'icon-hub-workspace-packs'
const ACTIVE_KEY = 'icon-hub-workspace-active-pack'
const EVENT_NAME = 'cart-updated'

function readPacks(): Pack[] {
  try {
    const raw = localStorage.getItem(PACKS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function readActiveId(): string {
  try {
    return localStorage.getItem(ACTIVE_KEY) || ''
  } catch {
    return ''
  }
}

function writePacks(packs: Pack[]) {
  localStorage.setItem(PACKS_KEY, JSON.stringify(packs))
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

function writeActiveId(id: string) {
  localStorage.setItem(ACTIVE_KEY, id)
  window.dispatchEvent(new CustomEvent(EVENT_NAME))
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CartDrawer() {
  const [open, setOpen] = useState(false)
  const [packs, setPacks] = useState<Pack[]>([])
  const [activeId, setActiveId] = useState('')
  const [pulse, setPulse] = useState(false)
  const prevCount = useRef(0)

  // Zip exporter modal states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [exportPackageName, setExportPackageName] = useState('icon-hub-package')
  const [exportFormats, setExportFormats] = useState({
    svg: true,
    png: true,
    react: true,
    vue: false,
    tailwind: false,
    sprite: true
  })
  const [exportPngScale, setExportPngScale] = useState(2)
  const [exportUsePreset, setExportUsePreset] = useState(false)
  const [exportPresetSize, setExportPresetSize] = useState(32)
  const [exportPresetStroke, setExportPresetStroke] = useState(1.5)
  const [exportPresetColor, setExportPresetColor] = useState('#818cf8')
  const [exportStatus, setExportStatus] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  /* --- read state ------------------------------------------------- */
  const refresh = useCallback(() => {
    const p = readPacks()
    setPacks(p)
    setActiveId(readActiveId())
  }, [])

  useEffect(() => {
    injectKeyframes()
    const initialRefresh = window.setTimeout(refresh, 0)

    const onCartUpdated = () => refresh()
    const onStorage = (e: StorageEvent) => {
      if (e.key === PACKS_KEY || e.key === ACTIVE_KEY) refresh()
    }
    const onCartToggle = () => setOpen((prev) => !prev)

    window.addEventListener(EVENT_NAME, onCartUpdated)
    window.addEventListener('storage', onStorage)
    window.addEventListener('cart-toggle', onCartToggle)
    return () => {
      window.clearTimeout(initialRefresh)
      window.removeEventListener(EVENT_NAME, onCartUpdated)
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('cart-toggle', onCartToggle)
    }
  }, [refresh])

  /* --- active pack items ------------------------------------------ */
  const activePack = packs.find((p) => p.id === activeId) || packs[0]
  const items: CartItem[] = activePack?.items ?? []
  const totalCount = items.length

  /* --- pulse animation when count increases ----------------------- */
  useEffect(() => {
    if (totalCount > prevCount.current) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 700)
      return () => clearTimeout(t)
    }
    prevCount.current = totalCount
  }, [totalCount])

  /* --- mutations -------------------------------------------------- */
  const removeItem = (key: string) => {
    if (!activePack) return
    const updated = packs.map((p) => {
      if (p.id !== activePack.id) return p
      return { ...p, items: p.items.filter((item) => item.key !== key) }
    })
    writePacks(updated)
  }

  const clearAll = () => {
    if (!activePack) return
    const updated = packs.map((p) => {
      if (p.id !== activePack.id) return p
      return { ...p, items: [] }
    })
    writePacks(updated)
  }


  const switchPack = (id: string) => {
    setActiveId(id)
    writeActiveId(id)
  }


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

  /* --- zip archive generation ------------------------------------- */
  const handleStartExport = async () => {
    if (items.length === 0) return

    if (!user) {
      setIsExportModalOpen(false)
      setIsAuthModalOpen(true)
      return
    }

    setIsExporting(true)

    setExportStatus('Reading icons...')
    try {
      // We map the icons list format to what exporter expects
      const formattedItems = items.map(item => ({
        key: item.key,
        icon: {
          ...item.icon,
          tags: item.icon.tags || []
        },
        size: item.size,
        stroke: item.stroke,
        color: item.color
      }))

      await generateZipPackage({
        packageName: exportPackageName,
        items: formattedItems,
        formats: exportFormats,
        pngScale: exportPngScale,
        usePreset: exportUsePreset,
        presetSize: exportPresetSize,
        presetStroke: exportPresetStroke,
        presetColor: exportPresetColor
      }, setExportStatus)
      setIsExportModalOpen(false)

      trackExport({
        format: 'zip',
        iconCount: formattedItems.length,
        libraries: [...new Set(formattedItems.map(item => item.icon.library))].join(','),
        iconNames: formattedItems.map(item => item.icon.name).join(','),
      })
    } catch (e) {
      console.error('Failed to generate package', e)
      setExportStatus('Failed to generate package. Try again.')
    } finally {
      setIsExporting(false)
    }
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <>
      {/* ---------- Floating Badge ---------- */}
      <button
        suppressHydrationWarning={true}
        className="cart-floating-fab"
        aria-label="Open bundle"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 999,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--accent, #818cf8)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(129,140,248,0.35)',
          transition: 'transform 0.2s ease, box-shadow 0.25s ease',
          animation: pulse ? 'cart-pulse 0.7s ease-out' : 'none',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
        }}
      >
        {/* Package/Bundle SVG */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>

        {/* Count overlay */}
        {totalCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#ef4444',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              borderRadius: '999px',
              padding: '2px 7px',
              border: '2px solid #000',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            {totalCount}
          </span>
        )}
      </button>

      {/* ---------- Drawer Panel ---------- */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(420px, 100vw)',
          background: 'var(--bg-card, #12131a)',
          zIndex: 1000,
          boxShadow: '-12px 0 36px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderLeft: '1px solid var(--border, rgba(255,255,255,0.08))',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          color: 'var(--text, #e2e2e2)',
        }}
      >
        {/* ---- Header ---- */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Your Bundle</span>
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted, #888)',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              {totalCount} item{totalCount !== 1 ? 's' : ''}
            </span>
          </div>
          <button suppressHydrationWarning
            aria-label="Close bundle"
            onClick={() => setOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted, #888)',
              fontSize: 22,
              cursor: 'pointer',
              lineHeight: 1,
              padding: 4,
              borderRadius: 6,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text, #e2e2e2)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted, #888)'
            }}
          >
            ×
          </button>
        </div>

        {/* ---- Pack selector ---- */}
        {packs.length > 1 && (
          <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))', flexShrink: 0 }}>
            <label
              htmlFor="cart-active-pack"
              style={{
                fontSize: 10,
                letterSpacing: '1.5px',
                color: 'var(--text-muted, #888)',
                display: 'block',
                marginBottom: 6,
              }}
            >
              ACTIVE BUNDLE
            </label>
            <select suppressHydrationWarning
              id="cart-active-pack"
              value={activeId}
              onChange={(e) => switchPack(e.target.value)}
              aria-label="Active bundle"
              title="Active bundle"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                background: 'rgba(255,255,255,0.04)',
                color: 'var(--text, #e2e2e2)',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#18181b', color: '#e2e2e2' }}>
                  {p.name} ({p.items?.length || 0})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ---- Items list ---- */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {items.length === 0 ? (
            /* ---- Empty state ---- */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: 16,
                color: 'var(--text-muted, #888)',
                padding: 32,
              }}
            >
              <svg
                width="56"
                height="56"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.35, animation: 'cart-empty-bounce 2.5s ease-in-out infinite' }}
              >
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Your bundle is empty</span>
              <span style={{ fontSize: 12, textAlign: 'center', lineHeight: 1.6, maxWidth: 240 }}>
                Browse icon libraries and add icons to build your custom icon bundle.
              </span>
              <Link
                href="/icon-search"
                onClick={() => setOpen(false)}
                style={{
                  marginTop: 12,
                  padding: '10px 20px',
                  borderRadius: 10,
                  background: 'var(--accent, #818cf8)',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'opacity 0.15s, transform 0.15s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.85'
                  e.currentTarget.style.transform = 'scale(0.98)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Return to Search
              </Link>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.key || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 24px',
                  transition: 'background 0.15s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
                }}
              >
                {/* Icon preview */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={getBestIconPreviewUrl({
                      name: item.icon?.name || '',
                      library: item.icon?.library || '',
                      svgUrl: item.icon?.svgUrl || '',
                    })}
                    alt={item.icon?.name}
                    width={24}
                    height={24}
                    style={{ filter: 'invert(1) brightness(0.95)' }}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.icon?.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 2 }}>
                    {item.icon?.libraryName || item.icon?.library}
                  </div>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    {item.size && (
                      <span style={badgeStyle}>{item.size}px</span>
                    )}
                    {item.stroke !== undefined && (
                      <span style={badgeStyle}>stroke {item.stroke}</span>
                    )}
                    {item.color && (
                      <span style={{ ...badgeStyle, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: String(item.color),
                            border: '1px solid rgba(255,255,255,0.15)',
                            flexShrink: 0,
                          }}
                        />
                        {String(item.color)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Remove */}
                <button suppressHydrationWarning
                  aria-label={`Remove ${item.icon?.name}`}
                  onClick={() => removeItem(item.key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #888)',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: 6,
                    lineHeight: 1,
                    transition: 'color 0.15s, background 0.15s',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.color = '#ef4444'
                    btn.style.background = 'rgba(239,68,68,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget as HTMLButtonElement
                    btn.style.color = 'var(--text-muted, #888)'
                    btn.style.background = 'none'
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        {/* ---- Footer ---- */}
        {items.length > 0 && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <button suppressHydrationWarning
                onClick={() => setIsExportModalOpen(true)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: 10,
                  border: 'none',
                  background: 'var(--accent, #818cf8)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
                  ;(e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'
                }}
              >
                Export Package
              </button>
              <button suppressHydrationWarning
                onClick={clearAll}
                style={{
                  padding: '10px 20px',
                  borderRadius: 10,
                  border: '1px solid rgba(239,68,68,0.4)',
                  background: 'transparent',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: 13,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement
                  btn.style.background = 'rgba(239,68,68,0.1)'
                  btn.style.borderColor = 'rgba(239,68,68,0.6)'
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement
                  btn.style.background = 'transparent'
                  btn.style.borderColor = 'rgba(239,68,68,0.4)'
                }}
              >
                Clear
              </button>
            </div>
            <Link
              href="/icon-search"
              onClick={() => setOpen(false)}
              style={{
                textAlign: 'center',
                color: 'var(--accent, #818cf8)',
                textDecoration: 'none',
                fontSize: 12,
                fontWeight: 600,
                padding: '4px 0',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
              }}
            >
              ← Continue Shopping & Search Icons
            </Link>
          </div>
        )}
      </div>

      {/* ---------- Export Modal ---------- */}
      {isExportModalOpen && (
        <>
          <div
            onClick={() => !isExporting && setIsExportModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 20000
            }}
          />

          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(520px, 94vw)',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'rgba(18, 18, 21, 0.98)',
            border: '1px solid var(--border)',
            borderRadius: '18px',
            padding: '24px',
            zIndex: 20001,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            color: '#e2e2e2',
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📦</span> Export Workspace Package
              </h3>
              <button suppressHydrationWarning
                onClick={() => setIsExportModalOpen(false)}
                disabled={isExporting}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#888',
                  fontSize: 20,
                  cursor: 'pointer',
                  padding: 4
                }}
              >
                ✕
              </button>
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '6px', letterSpacing: '1px' }}>
                // PACKAGE FILE NAME
              </label>
              <input suppressHydrationWarning
                type="text"
                placeholder="icon-hub-package"
                value={exportPackageName}
                onChange={(e) => setExportPackageName(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                style={{
                  width: '100%',
                  background: '#09090b',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                disabled={isExporting}
              />
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>Cohesive Presets Overrides</h4>
                  <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0 0' }}>Force all icons in package to use a uniform preset</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input suppressHydrationWarning
                    type="checkbox"
                    checked={exportUsePreset}
                    onChange={(e) => setExportUsePreset(e.target.checked)}
                    disabled={isExporting}
                  />
                  <span style={{ fontSize: '12px' }}>Enable</span>
                </label>
              </div>

              {exportUsePreset && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#888' }}>Preset Size</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent, #818cf8)' }}>{exportPresetSize}px</span>
                    </div>
                    <input suppressHydrationWarning
                      type="range"
                      min={16}
                      max={96}
                      value={exportPresetSize}
                      onChange={(e) => setExportPresetSize(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent, #818cf8)' }}
                      aria-label="Preset size"
                      title="Preset size"
                      disabled={isExporting}
                    />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#888' }}>Preset Stroke</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent, #818cf8)' }}>{exportPresetStroke.toFixed(1)}px</span>
                    </div>
                    <input suppressHydrationWarning
                      type="range"
                      min={0.5}
                      max={3}
                      step={0.1}
                      value={exportPresetStroke}
                      onChange={(e) => setExportPresetStroke(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent, #818cf8)' }}
                      aria-label="Preset stroke width"
                      title="Preset stroke width"
                      disabled={isExporting}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#888' }}>Preset Color:</span>
                    <input suppressHydrationWarning
                      type="color"
                      value={exportPresetColor}
                      onChange={(e) => setExportPresetColor(e.target.value)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                      aria-label="Preset color"
                      title="Preset color"
                      disabled={isExporting}
                    />
                    <span style={{ fontSize: '11px', color: '#e2e2e2' }}>{exportPresetColor}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ fontSize: '10px', color: '#888', display: 'block', marginBottom: '8px', letterSpacing: '1px' }}>
                // SELECT EXPORT FORMATS
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                {[
                  { id: 'svg', label: 'Optimized SVGs (.svg)' },
                  { id: 'react', label: 'React Elements (.tsx)' },
                  { id: 'vue', label: 'Vue Components (.vue)' },
                  { id: 'tailwind', label: 'Tailwind embeds' },
                  { id: 'sprite', label: 'SVG Sprite (sprite.svg)' },
                  { id: 'png', label: 'PNG Images (.png)' },
                ].map((f) => (
                  <label
                    key={f.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    <input suppressHydrationWarning
                      type="checkbox"
                      checked={exportFormats[f.id as keyof typeof exportFormats]}
                      onChange={(e) => setExportFormats(prev => ({ ...prev, [f.id]: e.target.checked }))}
                      disabled={isExporting}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            {exportFormats.png && (
              <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>PNG Scale Multiplier</h4>
                    <p style={{ fontSize: '11px', color: '#888', margin: '2px 0 0 0' }}>High DPI multiplier (e.g. @2x for retina)</p>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--accent, #818cf8)', fontWeight: 800 }}>
                    @{exportPngScale}x
                  </span>
                </div>
                <input suppressHydrationWarning
                  type="range"
                  min={1}
                  max={4}
                  step={1}
                  value={exportPngScale}
                  onChange={(e) => setExportPngScale(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent, #818cf8)' }}
                  aria-label="PNG scale multiplier"
                  title="PNG scale multiplier"
                  disabled={isExporting}
                />
              </div>
            )}

            {isExporting && (
              <div style={{
                background: 'rgba(129,140,248,0.06)',
                border: '1px solid rgba(129,140,248,0.2)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(129,140,248,0.2)',
                  borderTopColor: 'var(--accent, #818cf8)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <span style={{ fontSize: '13px', color: 'var(--accent, #818cf8)' }}>
                  {exportStatus}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button suppressHydrationWarning
                onClick={handleStartExport}
                disabled={isExporting || Object.values(exportFormats).every(v => !v)}
                style={{
                  flex: 1,
                  background: 'var(--accent, #818cf8)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  padding: '12px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {isExporting ? 'Packaging Workspace...' : 'Download ZIP Archive'}
              </button>
              <button suppressHydrationWarning
                onClick={() => setIsExportModalOpen(false)}
                disabled={isExporting}
                style={{
                  padding: '12px 20px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

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


/* ------------------------------------------------------------------ */
/*  Shared badge micro-style                                           */
/* ------------------------------------------------------------------ */

const badgeStyle: React.CSSProperties = {
  fontSize: 10,
  padding: '2px 7px',
  borderRadius: 5,
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--text-muted, #888)',
  whiteSpace: 'nowrap',
}
