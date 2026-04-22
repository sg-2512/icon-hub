import { getAllPosts, getPostBySlug } from '../../../lib/blog'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FAQSection from './FAQSection'

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

function renderContent(content: string) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0
  let inCodeBlock = false
  let codeLines: string[] = []
  let codeKey = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeLines = []
      } else {
        inCodeBlock = false
        elements.push(
          <pre key={`code-${codeKey++}`} style={{
            background: 'var(--code-bg)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '20px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
            color: 'var(--green)',
            overflowX: 'auto',
            lineHeight: 1.7,
            marginBottom: '24px',
          }}>
            {codeLines.join('\n')}
          </pre>
        )
        codeLines = []
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      i++
      continue
    }

    if (line.startsWith('## ')) {
      const heading = line.replace('## ', '')
      const isFaq = heading.toLowerCase().includes('faq') || heading.toLowerCase().includes('frequently asked')
      if (isFaq) { i++; break }
      elements.push(
        <h2 key={i} style={{
          fontSize: '22px', fontWeight: 700, margin: '48px 0 16px',
          color: 'var(--text)', paddingBottom: '10px',
          borderBottom: '1px solid var(--border)', lineHeight: 1.3,
        }}>
          {heading}
        </h2>
      )
      i++
      continue
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} style={{
          fontSize: '16px', fontWeight: 700, margin: '32px 0 12px',
          color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace',
        }}>
          // {line.replace('### ', '')}
        </h3>
      )
      i++
      continue
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} style={{ fontSize: '32px', fontWeight: 800, margin: '48px 0 16px', color: 'var(--text)', lineHeight: 1.2 }}>
          {line.replace('# ', '')}
        </h1>
      )
      i++
      continue
    }

    if (line.startsWith('* ') || line.startsWith('- ')) {
      const bulletItems: string[] = []
      while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
        bulletItems.push(lines[i].replace(/^[*-] /, ''))
        i++
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {bulletItems.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', listStyle: 'none' }}>
              <span style={{ color: 'var(--accent)', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', marginTop: '3px' }}>→</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>{item}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    if (line.startsWith('---')) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' }} />)
      i++
      continue
    }

    if (line.trim() === '') { i++; continue }

    elements.push(
      <p key={i} style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.9, marginBottom: '20px' }}>
        {line}
      </p>
    )
    i++
  }

  return elements
}

function extractFAQs(content: string) {
  const lines = content.split('\n')
  const faqs: { q: string; a: string }[] = []
  let inFaq = false
  let currentQ = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('## ') && (line.toLowerCase().includes('faq') || line.toLowerCase().includes('frequently asked'))) {
      inFaq = true
      continue
    }
    if (!inFaq) continue
    if (line.startsWith('### ')) {
      currentQ = line.replace('### ', '')
      continue
    }
    if (currentQ && line.trim() !== '' && !line.startsWith('#')) {
      faqs.push({ q: currentQ, a: line.trim() })
      currentQ = ''
    }
  }
  return faqs
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const faqs = extractFAQs(post.content)

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <Link href="/blog" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
        ← back to blog
      </Link>

      <section style={{ margin: '24px 0 48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--accent-dim)', border: '1px solid var(--accent)', padding: '3px 10px', borderRadius: '4px' }}>
            {post.category}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{post.date}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>· {post.author}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>
          {post.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '600px', lineHeight: 1.6, marginBottom: '16px' }}>
          {post.description}
        </p>
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {post.tags.map((tag: string) => (
              <span key={tag} style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: '4px' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Disclosure */}
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '10px 14px',
          marginTop: '12px',
          fontSize: '11px',
          color: 'var(--text-dim)',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          // This article was researched and edited by the IconHub team.
          Content may be AI-assisted and is reviewed for accuracy.
        </div>
        
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '48px', alignItems: 'flex-start' }}>

        <article>
          {renderContent(post.content)}

          {faqs.length > 0 && (
            <div style={{ marginTop: '48px' }}>
              <h2 style={{
                fontSize: '22px', fontWeight: 700, margin: '0 0 16px',
                color: 'var(--text)', paddingBottom: '10px',
                borderBottom: '1px solid var(--border)',
              }}>
                Frequently Asked Questions
              </h2>
              <FAQSection faqs={faqs} />
            </div>
          )}
        </article>

        <aside style={{ position: 'sticky', top: '80px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>EXPLORE ICONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Lucide Icons Guide', href: '/icons/lucide-icons' },
                { label: 'Heroicons Guide', href: '/icons/heroicons' },
                { label: 'Tabler Icons Guide', href: '/icons/tabler-icons' },
                { label: 'Compare Libraries', href: '/compare' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between' }}>
                  {link.label} <span style={{ color: 'var(--accent)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>POPULAR COMPARISONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Lucide vs Heroicons', href: '/compare/lucide-icons-vs-heroicons' },
                { label: 'Lucide vs Tabler', href: '/compare/lucide-icons-vs-tabler-icons' },
                { label: 'Heroicons vs Tabler', href: '/compare/heroicons-vs-tabler-icons' },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', display: 'flex', justifyContent: 'space-between' }}>
                  {link.label} <span style={{ color: 'var(--accent)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>

      <div style={{ marginTop: '64px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
        <Link href="/blog" style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>
          ← back to all posts
        </Link>
      </div>

    </main>
  )
}