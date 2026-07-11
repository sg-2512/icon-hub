export type PreviewIcon = {
  name: string
  library: string
  svgUrl: string
}

export const ICON_PREVIEW_CACHE_VERSION = 'named-library-preview-v3'

const PATTERNFLY_STATIC_BASE = 'https://cdn.jsdelivr.net/npm/@patternfly/react-icons@6.6.0/dist/static'

const LOCAL_PREVIEW_LIBRARY_IDS = new Set([
  'patternfly-icons',
  'bootstrap-icons',
])

const NAMED_LIBRARY_PREVIEW_PATTERNS: Record<string, string[]> = {
  'lucide-icons': [
    'https://unpkg.com/lucide-static@latest/icons/{name}.svg',
    'https://api.iconify.design/lucide/{name}.svg',
  ],
  'tabler-icons': [
    'https://cdn.jsdelivr.net/npm/@tabler/icons@2.47.0/icons/{name}.svg',
    'https://api.iconify.design/tabler/{name}.svg',
  ],
  'patternfly-icons': [
    '/api/icon-preview/patternfly-icons/{name}',
    `${PATTERNFLY_STATIC_BASE}/{name}.svg`,
  ],
  'phosphor-icons': [
    'https://unpkg.com/@phosphor-icons/core@latest/assets/regular/{name}.svg',
    'https://api.iconify.design/ph/{name}.svg',
  ],
  heroicons: [
    'https://api.iconify.design/heroicons/{name}.svg',
    'https://api.iconify.design/heroicons-outline/{name}.svg',
    'https://api.iconify.design/heroicons-solid/{name}.svg',
  ],
  'bootstrap-icons': [
    'https://cdn.jsdelivr.net/npm/bootstrap-icons@latest/icons/{name}.svg',
    'https://api.iconify.design/bi/{name}.svg',
  ],
  'feather-icons': [
    'https://unpkg.com/feather-icons@latest/dist/icons/{name}.svg',
    'https://api.iconify.design/feather/{name}.svg',
  ],
  'remix-icon': [
    'https://api.iconify.design/ri/{name}.svg',
  ],
  iconoir: [
    'https://api.iconify.design/iconoir/{name}.svg',
    'https://cdn.jsdelivr.net/npm/iconoir@latest/icons/regular/{name}.svg',
  ],
  ionicons: [
    'https://api.iconify.design/ion/{name}.svg',
  ],
  octicons: [
    'https://api.iconify.design/octicon/{name}.svg',
  ],
  'ant-design-icons': [
    'https://api.iconify.design/ant-design/{name}.svg',
    'https://api.iconify.design/ant-design/{name}-filled.svg',
    'https://api.iconify.design/ant-design/{name}-outlined.svg',
    'https://api.iconify.design/ant-design/{name}-twotone.svg',
    'https://api.iconify.design/ant-design/{name}-fill.svg',
    'https://api.iconify.design/ant-design/{name}-outline.svg',
  ],
}

function addUnique(urls: string[], seen: Set<string>, value: string) {
  if (!value || seen.has(value)) return
  seen.add(value)
  urls.push(value)
}

function nameVariants(name: string): string[] {
  return Array.from(new Set([
    name,
    name.replace(/_/g, '-'),
    name.replace(/-/g, '_'),
  ]))
}

function applyPattern(pattern: string, name: string): string {
  return pattern.replaceAll('{name}', name)
}

function patternFlySvgUrl(name: string): string {
  return `${PATTERNFLY_STATIC_BASE}/${name.replace(/_/g, '-')}.svg`
}

export function getLocalIconPreviewUrl(library: string, name: string): string {
  const normalizedName = name.replace(/\.svg$/i, '').replace(/_/g, '-')
  if (!LOCAL_PREVIEW_LIBRARY_IDS.has(library) || !normalizedName) return ''
  return `/api/icon-preview/${encodeURIComponent(library)}/${encodeURIComponent(normalizedName)}?v=${ICON_PREVIEW_CACHE_VERSION}`
}

export function getBestIconPreviewUrl(icon: PreviewIcon): string {
  return getIconPreviewCandidates(icon)[0] || getCleanSvgUrl(icon.svgUrl, icon.library)
}

export function getCleanSvgUrl(url: string, library: string): string {
  if (!url) return ''
  if (library === 'patternfly-icons') {
    const fileName = url.match(/\/([^/?#]+\.svg)(?:[?#].*)?$/)?.[1]
    return fileName ? patternFlySvgUrl(fileName.replace(/\.svg$/, '')) : url
  }
  if (library === 'tabler-icons' && url.includes('@tabler/icons/icons/')) {
    return url.replace('@tabler/icons/icons/', '@tabler/icons@2.47.0/icons/')
  }
  if (library === 'phosphor-icons' && url.includes('@phosphor-icons/core/assets/')) {
    return url.replace('@phosphor-icons/core/assets/', '@phosphor-icons/core@2.1.1/assets/')
  }
  if (library === 'lucide-icons' && url.includes('lucide-static/icons/')) {
    return url.replace('lucide-static/icons/', 'lucide-static@0.415.0/icons/')
  }
  return url
}

export function getIconPreviewCandidates(icon: PreviewIcon): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  const variants = nameVariants(icon.name)

  for (const variant of variants) {
    addUnique(urls, seen, getLocalIconPreviewUrl(icon.library, variant))
  }
  addUnique(urls, seen, getCleanSvgUrl(icon.svgUrl, icon.library))
  addUnique(urls, seen, icon.svgUrl)

  const patterns = NAMED_LIBRARY_PREVIEW_PATTERNS[icon.library]
  if (patterns) {
    for (const pattern of patterns) {
      for (const variant of variants) {
        addUnique(urls, seen, applyPattern(pattern, variant))
      }
    }
    return urls
  }

  if (icon.library.startsWith('iconify-')) {
    const prefix = icon.library.replace(/^iconify-/, '')
    for (const variant of variants) {
      addUnique(urls, seen, `https://api.iconify.design/${prefix}/${variant}.svg`)
    }
    return urls
  }

  const normalizedPrefix = icon.library
    .toLowerCase()
    .replace(/-icons?$/, '')
    .replace(/_/g, '-')
  for (const variant of variants) {
    addUnique(urls, seen, `https://api.iconify.design/${normalizedPrefix}/${variant}.svg`)
  }
  return urls
}
