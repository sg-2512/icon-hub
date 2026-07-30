'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bookmark,
  Box,
  CalendarDays,
  Camera,
  ChartNoAxesColumnIncreasing,
  Check,
  CirclePlus,
  Compass,
  Copy,
  CreditCard,
  Eye,
  Folder,
  Globe2,
  Heart,
  Home,
  Layers3,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  MousePointer2,
  Package,
  Palette,
  Rocket,
  Search,
  Send,
  Settings2,
  ShoppingBag,
  Sparkles,
  Star,
  User,
  Users,
  WandSparkles,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import styles from './framer-template.module.css'

type Category = 'All' | 'Essentials' | 'Commerce' | 'Social' | 'Objects'

type IconItem = {
  name: string
  category: Exclude<Category, 'All'>
  icon: LucideIcon
}

const iconItems: IconItem[] = [
  { name: 'Home', category: 'Essentials', icon: Home },
  { name: 'Search', category: 'Essentials', icon: Search },
  { name: 'Menu', category: 'Essentials', icon: Menu },
  { name: 'Settings', category: 'Essentials', icon: Settings2 },
  { name: 'Calendar', category: 'Essentials', icon: CalendarDays },
  { name: 'Bookmark', category: 'Essentials', icon: Bookmark },
  { name: 'Eye', category: 'Essentials', icon: Eye },
  { name: 'Lock', category: 'Essentials', icon: LockKeyhole },
  { name: 'Cart', category: 'Commerce', icon: ShoppingBag },
  { name: 'Card', category: 'Commerce', icon: CreditCard },
  { name: 'Package', category: 'Commerce', icon: Package },
  { name: 'Chart', category: 'Commerce', icon: ChartNoAxesColumnIncreasing },
  { name: 'User', category: 'Social', icon: User },
  { name: 'Users', category: 'Social', icon: Users },
  { name: 'Message', category: 'Social', icon: MessageCircle },
  { name: 'Send', category: 'Social', icon: Send },
  { name: 'Heart', category: 'Social', icon: Heart },
  { name: 'Mail', category: 'Social', icon: Mail },
  { name: 'Camera', category: 'Objects', icon: Camera },
  { name: 'Folder', category: 'Objects', icon: Folder },
  { name: 'Globe', category: 'Objects', icon: Globe2 },
  { name: 'Compass', category: 'Objects', icon: Compass },
  { name: 'Map pin', category: 'Objects', icon: MapPin },
  { name: 'Bell', category: 'Objects', icon: Bell },
]

const categories: Category[] = [
  'All',
  'Essentials',
  'Commerce',
  'Social',
  'Objects',
]

const accents = ['#8c5cff', '#ff5c35', '#17b890', '#2f6bff', '#efc84a']

const orbitIcons = [
  Sparkles,
  MousePointer2,
  Heart,
  Rocket,
  Star,
  Zap,
  Box,
  WandSparkles,
]

const projectCards = [
  {
    number: '01',
    title: 'Orbit',
    description: 'A friendly system for curious products.',
    icon: Compass,
    tone: 'violet',
    count: '128 icons',
  },
  {
    number: '02',
    title: 'Parcel',
    description: 'Useful symbols made for busy storefronts.',
    icon: Package,
    tone: 'coral',
    count: '96 icons',
  },
  {
    number: '03',
    title: 'Signals',
    description: 'Clear, compact marks for modern dashboards.',
    icon: ChartNoAxesColumnIncreasing,
    tone: 'mint',
    count: '164 icons',
  },
]

