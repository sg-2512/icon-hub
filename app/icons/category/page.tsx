import { categories } from '../../../data/categories'
import Link from 'next/link'

export const metadata = {
  title: 'Browse Icons by Category (2026) — Free SVG Icon Libraries',
  description: 'Browse free SVG icon libraries by category — UI icons, social media icons, dashboard icons, ecommerce icons and more.',
}

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

    </main>
  )
}