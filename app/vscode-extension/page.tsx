import Link from 'next/link'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'

const VSCODE_MARKETPLACE_URL =
  'https://marketplace.visualstudio.com/items?itemName=IconSearch.iconsearch-integration&ssr=false#overview'
const formattedIconCount = SEARCHABLE_ICON_COUNT.toLocaleString('en-US')

export const metadata = createPageMetadata({
  title: `IconSearch VS Code Extension — Search ${formattedIconCount} SVG Icons`,
  description: `Install the IconSearch VS Code extension to search and insert ${formattedIconCount} free online SVG icons from ${NAMED_LIBRARY_COUNT} open-source libraries.`,
  path: '/vscode-extension',
})

const stats = [
  { value: formattedIconCount, label: 'online icons' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'named libraries' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'icon collections' },
  { value: '0', label: 'offline icon bundles' },
]

const steps = [
  {
    title: 'Install from Marketplace',
    text: 'Add IconSearch Integration from the VS Code Marketplace and open it from the activity bar.',
  },
  {
    title: 'Connect your free account',
    text: 'Approve the extension in your browser. VS Code stores only a revocable app token.',
  },
  {
    title: 'Search and insert',
    text: 'Find icons by name, filter libraries and styles, then insert React, SVG, Vue, Svelte, or Tailwind snippets.',
  },
]

const features = [
  {
    title: 'Online-only catalog',
    text: 'Every preview and SVG is fetched from the live IconSearch API or trusted online SVG sources, so the extension stays small and current.',
  },
  {
    title: 'Developer-ready output',
    text: 'Copy or insert clean snippets for React, raw SVG, Vue, Svelte, and Tailwind workflows without leaving your editor.',
  },
  {
    title: 'Shared design source',
    text: 'Use the same icon database across the website, Figma plugin, and VS Code extension so design and code stay aligned.',
  },
  {
    title: 'Secure account approval',
    text: 'Sign-in happens on iconsearch.info. Your password never enters VS Code, and access can be revoked from your account.',
  },
]

const mockIcons = ['home', 'arrow', 'chart', 'user', 'search', 'code', 'sync', 'box', 'grid', 'bell', 'lock', 'copy']

