import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  CircleDashed,
  Feather,
  Layers3,
  Orbit,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { IconLibrary } from '../../lib/icons'
import {
  ICONIFY_COLLECTION_COUNT,
  NAMED_LIBRARY_COUNT,
  SEARCHABLE_ICON_COUNT,
} from '../../data/library-catalog'
import HomeSearch from './HomeSearch'
import styles from './home.module.css'

type RecentItem = {
  label: string
  href: string
  date: string
}

type HomeExperienceProps = {
  initialLibraries: IconLibrary[]
  recentItems: RecentItem[]
}

type ProductPath = {
  href: string
  icon: LucideIcon
  step: string
  title: string
  description: string
  action: string
}

const featuredSlugs = [
  'lucide-icons',
  'heroicons',
  'tabler-icons',
  'phosphor-icons',
  'iconoir',
  'bootstrap-icons',
]

const productPaths: ProductPath[] = [
  {
    href: '/icon-search',
    icon: Search,
    step: '01',
    title: 'Search the full index',
    description: 'Find a symbol by purpose, name, or interface pattern across every indexed source.',
    action: 'Search icons',
  },
  {
    href: '/best-for-you',
    icon: Sparkles,
    step: '02',
    title: 'Choose with context',
    description: 'Get a focused recommendation when your framework, visual style, or use case leads the decision.',
    action: 'Find a match',
  },
  {
    href: '/free-svg-icons',
    icon: Layers3,
    step: '03',
    title: 'Explore all libraries',
    description: 'Browse the complete catalog of open-source icon sets with live preview and customizer.',
    action: 'Browse catalog',
  },
]

const libraryMarks: Record<string, { Icon: LucideIcon; tone: string }> = {
  'lucide-icons': { Icon: Feather, tone: 'markLucide' },
  heroicons: { Icon: ShieldCheck, tone: 'markHeroicons' },
  'tabler-icons': { Icon: Table2, tone: 'markTabler' },
  'phosphor-icons': { Icon: CircleDashed, tone: 'markPhosphor' },
  iconoir: { Icon: Orbit, tone: 'markIconoir' },
  'bootstrap-icons': { Icon: Box, tone: 'markBootstrap' },
}

