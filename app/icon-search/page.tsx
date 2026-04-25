'use client'

import { useState, useMemo, useEffect, useRef } from 'react'

type Icon = {
  id: string
  name: string
  displayName: string
  library: string
  libraryName: string
  npmPackage: string
  license: string
  tags: string[]
  reactImport: string
  reactUsage: string
  svgUrl: string
}

const LIBRARIES = [
  { slug: 'all', name: 'All Libraries' },
  { slug: 'lucide-icons', name: 'Lucide' },
  { slug: 'heroicons', name: 'Heroicons' },
  { slug: 'tabler-icons', name: 'Tabler' },
  { slug: 'phosphor-icons', name: 'Phosphor' },
  { slug: 'radix-icons', name: 'Radix' },
]

const LIBRARY_COLORS: Record<string, string> = {
  'lucide-icons': '#7c6af7',
  'heroicons': '#06b6d4',
  'tabler-icons': '#10b981',
  'phosphor-icons': '#f59e0b',
  'radix-icons': '#ec4899',
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      style={{
        background: copied ? '#4ade8015' : 'var(--bg-secondary)',
        border: `1px solid ${copied ? '#4ade80' : 'var(--border)'}`,
        color: copied ? '#4ade80' : 'var(--text-muted)',
        padding: '4px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '11px',
        fontFamily: 'JetBrains Mono, monospace',
        transition: 'all 0.15s',
      }}
    >
      {copied ? '✓ copied' : label}
    </button>
  )
}

function IconCard({ icon }: { icon: Icon }) {
  const [imgError, setImgError] = useState(false)
  const color = LIBRARY_COLORS[icon.library] || 'var(--accent)'

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      transition: 'border-color 0.2s',
    }}>
      {/* Icon Preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60px',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
      }}>
        {!imgError ? (
          <img
            src={icon.svgUrl}
            alt={icon.name}
            width={32}
            height={32}
            style={{ filter: 'invert(1) brightness(0.8)', opacity: 0.9 }}
            onError={() => setImgError(true)}
          />
        ) : (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            color: 'var(--text-dim)',
          }}>
            {icon.displayName.slice(0, 4)}
          </span>
        )}
      </div>

      {/* Name + Library */}
      <div>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '4px',
          fontFamily: 'JetBrains Mono, monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {icon.name}
        </div>
        <span style={{
          fontSize: '10px',
          color,
          background: color + '15',
          border: `1px solid ${color}`,
          padding: '1px 6px',
          borderRadius: '3px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {icon.libraryName}
        </span>
      </div>

      {/* Copy Buttons */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <CopyButton text={icon.reactImport} label="import" />
        <CopyButton text={icon.reactUsage} label="JSX" />
      </div>

      {/* Full import on hover */}
      <div style={{
        background: 'var(--code-bg)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '6px 8px',
        fontSize: '10px',
        color: 'var(--green)',
        fontFamily: 'JetBrains Mono, monospace',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {icon.reactImport}
      </div>
    </div>
  )
}

export default function IconSearchPage() {
  const [query, setQuery] = useState('')
  const [selectedLib, setSelectedLib] = useState('all')
  const [icons, setIcons] = useState<Icon[]>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(120)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setVisibleCount(120)
  }, [query, selectedLib])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])


  // Lazy load icon data
  async function loadIcons() {
    if (loaded) return
    setLoading(true)
    try {
      const res = await fetch('/icon-search.json')
      const data = await res.json()
      setIcons(data)
      setLoaded(true)
    } catch {
      console.error('Failed to load icons')
    }
    setLoading(false)
  }

  const filtered = useMemo(() => {
    if (!query.trim() && selectedLib === 'all') return []
    return icons.filter(icon => {
      const matchesLib = selectedLib === 'all' || icon.library === selectedLib
      const q = query.toLowerCase().trim()
      const matchesQuery = !q ||
        icon.name.includes(q) ||
        icon.displayName.toLowerCase().includes(q) ||
        icon.tags.some(t => t.includes(q))
      return matchesLib && matchesQuery
    }).slice(0, visibleCount)
  }, [query, selectedLib, icons, visibleCount])

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <section style={{ marginBottom: '40px', paddingBottom: '40px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // ICON SEARCH
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px' }}>
          Search Icons Across<br />
          <span style={{ color: 'var(--accent)' }}>All Libraries</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px' }}>
          Find the same icon across Lucide, Heroicons, Tabler, Phosphor and more. Copy the React import instantly.
        </p>
      </section>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
            ref={searchRef}
            type="text"
            placeholder="Search icons — try 'camera', 'home', 'arrow'..."
            value={query}
            onChange={e => {
                setQuery(e.target.value)
                loadIcons()
            }}
            onFocus={e => {
                loadIcons()
                e.target.style.borderColor = 'var(--accent)'
            }}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
            style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '16px 20px',
                fontSize: '16px',
                color: 'var(--text)',
                fontFamily: 'JetBrains Mono, monospace',
                outline: 'none',
                transition: 'border-color 0.2s',
            }}
        />
      </div>

      {/* Per-library counts */}
      {loaded && (query || selectedLib !== 'all') && (
        <div style={{
          marginBottom: '16px',
          fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          {LIBRARIES.filter(l => l.slug !== 'all').map(lib => {
            const count = icons.filter(icon => {
              const q = query.toLowerCase().trim()
              return icon.library === lib.slug && (!q ||
                icon.name.includes(q) ||
                icon.displayName.toLowerCase().includes(q) ||
                icon.tags.some(t => t.includes(q)))
            }).length
            return (
              <span key={lib.slug} style={{ color: LIBRARY_COLORS[lib.slug] }}>
                {lib.name} ({count.toLocaleString()})
              </span>
            )
          })}
        </div>
      )}

      {/* Library Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}></div>

      {/* Library Filter */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {LIBRARIES.map(lib => (
          <button
            key={lib.slug}
            onClick={() => {
              setSelectedLib(lib.slug)
              loadIcons()
            }}
            style={{
              background: selectedLib === lib.slug ? 'var(--accent)' : 'var(--bg-card)',
              border: `1px solid ${selectedLib === lib.slug ? 'var(--accent)' : 'var(--border)'}`,
              color: selectedLib === lib.slug ? 'white' : 'var(--text-muted)',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              transition: 'all 0.15s',
            }}
          >
            {lib.name}
          </button>
        ))}
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          // loading icon database...
        </div>
      )}

      {!loading && !query && selectedLib === 'all' && loaded && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          // type to search {icons.length.toLocaleString()}+ icons
        </div>
      )}

      {!loading && !query && selectedLib === 'all' && !loaded && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          // click the search bar to load icons
        </div>
      )}

      {!loading && loaded && (query || selectedLib !== 'all') && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          // no icons found for "{query}" — try a different search term
        </div>
      )}

      {/* Results */}
      {filtered.length > 0 && (
        <>
          <div style={{ marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            // showing {filtered.length} results{filtered.length === visibleCount ? ' (top ${visibleCount})' : ''}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '12px',
          }}>
            {filtered.map(icon => (
              <IconCard key={icon.id} icon={icon} />
            ))}
          </div>
          {/* ← ADD LOAD MORE RIGHT HERE, before the closing </> */}
          {filtered.length === visibleCount && (
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <button
                onClick={() => setVisibleCount(v => v + 120)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                // load more
              </button>
            </div>
          )}
        </>
      )}

    </main>
  )
}