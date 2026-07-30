import type { CSSProperties } from 'react'
import NextImage from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Blocks,
  BookOpen,
  Brush,
  Check,
  ChevronDown,
  Code2,
  Command,
  FileText,
  Gem,
  Grid2X2,
  Heart,
  House,
  Image,
  MousePointer2,
  Palette,
  PanelsTopLeft,
  PanelLeft,
  PenTool,
  Presentation,
  RadioTower,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { ICONIFY_COLLECTION_COUNT, NAMED_LIBRARY_COUNT, SEARCHABLE_ICON_COUNT } from '../../../data/library-catalog'
import type { IntegrationConfig, IntegrationIcon, IntegrationSlug } from './integration-catalog'
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

type PreviewScene = 'design' | 'slides' | 'command' | 'code' | 'agent' | 'components' | 'creative' | 'content' | 'commerce'

type PreviewProfile = {
  logoSrc: string
  scene: PreviewScene
  query: string
  selectedName: string
  selectedLibrary: string
  SelectedIcon: LucideIcon
  sceneLabel: string
  sceneTitle: string
  sceneDetail: string
  cards: Array<{ name: string; library: string; Icon: LucideIcon }>
}

const previewProfiles: Record<IntegrationSlug, PreviewProfile> = {
  'penpot-plugin': {
    logoSrc: '/integration-logos/penpot.svg',
    scene: 'design',
    query: 'cursor, frame, component',
    selectedName: 'Cursor Pen',
    selectedLibrary: 'Lucide',
    SelectedIcon: PenTool,
    sceneLabel: 'Penpot canvas',
    sceneTitle: 'Editable vector group',
    sceneDetail: 'Centered, selected, and ready to edit',
    cards: [
      { name: 'Cursor Pen', library: 'Lucide', Icon: PenTool },
      { name: 'Pointer', library: 'Tabler', Icon: MousePointer2 },
      { name: 'Layout', library: 'Phosphor', Icon: PanelsTopLeft },
      { name: 'Grid', library: 'Iconoir', Icon: Grid2X2 },
    ],
  },
  'webflow-extension': {
    logoSrc: '/integration-logos/webflow.svg',
    scene: 'design',
    query: 'layout, hero, navigation',
    selectedName: 'Layout',
    selectedLibrary: 'Untitled UI',
    SelectedIcon: PanelsTopLeft,
    sceneLabel: 'Webflow Designer',
    sceneTitle: 'Hero navigation asset',
    sceneDetail: 'Inserted inside the selected container',
    cards: [
      { name: 'Layout', library: 'Untitled UI', Icon: PanelsTopLeft },
      { name: 'Home', library: 'Lucide', Icon: House },
      { name: 'Image', library: 'Tabler', Icon: Image },
      { name: 'Menu', library: 'Phosphor', Icon: Grid2X2 },
    ],
  },
  'sketch-plugin': {
    logoSrc: '/integration-logos/sketch.svg',
    scene: 'design',
    query: 'diamond, layers, symbol',
    selectedName: 'Diamond',
    selectedLibrary: 'Lucide',
    SelectedIcon: Gem,
    sceneLabel: 'Sketch document',
    sceneTitle: 'Editable symbol layer',
    sceneDetail: 'Placed beside the active selection',
    cards: [
      { name: 'Diamond', library: 'Lucide', Icon: Gem },
      { name: 'Layers', library: 'Iconoir', Icon: Blocks },
      { name: 'Pointer', library: 'Tabler', Icon: MousePointer2 },
      { name: 'Sparkle', library: 'Phosphor', Icon: Sparkles },
    ],
  },
  'powerpoint-addin': {
    logoSrc: '/integration-logos/powerpoint.svg',
    scene: 'slides',
    query: 'presentation, chart, growth',
    selectedName: 'Presentation',
    selectedLibrary: 'Lucide',
    SelectedIcon: Presentation,
    sceneLabel: 'PowerPoint slide',
    sceneTitle: 'Quarterly growth',
    sceneDetail: 'Presentation-ready SVG at 72 pt',
    cards: [
      { name: 'Presentation', library: 'Lucide', Icon: Presentation },
      { name: 'Growth', library: 'Tabler', Icon: Zap },
      { name: 'Image', library: 'Heroicons', Icon: Image },
      { name: 'Highlight', library: 'Iconoir', Icon: Sparkles },
    ],
  },
  'google-slides-addon': {
    logoSrc: '/integration-logos/google-slides.svg',
    scene: 'slides',
    query: 'launch, image, roadmap',
    selectedName: 'Launch',
    selectedLibrary: 'Phosphor',
    SelectedIcon: Zap,
    sceneLabel: 'Google Slides',
    sceneTitle: 'Product launch',
    sceneDetail: 'Transparent PNG placed on the slide',
    cards: [
      { name: 'Launch', library: 'Phosphor', Icon: Zap },
      { name: 'Slide', library: 'Lucide', Icon: Presentation },
      { name: 'Picture', library: 'Tabler', Icon: Image },
      { name: 'Idea', library: 'Iconoir', Icon: Sparkles },
    ],
  },
  'raycast-extension': {
    logoSrc: '/integration-logos/raycast.svg',
    scene: 'command',
    query: 'quick action, lightning',
    selectedName: 'Quick Action',
    selectedLibrary: 'Lucide',
    SelectedIcon: Command,
    sceneLabel: 'Raycast command',
    sceneTitle: 'Copy icon as React',
    sceneDetail: '⌘ ↵  Run selected action',
    cards: [
      { name: 'Quick Action', library: 'Lucide', Icon: Command },
      { name: 'Lightning', library: 'Phosphor', Icon: Zap },
      { name: 'Search', library: 'Tabler', Icon: Search },
      { name: 'Favorite', library: 'Heroicons', Icon: Heart },
    ],
  },
  'tailwind-plugin': {
    logoSrc: '/integration-logos/tailwind.svg',
    scene: 'code',
    query: 'wind, utility, classes',
    selectedName: 'Tailwind',
    selectedLibrary: 'Simple Icons',
    SelectedIcon: Wind,
    sceneLabel: 'Tailwind component',
    sceneTitle: 'Utility-first icon',
    sceneDetail: 'Styled with size and color classes',
    cards: [
      { name: 'Tailwind', library: 'Simple Icons', Icon: Wind },
      { name: 'Code', library: 'Lucide', Icon: Code2 },
      { name: 'Palette', library: 'Tabler', Icon: Palette },
      { name: 'Settings', library: 'Iconoir', Icon: Settings },
    ],
  },
  'mcp-server': {
    logoSrc: '/integration-logos/mcp.svg',
    scene: 'agent',
    query: 'tool, agent, protocol',
    selectedName: 'Tool Call',
    selectedLibrary: 'Lucide',
    SelectedIcon: RadioTower,
    sceneLabel: 'MCP tool result',
    sceneTitle: 'iconsearch_search',
    sceneDetail: 'Structured response returned to the agent',
    cards: [
      { name: 'Tool Call', library: 'Lucide', Icon: RadioTower },
      { name: 'Command', library: 'Tabler', Icon: Command },
      { name: 'Code', library: 'Phosphor', Icon: Code2 },
      { name: 'Secure', library: 'Heroicons', Icon: ShieldCheck },
    ],
  },
  'jetbrains-plugin': {
    logoSrc: '/integration-logos/jetbrains.svg',
    scene: 'code',
    query: 'code, class, component',
    selectedName: 'Code',
    selectedLibrary: 'Lucide',
    SelectedIcon: Code2,
    sceneLabel: 'JetBrains editor',
    sceneTitle: 'React component',
    sceneDetail: 'Inserted at the active caret',
    cards: [
      { name: 'Code', library: 'Lucide', Icon: Code2 },
      { name: 'Run', library: 'Phosphor', Icon: Zap },
      { name: 'Search', library: 'Tabler', Icon: Search },
      { name: 'Module', library: 'Iconoir', Icon: Blocks },
    ],
  },
  'storybook-addon': {
    logoSrc: '/integration-logos/storybook.svg',
    scene: 'components',
    query: 'component, controls, story',
    selectedName: 'Component',
    selectedLibrary: 'Lucide',
    SelectedIcon: Blocks,
    sceneLabel: 'Storybook canvas',
    sceneTitle: 'IconButton / Primary',
    sceneDetail: 'Previewed with live controls',
    cards: [
      { name: 'Component', library: 'Lucide', Icon: Blocks },
      { name: 'Controls', library: 'Tabler', Icon: SlidersHorizontal },
      { name: 'Pointer', library: 'Heroicons', Icon: MousePointer2 },
      { name: 'Favorite', library: 'Phosphor', Icon: Heart },
    ],
  },
  'canva-app': {
    logoSrc: '/integration-logos/canva.svg',
    scene: 'creative',
    query: 'sparkle, social, sticker',
    selectedName: 'Sparkle',
    selectedLibrary: 'Iconoir',
    SelectedIcon: Sparkles,
    sceneLabel: 'Canva design',
    sceneTitle: 'Summer campaign',
    sceneDetail: 'Brand-colored graphic element',
    cards: [
      { name: 'Sparkle', library: 'Iconoir', Icon: Sparkles },
      { name: 'Palette', library: 'Lucide', Icon: Palette },
      { name: 'Heart', library: 'Heroicons', Icon: Heart },
      { name: 'Image', library: 'Tabler', Icon: Image },
    ],
  },
  'wordpress-plugin': {
    logoSrc: '/integration-logos/wordpress.svg',
    scene: 'content',
    query: 'article, heading, callout',
    selectedName: 'Article',
    selectedLibrary: 'Lucide',
    SelectedIcon: FileText,
    sceneLabel: 'WordPress editor',
    sceneTitle: 'Feature callout block',
    sceneDetail: 'Added to the current post',
    cards: [
      { name: 'Article', library: 'Lucide', Icon: FileText },
      { name: 'Heading', library: 'Tabler', Icon: BookOpen },
      { name: 'Image', library: 'Heroicons', Icon: Image },
      { name: 'Layout', library: 'Iconoir', Icon: PanelsTopLeft },
    ],
  },
  'shopify-extension': {
    logoSrc: '/integration-logos/shopify.svg',
    scene: 'commerce',
    query: 'product, cart, delivery',
    selectedName: 'Shopping Bag',
    selectedLibrary: 'Lucide',
    SelectedIcon: ShoppingBag,
    sceneLabel: 'Shopify theme',
    sceneTitle: 'Product benefit card',
    sceneDetail: 'Reusable storefront icon block',
    cards: [
      { name: 'Shopping Bag', library: 'Lucide', Icon: ShoppingBag },
      { name: 'Favorite', library: 'Heroicons', Icon: Heart },
      { name: 'Fast', library: 'Phosphor', Icon: Zap },
      { name: 'Secure', library: 'Tabler', Icon: ShieldCheck },
    ],
  },
  'adobe-plugin': {
    logoSrc: '/integration-logos/adobe.svg',
    scene: 'creative',
    query: 'brush, vector, creative',
    selectedName: 'Brush',
    selectedLibrary: 'Lucide',
    SelectedIcon: Brush,
    sceneLabel: 'Adobe Express',
    sceneTitle: 'Campaign artboard',
    sceneDetail: 'Editable vector with brand color',
    cards: [
      { name: 'Brush', library: 'Lucide', Icon: Brush },
      { name: 'Pen Tool', library: 'Tabler', Icon: PenTool },
      { name: 'Sparkle', library: 'Phosphor', Icon: Sparkles },
      { name: 'Palette', library: 'Iconoir', Icon: Palette },
    ],
  },
  'obsidian-plugin': {
    logoSrc: '/integration-logos/obsidian.svg',
    scene: 'content',
    query: 'note, link, knowledge',
    selectedName: 'Knowledge Note',
    selectedLibrary: 'Lucide',
    SelectedIcon: BookOpen,
    sceneLabel: 'Obsidian note',
    sceneTitle: 'Design system index',
    sceneDetail: 'Embedded beside linked knowledge',
    cards: [
      { name: 'Knowledge Note', library: 'Lucide', Icon: BookOpen },
      { name: 'File', library: 'Tabler', Icon: FileText },
      { name: 'Link', library: 'Phosphor', Icon: Command },
      { name: 'Favorite', library: 'Heroicons', Icon: Heart },
    ],
  },
}

