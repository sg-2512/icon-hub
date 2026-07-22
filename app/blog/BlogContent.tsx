'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type BlogPost = {
  slug: string
  title: string
  description: string
  date: string
  author: string
  category: string
  tags: string[]
  featured: boolean
}

// Category color mapping
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  Tutorial: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' },
  Guide: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
  Design: { bg: 'rgba(251, 191, 36, 0.15)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)' },
  Performance: { bg: 'rgba(248, 113, 113, 0.15)', text: '#f87171', border: 'rgba(248, 113, 113, 0.3)' },
  Comparison: { bg: 'rgba(34, 211, 238, 0.15)', text: '#22d3ee', border: 'rgba(34, 211, 238, 0.3)' },
  General: { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
  GUIDE: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
}

const categoryGradients: Record<string, string> = {
  Tutorial: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)',
  Guide: 'linear-gradient(135deg, #052e16 0%, #065f46 50%, #047857 100%)',
  Design: 'linear-gradient(135deg, #422006 0%, #713f12 50%, #854d0e 100%)',
  Performance: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)',
  Comparison: 'linear-gradient(135deg, #083344 0%, #155e75 50%, #0e7490 100%)',
  General: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
  GUIDE: 'linear-gradient(135deg, #052e16 0%, #065f46 50%, #047857 100%)',
}

const categoryIcons: Record<string, string> = {
  Tutorial: '📖',
  Guide: '🧭',
  Design: '🎨',
  Performance: '⚡',
  Comparison: '⚖️',
  General: '📝',
  GUIDE: '🧭',
}

export default function BlogContent({ posts }: { posts: BlogPost[] }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(posts.map(p => p.category)))]
  }, [posts])

  const filteredPosts = useMemo(() => {
    let filtered = posts

    // Filter by category
    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory)
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [posts, activeCategory, search])

  return (
    <>
      {/* Hero Banner */}
      <section style={{
        background: 'linear-gradient(180deg, rgba(129, 140, 248, 0.08) 0%, var(--bg) 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '60px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 42px)',
            fontWeight: 800,
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.03em',
            marginBottom: '12px',
            color: 'var(--text)',
          }}>
            IconSearch Blog
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '16px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}>
            A blog about icons, design systems, development and performance
          </p>

          {/* Functional Search Bar */}
          <div style={{
            maxWidth: '520px',
            margin: '0 auto',
            position: 'relative',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '0 20px',
              gap: '12px',
              transition: 'border-color 0.2s',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: '14px',
                  padding: '14px 0',
                  width: '100%',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono, monospace',
                    flexShrink: 0,
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Sidebar + Cards */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '48px 24px 80px',
        display: 'grid',
        gridTemplateColumns: '200px 1fr',
        gap: '48px',
      }}>

        {/* Sidebar */}
        <aside>
          <nav style={{
            position: 'sticky',
            top: '120px',
          }}>
            {categories.map((cat) => {
              const count = cat === 'All' ? posts.length : posts.filter(p => p.category === cat).length
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '10px 16px',
                    marginBottom: '4px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--text)' : 'var(--text-muted)',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    background: isActive ? 'var(--accent-dim)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'Inter, sans-serif',
                    textAlign: 'left',
                  }}
                >
                  <span>{cat}</span>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono, monospace',
                    color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                    background: isActive ? 'transparent' : 'var(--bg-card)',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    border: isActive ? 'none' : '1px solid var(--border)',
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--border)', margin: '20px 0' }} />

            {/* Quick Links */}
            <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '12px', padding: '0 16px' }}>
              QUICK LINKS
            </div>
            <Link href="/free-svg-icons" style={{ display: 'block', padding: '8px 16px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>Browse Icons →</Link>
            <Link href="/compare" style={{ display: 'block', padding: '8px 16px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>Compare Libraries →</Link>
            <Link href="/best-for-you" style={{ display: 'block', padding: '8px 16px', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}>Best For You →</Link>
          </nav>
        </aside>

        {/* Blog Cards Grid */}
        <div>
          {/* Section Title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.02em',
            }}>
              {activeCategory === 'All' ? 'Latest Posts' : activeCategory}
              {search && <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '14px' }}> — "{search}"</span>}
            </h2>
            <span style={{
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text-dim)',
            }}>
              {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {/* No results */}
          {filteredPosts.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔍</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '8px' }}>
                No posts found for "{search || activeCategory}"
              </p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All') }}
                style={{
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  marginTop: '12px',
                }}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {filteredPosts.map((post) => {
              const colors = categoryColors[post.category] || categoryColors.General
              const gradient = categoryGradients[post.category] || categoryGradients.General
              const icon = categoryIcons[post.category] || categoryIcons.General

              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="blog-card"
                  style={{
                    textDecoration: 'none',
                    color: 'var(--text)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card)',
                    transition: 'all 0.25s ease',
                  }}
                >
                  {/* Card Thumbnail */}
                  <div style={{
                    background: gradient,
                    padding: '32px 24px',
                    position: 'relative',
                    minHeight: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono, monospace',
                        color: 'rgba(255,255,255,0.7)',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}>
                        <span style={{ color: 'var(--accent)', marginRight: '4px' }}>&lt;</span>
                        IconSearch
                        <span style={{ color: 'var(--accent)', marginLeft: '4px' }}>/&gt;</span>
                      </span>
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '20px',
                      fontSize: '40px',
                      opacity: 0.6,
                    }}>
                      {icon}
                    </div>

                    <h3 style={{
                      fontSize: '17px',
                      fontWeight: 700,
                      color: 'white',
                      lineHeight: 1.35,
                      margin: 0,
                      textShadow: '0 1px 8px rgba(0,0,0,0.3)',
                    }}>
                      {post.title.length > 55 ? post.title.substring(0, 55) + '...' : post.title}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}>
                    <h3 style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      marginBottom: '8px',
                      lineHeight: 1.35,
                      color: 'var(--text)',
                    }}>
                      {post.title.length > 70 ? post.title.substring(0, 70) + '...' : post.title}
                    </h3>

                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: 'JetBrains Mono, monospace',
                        color: colors.text,
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                        padding: '3px 10px',
                        borderRadius: '100px',
                        letterSpacing: '0.5px',
                      }}>
                        {post.category}
                      </span>
                    </div>

                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                      lineHeight: 1.6,
                      margin: 0,
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {post.description}
                    </p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '20px',
                      paddingTop: '16px',
                      borderTop: '1px solid var(--border)',
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'white',
                        flexShrink: 0,
                      }}>
                        {post.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                          {post.author}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Hover styles */}
      <style>{`
        .blog-card:hover {
          border-color: var(--border-hover) !important;
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }
        @media (max-width: 768px) {
          .blog-card:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  )
}