'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import AuthModal from '@/app/components/AuthModal'
import { createClient } from '@/lib/supabase'



type Icon = {
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

type Props = {
  icon: Icon
  initialSvg: string
  relatedIcons: Icon[]
  librarySlug: string
}

type SnippetTab = 'svg' | 'react' | 'jsx' | 'base64'

type DetailCartItem = {
  key: string
  icon: Icon
  size: number
  stroke: number
  color: string
}

type DetailPack = {
  id: string
  name: string
  items: DetailCartItem[]
  createdAt: string
}

const COMMON_COLORS = [
  '#ffffff', '#000000', '#4b5563', '#ef4444', '#f97316', '#f59e0b',
  '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
]

function getBrowseAllUrl(library: string): string {
  if (library.startsWith('iconify-')) {
    return `/icon-search?lib=iconify&iconifySet=${library.replace('iconify-', '')}`
  }
  return `/icon-search?lib=${library}`
}

export default function IconDetailClient({ icon, initialSvg, relatedIcons, librarySlug }: Props) {
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#818cf8')
  const [strokeWidth, setStrokeWidth] = useState(1.5)
  const [stripFill, setStripFill] = useState(false)
  const [activeTab, setActiveTab] = useState<SnippetTab>('svg')
  const [copied, setCopied] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
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


  const handleAddToCart = () => {
    try {
      const activeId = localStorage.getItem('icon-hub-workspace-active-pack') || 'default'
      const rawPacks = localStorage.getItem('icon-hub-workspace-packs')
      let packsList: DetailPack[] = [
        { id: 'default', name: 'Dashboard Pack', items: [], createdAt: new Date().toISOString() }
      ]

      if (rawPacks) {
        try {
          const parsedPacks = JSON.parse(rawPacks) as unknown
          packsList = Array.isArray(parsedPacks) ? parsedPacks as DetailPack[] : packsList
        } catch {}
      }

      const newItem = {
        key: `${icon.id}-${Date.now()}`,
        icon: icon,
        size: size,
        stroke: strokeWidth,
        color: color
      }

      packsList = packsList.map(p => {
        if (p.id === activeId) {
          return {
            ...p,
            items: [newItem, ...(p.items || [])]
          }
        }
        return p
      })

      localStorage.setItem('icon-hub-workspace-packs', JSON.stringify(packsList))
      window.dispatchEvent(new Event('cart-updated'))
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    } catch (e) {
      console.error('Failed to add to cart', e)
    }
  }

  const hasStroke = useMemo(() => {
    return initialSvg.includes('stroke-width') ||
           ['lucide-icons', 'tabler-icons', 'phosphor-icons', 'feather-icons', 'iconoir'].includes(icon.library)
  }, [initialSvg, icon.library])

  const modifiedSvg = useMemo(() => {
    if (!initialSvg) return ''
    let cleaned = initialSvg

    // Replace hardcoded stroke/fill currentColor or matching colors
    if (stripFill) {
      cleaned = cleaned
        .replace(/fill="[^"]*"/g, 'fill="none"')
        .replace(/style="[^"]*fill:[^;"]*;?[^"]*"/g, (match) => match.replace(/fill:[^;"]*;?/g, 'fill:none;'))
    } else {
      // If color is white or hex, replace fill and stroke values that aren't 'none'
      cleaned = cleaned.replace(/currentColor/g, color)
      // Some icons have explicit hex values we want to override to color
      if (icon.library !== 'iconify-simple-icons' && icon.library !== 'simple-icons') {
        cleaned = cleaned
          .replace(/stroke="#[a-fA-F0-9]{3,6}"/g, `stroke="${color}"`)
          .replace(/fill="#[a-fA-F0-9]{3,6}"(?!.*none)/g, `fill="${color}"`)
      }
    }

    // Replace/Inject width and height
    if (cleaned.includes('width=')) {
      cleaned = cleaned.replace(/width="[^"]*"/, `width="${size}"`)
    } else {
      cleaned = cleaned.replace('<svg', `<svg width="${size}"`)
    }
    if (cleaned.includes('height=')) {
      cleaned = cleaned.replace(/height="[^"]*"/, `height="${size}"`)
    } else {
      cleaned = cleaned.replace('<svg', `<svg height="${size}"`)
    }

    // Replace/Inject stroke-width if supported
    if (hasStroke) {
      if (cleaned.includes('stroke-width=')) {
        cleaned = cleaned.replace(/stroke-width="[^"]*"/g, `stroke-width="${strokeWidth}"`)
      } else {
        cleaned = cleaned.replace('<svg', `<svg stroke-width="${strokeWidth}"`)
      }
    }

    // Ensure it inherits color style
    if (!cleaned.includes('style=')) {
      cleaned = cleaned.replace('<svg', `<svg style="color: ${color}"`)
    } else {
      cleaned = cleaned.replace(/style="([^"]*)"/, `style="$1; color: ${color}"`)
    }

    return cleaned
  }, [initialSvg, size, color, strokeWidth, stripFill, hasStroke, icon.library])

  // Generate copy codes
  const reactCodeSnippet = useMemo(() => {
    // If it's a standard sub-library package
    if (icon.npmPackage && icon.npmPackage !== '@iconify/react') {
      const compName = icon.displayName || icon.name
      const strokeAttr = hasStroke ? ` strokeWidth={${strokeWidth}}` : ''
      return `import { ${compName} } from '${icon.npmPackage}';\n\nexport default function MyComponent() {\n  return <${compName} size={${size}} color="${color}"${strokeAttr} />;\n}`
    }
    // Generic Iconify usage
    return `import { Icon } from '@iconify/react';\n\nexport default function MyComponent() {\n  return <Icon icon="${icon.id.replace('iconify-', '').replace('-', ':')}" width={${size}} height={${size}} style={{ color: '${color}' }} />;\n}`
  }, [icon, size, color, strokeWidth, hasStroke])

  const jsxComponentSnippet = useMemo(() => {
    const compName = (icon.displayName || icon.name)
      .split(/[-_]/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '')

    const jsx = modifiedSvg
      .replace(/class=/g, 'className=')
      .replace(/stroke-width=/g, 'strokeWidth=')
      .replace(/stroke-linecap=/g, 'strokeLinecap=')
      .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
      .replace(/fill-rule=/g, 'fillRule=')
      .replace(/clip-rule=/g, 'clipRule=')
      .replace(/stroke-miterlimit=/g, 'strokeMiterlimit=')
      .replace(/stroke-dasharray=/g, 'strokeDasharray=')
      .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
      .replace(/style="[^"]*"/g, 'style={{ color: props.color || props.style?.color }}')
      .replace(/width="[^"]*"/g, 'width={props.size || props.width || "1em"}')
      .replace(/height="[^"]*"/g, 'height={props.size || props.height || "1em"}')

    return `import React from 'react';\n\nexport function ${compName}Icon(props: React.SVGProps<SVGSVGElement> & { size?: number }) {\n  return (\n    ${jsx.trim()}\n  );\n}`
  }, [modifiedSvg, icon])

  const base64Snippet = useMemo(() => {
    if (typeof window === 'undefined') return ''
    try {
      const b64 = btoa(unescape(encodeURIComponent(modifiedSvg)))
      return `data:image/svg+xml;base64,${b64}`
    } catch {
      return ''
    }
  }, [modifiedSvg])

  const activeSnippetText = useMemo(() => {
    switch (activeTab) {
      case 'svg': return modifiedSvg
      case 'react': return reactCodeSnippet
      case 'jsx': return jsxComponentSnippet
      case 'base64': return base64Snippet
      default: return ''
    }
  }, [activeTab, modifiedSvg, reactCodeSnippet, jsxComponentSnippet, base64Snippet])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeSnippetText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadSvg = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const blob = new Blob([modifiedSvg], { type: 'image/svg+xml;charset=utf-8' })
    const blobURL = URL.createObjectURL(blob)
    const downloadLink = document.createElement('a')
    downloadLink.href = blobURL
    downloadLink.download = `${icon.name}.svg`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(blobURL)
  }

  const handleDownloadPng = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    const svgEl = document.querySelector('.icon-detail-preview svg')
    if (!svgEl) return


    const svgString = new XMLSerializer().serializeToString(svgEl)
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
    const blobURL = URL.createObjectURL(svgBlob)

    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const renderSize = size * 2 // Render at 2x size for high-DPI clarity
      canvas.width = renderSize
      canvas.height = renderSize

      const context = canvas.getContext('2d')
      if (context) {
        context.clearRect(0, 0, renderSize, renderSize)
        context.drawImage(image, 0, 0, renderSize, renderSize)

        try {
          const pngURL = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.href = pngURL
          downloadLink.download = `${icon.name}.png`
          document.body.appendChild(downloadLink)
          downloadLink.click()
          document.body.removeChild(downloadLink)
        } catch (e) {
          console.error('Canvas serialization error:', e)
        }
      }
      URL.revokeObjectURL(blobURL)
    }
    image.src = blobURL
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>

      {/* Dynamic workspace wrapper */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1.2fr) minmax(320px, 1fr)',
        gap: '32px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Left column: giant preview with dynamic radial glow */}
        <div
          onMouseEnter={(e) => {
            const preview = e.currentTarget.querySelector('.icon-detail-preview') as HTMLElement
            if (preview) preview.style.transform = 'scale(1.06)'
          }}
          onMouseLeave={(e) => {
            const preview = e.currentTarget.querySelector('.icon-detail-preview') as HTMLElement
            if (preview) preview.style.transform = 'scale(1)'
          }}
          style={{
            background: `radial-gradient(circle at center, ${color}1c 0%, rgba(9, 9, 11, 0.4) 60%, rgba(9, 9, 11, 0.8) 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '64px',
            borderRight: '1px solid var(--border)',
            position: 'relative',
            minHeight: '420px',
            transition: 'background 0.3s ease'
          }}
        >
          {/* Subtle grid pattern background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            opacity: 0.25,
            pointerEvents: 'none'
          }} />

          <div
            className="icon-detail-preview"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: `drop-shadow(0 16px 32px ${color}33)`,
              transform: 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
            }}
            dangerouslySetInnerHTML={{ __html: modifiedSvg }}
          />
        </div>

        {/* Right column: controls & copy options */}
        <div style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div>
            <span style={{
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--accent)',
              background: 'var(--accent-dim)',
              border: '1px solid rgba(129, 140, 248, 0.2)',
              padding: '4px 10px',
              borderRadius: '100px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontWeight: 600,
              display: 'inline-block'
            }}>
              {icon.libraryName}
            </span>
            <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text)', marginTop: '12px', marginBottom: '6px', letterSpacing: '-0.02em' }}>
              {icon.displayName || icon.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>
                License: <a href={icon.licenseUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>{icon.license}</a>
              </span>
              {icon.legalSafe && (
                <span style={{
                  color: 'var(--green)',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(52, 211, 153, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Commercial Safe
                </span>
              )}
            </p>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: 0 }} />

          {/* Sizing options */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '10px', letterSpacing: '1px', fontFamily: 'JetBrains Mono, monospace' }}>
              ICON SIZE
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[24, 48, 64, 128, 256, 512].map(s => (
                <button suppressHydrationWarning
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    background: size === s ? 'var(--accent)' : 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid ' + (size === s ? 'var(--accent)' : 'var(--border)'),
                    color: size === s ? '#ffffff' : 'var(--text-muted)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: size === s ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (size !== s) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                      e.currentTarget.style.borderColor = 'var(--border-hover)'
                      e.currentTarget.style.color = 'var(--text)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (size !== s) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }
                  }}
                >
                  {s}px
                </button>
              ))}
            </div>
          </div>

          {/* Stroke Width (only if hasStroke) */}
          {hasStroke && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px', fontFamily: 'JetBrains Mono, monospace' }}>
                <label>STROKE WEIGHT</label>
                <span style={{ color: 'var(--accent)' }}>{strokeWidth}px</span>
              </div>
              <input suppressHydrationWarning
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
                aria-label="Stroke weight"
                title="Stroke weight"
                style={{
                  width: '100%',
                  accentColor: 'var(--accent)',
                  cursor: 'pointer'
                }}
              />
            </div>
          )}

          {/* Color picker */}
          <div>
            <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '10px', letterSpacing: '1px', fontFamily: 'JetBrains Mono, monospace' }}>
              COLOR PICKER
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{
                position: 'relative',
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
                background: color,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <input suppressHydrationWarning
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Pick icon color"
                  title="Pick icon color"
                  style={{
                    position: 'absolute',
                    opacity: 0,
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                />
              </div>
              <input suppressHydrationWarning
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Color hex value"
                title="Color hex value"
                placeholder="#818cf8"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontFamily: 'JetBrains Mono, monospace',
                  flexGrow: 1,
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: '6px' }}>
              {COMMON_COLORS.map(c => (
                <button suppressHydrationWarning
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    background: c,
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '6px',
                    border: color === c ? '2px solid var(--text)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    boxShadow: color === c ? '0 0 0 1px var(--bg)' : 'none',
                    transform: color === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = color === c ? 'scale(1.15)' : 'scale(1)'
                  }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Remove fill attribute check */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            marginTop: '4px',
            userSelect: 'none'
          }}>
            <input suppressHydrationWarning
              type="checkbox"
              checked={stripFill}
              onChange={(e) => setStripFill(e.target.checked)}
              style={{
                accentColor: 'var(--accent)',
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <span>Download SVG without fill color (CSS-styleable)</span>
          </label>

          {/* Download triggers */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button suppressHydrationWarning
              onClick={handleDownloadSvg}
              style={{
                flexGrow: 1,
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: `0 4px 16px ${color}1c`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download SVG
            </button>
            <button suppressHydrationWarning
              onClick={handleDownloadPng}
              style={{
                flexGrow: 1,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'
                e.currentTarget.style.borderColor = 'var(--border-hover)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download PNG
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button suppressHydrationWarning
            onClick={handleAddToCart}
            style={{
              background: addedToCart ? 'var(--green)' : 'var(--accent-accessible, #6366f1)',
              color: '#ffffff',
              border: 'none',
              padding: '15px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '6px',
              width: '100%',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: addedToCart ? '0 4px 16px rgba(52,211,153,0.2)' : '0 4px 16px rgba(99,102,241,0.2)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'none'
            }}
          >
            {addedToCart ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Added to Workspace Cart!
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </section>

      {/* Copy Code Panel Section */}
      <section style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(255, 255, 255, 0.01)',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingRight: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex' }}>
            {([
              { id: 'svg', label: 'RAW SVG' },
              { id: 'react', label: 'REACT IMPORT' },
              { id: 'jsx', label: 'STANDALONE JSX' },
              { id: 'base64', label: 'BASE64 DATA' },
            ] satisfies { id: SnippetTab; label: string }[]).map(t => (
              <button suppressHydrationWarning
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  background: activeTab === t.id ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                  border: 'none',
                  borderRight: '1px solid var(--border)',
                  borderTop: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeTab === t.id ? 'var(--text)' : 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '11px',
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== t.id) e.currentTarget.style.color = 'var(--text)'
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== t.id) e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button suppressHydrationWarning
            onClick={handleCopyCode}
            style={{
              background: copied ? 'rgba(52, 211, 153, 0.1)' : 'var(--accent-dim)',
              border: '1px solid ' + (copied ? 'var(--green)' : 'var(--accent)'),
              color: copied ? 'var(--green)' : 'var(--accent)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              margin: '8px 0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.85'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><polyline points="20 6 9 17 4 12"/></svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Code
              </>
            )}
          </button>
        </div>
        <pre style={{
          padding: '24px',
          margin: 0,
          background: '#09090b',
          overflowX: 'auto',
          fontSize: '13px',
          fontFamily: 'JetBrains Mono, monospace',
          color: '#e2e8f0',
          lineHeight: '1.6',
          maxHeight: '320px'
        }}>
          <code>{activeSnippetText}</code>
        </pre>
      </section>

      {/* "Icons in Action" Bento Showcase */}
      <section>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text)', marginBottom: '24px', letterSpacing: '-0.01em' }}>
          Icons in Action
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gridAutoRows: 'minmax(120px, auto)',
          gap: '24px'
        }}>
          {/* Card 1: Web Application Mockup (Span 8 cols, 2 rows) */}
          <div style={{
            gridColumn: 'span 8',
            gridRow: 'span 2',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minHeight: '320px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', margin: 0, letterSpacing: '1.5px', fontFamily: 'JetBrains Mono, monospace' }}>
              WEB APPLICATION HEADER & NAVIGATION
            </h3>
            <div style={{
              border: '1px solid var(--border)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'rgba(9, 9, 11, 0.3)',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Browser mockup header */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24', opacity: 0.8 }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', opacity: 0.8 }} />
                <div style={{
                  background: '#09090b',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  padding: '4px 24px',
                  borderRadius: '6px',
                  marginLeft: '24px',
                  flexGrow: 0.7,
                  textAlign: 'center',
                  fontFamily: 'JetBrains Mono, monospace',
                  border: '1px solid var(--border)'
                }}>
                  my-app.com/dashboard
                </div>
              </div>
              {/* Browser Navbar & page */}
              <div style={{ display: 'flex', flexGrow: 1, minHeight: '140px' }}>
                <div style={{ width: '160px', borderRight: '1px solid var(--border)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.1)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color,
                    background: color + '14',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${color}22`
                  }}>
                    <span style={{ display: 'inline-flex', transform: 'scale(0.85)' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, 'width="16"').replace(/height="[^"]*"/, 'height="16"') }} />
                    <span>Dashboard</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                    <span>Analytics</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)', padding: '8px 12px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    <span>Settings</span>
                  </div>
                </div>
                {/* Browser Inner Page */}
                <div style={{ flexGrow: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, 'width="20"').replace(/height="[^"]*"/, 'height="20"') }} />
                    <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Overview Dashboard</h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border)', borderRadius: '4px', opacity: 0.5 }} />
                    <div style={{ width: '85%', height: '8px', background: 'var(--border)', borderRadius: '4px', opacity: 0.3 }} />
                    <div style={{ width: '60%', height: '8px', background: 'var(--border)', borderRadius: '4px', opacity: 0.2 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Stepper Mockup (Span 4 cols, 1 row) */}
          <div style={{
            gridColumn: 'span 4',
            gridRow: 'span 1',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'JetBrains Mono, monospace' }}>
              PROGRESS STEPPER
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', width: '100%', gap: '6px', padding: '8px 0' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: `0 0 12px ${color}55`
              }}>
                <span style={{ display: 'inline-flex', filter: 'brightness(10)' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, 'width="15"').replace(/height="[^"]*"/, 'height="15"') }} />
              </div>
              <div style={{ flexGrow: 1, height: '3px', background: color }} />
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: `0 0 12px ${color}55`
              }}>
                <span style={{ display: 'inline-flex', filter: 'brightness(10)' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, 'width="15"').replace(/height="[^"]*"/, 'height="15"') }} />
              </div>
              <div style={{ flexGrow: 1, height: '3px', background: 'var(--border)' }} />
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '2px solid var(--border)',
                background: 'rgba(255,255,255,0.01)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>3</span>
              </div>
            </div>
          </div>

          {/* Card 3: Mobile Button UI Actions (Span 4 cols, 1 row) */}
          <div style={{
            gridColumn: 'span 4',
            gridRow: 'span 1',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'JetBrains Mono, monospace' }}>
              BUTTON UI ACTIONS
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button suppressHydrationWarning style={{
                background: color,
                color: '#ffffff',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${color}33`
              }}>
                <span style={{ display: 'inline-flex', filter: 'brightness(10)' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, 'width="14"').replace(/height="[^"]*"/, 'height="14"') }} />
                <span>Primary CTA</span>
              </button>
              <button suppressHydrationWarning style={{
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, 'width="14"').replace(/height="[^"]*"/, 'height="14"') }} />
                <span>Secondary</span>
              </button>
            </div>
          </div>

          {/* Card 4: Size Scale Grid (Span 6 cols, 1 row) */}
          <div style={{
            gridColumn: 'span 6',
            gridRow: 'span 1',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', fontFamily: 'JetBrains Mono, monospace' }}>
              SCALABILITY & CLARITY
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', flexGrow: 1, paddingBottom: '4px' }}>
              {[12, 16, 24, 32, 48].map(s => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '60px',
                    height: '60px',
                    background: 'rgba(9, 9, 11, 0.3)',
                    borderRadius: '10px',
                    border: '1px dashed var(--border)'
                  }}>
                    <span style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, `width="${s}"`).replace(/height="[^"]*"/, `height="${s}"`) }} />
                  </div>
                  <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', fontWeight: 600 }}>{s}px</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Quotes box (Span 6 cols, 1 row) */}
          <div style={{
            gridColumn: 'span 6',
            gridRow: 'span 1',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color, opacity: 0.2, fontSize: '56px', fontWeight: 900, lineHeight: 0.3, fontFamily: 'serif' }}>“</div>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13.5px', lineHeight: 1.6, fontStyle: 'italic' }}>
                Highly adaptable, clean vectors that scale perfectly across modern UI components, navigation bars, and mobile actions. Perfectly pre-vetted for production deployment.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-end' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${color} 0%, var(--green) 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 2px 8px ${color}33`
              }}>
                <span style={{ display: 'inline-flex', filter: 'brightness(10)' }} dangerouslySetInnerHTML={{ __html: modifiedSvg.replace(/width="[^"]*"/, 'width="12"').replace(/height="[^"]*"/, 'height="12"') }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>IconSearch Presets</div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        padding: '36px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', marginBottom: '28px', letterSpacing: '-0.01em' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>Q.</span>
              How do I use this icon in my React/Next.js project?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, margin: 0, paddingLeft: '24px' }}>
              You have two choices: install the official package listed under the "REACT IMPORT" tab (e.g. <code>npm install {icon.npmPackage}</code>) and import the icon directly, or copy the complete React Component code from the "STANDALONE JSX" tab and paste it directly into a local file (e.g. <code>{icon.displayName || icon.name}Icon.tsx</code>) to avoid installing any npm packages.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>Q.</span>
              Is this icon free for commercial use?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, margin: 0, paddingLeft: '24px' }}>
              Yes. This icon is published under the open-source **{icon.license}** license. The license grants full permissions for personal and commercial usage (e.g., in SaaS platforms, client projects, or business landing pages). Attributing the icon creator is generally not required for MIT/ISC licenses, but check details on our dedicated <Link href="/licenses" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>License Guide</Link>.
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>Q.</span>
              What is the "Download SVG without fill color" toggle?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, margin: 0, paddingLeft: '24px' }}>
              Many SVGs ship with inline <code>fill="..."</code> attributes. By checking this toggle, we strip these attributes and enforce <code>fill="none"</code>, making the SVG fully styleable via CSS classes or Tailwind utility classes like <code>fill-current</code>.
            </p>
          </div>
        </div>
      </section>

      {/* Related Icons section */}
      <section style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.01em' }}>
            Related Icons in {icon.libraryName}
          </h2>
          <Link href={getBrowseAllUrl(icon.library)} style={{
            color: 'var(--accent)',
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            textDecoration: 'none',
            fontWeight: 700
          }}>
            Browse all {icon.libraryName} icons →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '16px'
        }}>
          {relatedIcons.map(ri => {
            const cleanRiUrl = ri.svgUrl
              ? ri.svgUrl.replace('lucide-static/icons/', 'lucide-static@0.415.0/icons/')
                         .replace('@tabler/icons/icons/', '@tabler/icons@2.47.0/icons/')
                         .replace('@phosphor-icons/core/assets/', '@phosphor-icons/core@2.1.1/assets/')
              : ''
            return (
              <Link
                key={ri.id}
                href={`/icons/${librarySlug}/${ri.name}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '24px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  textDecoration: 'none',
                  color: 'var(--text)',
                  transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = color
                  e.currentTarget.style.boxShadow = `0 10px 20px ${color}14`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  background: 'rgba(9,9,9,0.3)',
                  borderRadius: '10px',
                  border: '1px solid var(--border)'
                }}>
                  {cleanRiUrl ? (
                    <img
                      src={cleanRiUrl}
                      alt={ri.name}
                      width="24"
                      height="24"
                      style={{
                        filter: 'invert(1) opacity(0.85)'
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>svg</span>
                  )}
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  textAlign: 'center',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  width: '100%',
                  color: 'var(--text-muted)'
                }} title={ri.displayName || ri.name}>
                  {ri.name}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authUser) => {
          setUser(authUser)
          setIsAuthModalOpen(false)
        }}
      />
    </div>
  )
}

