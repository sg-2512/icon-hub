import Link from 'next/link'
import {
  Bell,
  ChartColumn,
  CodeXml,
  House,
  Layers,
  ListFilter,
  Lock,
  MousePointer2,
  Palette,
  Search,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react'
import { NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../data/library-catalog'
import { createPageMetadata } from '../../lib/seo'
import styles from './figma-plugin.module.css'

const FIGMA_PLUGIN_URL = 'https://www.figma.com/community/plugin/1652731113142368438/iconsearch-free-svg-icons'
const formattedIconCount = SEARCHABLE_ICON_COUNT.toLocaleString('en-US')

export const metadata = createPageMetadata({
  title: `IconSearch Figma Plugin — Search ${formattedIconCount} Free SVG Icons`,
  description: `Install the live IconSearch Figma plugin to search, filter, and insert ${formattedIconCount} free SVG icons from ${NAMED_LIBRARY_COUNT} open-source libraries.`,
  path: '/figma-plugin',
  image: 'https://iconsearch.info/figma-plugin-thumbnail.png',
  imageAlt: 'IconSearch Figma plugin interface',
  imageWidth: 1920,
  imageHeight: 1080,
})

const stats = [
  { value: formattedIconCount, label: 'searchable SVG icons' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'named libraries' },
  { value: NAMED_LIBRARY_COUNT.toString(), label: 'icon collections' },
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

const iconSamples: Array<{ name: string; library: string; Icon: LucideIcon }> = [
  { name: 'home', library: 'Lucide', Icon: House },
  { name: 'chart', library: 'Tabler', Icon: ChartColumn },
  { name: 'bell', library: 'Heroicons', Icon: Bell },
  { name: 'lock', library: 'Phosphor', Icon: Lock },
]

const visualSteps = [
  { label: 'Search', Icon: Search },
  { label: 'Filter', Icon: ListFilter },
  { label: 'Insert', Icon: MousePointer2 },
]

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

        <div className={styles.heroVisual} aria-label="IconSearch Figma plugin workflow preview">
          <div className={styles.visualTopbar}>
            <div className={styles.figmaMark} aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
            <strong>Cooperative Software</strong>
            <span className={styles.branchLabel}>main</span>
          </div>

          <div className={styles.visualStage}>
            <div className={styles.canvasFrame}>
              <div className={styles.canvasToolbar}>
                <span>Desktop 1200</span>
                <div>
                  <Layers size={14} />
                  <span>Icon layer</span>
                </div>
              </div>

              <div className={styles.artboard}>
                <div className={styles.artboardGrid} aria-hidden="true" />

                <div className={styles.insertedHome}>
                  <House size={78} strokeWidth={2.3} />
                  <span className={styles.selectionHandle} />
                  <span className={styles.selectionHandle} />
                  <span className={styles.selectionHandle} />
                  <span className={styles.selectionHandle} />
                </div>

                <div className={styles.iconCluster} aria-hidden="true">
                  <span><ChartColumn size={22} /></span>
                  <span><Sparkles size={22} /></span>
                  <span><CodeXml size={22} /></span>
                </div>

                <div className={styles.canvasCaption}>
                  <MousePointer2 size={16} />
                  <span>Inserted as clean SVG</span>
                </div>
              </div>
            </div>

            <div className={styles.pluginPanel}>
              <div className={styles.panelHeader}>
                <span className={styles.logoMark}>IS</span>
                <div>
                  <strong>IconSearch</strong>
                  <small>{formattedIconCount} icons ready</small>
                </div>
              </div>

              <div className={styles.searchInput}>
                <Search size={17} />
                <span>Search home, chart, lock...</span>
              </div>

              <div className={styles.filterGrid}>
                <span><ListFilter size={14} /> All libraries</span>
                <span><Palette size={14} /> All styles</span>
              </div>

              <div className={styles.iconGrid}>
                {iconSamples.map(({ name, library, Icon }) => (
                  <div className={styles.iconCard} key={name}>
                    <span><Icon size={24} /></span>
                    <strong>{name}</strong>
                    <small>{library}</small>
                  </div>
                ))}
              </div>

              <div className={styles.insertBar}>
                <span><Star size={14} /> Pin</span>
                <strong>Insert SVG</strong>
              </div>
            </div>

            <div className={styles.workflowRail} aria-label="IconSearch Figma workflow">
              {visualSteps.map(({ label, Icon }) => (
                <div key={label}>
                  <Icon size={16} />
                  <span>{label}</span>
                </div>
              ))}
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
