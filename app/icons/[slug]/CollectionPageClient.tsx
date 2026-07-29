'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { IconLibraryMeta } from '../../../data/library-catalog'

type CollectionIcon = {
  id: string
  name: string
  displayName: string
  library: string
  libraryName: string
  license: string
  tags?: string[]
  svgUrl: string
}

type Props = {
  meta: IconLibraryMeta
  icons: CollectionIcon[]
}

const SIZE_OPTIONS = [16, 24, 32, 48, 64, 128, 256, 512]

export default function CollectionPageClient({ meta, icons }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<CollectionIcon | null>(null)
  const [pinned, setPinned] = useState(false)
  const [visibleCount, setVisibleCount] = useState(120)
  
  // Customizer state for selected icon modal
  const [selectedSize, setSelectedSize] = useState(512)
  const [selectedColor, setSelectedColor] = useState('#000000')
  const [stripFill, setStripFill] = useState(false)
  const [svgContent, setSvgContent] = useState<string>('')
  const [copyNotice, setCopyNotice] = useState<string | null>(null)

  // Reset pagination when search query changes
  useEffect(() => {
    setVisibleCount(120)
  }, [searchQuery])

  // Load pinned state
  useEffect(() => {
    try {
      const pinnedList = JSON.parse(localStorage.getItem('icon-hub-pinned-collections') || '[]')
      setPinned(pinnedList.includes(meta.slug))
    } catch {}
  }, [meta.slug])

  // Toggle pin
  const togglePin = () => {
    try {
      const pinnedList: string[] = JSON.parse(localStorage.getItem('icon-hub-pinned-collections') || '[]')
      let updated: string[] = []
      if (pinnedList.includes(meta.slug)) {
        updated = pinnedList.filter((s) => s !== meta.slug)
        setPinned(false)
      } else {
        updated = [...pinnedList, meta.slug]
        setPinned(true)
      }
      localStorage.setItem('icon-hub-pinned-collections', JSON.stringify(updated))
    } catch {}
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

  // Filter icons inside collection
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) return icons
    const q = searchQuery.toLowerCase().trim()
    return icons.filter((icon) => {
      const nameMatch = icon.name.toLowerCase().includes(q) || icon.displayName.toLowerCase().includes(q)
      const tagMatch = icon.tags ? icon.tags.some((t) => t.toLowerCase().includes(q)) : false
      return nameMatch || tagMatch
    })
  }, [icons, searchQuery])

  // Paged icons slice for performance (max 120 per page initial)
  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount)
  }, [filteredIcons, visibleCount])

  // Clean / Customize SVG string
  const customizedSvg = useMemo(() => {
    if (!svgContent) return ''
    let clean = svgContent

    if (stripFill) {
      clean = clean
        .replace(/fill="[^"]*"/gi, 'fill="none"')
        .replace(/style="[^"]*fill:[^;"]*;?[^"]*"/gi, (m) => m.replace(/fill:[^;"]*;?/gi, 'fill:none;'))
    } else {
      clean = clean.replace(/currentColor/gi, selectedColor)
      // Replace stroke/fill hex values if specified
      if (selectedColor && selectedColor !== '#000000') {
        clean = clean.replace(/stroke="(?!none)[^"]*"/gi, `stroke="${selectedColor}"`)
        clean = clean.replace(/fill="(?!none)[^"]*"/gi, `fill="${selectedColor}"`)
      }
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

  // Render PNG/WebP blob
  const exportImageFormat = (format: 'png' | 'webp') => {
    if (!customizedSvg) return
    const img = new Image()
    const svgBlob = new Blob([customizedSvg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = selectedSize
      canvas.height = selectedSize
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, selectedSize, selectedSize)
        canvas.toBlob((blob) => {
          if (blob) {
            downloadFile(blob, `${selectedIcon?.name || 'icon'}.${format}`, `image/${format}`)
          }
        }, `image/${format}`)
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px', position: 'relative' }}>
      
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

      {/* Visual Breadcrumb Navigation */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', fontFamily: 'var(--font-mono, monospace)', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <Link href="/free-svg-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Libraries</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>{meta.name}</span>
      </nav>

      {/* Hero Intro (Matching Screenshot) */}
      <section style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', color: 'var(--text)' }}>
          {meta.name}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '850px', lineHeight: 1.7, marginBottom: '24px' }}>
          Discover {meta.iconCount.toLocaleString('en-US')} high-quality icons in the {meta.name} collection. 
          Licensed under {meta.license}, perfect for web, app, and design projects.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={togglePin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '999px',
              background: pinned ? 'var(--accent)' : 'linear-gradient(135deg, #e11d48, #f43f5e)',
              color: '#ffffff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(244,63,94,0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '16px' }}>{pinned ? '📌' : '📍'}</span>
            {pinned ? 'Pinned Collection' : 'Pin this collection'}
          </button>

          <button
            onClick={() => triggerCopy(window.location.href, 'Collection link copied!')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🔗</span> Share Collection
          </button>
        </div>
      </section>

      {/* Collection Search Input Bar (Matching Screenshot) */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px 18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder={`Search in ${meta.iconCount.toLocaleString('en-US')} svg icons`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '15px',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Icon Grid Catalog */}
      <section style={{ marginBottom: '100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {meta.name.toUpperCase()} CATALOG (Showing {displayedIcons.length} of {filteredIcons.length.toLocaleString('en-US')})
          </span>
        </div>

        {filteredIcons.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
            No icons found matching &quot;{searchQuery}&quot;
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
              gap: '12px',
            }}>
              {displayedIcons.map((icon) => {
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
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#f43f5e'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }
                    }}
                  >
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

            {/* Load More Button (Loads Next 120 Icons) */}
            {visibleCount < filteredIcons.length && (
              <div style={{ textAlign: 'center', marginTop: '36px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={() => setVisibleCount((prev) => prev + 120)}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '999px',
                    background: 'var(--accent, #6366f1)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Load More Icons (120 More)
                </button>
                <button
                  onClick={() => setVisibleCount(filteredIcons.length)}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '999px',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Show All ({filteredIcons.length.toLocaleString('en-US')})
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Interactive Floating Selected Icon Modal (Matching Screenshot) */}
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

          {/* Left High-Contrast White Preview Box with Grid Pattern */}
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
            boxSizing: 'border-box',
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
                By Maintainers in <span style={{ color: 'var(--accent)' }}>{meta.name}</span>
              </p>

              {/* Customizer controls bar */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '14px' }}>
                {/* Size selector */}
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

                {/* Color Hex Input & Swatch */}
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

                {/* Reset button */}
                <button
                  onClick={() => { setSelectedSize(512); setSelectedColor('#000000'); setStripFill(false); }}
                  title="Reset styles"
                  style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
                >
                  🔄
                </button>
              </div>

              {/* Checkbox */}
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
                onClick={() => exportImageFormat('png')}
                style={{ padding: '7px 16px', borderRadius: '999px', background: '#f43f5e', color: '#fff', border: 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                💾 PNG
              </button>
              <button
                onClick={() => exportImageFormat('webp')}
                style={{ padding: '7px 16px', borderRadius: '999px', background: '#f43f5e', color: '#fff', border: 'none', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                💾 WebP
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
              <button
                onClick={() => triggerCopy(`import { FC } from 'react'\n// ${selectedIcon.displayName} (${meta.name})\nexport const Icon: FC = () => (\n  ${customizedSvg || svgContent}\n)`, 'TypeScript snippet copied!')}
                style={{ padding: '7px 16px', borderRadius: '999px', background: 'rgba(244,63,94,0.12)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                📘 TypeScript
              </button>
              <button
                onClick={() => triggerCopy(`${window.location.origin}/api/svg/${encodeURIComponent(selectedIcon.library)}/${encodeURIComponent(selectedIcon.name)}`, 'CDN URL copied!')}
                style={{ padding: '7px 16px', borderRadius: '999px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
              >
                🌐 CDN
              </button>
            </div>

            {/* Copy Notification Toast */}
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
