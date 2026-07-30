import { categories } from '../../../data/categories'
import Link from 'next/link'
import { createPageMetadata } from '../../../lib/seo'

export const metadata = createPageMetadata({
  title: 'Free SVG Icons by Category — UI, Social, Weather and More',
  description: 'Browse free SVG icons and recommended open-source libraries by category, including UI, social media, dashboard, ecommerce, weather, medical, and finance icons.',
  path: '/icons/category',
})

export default function CategoriesPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // CATEGORIES
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Browse Icons<br />
          <span style={{ color: 'var(--accent)' }}>by Category</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '500px' }}>
          Find the right icon library for your specific use case. {categories.length} categories covering every major UI pattern.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {categories.map(cat => (
          <Link key={cat.slug} href={`/icons/category/${cat.slug}`} className="card-hover" style={{
            background: 'var(--bg-card)',
            padding: '28px',
            textDecoration: 'none',
            color: 'var(--text)',
            display: 'block',
            transition: 'background 0.2s',
          }}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>{cat.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>
              {cat.description}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {cat.popularIcons.slice(0, 4).map(icon => (
                <span key={icon} style={{
                  fontSize: '11px',
                  color: 'var(--text-dim)',
                  fontFamily: 'JetBrains Mono, monospace',
                  background: 'var(--bg-secondary)',
                  padding: '2px 8px',
                  borderRadius: '3px',
                }}>
                  {icon}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {cat.recommendedLibraries.length} recommended libraries
              </span>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Programmatic Collections Directory Section */}
      <section style={{ marginTop: '64px', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // POPULAR COLLECTIONS
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>
          Curated Icon Collections
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { tag: 'arrow-icons', label: 'Arrow Icons' },
            { tag: 'settings-icons', label: 'Settings & Gear Icons' },
            { tag: 'user-icons', label: 'User & Profile Icons' },
            { tag: 'bell-icons', label: 'Bell & Alarm Icons' },
            { tag: 'heart-icons', label: 'Heart & Medical Icons' },
            { tag: 'cloud-icons', label: 'Cloud & Network Icons' },
            { tag: 'security-icons', label: 'Security & Key Icons' },
            { tag: 'commerce-icons', label: 'Cart & E-Commerce Icons' },
            { tag: 'weather-icons', label: 'Weather & Climate Icons' },
            { tag: 'device-icons', label: 'Device & Phone Icons' },
            { tag: 'design-icons', label: 'Design & Paint Icons' },
            { tag: 'communication-icons', label: 'Chat & Mail Icons' },
            { tag: 'building-icons', label: 'Home & Building Icons' },
            { tag: 'health-icons', label: 'Plus & Activity Icons' },
            { tag: 'finance-icons', label: 'Money & Wallet Icons' },
            { tag: 'star-icons', label: 'Star & Rating Icons' },
            { tag: 'trash-icons', label: 'Trash & Delete Icons' },
            { tag: 'lock-icons', label: 'Lock & Password Icons' },
          ].map(col => (
            <Link key={col.tag} href={`/icons/collection/${col.tag}`} style={{
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
            }}
            className="link-hover"
            >
              {col.label}
              <span style={{ color: 'var(--accent)' }}>→</span>
            </Link>
          ))}
        </div>
      </section>

    </main>
  )
}
