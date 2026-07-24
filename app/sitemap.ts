import { MetadataRoute } from 'next'
import { readFileSync } from 'fs'
import { join } from 'path'
import { icons } from '../lib/icons'
import { categories } from '../data/categories'
import { useCases } from '../data/usecases'

type SearchIndexIcon = {
  library?: string
  name?: string
}

function getIndexedIconKeys() {
  try {
    const indexPath = join(process.cwd(), 'data', 'icon-search.json')
    const indexedIcons = JSON.parse(readFileSync(indexPath, 'utf8')) as SearchIndexIcon[]
    return new Set(
      indexedIcons
        .filter((icon) => icon.library && icon.name)
        .map((icon) => `${icon.library}:${icon.name}`),
    )
  } catch (error) {
    console.error('Could not validate individual icon sitemap URLs:', error)
    return new Set<string>()
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://iconsearch.info'
  const now = new Date()

  // ─── Static pages ─────────────────────────────────────────────────────────
  // Defined directly (no .map) so TypeScript preserves the literal types
  // of changeFrequency instead of widening them to string.
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                       lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/free-svg-icons`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/react-icons`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/nextjs-icons`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/vue-icons`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/svelte-icons`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/tailwind-icons`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/typescript-icons`, lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/icon-search`,      lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/best-for-you`,     lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/licenses`,         lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/stats`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/directory`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/figma-plugin`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/vscode-extension`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/chrome-extension`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/framer-plugin`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`,            lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`,          lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy-policy`,   lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${base}/terms`,            lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // ─── Library pages ────────────────────────────────────────────────────────
  const libraryPages: MetadataRoute.Sitemap = icons.map(icon => ({
    url: `${base}/icons/${icon.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))



  // ─── Category pages ───────────────────────────────────────────────────────
  const categoryPages: MetadataRoute.Sitemap = [
    { url: `${base}/icons/category`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    ...categories.map(cat => ({
      url: `${base}/icons/category/${cat.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ]

  // ─── Use case pages ───────────────────────────────────────────────────────
  const useCasePages: MetadataRoute.Sitemap = [
    { url: `${base}/use-cases`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 },
    ...useCases.map(uc => ({
      url: `${base}/use-cases/${uc.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
  ]

  // ─── Collection pages (pSEO) ──────────────────────────────────────────────
  const POPULAR_TAGS = [
    'arrow', 'settings', 'user', 'bell', 'heart', 'cloud', 'security', 'commerce', 'edit', 'media',
    'alert', 'weather', 'device', 'design', 'communication', 'building', 'health', 'finance', 'search', 'home',
    'star', 'trash', 'lock', 'key', 'eye', 'check', 'plus', 'minus', 'download', 'upload',
    'share', 'mail', 'message', 'chat', 'phone', 'call', 'send', 'inbox', 'envelope', 'folder',
    'cpu', 'bot', 'chip', 'robot', 'keyboard', 'laptop', 'tablet', 'monitor', 'wifi', 'battery',
    'tv', 'plug', 'database', 'server', 'terminal', 'code', 'file', 'shield', 'auth', 'unlock',
    'password', 'cart', 'shop', 'card', 'price', 'wallet', 'dollar', 'euro', 'money', 'bag',
    'bank', 'coins', 'percent', 'chart', 'graph', 'analytics', 'target', 'gift', 'delivery', 'tag',
    'play', 'music', 'video', 'sound', 'audio', 'volume', 'camera', 'image', 'picture', 'disc',
    'film', 'mic', 'sun', 'rain', 'snow', 'wind', 'temp', 'leaf', 'tree', 'flower'
  ]

  const collectionPages: MetadataRoute.Sitemap = POPULAR_TAGS.map(tag => ({
    url: `${base}/icons/collection/${tag}-icons`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const individualIconPages: MetadataRoute.Sitemap = []
  const POPULAR_ICON_NAMES = [
    'home', 'settings', 'user', 'bell', 'heart', 'search', 'edit', 'trash', 'lock', 'key',
    'eye', 'download', 'upload', 'share', 'mail', 'message', 'chat', 'phone', 'play', 'camera',
    'folder', 'calendar', 'clock', 'plus', 'minus', 'check', 'info', 'alert-triangle', 'help-circle',
    'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'chevron-right', 'chevron-left',
    'shopping-cart', 'credit-card', 'map-pin', 'star', 'file', 'code', 'copy', 'menu', 'close'
  ]
  const POPULAR_ICON_LIBS = ['lucide-icons', 'heroicons', 'tabler-icons', 'phosphor-icons', 'bootstrap-icons', 'radix-icons']
  const indexedIconKeys = getIndexedIconKeys()

  for (const lib of POPULAR_ICON_LIBS) {
    for (const name of POPULAR_ICON_NAMES) {
      if (!indexedIconKeys.has(`${lib}:${name}`)) continue

      individualIconPages.push({
        url: `${base}/icons/${lib}/${name}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })
    }
  }

  return [
    ...staticPages,
    ...libraryPages,
    ...categoryPages,
    ...useCasePages,
    ...collectionPages,
    ...individualIconPages,
  ]
}
