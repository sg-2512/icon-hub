import { icons } from '../lib/icons'
import Link from 'next/link'
import { getAllPosts } from '../lib/blog'

export const metadata = {
  title: 'Best Free Icon Libraries for React & Next.js (2026)',
  description: 'Compare the best open source SVG icon libraries — Lucide, Heroicons, Tabler, Phosphor and more.',
}

export default function HomePage() {
  const posts = getAllPosts()
  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

      {/* Hero */}
      <section style={{ padding: '80px 0 60px', borderBottom: '1px solid var(--border)' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          color: 'var(--accent)',
          marginBottom: '16px',
          letterSpacing: '2px',
        }}>
          // OPEN SOURCE ICON LIBRARIES
        </div>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '20px',
          fontFamily: 'Syne, sans-serif',
        }}>
          Find the Perfect<br />
          <span style={{ color: 'var(--accent)' }}>Icon Library</span><br />
          for Your Project
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '18px',
          maxWidth: '500px',
          marginBottom: '32px',
        }}>
          Compare {icons.length}+ open source SVG icon libraries for React, Next.js, Vue and more.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['React', 'Next.js', 'Vue', 'Svelte', 'TypeScript', 'MIT License'].map(tag => (
            <span key={tag} style={{
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent)',
              color: 'var(--accent)',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '12px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Libraries Grid */}
      <section style={{ padding: '60px 0' }}>
        <h2 style={{
          fontSize: '13px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-muted)',
          letterSpacing: '2px',
          marginBottom: '24px',
        }}>
          ALL LIBRARIES ({icons.length})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {icons.map(icon => (
            <Link key={icon.slug} href={`/icons/${icon.slug}`} className="card-hover" style={{
              background: 'var(--bg-card)',
              padding: '24px',
              textDecoration: 'none',
              color: 'var(--text)',
              display: 'block',
              transition: 'background 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <h3 style={{ fontWeight: 700, fontSize: '16px' }}>{icon.name}</h3>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  color: 'var(--green)',
                  background: '#4ade8015',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  {icon.license}
                </span>
              </div>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '13px',
                marginBottom: '16px',
                lineHeight: 1.5,
              }}>
                {icon.description}
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  ⭐ {icon.stars.toLocaleString()}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                  ◆ {icon.iconCount.toLocaleString()} icons
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparisons */}
      <section style={{ padding: '0 0 80px' }}>
        <h2 style={{
          fontSize: '13px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--text-muted)',
          letterSpacing: '2px',
          marginBottom: '24px',
        }}>
          POPULAR COMPARISONS
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {[
            ['lucide-icons', 'heroicons'],
            ['lucide-icons', 'tabler-icons'],
            ['heroicons', 'tabler-icons'],
            ['phosphor-icons', 'lucide-icons'],
            ['feather-icons', 'lucide-icons'],
            ['remix-icon', 'lucide-icons'],
          ].map(([a, b]) => (
            <Link key={`${a}-${b}`} href={`/compare/${a}-vs-${b}`} className="link-hover" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '14px 18px',
              textDecoration: 'none',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s',
            }}>
              <span>{a.replace(/-/g, ' ')} vs {b.replace(/-/g, ' ')}</span>
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>
      {/* Blog Preview */}
      <section style={{ padding: '0 0 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--text-muted)',
            letterSpacing: '2px',
          }}>
            LATEST FROM THE BLOG
          </h2>
          <Link href="/blog" style={{
            fontSize: '13px',
            fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--accent)',
            textDecoration: 'none',
          }}>
            view all →
          </Link>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          {posts.length > 0 ? posts.slice(0, 3).map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card-hover" style={{
              background: 'var(--bg-card)',
              padding: '24px',
              textDecoration: 'none',
              color: 'var(--text)',
              display: 'block',
              transition: 'background 0.2s',
            }}>
              <div style={{
                fontSize: '11px',
                color: 'var(--accent)',
                fontFamily: 'JetBrains Mono, monospace',
                marginBottom: '10px',
                letterSpacing: '1px',
              }}>
                {post.category.toUpperCase()} · {post.date}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px', lineHeight: 1.4 }}>
                {post.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6 }}>
                {post.description}
              </p>
            </Link>
          )) : (
            <div style={{ background: 'var(--bg-card)', padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
              // blog posts coming soon
            </div>
          )}
        </div>
      </section>

    </main>
  )
}

