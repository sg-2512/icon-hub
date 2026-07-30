import Link from 'next/link'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'

const formattedIconCount = SEARCHABLE_ICON_COUNT.toLocaleString('en-US')

export const metadata = createPageMetadata({
  title: 'IconSearch Chrome Extension — Free SVG Icon Search',
  description: `The IconSearch Chrome extension is launching soon with ${formattedIconCount} online SVG icons from ${NAMED_LIBRARY_COUNT} curated open-source icon libraries.`,
  path: '/chrome-extension',
})

const stats = [
  { value: formattedIconCount, label: 'searchable icons' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'named libraries' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'icon collections' },
  { value: '0', label: 'offline icon bundles' },
]

const trustBadges = ['Launching soon', 'Live IconSearch API', 'Chrome Web Store next']

const featureCards = [
  {
    title: 'Search from any tab',
    text: 'Open the popup, type a query, filter by library or style, and keep working inside your current browser workflow.',
  },
  {
    title: 'Copy production snippets',
    text: 'Copy React component usage, raw SVG markup, or an online SVG URL without hunting through package docs.',
  },
  {
    title: 'Download SVG fast',
    text: 'Save a clean SVG from the live online source for quick design, no local icon database bundled.',
  },
  {
    title: 'Secure free unlock',
    text: 'Sign in on iconsearch.info. Chrome stores only a revocable session token in extension storage.',
  },
]

const workflow = [
  'Open the IconSearch popup',
  'Search home, arrow, chart, settings...',
  'Filter by library, style, and legal-safe results',
  'Copy React, SVG, URL, or download the SVG',
]

const launchSteps = [
  'Finalize the Chrome Web Store package',
  'Complete store screenshots, privacy copy, and review notes',
  'Submit the listing for Chrome Web Store review',
  'Switch this page to the official install link after approval',
]

const mockIcons = ['home', 'fire', 'arrow', 'chart', 'menu', 'globe', 'user', 'calendar', 'settings', 'copy', 'search', 'lock']

