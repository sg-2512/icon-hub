import Link from 'next/link'
import { createPageMetadata } from '../../lib/seo'

export const metadata = createPageMetadata({
  title: 'Icon Library Licenses — MIT, ISC and Apache 2.0 Guide',
  description: 'Check official licenses, commercial-use rules, and attribution for Heroicons, Tabler, Phosphor, Lucide, Feather, Bootstrap, Remix, and Radix icons.',
  path: '/licenses',
  type: 'article',
})

const licenseData = [
  {
    name: 'Lucide Icons',
    slug: 'lucide-icons',
    license: 'ISC',
    commercialUse: true,
    attribution: false,
    officialUrl: 'https://github.com/lucide-icons/lucide/blob/main/LICENSE',
    summary: 'ISC license is functionally identical to MIT. Free for commercial use, no attribution required.',
    color: '#7c6af7',
  },
  {
    name: 'Heroicons',
    slug: 'heroicons',
    license: 'MIT',
    commercialUse: true,
    attribution: false,
    officialUrl: 'https://github.com/tailwindlabs/heroicons/blob/master/LICENSE',
    summary: 'MIT licensed by Tailwind Labs. Free for personal and commercial use. No attribution required.',
    color: '#06b6d4',
  },
  {
    name: 'Tabler Icons',
    slug: 'tabler-icons',
    license: 'MIT',
    commercialUse: true,
    attribution: false,
    officialUrl: 'https://github.com/tabler/tabler-icons/blob/master/LICENSE',
    summary: 'MIT licensed. Free for commercial use. No attribution required. Can modify and redistribute.',
    color: '#10b981',
  },
  {
    name: 'Phosphor Icons',
    slug: 'phosphor-icons',
    license: 'MIT',
    commercialUse: true,
    attribution: false,
    officialUrl: 'https://github.com/phosphor-icons/core/blob/main/LICENSE',
    summary: 'MIT licensed. Free for personal and commercial use without attribution.',
    color: '#f59e0b',
  },
  {
    name: 'Remix Icon',
    slug: 'remix-icon',
    license: 'Apache 2.0',
    commercialUse: true,
    attribution: true,
    officialUrl: 'https://github.com/Remix-Design/RemixIcon/blob/master/License',
    summary: 'Apache 2.0 license. Free for commercial use. Attribution required — you must include a notice that icons are from Remix Icon.',
    color: '#8b5cf6',
  },
  {
    name: 'Bootstrap Icons',
    slug: 'bootstrap-icons',
    license: 'MIT',
    commercialUse: true,
    attribution: false,
    officialUrl: 'https://github.com/twbs/icons/blob/main/LICENSE',
    summary: 'MIT licensed by the Bootstrap team. Free for commercial use. No attribution required.',
    color: '#7952b3',
  },
  {
    name: 'Feather Icons',
    slug: 'feather-icons',
    license: 'MIT',
    commercialUse: true,
    attribution: false,
    officialUrl: 'https://github.com/feathericons/feather/blob/master/LICENSE',
    summary: 'MIT licensed. Free for commercial use. Note: Feather Icons is no longer maintained. Consider migrating to Lucide.',
    color: '#ef4444',
  },
  {
    name: 'Radix Icons',
    slug: 'radix-icons',
    license: 'MIT',
    commercialUse: true,
    attribution: false,
    officialUrl: 'https://github.com/radix-ui/icons/blob/master/LICENSE',
    summary: 'MIT licensed by WorkOS. Free for commercial use. No attribution required.',
    color: '#ec4899',
  },
]