export default function FramerTemplateClient({
  iconCount,
}: {
  iconCount: string
}) {
  const [category, setCategory] = useState<Category>('All')
  const [query, setQuery] = useState('')
  const [selectedName, setSelectedName] = useState('Compass')
  const [size, setSize] = useState(72)
  const [stroke, setStroke] = useState(1.75)
  const [accent, setAccent] = useState(accents[0])
  const [copied, setCopied] = useState(false)

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return iconItems.filter((item) => {
      const categoryMatches = category === 'All' || item.category === category
      const queryMatches =
        !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery)
      return categoryMatches && queryMatches
    })
  }, [category, query])

  const selected =
    iconItems.find((item) => item.name === selectedName) ?? iconItems[0]
  const SelectedIcon = selected.icon

  const copyIcon = async () => {
    const componentName = selected.name.replace(/\s/g, '')
    const snippet = `<${componentName} size={${size}} strokeWidth={${stroke}} color="${accent}" />`

    try {
      await navigator.clipboard.writeText(snippet)
    } catch {
      // The visual feedback still makes the interaction useful in restricted previews.
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const surpriseMe = () => {
    const next = iconItems[Math.floor(Math.random() * iconItems.length)]
    setSelectedName(next.name)
    setAccent(accents[Math.floor(Math.random() * accents.length)])
  }

  return (
    <main
      className={styles.page}
      style={{ '--template-accent': accent } as CSSProperties}
    >
      <nav className={styles.nav} aria-label="Main navigation">
        <a className={styles.wordmark} href="#top" aria-label="Icon Folio home">
          <span className={styles.wordmarkMark}>
            <Sparkles size={18} strokeWidth={2.4} />
          </span>
          <span>ICON/FOLIO</span>
        </a>

        <div className={styles.navLinks}>
          <a href="#work">Work</a>
          <a href="#lab">Icon lab</a>
          <a href="#about">About</a>
        </div>

        <a className={styles.navCta} href="https://iconsearch.info/icon-search">
          Free icons
          <ArrowUpRight size={16} />
        </a>
      </nav>

      <section className={styles.hero} id="top">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}>
            <span />
            Free Framer template · 2026
          </div>
          <h1>
            Tiny shapes.
            <br />
            <em>Big ideas.</em>
          </h1>
          <p>
            A playful portfolio for icon makers, visual designers, and people
            who believe the smallest details do the loudest work.
          </p>

          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#work">
              Explore the work
              <ArrowDown size={18} />
            </a>
            <button className={styles.textButton} onClick={surpriseMe}>
              Surprise me
              <Sparkles size={17} />
            </button>
          </div>

          <div className={styles.heroMeta}>
            <div>
              <strong>03</strong>
              <span>Featured systems</span>
            </div>
            <div>
              <strong>388</strong>
              <span>Original symbols</span>
            </div>
            <div>
              <strong>∞</strong>
              <span>Tiny possibilities</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual} aria-label="Animated icon composition">
          <div className={styles.heroStamp}>OPEN TO COLLABORATE</div>
          <div className={styles.heroVisualInner}>
            <div className={styles.bigGlyph}>
              <SelectedIcon size={126} strokeWidth={1.15} />
            </div>
            {orbitIcons.map((Icon, index) => (
              <button
                type="button"
                className={`${styles.orbitIcon} ${styles[`orbit${index + 1}`]}`}
                key={index}
                onClick={surpriseMe}
                aria-label="Show another icon"
              >
                <Icon size={index % 3 === 0 ? 30 : 24} strokeWidth={1.8} />
              </button>
            ))}
            <span className={styles.orbitLineOne} />
            <span className={styles.orbitLineTwo} />
          </div>
          <div className={styles.visualCaption}>
            <span>Selected</span>
            <strong>{selected.name}</strong>
            <span>{size}px / {stroke} stroke</span>
          </div>
        </div>
      </section>

      <section className={styles.marquee} aria-label="Template highlights">
        <div>
          <span>ICON SYSTEMS</span>
          <Star size={16} fill="currentColor" />
          <span>BRAND DETAILS</span>
          <Star size={16} fill="currentColor" />
          <span>PIXEL PERFECT</span>
          <Star size={16} fill="currentColor" />
          <span>ICON SYSTEMS</span>
          <Star size={16} fill="currentColor" />
          <span>BRAND DETAILS</span>
          <Star size={16} fill="currentColor" />
          <span>PIXEL PERFECT</span>
          <Star size={16} fill="currentColor" />
        </div>
      </section>

      <section className={styles.workSection} id="work">
        <div className={styles.sectionIntro}>
          <span className={styles.sectionNumber}>01 / SELECTED WORK</span>
          <div>
            <h2>Systems with a point of view.</h2>
            <p>
              Three collections, three personalities, one obsession with
              rhythm, clarity, and the perfect corner.
            </p>
          </div>
        </div>

        <div className={styles.projects}>
          {projectCards.map((project) => {
            const ProjectIcon = project.icon
            return (
              <article
                className={`${styles.projectCard} ${styles[project.tone]}`}
                key={project.title}
              >
                <div className={styles.cardTopline}>
                  <span>{project.number}</span>
                  <span>{project.count}</span>
                </div>
                <div className={styles.cardGlyph}>
                  <ProjectIcon size={88} strokeWidth={1.25} />
                  <CirclePlus size={30} strokeWidth={1.4} />
                </div>
                <div className={styles.cardCopy}>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <button type="button" aria-label={`Open ${project.title} project`}>
                    <ArrowUpRight size={24} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className={styles.labSection} id="lab">
        <div className={styles.labHeading}>
          <div>
            <span className={styles.sectionNumber}>02 / ICON LAB</span>
            <h2>Make it feel like yours.</h2>
          </div>
          <p>
            Search, filter, recolor, and tune the live preview. A small taste of
            what a useful icon system can do.
          </p>
        </div>

        <div className={styles.labShell}>
          <div className={styles.libraryPanel}>
            <div className={styles.searchBox}>
              <Search size={19} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search this mini set..."
                aria-label="Search icons"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear icon search"
                >
                  <X size={17} />
                </button>
              )}
              <kbd>⌘ K</kbd>
            </div>

            <div className={styles.categoryRow} aria-label="Icon categories">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={category === item ? styles.categoryActive : ''}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className={styles.iconGrid}>
              {filteredIcons.map((item) => {
                const Icon = item.icon
                const isSelected = selected.name === item.name
                return (
                  <button
                    type="button"
                    key={item.name}
                    className={isSelected ? styles.iconSelected : ''}
                    onClick={() => setSelectedName(item.name)}
                    title={item.name}
                    aria-label={`Preview ${item.name} icon`}
                    aria-pressed={isSelected}
                  >
                    <Icon size={26} strokeWidth={1.7} />
                    <span>{item.name}</span>
                  </button>
                )
              })}
            </div>

            {filteredIcons.length === 0 && (
              <div className={styles.emptyState}>
                <Search size={30} />
                <strong>No tiny shapes found.</strong>
                <span>Try another search or category.</span>
              </div>
            )}
          </div>

          <aside className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <span>LIVE PREVIEW</span>
              <button type="button" onClick={surpriseMe}>
                Randomize
                <Sparkles size={15} />
              </button>
            </div>

            <div className={styles.previewStage}>
              <div className={styles.previewGrid} />
              <SelectedIcon
                size={size}
                strokeWidth={stroke}
                color={accent}
                aria-label={`${selected.name} preview`}
              />
              <span className={styles.sizeLabel}>{size} × {size}</span>
            </div>

            <div className={styles.controls}>
              <label>
                <span>
                  Size <strong>{size}px</strong>
                </span>
                <input
                  type="range"
                  min="40"
                  max="124"
                  value={size}
                  onChange={(event) => setSize(Number(event.target.value))}
                />
              </label>

              <label>
                <span>
                  Stroke <strong>{stroke}</strong>
                </span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.25"
                  value={stroke}
                  onChange={(event) => setStroke(Number(event.target.value))}
                />
              </label>

              <div className={styles.colorControl}>
                <span>Color</span>
                <div>
                  {accents.map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => setAccent(color)}
                      className={accent === color ? styles.swatchActive : ''}
                      style={{ background: color }}
                      aria-label={`Use ${color}`}
                      aria-pressed={accent === color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button className={styles.copyButton} type="button" onClick={copyIcon}>
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'Copied to clipboard' : 'Copy component'}
            </button>
          </aside>
        </div>
      </section>

      <section className={styles.aboutSection} id="about">
        <div className={styles.aboutIcon}>
          <Palette size={54} strokeWidth={1.25} />
        </div>
        <blockquote>
          “An icon is a tiny promise: <em>you already know what happens next.</em>”
        </blockquote>
        <div className={styles.aboutCopy}>
          <span className={styles.sectionNumber}>03 / ABOUT THE STUDIO</span>
          <p>
            We make symbols for products with something to say. Every set starts
            on paper, gets tested at 16 pixels, and earns its place one curve at
            a time.
          </p>
          <a href="mailto:hello@example.com">
            Start a project
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section className={styles.freeBanner} id="get-template">
        <div className={styles.freeBannerBadge}>
          <Layers3 size={26} />
          <span>FREE TO REMIX</span>
        </div>
        <div>
          <p>A free Framer template from IconSearch</p>
          <h2>Build something iconic.</h2>
        </div>
        <a href="https://iconsearch.info/icon-search">
          Browse {iconCount} icons
          <ArrowUpRight size={20} />
        </a>
      </section>

      <footer className={styles.footer}>
        <a className={styles.wordmark} href="#top">
          <span className={styles.wordmarkMark}>
            <Sparkles size={18} />
          </span>
          <span>ICON/FOLIO</span>
        </a>
        <p>Designed to be remixed. Shared with care.</p>
        <div>
          <a href="#work">Work</a>
          <a href="#lab">Lab</a>
          <a href="https://iconsearch.info">IconSearch</a>
        </div>
      </footer>
    </main>
  )
}
