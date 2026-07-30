import type { MetadataRoute } from 'next'
import { allLibraries } from '../data/library-catalog'
import snapshot from '../data/icon-search.snapshot.json'
import { categories } from '../data/categories'
import { staticPages } from '../data/static-pages'
import { useCases } from '../data/usecases'
import { SITE_URL } from '../lib/seo'

const CORE_PATHS = [
  '/',
  '/free-svg-icons',
  '/icon-search',
  '/react-icons',
  '/nextjs-icons',
  '/vue-icons',
  '/svelte-icons',
  '/tailwind-icons',
  '/typescript-icons',
  '/best-for-you',
  '/licenses',
  '/stats',
  '/directory',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/figma-plugin',
  '/sketch-plugin',
  '/vscode-extension',
  '/chrome-extension',
  '/framer-plugin',
  '/framer-template',
  '/webflow-extension',
  '/powerpoint-addin',
  '/google-slides-addon',
  '/raycast-extension',
  '/tailwind-plugin',
  '/mcp-server',
  '/jetbrains-plugin',
  '/storybook-addon',
  '/canva-app',
  '/wordpress-plugin',
  '/shopify-extension',
  '/adobe-plugin',
  '/obsidian-plugin',
  '/penpot-plugin',
] as const

const POPULAR_COLLECTIONS = [
  'arrow', 'settings', 'user', 'bell', 'heart', 'cloud', 'security', 'commerce', 'edit', 'media',
  'alert', 'weather', 'device', 'design', 'communication', 'building', 'health', 'finance', 'search', 'home',
  'star', 'trash', 'lock', 'key', 'eye', 'check', 'plus', 'minus', 'download', 'upload',
  'share', 'mail', 'message', 'chat', 'phone', 'call', 'send', 'inbox', 'envelope', 'folder',
  'cpu', 'bot', 'chip', 'robot', 'keyboard', 'laptop', 'tablet', 'monitor', 'wifi', 'battery',
  'tv', 'plug', 'database', 'server', 'terminal', 'code', 'file', 'shield', 'auth', 'unlock',
  'password', 'cart', 'shop', 'card', 'price', 'wallet', 'dollar', 'euro', 'money', 'bag',
  'bank', 'coins', 'percent', 'chart', 'graph', 'analytics', 'target', 'gift', 'delivery', 'tag',
  'play', 'music', 'video', 'sound', 'audio', 'volume', 'camera', 'image', 'picture', 'disc',
  'film', 'mic', 'sun', 'rain', 'snow', 'wind', 'temp', 'leaf', 'tree', 'flower',
] as const

const knownPageDates = new Map(staticPages.map((page) => [page.href, page.date]))
knownPageDates.set('/privacy-policy', '2026-07-24')
knownPageDates.set('/terms', '2026-07-24')

function entry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  return {
    url: new URL(path, SITE_URL).toString(),
    ...(lastModified ? { lastModified } : {}),
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const catalogModified = snapshot.generatedAt

  return [
    ...CORE_PATHS.map((path) => entry(path, knownPageDates.get(path))),
    entry('/icons/category', catalogModified),
    ...allLibraries.map((library) =>
      entry(`/icons/${encodeURIComponent(library.slug)}`, catalogModified),
    ),
    ...categories.map((category) =>
      entry(`/icons/category/${encodeURIComponent(category.slug)}`, catalogModified),
    ),
    entry('/use-cases', catalogModified),
    ...useCases.map((useCase) =>
      entry(`/use-cases/${encodeURIComponent(useCase.slug)}`, catalogModified),
    ),
    ...POPULAR_COLLECTIONS.map((tag) =>
      entry(`/icons/collection/${encodeURIComponent(`${tag}-icons`)}`, catalogModified),
    ),
  ]
}