export default function ChromeExtensionPage() {
  return (
    <main className="chrome-page">
      <section className="chrome-hero">
        <div className="hero-copy">
          <div className="eyebrow">{'// CHROME EXTENSION - LAUNCHING SOON'}</div>
          <h1>Chrome icon search is launching soon.</h1>
          <p>
            A polished browser popup for finding, previewing, copying, and downloading clean SVG icons
            from the live IconSearch catalog. The public Chrome Web Store listing is the next release.
          </p>

          <div className="hero-actions">
            <span className="primary-action pending">Chrome Web Store launch soon</span>
            <Link className="secondary-action" href="/icon-search">
              Try Web Search
            </Link>
          </div>

          <div className="badge-row" aria-label="Chrome extension highlights">
            {trustBadges.map((badge) => (
              <span key={badge}>{badge}</span>
            ))}
          </div>
        </div>

        <div className="browser-stage" aria-label="IconSearch Chrome extension preview">
          <div className="browser-shell">
            <div className="browser-tabs">
              <span />
              <span />
              <span />
              <strong>canva.com/design</strong>
            </div>
            <div className="browser-toolbar">
              <span className="address">https://canva.com/design/project</span>
              <span className="pin">IS</span>
            </div>
            <div className="browser-canvas">
              <div className="canvas-card">
                <span>Brand dashboard</span>
                <strong>Drop icons into any workflow</strong>
              </div>
              <div className="popup-card">
                <div className="popup-title">
                  <span className="logo-mark">IS</span>
                  <div>
                    <strong>IconSearch</strong>
                    <small>{formattedIconCount} online icons</small>
                  </div>
                </div>
                <div className="popup-search">Search fire, home, chart...</div>
                <div className="popup-filters">
                  <span>All libraries</span>
                  <span>All styles</span>
                </div>
                <div className="popup-format">
                  <span>React</span>
                  <span>SVG</span>
                  <span>URL</span>
                </div>
                <div className="popup-grid">
                  {mockIcons.map((icon) => (
                    <div key={icon}>
                      <span>{icon.slice(0, 2)}</span>
                    </div>
                  ))}
                </div>
                <div className="popup-actions">
                  <span>Copy SVG</span>
                  <span>Download</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Chrome extension stats">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="section-block split">
        <div className="section-heading">
          <span>{'// WHY CHROME'}</span>
          <h2>One icon search layer for design, docs, no-code, and web apps.</h2>
          <p>
            Chrome is where designers and builders already move between Canva, docs, dashboards,
            CMS tools, and internal apps. IconSearch gives them a compact icon command center.
          </p>
        </div>
        <div className="feature-grid">
          {featureCards.map((feature) => (
            <article key={feature.title} className="feature-card">
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
          <h2>Fast enough for daily icon work.</h2>
        </div>
        <div className="workflow-list">
          {workflow.map((item, index) => (
            <div key={item}>
              <span>{index + 1}</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="install-panel">
        <div className="section-heading">
          <span>{'// LAUNCH PLAN'}</span>
          <h2>Chrome Web Store launch is next.</h2>
          <p>
            The extension page is staying in launch-soon mode until the official Chrome Web Store
            listing is approved. That keeps users on a clean, trusted install path.
          </p>
        </div>
        <div className="install-grid">
          {launchSteps.map((step, index) => (
            <div key={step}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="launch-card">
        <div>
          <span className="eyebrow">{'// STATUS'}</span>
          <h2>Launching soon after store approval.</h2>
          <p>
            The extension uses restricted host access, a revocable IconSearch account token,
            and the same live API as the website and VS Code extension.
          </p>
        </div>
        <Link className="secondary-action" href="/icon-search">
          Use Web Search Today
        </Link>
      </section>

      <style>{`
        .chrome-page {
          width: min(1220px, 100%);
          margin: 0 auto;
          padding: 56px 48px 72px;
          overflow: hidden;
        }

        .chrome-hero {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 0.86fr) minmax(460px, 1.14fr);
          gap: 38px;
          align-items: center;
          border: 1px solid rgba(129, 140, 248, 0.18);
          border-radius: 32px;
          padding: clamp(28px, 5vw, 56px);
          background:
            radial-gradient(circle at 16% 18%, rgba(236, 72, 153, 0.18), transparent 26rem),
            radial-gradient(circle at 82% 12%, rgba(34, 211, 238, 0.14), transparent 24rem),
            linear-gradient(135deg, rgba(24, 24, 27, 0.94), rgba(9, 9, 11, 0.92));
          box-shadow: 0 32px 110px rgba(0, 0, 0, 0.42);
        }

        .chrome-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background-image:
            linear-gradient(rgba(129, 140, 248, 0.065) 1px, transparent 1px),
            linear-gradient(90deg, rgba(129, 140, 248, 0.065) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 54% 16%, #000 0%, transparent 72%);
          -webkit-mask-image: radial-gradient(circle at 54% 16%, #000 0%, transparent 72%);
          pointer-events: none;
        }

        .hero-copy,
        .browser-stage,
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
          font-size: clamp(44px, 6vw, 74px);
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
          border: 1px solid rgba(251, 113, 133, 0.55);
          background: linear-gradient(135deg, #fb7185 0%, #ec4899 48%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 18px 42px rgba(236, 72, 153, 0.26);
        }

        .primary-action.pending {
          cursor: default;
        }

        .secondary-action {
          border: 1px solid rgba(148, 163, 184, 0.22);
          background: rgba(9, 9, 11, 0.42);
          color: var(--text);
        }

        .primary-action:not(.pending):hover,
        .secondary-action:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.42);
        }

        .badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .badge-row span {
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 999px;
          background: rgba(248, 250, 252, 0.08);
          color: #dbeafe;
          padding: 8px 11px;
          font-size: 12px;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
        }

        .browser-shell {
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 24px;
          background: #eef4ff;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.34);
        }

        .browser-tabs,
        .browser-toolbar {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 12px 16px;
        }

        .browser-tabs {
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background: #dbeafe;
        }

        .browser-tabs span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #94a3b8;
        }

        .browser-tabs span:nth-child(1) { background: #fb7185; }
        .browser-tabs span:nth-child(2) { background: #fbbf24; }
        .browser-tabs span:nth-child(3) { background: #34d399; }

        .browser-tabs strong {
          color: #334155;
          font-size: 12px;
          font-weight: 800;
        }

        .browser-toolbar {
          background: white;
        }

        .address {
          flex: 1;
          border-radius: 999px;
          background: #f1f5f9;
          color: #64748b;
          padding: 9px 13px;
          font-size: 12px;
        }

        .pin {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          border-radius: 11px;
          color: white;
          background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-weight: 900;
        }

        .browser-canvas {
          position: relative;
          min-height: 520px;
          padding: 34px;
          background:
            linear-gradient(90deg, rgba(15, 23, 42, 0.09) 1px, transparent 1px),
            linear-gradient(rgba(15, 23, 42, 0.09) 1px, transparent 1px),
            #f8fafc;
          background-size: 34px 34px;
        }

        .canvas-card {
          width: 68%;
          min-height: 340px;
          border: 1px dashed rgba(15, 23, 42, 0.18);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.78);
          padding: 30px;
        }

        .canvas-card span {
          color: #64748b;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
        }

        .canvas-card strong {
          display: block;
          max-width: 340px;
          margin-top: 12px;
          color: #0f172a;
          font-size: 34px;
          line-height: 1.1;
          letter-spacing: -0.055em;
        }

        .popup-card {
          position: absolute;
          right: 26px;
          top: 40px;
          width: min(342px, calc(100% - 52px));
          border: 1px solid rgba(15, 23, 42, 0.11);
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          color: #0f172a;
          padding: 16px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.24);
        }

        .popup-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-mark {
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

        .popup-title strong,
        .popup-title small {
          display: block;
        }

        .popup-title small {
          color: #64748b;
          font-size: 12px;
        }

        .popup-search {
          margin-top: 16px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          color: #64748b;
          padding: 11px 12px;
          font-size: 13px;
        }

        .popup-filters,
        .popup-format,
        .popup-actions {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }

        .popup-filters span,
        .popup-format span,
        .popup-actions span {
          flex: 1;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: #f8fafc;
          padding: 9px 10px;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .popup-format span {
          text-align: center;
          color: #2563eb;
        }

        .popup-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 9px;
          margin-top: 14px;
        }

        .popup-grid div {
          display: grid;
          place-items: center;
          aspect-ratio: 1;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: #f8fafc;
        }

        .popup-grid span {
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

        .popup-actions span {
          border-color: rgba(14, 165, 233, 0.3);
          background: #eff6ff;
          color: #0369a1;
          text-align: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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

        .split {
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
          background: #fb7185;
          box-shadow: 0 0 26px rgba(251, 113, 133, 0.52);
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
          grid-template-columns: 34px 1fr;
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
          width: 34px;
          height: 34px;
          border-radius: 11px;
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

        .install-panel {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
          gap: 28px;
          align-items: start;
          margin-top: 72px;
          border: 1px solid rgba(129, 140, 248, 0.18);
          border-radius: 26px;
          padding: 34px;
          background:
            radial-gradient(circle at 8% 0%, rgba(56, 189, 248, 0.14), transparent 20rem),
            linear-gradient(135deg, rgba(24, 24, 27, 0.9), rgba(9, 9, 11, 0.9));
        }

        .install-grid {
          display: grid;
          gap: 12px;
        }

        .install-grid div {
          display: grid;
          grid-template-columns: 54px 1fr;
          gap: 14px;
          align-items: center;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 18px;
          background: rgba(248, 250, 252, 0.045);
          padding: 16px;
        }

        .install-grid strong {
          color: #67e8f9;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-size: 18px;
        }

        .install-grid p {
          color: #dbeafe;
          font-size: 14px;
          line-height: 1.55;
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
          max-width: 720px;
        }

        @media (max-width: 1120px) {
          .chrome-hero,
          .split,
          .workflow-panel,
          .install-panel {
            grid-template-columns: 1fr;
          }

          .browser-stage {
            max-width: 760px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .chrome-page {
            padding: 28px 16px 48px;
          }

          .chrome-hero,
          .workflow-panel,
          .install-panel,
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

          .browser-canvas {
            min-height: 520px;
            padding: 18px;
          }

          .canvas-card {
            width: 100%;
            min-height: 230px;
          }

          .popup-card {
            left: 18px;
            right: 18px;
            top: 190px;
            width: auto;
          }
        }
      `}</style>
    </main>
  )
}