function formatNumber(value: number) {
  return value.toLocaleString('en-US')
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function LibraryMark({ library, compact = false }: { library: IconLibrary; compact?: boolean }) {
  const mark = libraryMarks[library.slug] ?? { Icon: Layers3, tone: 'markFallback' }
  const Icon = mark.Icon
  const markClass = compact ? styles.directoryMark : styles.libraryMark

  return (
    <span className={`${markClass} ${styles[mark.tone]}`} role="img" aria-label={`${library.name} mark`}>
      <Icon size={compact ? 17 : 19} strokeWidth={1.9} aria-hidden="true" />
    </span>
  )
}

export default function HomeExperience({ initialLibraries, recentItems }: HomeExperienceProps) {
  const librariesBySlug = new Map(initialLibraries.map((library) => [library.slug, library]))
  const featuredLibraries = featuredSlugs
    .map((slug) => librariesBySlug.get(slug))
    .filter((library): library is IconLibrary => Boolean(library))
  const directoryPreview = featuredLibraries.slice(0, 3)

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.kicker}>IconSearch / open-source icon directory</p>
          <h1 className={styles.heroTitle}>Find your icon system.</h1>
          <p className={styles.heroLead}>
            Search a single index of free SVG icons, then review the libraries behind them before you commit to a visual language.
          </p>

          <HomeSearch />

          <div className={styles.heroActions}>
            <Link href="/free-svg-icons" className={styles.primaryAction}>
              Browse libraries <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.trustRow} aria-label="IconSearch benefits">
            <span><Check size={15} aria-hidden="true" /> Open-source libraries</span>
            <span><Check size={15} aria-hidden="true" /> Commercial-friendly licenses</span>
            <span><Check size={15} aria-hidden="true" /> SVG and framework exports</span>
          </div>
        </div>

        <aside className={styles.directoryPanel} aria-labelledby="directory-preview-heading">
          <div className={styles.directoryHeader}>
            <div>
              <p className={styles.panelLabel}>START HERE</p>
              <h2 id="directory-preview-heading">Popular libraries</h2>
            </div>
            <Layers3 size={19} aria-hidden="true" />
          </div>

          <div className={styles.directoryList}>
            {directoryPreview.map((library) => (
              <Link key={library.slug} href={`/icons/${library.slug}`} className={styles.directoryItem}>
                <LibraryMark library={library} compact />
                <span className={styles.directoryInfo}>
                  <strong>{library.name}</strong>
                  <span>{formatNumber(library.iconCount)} icons · {library.style.slice(0, 2).join(' / ')}</span>
                </span>
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className={styles.directoryFooter}>
            <span>{NAMED_LIBRARY_COUNT} libraries · {ICONIFY_COLLECTION_COUNT} collections</span>
            <Link href="/free-svg-icons">View directory <ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
        </aside>
      </section>

      <section className={styles.statsRow} aria-label="IconSearch at a glance">
        <div>
          <strong>{formatNumber(SEARCHABLE_ICON_COUNT)}</strong>
          <span>searchable SVG icons</span>
        </div>
        <div>
          <strong>{NAMED_LIBRARY_COUNT}</strong>
          <span>named libraries reviewed</span>
        </div>
        <div>
          <strong>{ICONIFY_COLLECTION_COUNT}</strong>
          <span>Open-source collections indexed</span>
        </div>
        <div>
          <strong>MIT / ISC</strong>
          <span>common licenses at a glance</span>
        </div>
      </section>

      <section className={styles.librarySection} aria-labelledby="featured-libraries">
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.kicker}>A PRACTICAL SHORTLIST</p>
            <h2 id="featured-libraries">Start with a library that matches your interface.</h2>
          </div>
          <div className={styles.sectionSide}>
            <p>Review the essential signals before a package becomes part of your product: style, scale, framework support, and license.</p>
            <Link href="/free-svg-icons">All libraries <ArrowRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>

        <div className={styles.libraryGrid}>
          {featuredLibraries.map((library) => (
            <Link key={library.slug} href={`/icons/${library.slug}`} className={styles.libraryCard}>
              <div className={styles.libraryTop}>
                <LibraryMark library={library} />
                <span className={styles.license}>{library.license}</span>
              </div>
              <h3>{library.name}</h3>
              <p>{library.description}</p>
              <div className={styles.libraryMeta}>
                <span>{formatNumber(library.iconCount)} icons</span>
                <span>{library.frameworks.slice(0, 2).join(' / ')}</span>
              </div>
              <ArrowUpRight className={styles.cardArrow} size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.pathSection} aria-labelledby="path-heading">
        <div className={styles.pathHeader}>
          <p className={styles.kicker}>A CLEARER DECISION PATH</p>
          <h2 id="path-heading">Do the next useful thing.</h2>
          <p>Whether you know the icon you need or the library you want, start from the question in front of you.</p>
        </div>

        <div className={styles.pathGrid}>
          {productPaths.map((path) => {
            const Icon = path.icon

            return (
              <Link key={path.href} href={path.href} className={styles.pathCard}>
                <span className={styles.pathStep}>{path.step}</span>
                <Icon className={styles.pathIcon} size={21} aria-hidden="true" />
                <h3>{path.title}</h3>
                <p>{path.description}</p>
                <span className={styles.pathLink}>{path.action} <ArrowRight size={15} aria-hidden="true" /></span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className={styles.resourcesSection} aria-label="Recent resources">

        <article className={styles.resourcePanel}>
          <p className={styles.kicker}>FROM THE GUIDE</p>
          <h2>Current thinking for icon systems.</h2>
          <div className={styles.articleList}>
            {recentItems.slice(0, 3).map((item) => (
              <Link key={item.href} href={item.href}>
                <span>{formatDate(item.date)}</span>
                <strong>{item.label}</strong>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
          <Link href="/directory" className={styles.resourceFooter}>Browse all guides & resources <ArrowRight size={15} aria-hidden="true" /></Link>
        </article>
      </section>

      <section className={styles.finalCta}>
        <div>
          <p className={styles.kicker}>READY TO BUILD</p>
          <h2>Choose an icon system with fewer assumptions.</h2>
        </div>
        <Link href="/icon-search" className={styles.primaryAction}>
          Search the icon index <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  )
}
