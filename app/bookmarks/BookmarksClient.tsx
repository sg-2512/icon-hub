'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { allLibraries, type IconLibraryMeta } from '../../data/library-catalog'

type BookmarkedIcon = {
  id: string
  name: string
  displayName?: string
  library: string
  libraryName?: string
  license?: string
  tags?: string[]
}

const SIZE_OPTIONS = [16, 24, 32, 48, 64, 128, 256, 512]

export default function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState<BookmarkedIcon[]>([])
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([])
  const [selectedIcon, setSelectedIcon] = useState<BookmarkedIcon | null>(null)
  const [activeTab, setActiveTab] = useState<'icons' | 'collections'>('icons')
  const [searchQuery, setSearchQuery] = useState('')

  // Customizer state for modal
  const [selectedSize, setSelectedSize] = useState(512)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [stripFill, setStripFill] = useState(false)
  const [svgContent, setSvgContent] = useState<string>('')
  const [copyNotice, setCopyNotice] = useState<string | null>(null)

  // Read saved bookmarks and pinned collections from localStorage
  useEffect(() => {
    try {
      const rawBookmarks = localStorage.getItem('icon-hub-bookmarked-icons')
      if (rawBookmarks) {
        setBookmarks(JSON.parse(rawBookmarks))
      }

      const rawPinned = localStorage.getItem('icon-hub-pinned-collections')
      if (rawPinned) {
        setPinnedSlugs(JSON.parse(rawPinned))
      }
    } catch {}
  }, [])

  // Remove bookmark
  const removeBookmark = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = bookmarks.filter((b) => b.id !== id)
    setBookmarks(updated)
    try {
      localStorage.setItem('icon-hub-bookmarked-icons', JSON.stringify(updated))
    } catch {}
    if (selectedIcon?.id === id) {
      setSelectedIcon(null)
    }
  }

  // Remove pinned collection
  const removePinnedCollection = (slug: string) => {
    const updated = pinnedSlugs.filter((s) => s !== slug)
    setPinnedSlugs(updated)
    try {
      localStorage.setItem('icon-hub-pinned-collections', JSON.stringify(updated))
    } catch {}
  }

  // Clear all bookmarks
  const clearAllBookmarks = () => {
    if (confirm('Are you sure you want to clear all bookmarked icons?')) {
      setBookmarks([])
      try {
        localStorage.removeItem('icon-hub-bookmarked-icons')
      } catch {}
    }
  }

  // Fetch SVG when selected icon changes
  useEffect(() => {
    if (!selectedIcon) return
    const controller = new AbortController()
    const url = `/api/svg/${encodeURIComponent(selectedIcon.library)}/${encodeURIComponent(selectedIcon.name)}`
    
    fetch(url, { signal: controller.signal })
      .then((res) => res.ok ? res.text() : Promise.reject())
      .then((text) => setSvgContent(text))
      .catch(() => setSvgContent(''))

    return () => controller.abort()
  }, [selectedIcon])

  // Filtered bookmarks by search query
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks
    const q = searchQuery.toLowerCase().trim()
    return bookmarks.filter((b) =>
      b.name.toLowerCase().includes(q) || (b.displayName && b.displayName.toLowerCase().includes(q)) || b.library.toLowerCase().includes(q)
    )
  }, [bookmarks, searchQuery])

  // Pinned library metadata objects
  const pinnedLibraries = useMemo(() => {
    return pinnedSlugs
      .map((slug) => allLibraries.find((l) => l.slug === slug || l.id === slug))
      .filter((l): l is IconLibraryMeta => Boolean(l))
  }, [pinnedSlugs])

  // Clean / Customize SVG string
  const customizedSvg = useMemo(() => {
    if (!svgContent) return ''
    let clean = svgContent

    if (stripFill) {
      clean = clean
        .replace(/fill="[^"]*"/gi, 'fill="none"')
        .replace(/style="[^"]*fill:[^;"]*;?[^"]*"/gi, (m) => m.replace(/fill:[^;"]*;?/gi, 'fill:none;'))
    } else if (selectedColor && selectedColor !== '#000000') {
      clean = clean.replace(/currentColor/gi, selectedColor)
      clean = clean.replace(/stroke="(?!none)[^"]*"/gi, `stroke="${selectedColor}"`)
      clean = clean.replace(/fill="(?!none)[^"]*"/gi, `fill="${selectedColor}"`)
    }

    return clean
  }, [svgContent, selectedColor, stripFill])

  // Copy helper
  const triggerCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopyNotice(label)
    setTimeout(() => setCopyNotice(null), 2000)
  }

  // Download file helper
  const downloadFile = (content: Blob | string, filename: string, type: string) => {
    const blob = typeof content === 'string' ? new Blob([content], { type }) : content
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', minHeight: '80vh', position: 'relative' }}>
      
      {/* Dynamic CSS Override for SVG Preview Sizing & Visibility */}
      <style>{`
        .svg-modal-preview-wrapper svg {
          width: 100% !important;
          height: 100% !important;
          max-width: 130px !important;
          max-height: 130px !important;
          object-fit: contain !important;
        }
      `}</style>

      {/* Visual Breadcrumbs */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', fontFamily: 'var(--font-mono, monospace)', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>Bookmarks</span>
      </nav>

      {/* Header */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px', color: 'var(--text)' }}>
              Bookmarks <span style={{ color: 'var(--accent)' }}>& Saved Items</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', lineHeight: 1.7 }}>
              Access all your bookmarked icons and pinned library collections in one place.
            </p>
          </div>

          {bookmarks.length > 0 && (
            <button
              onClick={clearAllBookmarks}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#ef4444',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear All Bookmarks
            </button>
          )}
        </div>
      </section>

      {/* Navigation Tabs */}
      <section style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '28px' }}>
        <button
          onClick={() => setActiveTab('icons')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            background: activeTab === 'icons' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'icons' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          🔖 Saved Icons ({bookmarks.length})
        </button>

        <button
          onClick={() => setActiveTab('collections')}
          style={{
            padding: '8px 18px',
            borderRadius: '999px',
            background: activeTab === 'collections' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'collections' ? '#ffffff' : 'var(--text-muted)',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          📍 Pinned Collections ({pinnedLibraries.length})
        </button>
      </section>

      {/* Tab 1: Bookmarked Icons */}
      {activeTab === 'icons' && (
        <section style={{ marginBottom: '80px' }}>
          {bookmarks.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                placeholder="Filter saved icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {filteredBookmarks.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔖</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>No bookmarked icons yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Click the bookmark or select icon on any collection or search page to save icons here for quick access.
              </p>
              <Link
                href="/icon-search"
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-block',
                }}
              >
                Explore All Icons →
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '12px',
            }}>
              {filteredBookmarks.map((icon) => {
                const isSelected = selectedIcon?.id === icon.id
                const previewUrl = `/api/svg/${encodeURIComponent(icon.library)}/${encodeURIComponent(icon.name)}`

                return (
                  <button
                    key={icon.id}
                    onClick={() => setSelectedIcon(icon)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '110px',
                      borderRadius: '16px',
                      border: isSelected ? '2px solid #f43f5e' : '1px solid #e2e8f0',
                      background: '#ffffff',
                      boxShadow: isSelected ? '0 4px 16px rgba(244,63,94,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                      padding: '12px',
                    }}
                  >
                    {/* Remove bookmark button */}
                    <span
                      onClick={(e) => removeBookmark(icon.id, e)}
                      title="Remove bookmark"
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        fontSize: '12px',
                        color: '#ef4444',
                        padding: '2px',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </span>

                    <img
                      src={previewUrl}
                      alt={icon.name}
                      width={32}
                      height={32}
                      loading="lazy"
                      style={{ objectFit: 'contain', marginBottom: '8px' }}
                    />
                    <span style={{
                      fontSize: '11px',
                      color: '#475569',
                      fontWeight: 500,
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'var(--font-mono, monospace)',
                    }}>
                      {icon.displayName || icon.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Pinned Collections */}
      {activeTab === 'collections' && (
        <section style={{ marginBottom: '80px' }}>
          {pinnedLibraries.length === 0 ? (
            <div style={{ padding: '80px 20px', textAlign: 'center', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📍</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text)' }}>No pinned collections yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Click &quot;Pin this collection&quot; on any library page to pin your favorite icon sets here.
              </p>
              <Link
                href="/free-svg-icons"
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  background: 'var(--accent)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  display: 'inline-block',
                }}
              >
                Browse All Libraries →
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {pinnedLibraries.map((lib) => (
                <div
                  key={lib.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '14px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                  }}
                >
                  <button
                    onClick={() => removePinnedCollection(lib.slug)}
                    title="Unpin collection"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    ✕
                  </button>

                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: '16px', margin: '0 0 6px', color: 'var(--text)' }}>{lib.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '0 0 16px' }}>
                      {lib.iconCount.toLocaleString('en-US')} vector icons · {lib.license} License
                    </p>
                  </div>

                  <Link
                    href={`/icons/${lib.slug}`}
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'var(--accent-dim)',
                      color: 'var(--accent)',
                      textDecoration: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      textAlign: 'center',
                    }}
                  >
                    View Collection →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Interactive Selected Icon Modal */}
      {selectedIcon && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: '920px',
          background: 'var(--bg-card, #12131a)',
          border: '1px solid rgba(244,63,94,0.4)',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
          zIndex: 1000,
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: '220px 1fr',
          gap: '24px',
          backdropFilter: 'blur(16px)',
          animation: 'fadeInUp 0.2s ease-out'
        }}>
          {/* Close button */}
          <button
            onClick={() => setSelectedIcon(null)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}
          >
            ✕
          </button>

          {/* Left High-Contrast White Preview Box */}
          <div style={{
            background: 'radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px) #ffffff',
            backgroundSize: '16px 16px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            width: '100%',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {customizedSvg ? (
              <div
                className="svg-modal-preview-wrapper"
                dangerouslySetInnerHTML={{ __html: customizedSvg }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '130px',
                  height: '130px',
                  overflow: 'hidden',
                }}
              />
            ) : (
              <img
                src={`/api/svg/${encodeURIComponent(selectedIcon.library)}/${encodeURIComponent(selectedIcon.name)}`}
                alt=""
                width={80}
                height={80}
                style={{ objectFit: 'contain' }}
              />
            )}
          </div>

          {/* Right Controls & Export Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text)' }}>
                {selectedIcon.displayName || selectedIcon.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                Collection: <span style={{ color: 'var(--accent)' }}>{selectedIcon.library}</span>
              </p>

              {/* Customizer controls bar */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(Number(e.target.value))}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    color: 'var(--text)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {SIZE_OPTIONS.map((sz) => (
                    <option key={sz} value={sz}>{sz}px</option>
                  ))}
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px 8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>#</span>
                  <input
                    type="text"
                    value={selectedColor.replace('#', '')}
                    onChange={(e) => setSelectedColor(`#${e.target.value}`)}
                    style={{ width: '60px', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                  />
                  <input
                    type="color"
                    value={selectedColor.startsWith('#') && selectedColor.length === 7 ? selectedColor : '#000000'}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    style={{ width: '22px', height: '22px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'none' }}
                  />
                </div>

                <button
                  onClick={() => { setSelectedSize(512); setSelectedColor('#000000'); setStripFill(false); }}
                  title="Reset styles"
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                >
                  🔄
                </button>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  checked={stripFill}
                  onChange={(e) => setStripFill(e.target.checked)}
                  style={{ borderRadius: '4px', cursor: 'pointer' }}
                />
                Download SVG without fill color (CSS-styleable)
              </label>
            </div>

            {/* Export Actions (Pill Buttons) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => downloadFile(customizedSvg || svgContent, `${selectedIcon.name}.svg`, 'image/svg+xml')}
                style={{ padding: '7px 16px', borderRadius: '999px', background: '#f43f5e', color: '#fff', border: 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                💾 SVG
              </button>
              <button
                onClick={() => triggerCopy(customizedSvg || svgContent, 'SVG Code Copied!')}
                style={{ padding: '7px 16px', borderRadius: '999px', background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                📋 SVG
              </button>
              <button
                onClick={() => triggerCopy(`<${selectedIcon.name.split('-').map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join('')} size={${selectedSize}} color="${selectedColor}" />`, 'React snippet copied!')}
                style={{ padding: '7px 16px', borderRadius: '999px', background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                ⚛️ React
              </button>
            </div>

            {copyNotice && (
              <div style={{ position: 'absolute', top: '-40px', right: '20px', background: '#10b981', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
                ✓ {copyNotice}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