export default function VSCodeExtensionPage() {
  return (
    <main className="vscode-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow">{'// LIVE VS CODE EXTENSION'}</div>
          <h1>
            Search SVG icons inside VS Code.
          </h1>
          <p className="hero-lede">
            Browse {formattedIconCount} online icons from the live IconSearch catalog with previews,
            library filters, and production-ready snippets for everyday frontend work.
          </p>

          <div className="hero-actions" aria-label="Primary actions">
            <a className="primary-action" href={VSCODE_MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
              Install from Marketplace
            </a>
            <Link className="secondary-action" href="/icon-search">
              Try the Web Search
            </Link>
          </div>

          <div className="trust-row" aria-label="Extension highlights">
            <span>Free access</span>
            <span>Secure sign in</span>
            <span>Online results</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="VS Code extension preview">
          <div className="window-bar">
            <span />
            <span />
            <span />
            <strong>IconSearch: Search and Insert</strong>
          </div>
          <div className="extension-preview">
            <div className="preview-header">
              <div>
                <span className="preview-kicker">LIVE ICON SEARCH</span>
                <h2>IconSearch</h2>
              </div>
              <span className="free-pill">FREE</span>
            </div>
            <div className="search-box">home, arrow, chart...</div>
            <div className="filter-row">
              <span>All libraries</span>
              <span>All styles</span>
            </div>
            <div className="format-row">
              <span>React</span>
              <span>SVG</span>
              <span>Vue</span>
              <span>Svelte</span>
              <span>TW</span>
            </div>
            <p className="result-count">60 visible from {formattedIconCount} online results</p>
            <div className="icon-grid">
              {mockIcons.map((icon) => (
                <div className="mock-icon-card" key={icon}>
                  <span aria-hidden="true">{icon.slice(0, 2)}</span>
                  <strong>{icon}</strong>
                  <small>@iconify/react</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="IconSearch extension stats">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <span>{'// HOW IT WORKS'}</span>
          <h2>Install once, search from your editor.</h2>
        </div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <article className="step-card" key={step.title}>
              <span className="step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block split-section">
        <div className="section-heading">
          <span>{'// BUILT FOR HANDOFF'}</span>
          <h2>Professional icon search for real codebases.</h2>
          <p>
            The extension is designed for fast implementation work: fewer browser tabs, fewer copied
            package names, and fewer mismatches between design and code.
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

      <section className="security-banner">
        <div>
          <span>{'// SECURITY MODEL'}</span>
          <h2>Your password stays out of the extension.</h2>
          <p>
            IconSearch opens a browser approval flow on iconsearch.info. VS Code receives only an opaque,
            revocable session token, while the live API handles icon search and preview delivery.
          </p>
        </div>
        <Link className="secondary-action compact" href="/account">
          Manage account
        </Link>
      </section>

      <section className="final-cta">
        <div>
          <span className="eyebrow">{'// READY'}</span>
          <h2>Add IconSearch to VS Code today.</h2>
          <p>
            Start with the free extension and keep your icon workflow in the same place you write code.
          </p>
        </div>
        <a className="primary-action" href={VSCODE_MARKETPLACE_URL} target="_blank" rel="noopener noreferrer">
          Open Marketplace Listing
        </a>
      </section>

      <style>{`
        .vscode-page {
          width: min(1180px, 100%);
          margin: 0 auto;
          padding: 56px 48px 72px;
          overflow: hidden;
        }

        .hero-section {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.92fr);
          gap: 42px;
          align-items: center;
          padding: 42px;
          border: 1px solid rgba(129, 140, 248, 0.18);
          border-radius: 28px;
          background:
            radial-gradient(circle at 20% 20%, rgba(129, 140, 248, 0.18), transparent 28rem),
            radial-gradient(circle at 88% 18%, rgba(34, 211, 238, 0.12), transparent 24rem),
            linear-gradient(135deg, rgba(24, 24, 27, 0.9), rgba(9, 9, 11, 0.92));
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.38);
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
          mask-image: radial-gradient(circle at 55% 22%, #000 0%, transparent 72%);
          -webkit-mask-image: radial-gradient(circle at 55% 22%, #000 0%, transparent 72%);
          pointer-events: none;
        }

        .hero-copy,
        .hero-visual,
        .stats-grid,
        .section-block,
        .security-banner,
        .final-cta {
          position: relative;
          z-index: 1;
        }

        .eyebrow,
        .section-heading span,
        .security-banner span,
        .preview-kicker {
          display: inline-block;
          color: var(--accent);
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-size: 12px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .hero-copy h1 {
          max-width: 720px;
          margin: 16px 0 20px;
          font-size: clamp(44px, 5.8vw, 68px);
          line-height: 0.96;
          letter-spacing: -0.07em;
        }

        .hero-lede {
          max-width: 650px;
          color: #b6c6df;
          font-size: 18px;
          line-height: 1.75;
        }

        .hero-actions,
        .final-cta {
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
          align-items: center;
          justify-content: center;
          min-height: 48px;
          border-radius: 13px;
          padding: 0 22px;
          text-decoration: none;
          font-weight: 800;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .primary-action {
          border: 1px solid rgba(165, 180, 252, 0.72);
          background: linear-gradient(135deg, #8b8cf8 0%, #5b5bf0 100%);
          color: #07070a;
          box-shadow: 0 18px 42px rgba(79, 70, 229, 0.32);
        }

        .secondary-action {
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: rgba(9, 9, 11, 0.38);
          color: var(--text);
        }

        .primary-action:hover,
        .secondary-action:hover {
          transform: translateY(-1px);
          border-color: rgba(165, 180, 252, 0.68);
        }

        .secondary-action.compact {
          min-width: 150px;
          padding: 0 18px;
        }

        .trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .trust-row span {
          border: 1px solid rgba(52, 211, 153, 0.24);
          border-radius: 999px;
          background: rgba(52, 211, 153, 0.08);
          color: #a7f3d0;
          padding: 7px 11px;
          font-size: 12px;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
        }

        .hero-visual {
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 24px;
          overflow: hidden;
          background: #0b0f18;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.34);
        }

        .window-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 42px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.12);
          background: rgba(15, 23, 42, 0.82);
        }

        .window-bar span {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: #475569;
        }

        .window-bar span:nth-child(1) { background: #f87171; }
        .window-bar span:nth-child(2) { background: #fbbf24; }
        .window-bar span:nth-child(3) { background: #34d399; }

        .window-bar strong {
          margin-left: 8px;
          color: #cbd5e1;
          font-size: 12px;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-weight: 600;
        }

        .extension-preview {
          padding: 22px;
          background:
            radial-gradient(circle at 90% 0%, rgba(129, 140, 248, 0.2), transparent 15rem),
            #0b0f18;
        }

        .preview-header,
        .filter-row,
        .format-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .preview-header h2 {
          margin-top: 3px;
          font-size: 24px;
          letter-spacing: -0.04em;
        }

        .free-pill {
          border: 1px solid rgba(52, 211, 153, 0.34);
          border-radius: 999px;
          color: #34d399;
          padding: 5px 9px;
          font-size: 11px;
          font-weight: 900;
        }

        .search-box {
          margin-top: 18px;
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 13px;
          background: rgba(248, 250, 252, 0.07);
          color: #94a3b8;
          padding: 13px 14px;
          font-size: 13px;
        }

        .filter-row {
          margin-top: 12px;
        }

        .filter-row span,
        .format-row span {
          flex: 1;
          border: 1px solid rgba(148, 163, 184, 0.16);
          border-radius: 11px;
          background: rgba(15, 23, 42, 0.78);
          color: #e2e8f0;
          padding: 10px 12px;
          font-size: 12px;
        }

        .format-row {
          justify-content: flex-start;
          margin-top: 12px;
        }

        .format-row span {
          flex: 0 0 auto;
          padding: 8px 10px;
          color: #bfdbfe;
          font-weight: 800;
        }

        .result-count {
          margin: 18px 0 12px;
          color: #94a3b8;
          font-size: 12px;
        }

        .icon-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .mock-icon-card {
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 14px;
          background: rgba(248, 250, 252, 0.055);
          padding: 12px;
        }

        .mock-icon-card span {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          margin-bottom: 10px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(129, 140, 248, 0.14));
          color: #67e8f9;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-weight: 900;
          text-transform: uppercase;
        }

        .mock-icon-card strong,
        .mock-icon-card small {
          display: block;
        }

        .mock-icon-card strong {
          color: #f8fafc;
          font-size: 12px;
          line-height: 1.2;
        }

        .mock-icon-card small {
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin: 24px 0 70px;
        }

        .stat-card {
          border: 1px solid var(--border);
          border-radius: 18px;
          background: rgba(24, 24, 27, 0.78);
          padding: 22px;
        }

        .stat-card strong {
          display: block;
          color: var(--accent);
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

        .section-heading {
          max-width: 720px;
          margin-bottom: 26px;
        }

        .section-heading h2,
        .security-banner h2,
        .final-cta h2 {
          margin: 10px 0 0;
          font-size: clamp(28px, 4vw, 46px);
          line-height: 1.06;
          letter-spacing: -0.055em;
        }

        .section-heading p,
        .security-banner p,
        .final-cta p {
          margin-top: 12px;
          color: var(--text-muted);
          font-size: 16px;
          line-height: 1.75;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .step-card,
        .feature-card {
          border: 1px solid var(--border);
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(24, 24, 27, 0.88), rgba(18, 18, 21, 0.82));
          padding: 24px;
        }

        .step-number {
          display: inline-grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 13px;
          background: var(--accent-dim);
          color: #c7d2fe;
          font-family: var(--font-mono), "JetBrains Mono", monospace;
          font-weight: 900;
          margin-bottom: 22px;
        }

        .step-card h3,
        .feature-card h3 {
          font-size: 17px;
          line-height: 1.25;
          letter-spacing: -0.02em;
        }

        .step-card p,
        .feature-card p {
          margin-top: 10px;
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .split-section {
          display: grid;
          grid-template-columns: minmax(0, 0.82fr) minmax(0, 1.18fr);
          gap: 34px;
          align-items: start;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .feature-dot {
          display: block;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--green);
          box-shadow: 0 0 26px rgba(52, 211, 153, 0.55);
          margin-bottom: 24px;
        }

        .security-banner,
        .final-cta {
          margin-top: 72px;
          border: 1px solid rgba(129, 140, 248, 0.22);
          border-radius: 24px;
          background:
            radial-gradient(circle at 90% 0%, rgba(34, 211, 238, 0.12), transparent 20rem),
            linear-gradient(135deg, rgba(24, 24, 27, 0.92), rgba(9, 9, 11, 0.9));
          padding: 32px;
        }

        .security-banner {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: center;
        }

        .final-cta {
          justify-content: space-between;
        }

        .final-cta > div {
          max-width: 660px;
        }

        @media (max-width: 1080px) {
          .hero-section,
          .split-section {
            grid-template-columns: 1fr;
          }

          .hero-visual {
            max-width: 620px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 720px) {
          .vscode-page {
            padding: 28px 16px 48px;
          }

          .hero-section,
          .security-banner,
          .final-cta {
            padding: 24px;
            border-radius: 22px;
          }

          .hero-copy h1 {
            font-size: clamp(36px, 14vw, 54px);
          }

          .hero-lede {
            font-size: 16px;
          }

          .hero-actions,
          .final-cta {
            align-items: stretch;
            flex-direction: column;
          }

          .primary-action,
          .secondary-action {
            width: 100%;
          }

          .stats-grid,
          .steps-grid,
          .feature-grid,
          .security-banner {
            grid-template-columns: 1fr;
          }

          .extension-preview {
            padding: 16px;
          }

          .icon-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </main>
  )
}
