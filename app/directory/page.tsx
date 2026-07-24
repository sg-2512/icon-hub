import Link from 'next/link'
import { icons } from '../../lib/icons'
import { getComparisonPairs } from '../../lib/icons'
import { SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'

export const metadata = {
  title: 'Site Directory — IconSearch',
  description: 'Complete directory of all icon libraries, comparisons, frameworks, use cases, and resources available on IconSearch.',
}

export default function DirectoryPage() {
  const pairs = getComparisonPairs()

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>
      
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', gap: '8px', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--accent)' }}>Directory</span>
      </nav>

      {/* Hero */}
      <section style={{ margin: '0 0 48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // SITE DIRECTORY
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
          Explore the Full Site
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', lineHeight: 1.8 }}>
          A complete index of every icon library, framework guide, technical comparison, and use-case analysis available on IconSearch.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '48px' }}>
        
        {/* Core Pages */}
        <section>
          <h2 style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            CORE PAGES
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Homepage</Link>
            <Link href="/icon-search" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Search All Icons ({SEARCHABLE_ICON_COUNT.toLocaleString('en-US')})</Link>
            <Link href="/free-svg-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Browse All Libraries</Link>
            <Link href="/best-for-you" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Interactive Quiz: Best For You</Link>
            <Link href="/stats" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Global Statistics</Link>
            <Link href="/licenses" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Open Source License Guide</Link>
          </div>
        </section>

        {/* Icon Libraries */}
        <section>
          <h2 style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            ICON LIBRARIES
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {icons.map(icon => (
              <Link key={icon.slug} href={`/icons/${icon.slug}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>
                {icon.name} Guide
              </Link>
            ))}
          </div>
        </section>

        {/* Framework Guides */}
        <section>
          <h2 style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            FRAMEWORK GUIDES
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/react-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>React Icons Guide</Link>
            <Link href="/nextjs-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Next.js Icons Guide</Link>
            <Link href="/vue-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Vue Icons Guide</Link>
            <Link href="/svelte-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Svelte Icons Guide</Link>
            <Link href="/tailwind-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Tailwind CSS Icons Guide</Link>
            <Link href="/typescript-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>TypeScript Icons Guide</Link>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            USE CASES & CATEGORIES
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/use-cases" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>View All Use Cases</Link>
            <Link href="/use-cases/icons-for-saas" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Icons for SaaS</Link>
            <Link href="/use-cases/icons-for-dashboards" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Icons for Dashboards</Link>
            <Link href="/use-cases/icons-for-mobile-apps" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Icons for Mobile Apps</Link>
            <Link href="/use-cases/icons-for-dark-mode" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Icons for Dark Mode</Link>
            <Link href="/icons/category" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Icon Categories Index</Link>
            <Link href="/icons/category/ui-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>UI Icons</Link>
            <Link href="/icons/category/social-media-icons" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Social Media Icons</Link>
          </div>
        </section>



        {/* Legal & About */}
        <section>
          <h2 style={{ fontSize: '14px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
            ABOUT & LEGAL
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link href="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>About IconSearch</Link>
            <Link href="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Contact Us</Link>
            <Link href="/privacy-policy" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</Link>
          </div>
        </section>

      </div>

    </main>
  )
}
