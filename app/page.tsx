import { icons } from '../lib/icons'
import Link from 'next/link'
import { getAllPosts } from '../lib/blog'

export const metadata = {
  title: 'IconSearch — Find & Compare Free SVG Icon Libraries (2026)',
  other: {
    'application/ld+json': JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "What is the best free icon library for React?", "acceptedAnswer": { "@type": "Answer", "text": "Lucide Icons and Heroicons are the most popular choices for React." } },
        { "@type": "Question", "name": "Are these icon libraries free to use commercially?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — all libraries use MIT or ISC licenses which allow free commercial use." } },
        { "@type": "Question", "name": "Which icon library has the most icons?", "acceptedAnswer": { "@type": "Answer", "text": "Tabler Icons has the largest collection with 5,000+ icons." } },
        { "@type": "Question", "name": "Can I use these icons with Next.js?", "acceptedAnswer": { "@type": "Answer", "text": "Yes — all listed libraries ship as React components and work with Next.js App Router." } },
      ]
    })
  },
  description: 'Search 11,000+ icons across Lucide, Heroicons, Tabler, Phosphor and more. Compare React icon libraries by size, license, and style. Free, open source.',
  keywords: 'free svg icons, react icons, icon library comparison, lucide icons, heroicons, tabler icons, phosphor icons, open source icons',
  openGraph: {
    title: 'IconSearch — Find & Compare Free SVG Icon Libraries',
    description: 'Search 11,000+ icons across Lucide, Heroicons, Tabler, Phosphor and more.',
    url: 'https://iconsearch.info',
    siteName: 'IconSearch',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IconSearch — Find & Compare Free SVG Icon Libraries',
    description: 'Search 11,000+ icons across Lucide, Heroicons, Tabler, Phosphor and more.',
  },
  alternates: {
    canonical: 'https://iconsearch.info',
  },
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
          // FIND & COMPARE FREE SVG ICON LIBRARIES
        </div>
        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.1,
          marginBottom: '20px',
          fontFamily: 'Syne, sans-serif',
        }}>
          Find & Compare Free<br />
          <span style={{ color: 'var(--accent)' }}>SVG Icon Libraries</span><br />
          for React & Next.js
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '18px',
          maxWidth: '500px',
          marginBottom: '32px',
        }}>
          Search 11,700+ free open source SVG icons across Lucide, Heroicons, Tabler, Phosphor and more — for React, Next.js, Vue and Svelte.
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
        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
          <Link href="/icon-search" style={{
            background: 'var(--accent)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
          }}>
            Search 11,700+ Icons →
          </Link>
          <Link href="/compare" style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Compare Libraries
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{ padding: '40px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
        {[
          { value: '11,700+', label: 'Total Icons' },
          { value: `${icons.length}+`, label: 'Icon Libraries' },
          { value: 'MIT', label: 'License' },
          { value: '100%', label: 'Free & Open Source' },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Syne, sans-serif', color: 'var(--accent)' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: '4px' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Libraries Grid */}
      <section style={{ padding: '60px 0' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>
          Browse All Icon Libraries
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', fontFamily: 'JetBrains Mono, monospace' }}>
          // {icons.length} libraries — compare stars, icon count, license and React support
        </p>
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
        <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>
          Popular Comparisons
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', fontFamily: 'JetBrains Mono, monospace' }}>
          // side-by-side library breakdowns to help you decide
        </p>
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
          <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
            Latest from the Blog
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
    {/* FAQ Section */}
      <section style={{ padding: '0 0 80px' }}>
        <h2 style={{ fontSize: '26px', fontWeight: 800, fontFamily: 'Syne, sans-serif', marginBottom: '32px' }}>
          Frequently Asked Questions
        </h2>
        {[
          {
            q: 'What is the best free icon library for React?',
            a: 'Lucide Icons and Heroicons are the most popular choices for React. Lucide has 1,000+ icons with a consistent style, while Heroicons is made by the Tailwind CSS team and integrates perfectly with Tailwind projects.',
          },
          {
            q: 'Are these icon libraries free to use commercially?',
            a: 'Yes — all libraries listed on IconSearch use MIT or ISC licenses, which allow free commercial use with no attribution required.',
          },
          {
            q: 'Which icon library has the most icons?',
            a: 'Tabler Icons has the largest collection with 5,000+ icons, followed by Phosphor Icons with 1,200+ icons across 6 weight variants including Bold, Fill, Duotone and Thin.',
          },
          {
            q: 'Can I use these icons with Next.js?',
            a: 'Yes — all listed libraries ship as React components and work out of the box with Next.js, including server components and the App Router.',
          },
          {
            q: 'What is the difference between Lucide and Heroicons?',
            a: 'Lucide has a larger icon set (1,000+) with a neutral style suited for any project. Heroicons has fewer icons (~300) but is optimized for Tailwind CSS and has both outline and solid variants.',
          },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', lineHeight: 1.4 }}>{q}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8 }}>{a}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

