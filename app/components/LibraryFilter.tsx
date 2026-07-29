'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { allLibraries, type IconLibraryMeta } from '@/data/library-catalog'

type Props = {
  value: string
  onChange: (librarySlugOrId: string) => void
}

export default function LibraryFilter({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Selected library metadata
  const selectedMeta = useMemo(() => {
    if (!value || value === 'all') return null
    const clean = value.toLowerCase().replace(/^iconify-/, '')
    return allLibraries.find((lib) => lib.slug === clean || lib.id === value || lib.id === `iconify-${clean}`)
  }, [value])

  // Filtered libraries by user search query inside dropdown
  const filteredLibraries = useMemo(() => {
    if (!query.trim()) return allLibraries
    const q = query.toLowerCase().trim()
    return allLibraries.filter(
      (lib) => lib.name.toLowerCase().includes(q) || lib.slug.toLowerCase().includes(q)
    )
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {/* Filter trigger button */}
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          padding: '8px 12px',
          borderRadius: '8px',
          background: '#161722',
          border: isOpen ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.15)',
          color: '#ffffff',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          boxSizing: 'border-box',
          height: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
          <span style={{ fontSize: '14px', color: '#94a3b8', flexShrink: 0 }}>📚</span>
          <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', color: '#ffffff' }}>
            {selectedMeta ? selectedMeta.name : 'All Libraries'}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
          ▼
        </span>
      </button>

      {/* Dropdown Panel - Solid Opaque Dark Background */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            width: '300px',
            background: '#181926',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '12px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.95)',
            zIndex: 9999,
            padding: '10px',
            maxHeight: '380px',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Inner Search Input */}
          <div style={{ padding: '2px', marginBottom: '8px' }}>
            <input
              suppressHydrationWarning
              type="text"
              placeholder={`Search ${allLibraries.length} icon libraries...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#222436',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* List of libraries */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px', paddingRight: '2px' }}>
            <button
              type="button"
              onClick={() => { onChange('all'); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                background: !selectedMeta ? 'rgba(129,140,248,0.2)' : 'transparent',
                color: !selectedMeta ? '#a5b4fc' : '#f1f5f9',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (selectedMeta) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              }}
              onMouseLeave={(e) => {
                if (selectedMeta) e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontWeight: !selectedMeta ? 700 : 500 }}>All Libraries</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)' }}>
                355k
              </span>
            </button>

            {filteredLibraries.map((lib) => {
              const isSelected = selectedMeta?.id === lib.id || selectedMeta?.slug === lib.slug
              return (
                <button
                  key={lib.id}
                  type="button"
                  onClick={() => { onChange(lib.slug); setIsOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(129,140,248,0.2)' : 'transparent',
                    color: isSelected ? '#a5b4fc' : '#f1f5f9',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <span style={{ fontWeight: isSelected ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lib.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono, monospace)', marginLeft: '8px', flexShrink: 0 }}>
                    {lib.iconCount.toLocaleString('en-US')}
                  </span>
                </button>
              )
            })}

            {filteredLibraries.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                No library found matching &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
