import type { Metadata } from 'next'
import Link from 'next/link'
import { ICONIFY_COLLECTION_COUNT, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import styles from './figma-plugin.module.css'

const FIGMA_PLUGIN_URL = 'https://www.figma.com/community/plugin/1652731113142368438/iconsearch-free-svg-icons'
const formattedIconCount = SEARCHABLE_ICON_COUNT.toLocaleString('en-US')

export const metadata: Metadata = {
  title: `IconSearch Figma Plugin - Search ${formattedIconCount} Free SVG Icons`,
  description: `Install the live IconSearch Figma plugin to search, filter, and insert ${formattedIconCount} free SVG icons from ${NAMED_LIBRARY_COUNT} named libraries and ${ICONIFY_COLLECTION_COUNT} Iconify collections.`,
  alternates: {
    canonical: '/figma-plugin',
  },
  openGraph: {
    title: 'IconSearch Figma Plugin',
    description: `Search and insert ${formattedIconCount} free SVG icons directly inside Figma.`,
    url: '/figma-plugin',
    type: 'website',
  },
}

const stats = [
  { value: formattedIconCount, label: 'searchable SVG icons' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'named libraries' },
  { value: ICONIFY_COLLECTION_COUNT.toString(), label: 'Iconify collections' },
  { value: 'Live', label: 'on Figma Community' },
]

const features = [
  {
    title: 'Search without leaving Figma',
    text: 'Find icons by name, library, and style while staying in the same design file.',
  },
  {
    title: 'Insert clean vector SVGs',
    text: 'Place icons as editable vector layers, ready for layouts, components, and design systems.',
  },
  {
    title: 'Use the same source as code',
    text: 'Designers and developers can reference the same icon names and libraries across IconSearch.',
  },
  {
    title: 'Save frequent picks',
    text: 'Keep favorite and recently used icons close for faster repeated work.',
  },
]

const workflow = [
  'Open IconSearch from Figma Community',
  'Search home, arrow, chart, menu, brand, or system icons',
  'Filter by library or icon style',
  'Insert the selected SVG into your active canvas',
]

const iconSamples = ['home', 'arrow', 'chart', 'bell', 'lock', 'menu', 'user', 'spark']

export default function FigmaPluginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span className={styles.liveDot} />
            Live on Figma Community
          </div>

          <h1>IconSearch for Figma</h1>

          <p className={styles.lede}>
            Search, filter, and insert {formattedIconCount} free SVG icons directly in your Figma
            canvas. Built for faster design exploration, cleaner handoff, and fewer browser tabs.
          </p>

          <div className={styles.actions} aria-label="Primary actions">
            <a className={styles.primaryAction} href={FIGMA_PLUGIN_URL} target="_blank" rel="noopener noreferrer">
              Install Figma Plugin
            </a>
            <Link className={styles.secondaryAction} href="/icon-search">
              Try Web Search
            </Link>
          </div>

          <div className={styles.trustRow} aria-label="Plugin highlights">
            <span>Review passed</span>
            <span>Free SVG icons</span>
            <span>Design to code ready</span>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="IconSearch Figma plugin preview">
          <div className={styles.figmaTopbar}>
            <div className={styles.figmaMark} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <strong>Cooperative Software</strong>
            <span>main</span>
          </div>

          <div className={styles.figmaWorkspace}>
            <div className={styles.canvasPreview}>
              <div className={styles.canvasLabel}>Desktop 1200</div>
              <div className={styles.insertedIcon} aria-hidden="true">
                <span />
                <span />
              </div>
              <p>Selected SVG inserted as an editable layer</p>
            </div>

            <div className={styles.pluginPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.logoMark}>IS</span>
                <div>
                  <strong>IconSearch</strong>
                  <small>{formattedIconCount} icons ready</small>
                </div>
              </div>
              <div className={styles.searchInput}>Search home, arrow, chart...</div>
              <div className={styles.filterGrid}>
                <span>All libraries</span>
                <span>All styles</span>
              </div>
              <div className={styles.iconGrid}>
                {iconSamples.map((icon) => (
                  <div className={styles.iconCard} key={icon}>
                    <span>{icon.slice(0, 2)}</span>
                    <strong>{icon}</strong>
                    <small>SVG</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.statsGrid} aria-label="IconSearch Figma plugin stats">
        {stats.map((stat) => (
          <div className={styles.statCard} key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className={styles.sectionHeader}>
        <span>{'// BUILT FOR DESIGN WORK'}</span>
        <h2>A focused icon workflow inside Figma.</h2>
        <p>
          IconSearch keeps the searching, filtering, previewing, and insertion flow close to the canvas,
          so designers can move from idea to production-ready SVG faster.
        </p>
      </section>

      <section className={styles.featureGrid} aria-label="Figma plugin features">
        {features.map((feature) => (
          <article className={styles.featureCard} key={feature.title}>
            <span className={styles.featureDot} />
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        ))}
      </section>

      <section className={styles.workflowSection}>
        <div className={styles.sectionHeader}>
          <span>{'// HOW IT WORKS'}</span>
          <h2>Four steps from search to canvas.</h2>
        </div>

        <div className={styles.workflowList}>
          {workflow.map((step, index) => (
            <div className={styles.workflowItem} key={step}>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.handoffSection}>
        <div>
          <span>{'// HANDOFF READY'}</span>
          <h2>One icon source for designers and developers.</h2>
          <p>
            The Figma plugin uses the same IconSearch catalog as the website and the{' '}
            <Link href="/vscode-extension">VS Code extension</Link>. That makes it easier to match
            design assets with code imports, SVG files, and icon names during implementation.
          </p>
        </div>
        <a className={styles.primaryAction} href={FIGMA_PLUGIN_URL} target="_blank" rel="noopener noreferrer">
          Open Figma Listing
        </a>
      </section>
    </main>
  )
}
