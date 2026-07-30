'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { allLibraries, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'

export default function StatsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [licenseFilter, setLicenseFilter] = useState('all')

  const totalLibraries = allLibraries.length
  const totalIcons = useMemo(() => allLibraries.reduce((sum, lib) => sum + lib.iconCount, 0), [])
  const maxIconsInSingleLib = useMemo(() => Math.max(...allLibraries.map(l => l.iconCount)), [])

  // License Distribution Calculation
  const licenseStats = useMemo(() => {
    const counts: Record<string, number> = {}
    allLibraries.forEach(lib => {
      const lic = lib.license || 'Other'
      counts[lic] = (counts[lic] || 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([license, count]) => ({
        license,
        count,
        percentage: ((count / totalLibraries) * 100).toFixed(1)
      }))
  }, [totalLibraries])

  // Filtered Libraries
  const filteredLibraries = useMemo(() => {
    return allLibraries.filter(lib => {
      const matchesSearch = lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            lib.slug.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLicense = licenseFilter === 'all' || lib.license === licenseFilter
      return matchesSearch && matchesLicense
    })
  }, [searchQuery, licenseFilter])

  // Top 15 Libraries for Bar Chart
  const top15Libraries = useMemo(() => {
    return [...allLibraries].sort((a, b) => b.iconCount - a.iconCount).slice(0, 15)
  }, [])

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      
      {/* Header */}
      <header style={{ marginBottom: '48px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '2px', marginBottom: '12px', textTransform: 'uppercase' }}>
          // ECOSYSTEM ANALYTICS & RANKINGS
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.02em' }}>
          Icon Library<br />
          <span style={{ color: 'var(--accent)' }}>Stats & Ecosystem Breakdown</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '17px', maxWidth: '640px', lineHeight: '1.6' }}>
          Real-time statistics across all <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalLibraries} open-source icon libraries</span> and <span style={{ color: '#ffffff', fontWeight: 600 }}>{totalIcons.toLocaleString('en-US')} vector icons</span> indexed on IconSearch.
        </p>
      </header>

      {/* Overview Stat Cards */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>
          Key Metrics Summary
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Unique Libraries', value: totalLibraries.toString(), sub: '100% Deduplicated', color: '#818cf8' },
            { label: 'Total Vector Icons', value: totalIcons.toLocaleString('en-US'), sub: `${SEARCHABLE_ICON_COUNT.toLocaleString()} Searchable`, color: '#38bdf8' },
            { label: 'Largest Collection', value: `${maxIconsInSingleLib.toLocaleString()} icons`, sub: 'Fluent UI System Icons', color: '#34d399' },
            { label: 'Avg Icons / Set', value: Math.round(totalIcons / totalLibraries).toLocaleString(), sub: 'High-density sets', color: '#fbbf24' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--bg-card, #12131a)', border: '1px solid var(--border, rgba(255,255,255,0.08))', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted, #888)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 600 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-mono, monospace)', color: stat.color, marginBottom: '6px' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top 15 Largest Libraries Chart */}
      <section style={{ marginBottom: '48px', background: 'var(--bg-card, #12131a)', border: '1px solid var(--border, rgba(255,255,255,0.08))', borderRadius: '16px', padding: '28px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              Top 15 Icon Libraries by Volume
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Comparing total icon counts across the largest open-source sets
            </p>
          </div>
          <span style={{ fontSize: '12px', padding: '4px 10px', background: 'rgba(129,140,248,0.1)', color: 'var(--accent)', borderRadius: '6px', border: '1px solid rgba(129,140,248,0.2)', fontWeight: 600 }}>
            Volume Ranking
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {top15Libraries.map((lib, idx) => {
            const pct = Math.max(4, Math.round((lib.iconCount / maxIconsInSingleLib) * 100))
            return (
              <div key={lib.id} style={{ display: 'grid', gridTemplateColumns: '30px 200px 1fr 90px', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: idx < 3 ? 'var(--accent)' : '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                  #{idx + 1}
                </span>
                <Link href={`/icons/${lib.slug}`} style={{ color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hover:text-accent">
                  {lib.name}
                </Link>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${pct}%`, 
                      height: '100%', 
                      background: idx === 0 ? 'linear-gradient(90deg, #818cf8, #c084fc)' : idx < 3 ? 'linear-gradient(90deg, #38bdf8, #818cf8)' : '#334155',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'var(--font-mono, monospace)', textAlign: 'right' }}>
                  {lib.iconCount.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* License Breakdown Section */}
      <section style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>
          Open-Source License Distribution
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {licenseStats.slice(0, 6).map(stat => (
            <div 
              key={stat.license} 
              onClick={() => setLicenseFilter(licenseFilter === stat.license ? 'all' : stat.license)}
              style={{ 
                background: licenseFilter === stat.license ? 'rgba(129,140,248,0.15)' : 'var(--bg-card, #12131a)', 
                border: licenseFilter === stat.license ? '1px solid var(--accent)' : '1px solid var(--border, rgba(255,255,255,0.08))', 
                borderRadius: '12px', 
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {stat.license}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {stat.count} sets ({stat.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full library data table */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
              All {totalLibraries} Icon Libraries
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Search, filter, and inspect icon collections
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '480px', flexWrap: 'wrap' }}>
            <input
              suppressHydrationWarning
              type="text"
              placeholder={`Search ${totalLibraries} libraries...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#161722',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <select
              suppressHydrationWarning
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#161722',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Licenses</option>
              {licenseStats.map(stat => (
                <option key={stat.license} value={stat.license}>{stat.license} ({stat.count})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div style={{ background: 'var(--bg-card, #12131a)', border: '1px solid var(--border, rgba(255,255,255,0.08))', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '1px' }}>#</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '1px' }}>Library Name</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '1px' }}>Slug</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '1px' }}>Icons</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '1px' }}>License</th>
                  <th style={{ padding: '14px 20px', fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLibraries.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                      No libraries matching &quot;{searchQuery}&quot;
                    </td>
                  </tr>
                ) : (
                  filteredLibraries.map((lib, idx) => (
                    <tr 
                      key={lib.id} 
                      style={{ 
                        borderBottom: idx < filteredLibraries.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                        transition: 'background 0.15s ease'
                      }}
                      className="hover:bg-white/5"
                    >
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b', fontFamily: 'var(--font-mono, monospace)' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, fontSize: '14px', color: '#ffffff' }}>
                        <Link href={`/icons/${lib.slug}`} style={{ color: '#ffffff', textDecoration: 'none' }}>
                          {lib.name}
                        </Link>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '12px', color: '#818cf8', fontFamily: 'var(--font-mono, monospace)' }}>
                        {lib.slug}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'var(--font-mono, monospace)' }}>
                        {lib.iconCount.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', fontFamily: 'var(--font-mono, monospace)' }}>
                          {lib.license}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <Link 
                          href={`/icons/${lib.slug}`} 
                          style={{ 
                            fontSize: '12px', 
                            color: 'var(--accent)', 
                            textDecoration: 'none', 
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          View Set →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  )
}
