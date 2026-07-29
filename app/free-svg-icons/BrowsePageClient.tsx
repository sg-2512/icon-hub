'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import type { IconLibraryMeta } from '../../data/library-catalog'

type Props = {
  libraries: IconLibraryMeta[]
  totalIconCount: number
}

export default function BrowsePageClient({ libraries, totalIconCount }: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return libraries
    const q = query.toLowerCase().trim()
    return libraries.filter(
      (lib) => lib.name.toLowerCase().includes(q) || lib.slug.toLowerCase().includes(q) || lib.license.toLowerCase().includes(q)
    )
  }, [libraries, query])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header */}
      <section style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '2px', marginBottom: '12px' }}>
          // BROWSE DIRECTORY
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px', color: 'var(--text)' }}>
          Free SVG Icons <span style={{ color: 'var(--accent)' }}>for Web Projects</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '640px', marginBottom: '24px', lineHeight: 1.7 }}>
          Browse all {libraries.length} open-source icon libraries and explore over {totalIconCount.toLocaleString('en-US')} high-quality vector icons. Free for commercial and personal usage.
        </p>

        {/* License Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['MIT License', 'Apache 2.0', 'ISC License', 'CC0 / CC BY', 'TypeScript Native', 'React & Next.js', 'Vue & Svelte'].map((tag) => (
            <span
              key={tag}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                padding: '5px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Overview */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Searchable Index', value: totalIconCount.toLocaleString('en-US') },
            { label: 'Icon Libraries', value: libraries.length.toString() },
            { label: 'Commercial Safe', value: '100% Free' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent)', marginBottom: '4px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Search Input for 242 Libraries */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '12px 18px',
        }}>
          <span style={{ fontSize: '18px', color: 'var(--text-muted)' }}>🔍</span>
          <input
            type="text"
            placeholder={`Search all ${libraries.length} icon libraries (e.g. mage, solar, heroicons, material)...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '13px' }}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* All 242 Libraries Grid */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
            ALL ICON LIBRARIES ({filtered.length})
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border)' }}>
            No library matching &quot;{query}&quot;
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
          }}>
            {filtered.map((lib) => (
              <Link
                key={lib.id}
                href={`/icons/${lib.slug}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '20px',
                  textDecoration: 'none',
                  color: 'var(--text)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '16px', margin: 0 }}>{lib.name}</h3>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--green, #34d399)',
                      background: 'rgba(52,211,153,0.1)',
                      border: '1px solid rgba(52,211,153,0.3)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono, monospace)',
                      flexShrink: 0
                    }}>
                      {lib.license}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px' }}>
                    Vector SVG collection containing {lib.iconCount.toLocaleString('en-US')} high-quality icons.
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono, monospace)', fontWeight: 600 }}>
                    {lib.iconCount.toLocaleString('en-US')} icons
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Explore →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
