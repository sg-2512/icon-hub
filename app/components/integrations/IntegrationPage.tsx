import type { CSSProperties } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Blocks,
  BookOpen,
  Brush,
  Check,
  ChevronDown,
  Code2,
  Command,
  Gem,
  Grid2X2,
  Heart,
  House,
  Image,
  MousePointer2,
  PanelsTopLeft,
  PanelLeft,
  Presentation,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import { ICONIFY_COLLECTION_COUNT, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../../data/library-catalog'
import type { IntegrationConfig, IntegrationIcon } from './integration-catalog'
import styles from './integration-page.module.css'

const platformIcons: Record<IntegrationIcon, LucideIcon> = {
  layout: PanelsTopLeft,
  presentation: Presentation,
  command: Command,
  wind: Wind,
  radio: RadioTower,
  blocks: Blocks,
  book: BookOpen,
  image: Image,
  panel: PanelLeft,
  shop: ShoppingBag,
  brush: Brush,
  gem: Gem,
}

const sampleIcons = [
  { name: 'House', library: 'Lucide', Icon: House },
  { name: 'Search', library: 'Tabler', Icon: Search },
  { name: 'Bell', library: 'Phosphor', Icon: Bell },
  { name: 'Heart', library: 'Heroicons', Icon: Heart },
  { name: 'Settings', library: 'Lucide', Icon: Settings },
  { name: 'Sparkles', library: 'Iconoir', Icon: Sparkles },
]

const featureIcons = [Search, SlidersHorizontal, MousePointer2, ShieldCheck]

export default function IntegrationPage({ config }: { config: IntegrationConfig }) {
  const PlatformIcon = platformIcons[config.icon]
  const iconCount = SEARCHABLE_ICON_COUNT.toLocaleString('en-US')
  const pageStyle = {
    '--integration-accent': config.accent,
    '--integration-accent-muted': config.accentMuted,
  } as CSSProperties

  return (
    <main className={styles.page} style={pageStyle}>
      <section className={styles.hero}>
        <div className={styles.heroHeader}>
          <div className={styles.identity}>
            <span className={styles.platformMark} aria-hidden="true">
              <PlatformIcon size={24} />
            </span>
            <div>
              <span className={styles.eyebrow}>{config.eyebrow}</span>
              <strong>IconSearch for {config.platform}</strong>
            </div>
          </div>
          <span className={styles.status} data-tone={config.statusTone}>
            <span />
            {config.status}
          </span>
        </div>

        <div className={styles.heroCopy}>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#local-setup">
              View local setup
              <ArrowRight size={17} />
            </a>
            <Link className={styles.secondaryAction} href="/icon-search">
              Search icons
            </Link>
          </div>
          <div className={styles.capabilities} aria-label={`${config.name} highlights`}>
            {config.capabilities.map((capability) => (
              <span key={capability}><Check size={13} />{capability}</span>
            ))}
          </div>
        </div>

        <div className={styles.workspace} aria-label={`${config.name} interface preview`}>
          <div className={styles.workspaceBar}>
            <div className={styles.windowDots} aria-hidden="true"><span /><span /><span /></div>
            <strong>{config.previewContext}</strong>
            <span className={styles.apiState}><span /> Live catalog</span>
          </div>

          <div className={styles.workspaceBody}>
            <aside className={styles.previewRail} aria-label="Preview navigation">
              <span className={styles.brandMark}>{config.mark}</span>
              <button type="button" aria-label="Search view" className={styles.activeRailButton}><Search size={18} /></button>
              <button type="button" aria-label="Favorites view"><Heart size={18} /></button>
              <button type="button" aria-label="Settings view"><Settings size={18} /></button>
            </aside>

            <div className={styles.resultsPanel}>
              <div className={styles.searchRow}>
                <div><Search size={17} /><span>Search home, arrow, cart...</span></div>
                <button type="button"><SlidersHorizontal size={16} /> Filters</button>
              </div>
              <div className={styles.filterRow}>
                <span>All libraries <ChevronDown size={13} /></span>
                <span>All styles <ChevronDown size={13} /></span>
                <span><ShieldCheck size={13} /> Legal-safe</span>
              </div>
              <div className={styles.resultMeta}>
                <span>Popular results</span>
                <span>{iconCount} available</span>
              </div>
              <div className={styles.iconGrid}>
                {sampleIcons.map(({ name, library, Icon }, index) => (
                  <article className={index === 0 ? styles.selectedIconCard : styles.iconCard} key={name}>
                    <span><Icon size={30} strokeWidth={1.8} /></span>
                    <strong>{name}</strong>
                    <small>{library}</small>
                  </article>
                ))}
              </div>
            </div>

            <aside className={styles.inspector}>
              <div className={styles.inspectorHeading}>
                <div><span>SELECTED ICON</span><strong>House</strong></div>
                <Grid2X2 size={18} />
              </div>
              <div className={styles.largePreview}><House size={72} strokeWidth={1.7} /></div>

              {config.dragAndDrop || config.styleControls ? (
                <>
                  <div className={styles.controlLabel}><span>Size</span><strong>96 px</strong></div>
                  <div className={styles.slider}><span /></div>
                  <div className={styles.controlLabel}><span>Color</span><strong>#111827</strong></div>
                  <div className={styles.swatches} aria-label="Color preview">
                    <span data-color="dark" /><span data-color="blue" /><span data-color="red" /><span data-color="green" />
                  </div>
                </>
              ) : (
                <div className={styles.formatTabs} aria-label="Output format preview">
                  <span className={styles.activeFormat}>React</span><span>SVG</span><span>Tailwind</span>
                </div>
              )}

              <div className={styles.outputBlock}>
                <span>{config.outputLabel}</span>
                <code>{config.output}</code>
              </div>
              <button type="button" className={styles.previewAction}>{config.previewAction}</button>
              {config.dragAndDrop && <p className={styles.dragHint}><MousePointer2 size={14} /> Or drag the icon into your work</p>}
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.stats} aria-label={`${config.name} overview`}>
        <div><strong>{iconCount}</strong><span>searchable icons</span></div>
        <div><strong>{NAMED_LIBRARY_COUNT}</strong><span>named libraries</span></div>
        <div><strong>{ICONIFY_COLLECTION_COUNT}</strong><span>Iconify collections</span></div>
        <div><strong>{config.account}</strong><span>access model</span></div>
      </section>

      <section className={styles.featureSection}>
        <div className={styles.sectionHeading}>
          <span>{'// BUILT FOR THE WORKFLOW'}</span>
          <h2>A focused IconSearch experience for {config.platform}.</h2>
          <p>The interface keeps discovery, inspection, and the final handoff close together while using the same live catalog as the website.</p>
        </div>
        <div className={styles.featureGrid}>
          {config.features.map((feature, index) => {
            const FeatureIcon = featureIcons[index]
            return (
              <article key={feature.title}>
                <span className={styles.featureIcon}><FeatureIcon size={20} /></span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.setupSection} id="local-setup">
        <div className={styles.workflowColumn}>
          <span className={styles.sectionLabel}>{'// WORKFLOW'}</span>
          <h2>From local setup to a real icon.</h2>
          <div className={styles.workflowList}>
            {config.workflow.map((step, index) => (
              <div key={step}><strong>{String(index + 1).padStart(2, '0')}</strong><p>{step}</p></div>
            ))}
          </div>
        </div>

        <div className={styles.setupColumn}>
          <div className={styles.setupHeading}>
            <div><span>LOCAL DEVELOPMENT</span><strong>{config.platform}</strong></div>
            <Code2 size={22} />
          </div>
          <pre><code>{config.setup}</code></pre>
          <div className={styles.requirements}>
            <strong>Requirements</strong>
            {config.requirements.map((requirement) => <span key={requirement}><Check size={14} />{requirement}</span>)}
          </div>
        </div>
      </section>

      <section className={styles.releaseSection}>
        <div>
          <span>{'// RELEASE STATUS'}</span>
          <h2>{config.releaseTitle}</h2>
          <p>{config.releaseText}</p>
        </div>
        <span className={styles.releaseBadge}><PlatformIcon size={18} />{config.status}</span>
      </section>
    </main>
  )
}
