import type { Metadata } from 'next'
import Link from 'next/link'
import { ICONIFY_COLLECTION_COUNT, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'

const formattedIconCount = SEARCHABLE_ICON_COUNT.toLocaleString('en-US')
const framerMarketplaceUrl = 'https://www.framer.com/community/marketplace/plugins/iconsearch-svg-icons/'

export const metadata: Metadata = {
  title: 'IconSearch Framer Plugin - Free SVG Icons for Framer',
  description: `Install the free IconSearch Framer plugin to search, customize, and insert ${formattedIconCount} online SVG icons from ${NAMED_LIBRARY_COUNT} named libraries and ${ICONIFY_COLLECTION_COUNT} Iconify collections.`,
  alternates: {
    canonical: '/framer-plugin',
  },
  openGraph: {
    title: 'IconSearch Framer Plugin - Now Live',
    description: `Install the free Framer Community plugin to search, customize, and insert ${formattedIconCount} open source SVG icons directly inside Framer.`,
    url: '/framer-plugin',
    type: 'website',
  },
}

const stats = [
  { value: formattedIconCount, label: 'online icons' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'named libraries' },
  { value: ICONIFY_COLLECTION_COUNT.toString(), label: 'Iconify collections' },
]

const features = [
  {
    title: 'Framer-ready SVG insertion',
    text: 'Pick an icon and insert clean vector SVG directly into the canvas, ready for landing pages, components, and hero sections.',
  },
  {
    title: 'Online-only catalog',
    text: 'The plugin searches the live IconSearch API and online SVG sources, so the Framer plugin stays lightweight and current.',
  },
  {
    title: 'Secure free access',
    text: 'Users approve access on iconsearch.info. Framer receives only a revocable app token, never the account password.',
  },
  {
    title: 'Designer-friendly filters',
    text: 'Filter by named libraries, Iconify collections, style, and legal-safe results without leaving your Framer workflow.',
  },
]

const workflow = [
  'Install IconSearch free from the Framer Marketplace',
  'Connect your free IconSearch account',
  'Search home, arrow, chart, calendar, or any icon',
  'Click an icon to insert a clean SVG on the canvas',
]

const mockIcons = ['home', 'arrow', 'chart', 'user', 'calendar', 'settings', 'menu', 'copy', 'grid', 'globe', 'spark', 'lock']

export default function FramerPluginPage() {
  return (
    <main className="framer-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">{'// NOW LIVE IN THE FRAMER MARKETPLACE'}</div>
          <h1>Search and insert SVG icons inside Framer.</h1>
          <p>
            A compact icon command center for Framer designers: search the live IconSearch catalog,
            preview results, and place clean SVG vectors directly onto your canvas.
          </p>

          <div className="hero-actions" aria-label="Primary actions">
            <a className="primary-action" href={framerMarketplaceUrl} target="_blank" rel="noreferrer">
              Open Framer Plugin
            </a>
            <Link className="secondary-action" href="/icon-search">
              Try Web Search
            </Link>
          </div>

          <div className="trust-row" aria-label="Framer plugin highlights">
            <span>Free on Framer Marketplace</span>
            <span>Secure sign in</span>
            <span>Online SVG vectors</span>
          </div>
        </div>

        <div className="framer-stage" aria-label="IconSearch Framer plugin preview">
          <div className="canvas-window">
            <div className="window-top">
              <span />
              <span />
              <span />
              <strong>framer.com/projects/IconSearch</strong>
            </div>
            <div className="canvas-area">
              <div className="site-frame">
                <span>Landing page canvas</span>
                <strong>Build pages with consistent icons.</strong>
                <div className="inserted-icon">IS</div>
              </div>

              <div className="plugin-card">
                <div className="plugin-title">
                  <span className="brand-mark">IS</span>
                  <div>
                    <strong>IconSearch</strong>
                    <small>{formattedIconCount} online icons</small>
                  </div>
                </div>
                <div className="plugin-search">Search fire, home, chart...</div>
                <div className="plugin-filters">
                  <span>All libraries</span>
                  <span>All styles</span>
                </div>
                <div className="plugin-grid">
                  {mockIcons.map((icon) => (
                    <div key={icon}>
                      <span>{icon.slice(0, 2)}</span>
                      <small>{icon}</small>
                    </div>
                  ))}
                </div>
                <p>Click any icon to insert SVG</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Framer plugin stats">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="section-block split-section">
        <div className="section-heading">
          <span>{'// BUILT FOR FRAMER'}</span>
          <h2>Icon search that feels native to visual building.</h2>
          <p>
            Framer projects need fast, polished icons for navs, feature cards, dashboards,
            pricing sections, forms, and marketing pages. IconSearch keeps that workflow in one panel.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span className="feature-dot" />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-panel">
        <div>
          <span className="eyebrow">{'// WORKFLOW'}</span>
          <h2>From search to canvas in one click.</h2>
        </div>
        <div className="workflow-list">
          {workflow.map((item, index) => (
            <div key={item}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="launch-card">
        <div>
          <span className="eyebrow">{'// STATUS'}</span>
          <h2>Live on the Framer Marketplace.</h2>
          <p>
            IconSearch is available free from the official Framer Marketplace. Install it to
            search the live catalog, customize size and color, then click or drag editable SVG
            icons directly onto the canvas.
          </p>
        </div>
        <a className="secondary-action compact" href={framerMarketplaceUrl} target="_blank" rel="noreferrer">
          View Framer listing
        </a>
      </section>

      <style>{`
        .framer-page {
          width: min(1220px, 100%);
          margin: 0 auto;
          padding: 56px 48px 72px;
          overflow: hidden;
        }

        .hero-section {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(460px, 1.1fr);
          gap: 38px;
          align-items: center;
          border: 1px solid rgba(129, 140, 248, 0.18);
          border-radius: 32px;
          padding: clamp(28px, 5vw, 56px);
          background:
            radial-gradient(circle at 18% 12%, rgba(56, 189, 248, 0.16), transparent 27rem),
            radial-gradient(circle at 88% 18%, rgba(168, 85, 247, 0.18), transparent 25rem),
            linear-gradient(135deg, rgba(24, 24, 27, 0.94), rgba(9, 9, 11, 0.92));
          box-shadow: 0 32px 110px rgba(0, 0, 0, 0.42);
        }

        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background-image:
            linear-gradient(rgba(129, 140, 248, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 140, 248, 0.06) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 54% 16%, #000 0%, transparent 72%);
          -webkit-mask-image: radial-gradient(circle at 54% 16%, #000 0%, transparent 72%);
          pointer-events: none;
        }

        .hero-copy,
        .framer-stage,
        .stats-grid,
        .section-block,
        .workflow-panel,
        .launch-card {
          position: relative;
          z-index: 1;
        }

        .eyebrow,
        .section-heading span {
          display: inline-block;
          color: #a5b4fc;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .hero-copy h1 {
          max-width: 720px;
          margin: 16px 0 20px;
          font-size: clamp(44px, 5.8vw, 72px);
          line-height: 0.94;
          letter-spacing: -0.075em;
        }

        .hero-copy p,
        .section-heading p,
        .launch-card p {
          color: #b8c7df;
          font-size: 18px;
          line-height: 1.75;
        }

        .hero-actions,
        .launch-card {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hero-actions {
          margin-top: 30px;
        }

        .primary-action,
        .secondary-action {
          display: inline-flex;
          min-height: 50px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          padding: 0 24px;
          text-decoration: none;
          font-weight: 900;
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }

        .primary-action {
          border: 1px solid rgba(34, 211, 238, 0.48);
          background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 52%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 18px 42px rgba(59, 130, 246, 0.28);
        }

        .secondary-action {
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(9, 9, 11, 0.42);
          color: var(--text);
        }

        .primary-action:hover,
        .secondary-action:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.42);
        }

        .secondary-action.compact {
          min-width: 154px;
        }

        .trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .trust-row span {
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 999px;
          background: rgba(248, 250, 252, 0.08);
          color: #dbeafe;
          padding: 8px 11px;
          font-size: 12px;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
        }

        .canvas-window {
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 24px;
          background: #f8fafc;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
        }

        .window-top {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 13px 16px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: #e2e8f0;
        }

        .window-top span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #94a3b8;
        }

        .window-top span:nth-child(1) { background: #fb7185; }
        .window-top span:nth-child(2) { background: #fbbf24; }
        .window-top span:nth-child(3) { background: #34d399; }

        .window-top strong {
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .canvas-area {
          position: relative;
          min-height: 540px;
          padding: 34px;
          background:
            linear-gradient(90deg, rgba(15, 23, 42, 0.08) 1px, transparent 1px),
            linear-gradient(rgba(15, 23, 42, 0.08) 1px, transparent 1px),
            #f8fafc;
          background-size: 34px 34px;
        }

        .site-frame {
          width: 68%;
          min-height: 350px;
          border: 1px dashed rgba(15, 23, 42, 0.18);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.78);
          padding: 30px;
        }

        .site-frame span {
          color: #64748b;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }

        .site-frame strong {
          display: block;
          max-width: 340px;
          margin-top: 12px;
          color: #0f172a;
          font-size: 34px;
          line-height: 1.1;
          letter-spacing: -0.055em;
        }

        .inserted-icon {
          display: grid;
          width: 96px;
          height: 96px;
          margin-top: 32px;
          place-items: center;
          border-radius: 26px;
          background: linear-gradient(135deg, #22d3ee, #8b5cf6);
          color: white;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-size: 30px;
          font-weight: 900;
          box-shadow: 0 20px 42px rgba(59, 130, 246, 0.26);
        }

        .plugin-card {
          position: absolute;
          right: 26px;
          top: 42px;
          width: min(344px, calc(100% - 52px));
          border: 1px solid rgba(15, 23, 42, 0.11);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          color: #0f172a;
          padding: 16px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
        }

        .plugin-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-mark {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 13px;
          color: white;
          background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-weight: 900;
        }

        .plugin-title strong,
        .plugin-title small {
          display: block;
        }

        .plugin-title small {
          color: #64748b;
          font-size: 12px;
        }

        .plugin-search {
          margin-top: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          padding: 11px 12px;
          font-size: 13px;
        }

        .plugin-filters {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .plugin-filters span {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          padding: 9px 10px;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .plugin-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
          margin-top: 14px;
        }

        .plugin-grid div {
          display: grid;
          place-items: center;
          gap: 5px;
          aspect-ratio: 1;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #f8fafc;
          padding: 6px;
        }

        .plugin-grid span {
          display: grid;
          place-items: center;
          width: 28px;
          height: 28px;
          border-radius: 9px;
          background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(139, 92, 246, 0.13));
          color: #2563eb;
          font-size: 11px;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-weight: 900;
          text-transform: uppercase;
        }

        .plugin-grid small {
          width: 100%;
          overflow: hidden;
          color: #64748b;
          font-size: 9px;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .plugin-card p {
          margin-top: 14px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin: 24px 0 72px;
        }

        .stat-card,
        .feature-card,
        .workflow-panel,
        .launch-card {
          border: 1px solid var(--border);
          background: linear-gradient(180deg, rgba(24, 24, 27, 0.92), rgba(18, 18, 21, 0.86));
        }

        .stat-card {
          border-radius: 19px;
          padding: 22px;
        }

        .stat-card strong {
          display: block;
          color: #a5b4fc;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-size: clamp(24px, 3vw, 34px);
          line-height: 1;
        }

        .stat-card span {
          display: block;
          margin-top: 9px;
          color: var(--text-muted);
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .section-block {
          margin-top: 72px;
        }

        .split-section {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: 34px;
          align-items: start;
        }

        .section-heading h2,
        .workflow-panel h2,
        .launch-card h2 {
          margin: 10px 0 0;
          font-size: clamp(30px, 4.2vw, 50px);
          line-height: 1.03;
          letter-spacing: -0.06em;
        }

        .section-heading p,
        .launch-card p {
          margin-top: 14px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .feature-card {
          border-radius: 22px;
          padding: 24px;
        }

        .feature-dot {
          display: block;
          width: 10px;
          height: 10px;
          margin-bottom: 24px;
          border-radius: 999px;
          background: #22d3ee;
          box-shadow: 0 0 26px rgba(34, 211, 238, 0.52);
        }

        .feature-card h3 {
          font-size: 17px;
          letter-spacing: -0.02em;
        }

        .feature-card p {
          margin-top: 10px;
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .workflow-panel {
          display: grid;
          grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr);
          gap: 30px;
          align-items: center;
          margin-top: 72px;
          border-radius: 26px;
          padding: 34px;
        }

        .workflow-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .workflow-list div {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 12px;
          align-items: center;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 16px;
          background: rgba(9, 9, 11, 0.34);
          padding: 14px;
        }

        .workflow-list span {
          display: grid;
          place-items: center;
          width: 44px;
          height: 44px;
          border-radius: 13px;
          background: rgba(129, 140, 248, 0.16);
          color: #c7d2fe;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-weight: 900;
        }

        .workflow-list p {
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.45;
        }

        .launch-card {
          justify-content: space-between;
          margin-top: 72px;
          border-radius: 26px;
          padding: 34px;
          background:
            radial-gradient(circle at 92% 12%, rgba(34, 211, 238, 0.14), transparent 22rem),
            linear-gradient(135deg, rgba(24, 24, 27, 0.92), rgba(9, 9, 11, 0.92));
        }

        .launch-card > div {
          max-width: 760px;
        }

        @media (max-width: 1120px) {
          .hero-section,
          .split-section,
          .workflow-panel {
            grid-template-columns: 1fr;
          }

          .framer-stage {
            max-width: 760px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .framer-page {
            padding: 28px 16px 48px;
          }

          .hero-section,
          .workflow-panel,
          .launch-card {
            padding: 24px;
            border-radius: 22px;
          }

          .hero-copy h1 {
            font-size: clamp(38px, 14vw, 56px);
          }

          .hero-copy p,
          .section-heading p,
          .launch-card p {
            font-size: 16px;
          }

          .hero-actions,
          .launch-card {
            align-items: stretch;
            flex-direction: column;
          }

          .primary-action,
          .secondary-action {
            width: 100%;
          }

          .stats-grid,
          .feature-grid,
          .workflow-list {
            grid-template-columns: 1fr;
          }

          .canvas-area {
            min-height: 560px;
            padding: 18px;
          }

          .site-frame {
            width: 100%;
            min-height: 250px;
          }

          .plugin-card {
            left: 18px;
            right: 18px;
            top: 218px;
            width: auto;
          }
        }
      `}</style>
    </main>
  )
}
