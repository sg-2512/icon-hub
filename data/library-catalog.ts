export type NamedLibrary = {
  id: string
  name: string
  slug: string
  color: string
}

export const SEARCHABLE_ICON_COUNT = 355_702
export const LEGAL_SAFE_ICON_COUNT = 259_070
export const ICONIFY_ICON_COUNT = 332_012
export const ICONIFY_COLLECTION_COUNT = 227

export const namedLibraries: NamedLibrary[] = [
  { id: 'lucide-icons', name: 'Lucide Icons', slug: 'lucide-icons', color: '#818cf8' },
  { id: 'heroicons', name: 'Heroicons', slug: 'heroicons', color: '#38bdf8' },
  { id: 'tabler-icons', name: 'Tabler Icons', slug: 'tabler-icons', color: '#34d399' },
  { id: 'patternfly-icons', name: 'PatternFly Icons', slug: 'patternfly-icons', color: '#06b6d4' },
  { id: 'untitled-ui-icons', name: 'Untitled UI Icons', slug: 'untitled-ui-icons', color: '#7dd3fc' },
  { id: 'phosphor-icons', name: 'Phosphor Icons', slug: 'phosphor-icons', color: '#f472b6' },
  { id: 'remix-icon', name: 'Remix Icon', slug: 'remix-icon', color: '#fb923c' },
  { id: 'feather-icons', name: 'Feather Icons', slug: 'feather-icons', color: '#a78bfa' },
  { id: 'bootstrap-icons', name: 'Bootstrap Icons', slug: 'bootstrap-icons', color: '#a855f7' },
  { id: 'radix-icons', name: 'Radix Icons', slug: 'radix-icons', color: '#fbbf24' },
  { id: 'iconoir', name: 'Iconoir', slug: 'iconoir', color: '#f87171' },
  { id: 'ionicons', name: 'Ionicons', slug: 'ionicons', color: '#2dd4bf' },
  { id: 'octicons', name: 'Octicons', slug: 'octicons', color: '#94a3b8' },
  { id: 'ant-design-icons', name: 'Ant Design Icons', slug: 'ant-design-icons', color: '#60a5fa' },
  { id: 'devicons', name: 'Devicons', slug: 'devicons', color: '#60a5fa' },
  { id: 'teenyicons', name: 'Teenyicons', slug: 'teenyicons', color: '#fb7185' },
  { id: 'circum-icons', name: 'Circum Icons', slug: 'circum-icons', color: '#818cf8' },
  { id: 'elusive-icons', name: 'Elusive Icons', slug: 'elusive-icons', color: '#38bdf8' },
]

export const NAMED_LIBRARY_COUNT = namedLibraries.length
export const COMPARISON_COUNT = NAMED_LIBRARY_COUNT * (NAMED_LIBRARY_COUNT - 1) / 2

const namedLibraryNames = new Map(namedLibraries.map((library) => [library.id, library.name]))
const acronymParts = new Set(['ai', 'bi', 'fa', 'gis', 'ic', 'mdi', 'svg', 'ui'])

export function getNamedLibraryName(id: string): string {
  return namedLibraryNames.get(id) || id
}

export function formatIconifyCollectionName(id: string): string {
  return id
    .replace(/^iconify-/, '')
    .split('-')
    .map((part) => acronymParts.has(part) ? part.toUpperCase() : `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}