const featureIcons = [Search, SlidersHorizontal, MousePointer2, ShieldCheck]

export default function IntegrationPage({ config }: { config: IntegrationConfig }) {
  const PlatformIcon = platformIcons[config.icon]
  const preview = previewProfiles[config.slug]
  const SelectedIcon = preview.SelectedIcon
  const logoSrc = config.logoSrc ?? preview.logoSrc
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
              {logoSrc ? <NextImage className={styles.platformLogo} src={logoSrc} alt="" width={24} height={24} unoptimized /> : <PlatformIcon size={24} />}
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
              <span className={styles.brandMark}>
                {logoSrc ? <NextImage className={styles.previewLogo} src={logoSrc} alt="" width={20} height={20} unoptimized /> : config.mark}
              </span>
              <button type="button" aria-label="Search view" className={styles.activeRailButton}><Search size={18} /></button>
              <button type="button" aria-label="Favorites view"><Heart size={18} /></button>
              <button type="button" aria-label="Settings view"><Settings size={18} /></button>
            </aside>

            <div className={styles.resultsPanel}>
              <div className={styles.searchRow}>
                <div><Search size={17} /><span>{preview.query}</span></div>
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
                {preview.cards.map(({ name, library, Icon }, index) => (
                  <article className={index === 0 ? styles.selectedIconCard : styles.iconCard} key={name}>
                    <span><Icon size={27} strokeWidth={1.8} /></span>
                    <strong>{name}</strong>
                    <small>{library}</small>
                  </article>
                ))}
              </div>
              <div className={styles.hostPreview} data-scene={preview.scene}>
                <div className={styles.hostPreviewHeader}>
                  <span>{preview.sceneLabel}</span>
                  <strong>{config.platform}</strong>
                </div>
                <div className={styles.hostSurface}>
                  <span className={styles.sceneChrome} aria-hidden="true"><i /><i /><i /></span>
                  <span className={styles.sceneArtwork}>
                    <SelectedIcon size={46} strokeWidth={1.7} />
                  </span>
                  <span className={styles.sceneCopy}>
                    <strong>{preview.sceneTitle}</strong>
                    <small>{preview.sceneDetail}</small>
                  </span>
                  <code className={styles.sceneCode}>{config.output}</code>
                </div>
              </div>
            </div>

            <aside className={styles.inspector}>
              <div className={styles.inspectorHeading}>
                <div><span>SELECTED ICON · {preview.selectedLibrary}</span><strong>{preview.selectedName}</strong></div>
                <Grid2X2 size={18} />
              </div>
              <div className={styles.largePreview}><SelectedIcon size={72} strokeWidth={1.7} /></div>

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
        <div><strong>{ICONIFY_COLLECTION_COUNT}</strong><span>icon collections</span></div>
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
        <span className={styles.releaseBadge}>
          {logoSrc ? <NextImage className={styles.releaseLogo} src={logoSrc} alt="" width={16} height={16} unoptimized /> : <PlatformIcon size={18} />}
          {config.status}
        </span>
      </section>
    </main>
  )
}
