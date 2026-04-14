import { useCases } from '../../data/usecases'
import Link from 'next/link'

export const metadata = {
  title: 'Icon Libraries by Use Case (2026) — Find the Right Icons for Your Project',
  description: 'Find the best icon library for your specific use case — SaaS, dashboards, mobile apps, landing pages, ecommerce and more.',
}

export default function UseCasesPage() {
  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

      <section style={{ marginBottom: '48px', paddingBottom: '48px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '12px', color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '2px', marginBottom: '12px' }}>
          // USE CASES
        </div>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: '16px' }}>
          Icons by<br />
          <span style={{ color: 'var(--accent)' }}>Use Case</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '18px', maxWidth: '500px' }}>
          Not all icon libraries suit all projects. Find the right one for your specific use case with tailored recommendations and design tips.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        {useCases.map(uc => (
          <Link key={uc.slug} href={`/use-cases/${uc.slug}`} className="card-hover" style={{ background: 'var(--bg-card)', padding: '28px', textDecoration: 'none', color: 'var(--text)', display: 'block', transition: 'background 0.2s' }}>
            <h2 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '10px' }}>{uc.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '16px' }}>{uc.description}</p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {uc.recommendedLibraries.map(lib => (
                <span key={lib} style={{ fontSize: '11px', color: 'var(--accent)', background: 'var(--accent-dim)', border: '1px solid var(--accent)', padding: '2px 8px', borderRadius: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
                  {lib.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                {uc.designTips.length} design tips
              </span>
              <span style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono, monospace' }}>→</span>
            </div>
          </Link>
        ))}
      </div>

    </main>
  )
}