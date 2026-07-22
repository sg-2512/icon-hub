import { getAllPosts, getPostBySlug } from '../../../lib/blog'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FAQSection from './FAQSection'
import ArticleTools from './ArticleTools'
import styles from './article.module.css'

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
    alternates: {
      canonical: `https://iconsearch.info/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://iconsearch.info/blog/${slug}`,
      type: 'article',
      publishedTime: post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      creator: '@IconSearchinfo',
    },
  }
}

function parseMdInline(text: string): React.ReactNode {
  // Handle **bold** and `code` inline
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--text)', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: 'var(--code-bg)', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', padding: '1px 6px', borderRadius: '4px' }}>{part.slice(1, -1)}</code>
    }
    return part
  })
}

type ArticleHeading = {
  id: string
  text: string
}

function slugifyHeading(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function getArticleHeadings(content: string): ArticleHeading[] {
  return content
    .split('\n')
    .filter((line) => line.startsWith('## '))
    .map((line) => line.replace('## ', ''))
    .filter((heading) => !heading.toLowerCase().includes('faq') && !heading.toLowerCase().includes('frequently asked'))
    .map((text) => ({ id: slugifyHeading(text), text }))
}

function getReadingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
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

    // Code blocks
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

    // Markdown table — collect all consecutive table lines
    if (line.trim().startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }

      // First row = headers, second row = separator (skip), rest = body
      const [headerRow, , ...bodyRows] = tableLines
      const headers = headerRow.split('|').map(h => h.trim()).filter(Boolean)
      const rows = bodyRows
        .filter(r => !r.match(/^[\s|:-]+$/)) // skip any extra separator rows
        .map(r => r.split('|').map(c => c.trim()).filter(Boolean))

      elements.push(
        <div key={`table-${i}`} style={{ overflowX: 'auto', marginBottom: '32px', marginTop: '8px' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            fontFamily: 'inherit',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {headers.map((h, idx) => (
                  <th key={idx} style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>
                    {parseMdInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ridx) => (
                <tr key={ridx} style={{
                  borderBottom: '1px solid var(--border)',
                  background: ridx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                }}>
                  {row.map((cell, cidx) => {
                    // Style the paid tier column (3rd col, index 2) with badges
                    const isFree = cell === '$0 — no paid tier'
                    const isPaid = cell.match(/^\$\d+/)
                    const isNo = cell === 'No'
                    const isYes = cell.toLowerCase().includes('yes') || cell.toLowerCase().includes('technically')

                    let badge = null
                    if (cidx === 2) {
                      if (isFree) badge = { bg: '#064e3b', color: '#6ee7b7', text: '$0' }
                      else if (isPaid) badge = { bg: '#78350f', color: '#fcd34d', text: cell.replace(' individual', '') }
                    }
                    if (cidx === 4) {
                      if (isNo) badge = { bg: '#064e3b', color: '#6ee7b7', text: 'No' }
                      else if (isYes) badge = { bg: '#7f1d1d', color: '#fca5a5', text: cell }
                    }

                    return (
                      <td key={cidx} style={{
                        padding: '9px 14px',
                        color: cidx === 0 ? 'var(--text)' : 'var(--text-muted)',
                        fontWeight: cidx === 0 ? 600 : 400,
                        fontSize: '13px',
                        verticalAlign: 'middle',
                      }}>
                        {badge ? (
                          <span style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: badge.bg,
                            color: badge.color,
                            whiteSpace: 'nowrap',
                          }}>
                            {badge.text}
                          </span>
                        ) : parseMdInline(cell)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    // Headings
    if (line.startsWith('## ')) {
      const heading = line.replace('## ', '')
      const isFaq = heading.toLowerCase().includes('faq') || heading.toLowerCase().includes('frequently asked')
      if (isFaq) { i++; break }
      elements.push(
        <h2 key={i} id={slugifyHeading(heading)} style={{
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

    // Bullet lists
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
              <span style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.7 }}>{parseMdInline(item)}</span>
            </li>
          ))}
        </ul>
      )
      continue
    }

    // Horizontal rule
    if (line.startsWith('---')) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '40px 0' }} />)
      i++
      continue
    }

    if (line.trim() === '') { i++; continue }

    // Paragraph
    elements.push(
      <p key={i} style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.9, marginBottom: '20px' }}>
        {parseMdInline(line)}
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
  const headings = getArticleHeadings(post.content)
  const readingTime = getReadingTime(post.content)
  const publishedLabel = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(post.date))
  const articleUrl = 'https://iconsearch.info/blog/' + slug

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.date,
          "author": {
            "@type": "Person",
            "name": post.author
          },
          "publisher": {
            "@type": "Organization",
            "name": "IconSearch",
            "logo": {
              "@type": "ImageObject",
              "url": "https://iconsearch.info/iconsearch-logo-128.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://iconsearch.info/blog/${slug}`
          }
        })}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://iconsearch.info" },
            { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://iconsearch.info/blog" },
            { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://iconsearch.info/blog/${slug}` },
          ]
        })}}
      />

      <Link href="/blog" className={styles.backLink}>
        ← back to blog
      </Link>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
        <div className={styles.metaRow}>
          <span className={styles.category}>
            {post.category}
          </span>
          <time dateTime={post.date}>{publishedLabel}</time>
          <span className={styles.metaDot} aria-hidden="true" />
          <span>{post.author}</span>
        </div>
        <h1 className={styles.title}>
          {post.title}
        </h1>
        <p className={styles.description}>
          {post.description}
        </p>
        {post.tags.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map((tag: string) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className={styles.heroFooter}>
          <div className={styles.stats} aria-label="Article details">
            <div className={styles.stat}>
              <span className={styles.statValue}>{readingTime}</span>
              <span className={styles.statLabel}>MIN READ</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{headings.length}</span>
              <span className={styles.statLabel}>SECTIONS</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{post.tags.length}</span>
              <span className={styles.statLabel}>TOPICS</span>
            </div>
          </div>
          <ArticleTools title={post.title} url={articleUrl} />
        </div>
        </div>
        <div className={styles.heroArtwork} aria-hidden="true">
          <span className={styles.signal} />
          <span className={styles.signal} />
          <span className={styles.signal} />
          <span className={styles.signal} />
        </div>
      </section>

      <section className={styles.mobileToc} aria-label="Article table of contents">
        <details>
          <summary>
            <span>ON THIS PAGE</span>
            <span>{headings.length} sections</span>
          </summary>
          <nav>
            {headings.map((heading) => (
              <a key={heading.id} href={'#' + heading.id} className={styles.tocLink}>
                {heading.text}
              </a>
            ))}
          </nav>
        </details>
      </section>

      <div className={styles.contentLayout}>

        <article className={styles.article}>
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

        <aside className={styles.sidebar}>
          <nav className={styles.tocCard} aria-label="Article table of contents">
            <p className={styles.tocHeading}>ON THIS PAGE</p>
            {headings.map((heading) => (
              <a key={heading.id} href={'#' + heading.id} className={styles.tocLink}>
                {heading.text}
              </a>
            ))}
          </nav>
          <div className={styles.resourceCard}>
            <div className={styles.resourceEyebrow}>EXPLORE ICONS</div>
            <div className={styles.resourceLinks}>
              {[
                { label: 'Lucide Icons Guide', href: '/icons/lucide-icons' },
                { label: 'Heroicons Guide', href: '/icons/heroicons' },
                { label: 'Tabler Icons Guide', href: '/icons/tabler-icons' },
                { label: 'Compare Libraries', href: '/compare' },
              ].map(link => (
                <Link key={link.href} href={link.href} className={styles.resourceLink}>
                  {link.label} <span style={{ color: 'var(--accent)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
          <div className={styles.resourceCard}>
            <div className={styles.resourceEyebrow}>POPULAR COMPARISONS</div>
            <div className={styles.resourceLinks}>
              {[
                { label: 'Lucide vs Heroicons', href: '/compare/lucide-icons-vs-heroicons' },
                { label: 'Lucide vs Tabler', href: '/compare/lucide-icons-vs-tabler-icons' },
                { label: 'Heroicons vs Tabler', href: '/compare/heroicons-vs-tabler-icons' },
              ].map(link => (
                <Link key={link.href} href={link.href} className={styles.resourceLink}>
                  {link.label} <span style={{ color: 'var(--accent)' }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>

      <footer className={styles.footer}>
        <Link href="/blog" className={styles.footerLink}>
          ← back to all posts
        </Link>
        <span className={styles.footerMeta}>IconSearch editorial · {publishedLabel}</span>
      </footer>

    </main>
  )
}