export default function LicensesPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // LICENSES
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Icon Library Licenses<br />
          <span style={{ color: 'var(--accent)' }}>Official Guide (2026)</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '640px', lineHeight: 1.7, marginBottom: '24px' }}>
          Can you use these icon libraries in commercial projects? Do you need to provide attribution? This page covers the official license for every major icon library with direct links to the official license files on GitHub.
        </p>
        <div style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)', borderRadius: '8px', padding: '14px 18px', display: 'inline-block' }}>
          <span style={{ fontSize: '13px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>
            // TL;DR — All major icon libraries are free for commercial use. Only Remix Icon requires attribution.
          </span>
        </div>
      </section>

      {/* License comparison table */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          QUICK COMPARISON
        </h2>
        <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {['Library', 'License', 'Commercial Use', 'Attribution Required', 'Official Source'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '1px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {licenseData.map((lib, index) => (
                <tr key={lib.slug} style={{ background: index % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-secondary)', borderBottom: index < licenseData.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <Link href={`/icons/${lib.slug}`} style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }}>
                      {lib.name}
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ fontSize: '12px', color: lib.color, background: lib.color + '15', border: `1px solid ${lib.color}`, padding: '3px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                      {lib.license}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: lib.commercialUse ? 'var(--green)' : 'var(--red)' }}>
                    {lib.commercialUse ? '✓ Yes' : '✗ No'}
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: lib.attribution ? 'var(--yellow)' : 'var(--green)' }}>
                    {lib.attribution ? '⚠ Required' : '✓ Not required'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <a href={lib.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', textDecoration: 'none' }}>
                      GitHub →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed breakdown */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '20px' }}>
          DETAILED LICENSE BREAKDOWN
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {licenseData.map(lib => (
            <div id={lib.slug} key={lib.slug} style={{ background: 'var(--bg-card)', padding: '24px 28px', scrollMarginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{lib.name}</h3>
                  <span style={{ fontSize: '11px', color: lib.color, background: lib.color + '15', border: `1px solid ${lib.color}`, padding: '2px 8px', borderRadius: '4px', fontFamily: 'JetBrains Mono, monospace' }}>
                    {lib.license}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>✓ Commercial use</span>
                  {!lib.attribution && <span style={{ fontSize: '12px', color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>✓ No attribution</span>}
                  {lib.attribution && <span style={{ fontSize: '12px', color: 'var(--yellow)', fontFamily: 'JetBrains Mono, monospace' }}>⚠ Attribution required</span>}
                </div>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>
                {lib.summary}
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link href={`/icons/${lib.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                  Full guide →
                </Link>
                <a href={lib.officialUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace' }}>
                  Official license on GitHub →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ section */}
      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '24px', paddingBottom: '10px', borderBottom: '1px solid var(--border)' }}>
          Frequently Asked Questions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[
            {
              q: 'Can I use Heroicons in a commercial project?',
              a: 'Yes. Heroicons is MIT licensed by Tailwind Labs. You can use it freely in any personal or commercial project without attribution. The license is available on the official GitHub repository at github.com/tailwindlabs/heroicons.',
            },
            {
              q: 'Can I use Tabler Icons commercially?',
              a: 'Yes. Tabler Icons is MIT licensed. You can use all 5,500+ icons in commercial projects without attribution. The MIT license is confirmed on the official GitHub repository.',
            },
            {
              q: 'Does Remix Icon require attribution?',
              a: 'Yes. Remix Icon uses the Apache 2.0 license which requires attribution. You must include a notice that the icons are from Remix Icon. All other major icon libraries on this list do not require attribution.',
            },
            {
              q: 'What is the difference between MIT and ISC license for icons?',
              a: 'For practical purposes there is no difference. Both MIT and ISC licenses allow free use in commercial projects, modification, and distribution without attribution. Lucide Icons uses the ISC license which is functionally identical to MIT.',
            },
            {
              q: 'Can I modify MIT licensed icons?',
              a: 'Yes. MIT license explicitly allows modification. You can change colors, sizes, stroke widths, and shapes of any MIT-licensed icon. You can also create derivative works and distribute them.',
            },
            {
              q: 'Do I need to include license files when using icon libraries?',
              a: 'When distributing software that includes icon libraries as bundled assets, you should include the license file. However, for most web applications where icons are loaded as npm packages, the license files are included in node_modules automatically and no additional action is required.',
            },
          ].map((faq, i) => (
            <div key={i} style={{ borderBottom: i < 5 ? '1px solid var(--border)' : 'none', paddingBottom: i < 5 ? '24px' : '0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', color: 'var(--text)' }}>
                {faq.q}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.8 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related pages */}
      <section>
        <h2 style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '16px' }}>
          EXPLORE LIBRARIES
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
          {licenseData.map(lib => (
            <Link key={lib.slug} href={`/icons/${lib.slug}`} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px 18px', textDecoration: 'none', color: 'var(--text)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{lib.name}</span>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{lib.license}</span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
