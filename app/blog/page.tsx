import { getAllPosts } from '../../lib/blog'
import Link from 'next/link'

export const metadata = {
  title: 'Blog — Icon Library Guides, Tutorials & Updates | IconHub',
  description: 'Guides, tutorials, comparisons and updates about open source icon libraries for React, Next.js and Vue developers.',
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Header */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // BLOG
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Guides & Tutorials
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '500px' }}>
          Deep dives into icon libraries, migration guides, comparisons and best practices for React and Next.js developers.
        </p>
      </section>

      {/* Posts */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          // no posts yet — check back soon
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="card-hover" style={{
              background: 'var(--bg-card)',
              padding: '28px 32px',
              textDecoration: 'none',
              color: 'var(--text)',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: '24px',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}>
              <div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--accent-dim)', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: '4px' }}>
                    {post.category}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                    {post.date}
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', lineHeight: 1.3 }}>
                  {post.title}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
                  {post.description}
                </p>
                {post.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {post.tags.map(tag => (
                      <span key={tag} style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ color: 'var(--accent)', fontSize: '20px', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>→</span>
            </Link>
          ))}
        </div>
      )}

    </main>
  )
}