import { getAllPosts, getPostBySlug } from '../../../lib/blog'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const paragraphs = post.content.split('\n').filter(line => line.trim() !== '')

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      {/* Breadcrumb */}
      <Link href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
        ← back to blog
      </Link>

      {/* Header */}
      <section style={{ margin: '24px 0 48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--accent-dim)', border: '1px solid var(--accent)', padding: '3px 10px', borderRadius: '4px' }}>
            {post.category}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            {post.date}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            · {post.author}
          </span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>
          {post.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6 }}>
          {post.description}
        </p>
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: '4px' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Content */}
      <article style={{ maxWidth: '720px' }}>
        {paragraphs.map((line, i) => {
          if (line.startsWith('```')) return null
          if (line.startsWith('## ')) {
            return (
              <h2 key={i} style={{ fontSize: '24px', fontWeight: 700, margin: '40px 0 16px', color: 'var(--text)' }}>
                {line.replace('## ', '')}
              </h2>
            )
          }
          if (line.startsWith('# ')) {
            return (
              <h1 key={i} style={{ fontSize: '32px', fontWeight: 800, margin: '40px 0 16px', color: 'var(--text)' }}>
                {line.replace('# ', '')}
              </h1>
            )
          }
          if (line.startsWith('### ')) {
            return (
              <h3 key={i} style={{ fontSize: '18px', fontWeight: 700, margin: '28px 0 12px', color: 'var(--text)' }}>
                {line.replace('### ', '')}
              </h3>
            )
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>→</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>{line.replace(/^[-*] /, '')}</span>
              </div>
            )
          }
          if (line.startsWith('`') && line.endsWith('`') && !line.startsWith('```')) {
            return (
              <code key={i} style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--green)' }}>
                {line.replace(/`/g, '')}
              </code>
            )
          }
          if (line.startsWith('**') && line.endsWith('**')) {
            return (
              <p key={i} style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '8px', lineHeight: 1.7 }}>
                {line.replace(/\*\*/g, '')}
              </p>
            )
          }
          return (
            <p key={i} style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.8, marginBottom: '16px' }}>
              {line}
            </p>
          )
        })}
      </article>

      {/* Back to blog */}
      <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
        <Link href="/blog" style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          ← back to all posts
        </Link>
      </div>

    </main>
  )
}