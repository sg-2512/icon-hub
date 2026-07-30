import Link from 'next/link'
import {
  NAMED_LIBRARY_COUNT,
  SEARCHABLE_ICON_COUNT,
} from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'

export const metadata = createPageMetadata({
  title: 'About IconSearch — Free SVG Icon Search and Discovery',
  description: `Learn how IconSearch indexes ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} searchable SVG icons from ${NAMED_LIBRARY_COUNT} open-source libraries for developers and designers.`,
  path: '/about',
})

export default function AboutPage() {
  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // ABOUT
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          About <span style={{ color: 'var(--accent)' }}>IconSearch</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: 1.7, maxWidth: '600px' }}>
          The definitive independent discovery platform for free open-source SVG icon libraries — built for developers who want fast, data-driven decisions.
        </p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* What is IconSearch */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            What is IconSearch?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
            IconSearch is an independent search platform covering {NAMED_LIBRARY_COUNT} free SVG icon libraries in the web development ecosystem. We help React, Next.js, Vue, and Svelte developers find the right icon library through real benchmark data and honest recommendations — all in one place.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            The site covers major open-source icon libraries such as Lucide Icons, Heroicons, Tabler Icons, PatternFly Icons, Untitled UI Icons, Phosphor Icons, Remix Icon, Feather Icons, Bootstrap Icons, Radix Icons, Iconoir, IonIcons, Octicons, Ant Design Icons, Devicons, Mage Icons, Solar Icons, and hundreds of open-source vector collections.
          </p>
        </div>

        {/* By the Numbers */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            By the Numbers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { value: SEARCHABLE_ICON_COUNT.toLocaleString('en-US'), label: 'Searchable icons' },
              { value: NAMED_LIBRARY_COUNT.toString(), label: 'Icon libraries' },
              { value: '10', label: 'Icon category guides' },
              { value: '10', label: 'Use case guides' },
              { value: '6', label: 'Framework guides' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px' }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', marginBottom: '4px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why We Built This */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            Why We Built This
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
            Choosing an icon library should be a five-minute decision. In practice it often takes hours — reading GitHub READMEs, cross-checking npm download stats, opening a dozen tabs to compare visual styles, and hoping someone on Stack Overflow answered the same bundle-size question in 2023. We built IconSearch to eliminate that process entirely.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            One site. All the data. Honest recommendations. No affiliation with any library project.
          </p>
        </div>

        {/* What We Offer */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            What We Offer
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                title: 'Icon Search Tool',
                link: '/icon-search',
                desc: `Search ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} free SVG icons from ${NAMED_LIBRARY_COUNT} open-source libraries. No npm install required.`,
              },
              {
                title: 'SVG Customizer Sandbox',
                link: '/icon-search',
                desc: 'Adjust icon size, stroke weight, and color palette in real-time. Copy output as a React JSX component or raw SVG markup instantly.',
              },
              {
                title: 'Best For You Quiz',
                link: '/best-for-you',
                desc: 'A 7-question guided quiz that recommends the exact right library for your framework, project type, design style, and license requirements.',
              },
              {
                title: 'Stats Dashboard',
                link: '/stats',
                desc: 'Live rankings by GitHub stars, weekly npm downloads, and icon count. Full feature matrix for TypeScript, tree-shaking, Figma support, and framework compatibility.',
              },
              {
                title: 'Bundle Size Benchmarks',
                link: '/stats',
                desc: 'Real gzip measurements for 10, 50, and 100 icons across all libraries in Next.js 15 with Turbopack.',
              },
              {
                title: 'License Guide',
                link: '/licenses',
                desc: 'Clear breakdown of MIT, ISC, Apache 2.0, CC0, and CC BY 4.0 licenses — with official GitHub source links for every library.',
              },
              {
                title: 'Framework & Use Case Guides',
                link: '/use-cases',
                desc: 'Dedicated guides for React, Next.js App Router, Vue 3, Svelte, Tailwind CSS, and TypeScript. Plus 10 use-case guides covering SaaS, dashboards, mobile, dark mode, and more.',
              },
            ].map(item => (
              <div key={item.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', marginTop: '2px', flexShrink: 0 }}>→</span>
                <div>
                  <Link href={item.link} style={{ display: 'block', fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '4px', textDecoration: 'none' }}>{item.title}</Link>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Independence */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            Editorial Independence
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '12px' }}>
            IconSearch is not affiliated with any icon library project. We do not accept payment for rankings, recommendations, or comparison outcomes. All data — GitHub stars, npm download counts, bundle sizes, license types, TypeScript support, and framework compatibility — is sourced from publicly available information on GitHub, npm, and official documentation.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            If any data on the site is incorrect or outdated, we welcome corrections. Reach out at <a href="mailto:iconsearchinfo@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>iconsearchinfo@gmail.com</a> and we will update it promptly.
          </p>
        </div>

        {/* Libraries Covered */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            Libraries Covered ({NAMED_LIBRARY_COUNT} Total)
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              { name: 'Lucide Icons', license: 'ISC' },
              { name: 'Heroicons', license: 'MIT' },
              { name: 'Tabler Icons', license: 'MIT' },
              { name: 'Phosphor Icons', license: 'MIT' },
              { name: 'Remix Icon', license: 'Apache 2.0' },
              { name: 'Feather Icons', license: 'MIT' },
              { name: 'Bootstrap Icons', license: 'MIT' },
              { name: 'Radix Icons', license: 'MIT' },
              { name: 'Font Awesome', license: 'Mixed' },
              { name: 'React Icons', license: 'MIT' },
              { name: 'Material Symbols', license: 'Apache 2.0' },
              { name: 'Simple Icons', license: 'CC0' },
              { name: 'Iconoir', license: 'MIT' },
              { name: 'IonIcons', license: 'MIT' },
              { name: 'Octicons', license: 'MIT' },
              { name: 'Mage Icons', license: 'Apache 2.0' },
            ].map(lib => (
              <div key={lib.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{lib.name}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{lib.license}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--text)', fontFamily: 'JetBrains Mono, monospace' }}>
            Get in Touch
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>
            Have a suggestion, found an error, or want to partner with us? Visit our{' '}
            <Link href="/contact" style={{ color: 'var(--accent)', textDecoration: 'none' }}>contact page</Link> or email us directly at{' '}
            <a href="mailto:iconsearchinfo@gmail.com" style={{ color: 'var(--accent)', textDecoration: 'none' }}>iconsearchinfo@gmail.com</a>.
            We aim to respond within 48 business hours.
          </p>
        </div>

      </div>
    </main>
  )
}
