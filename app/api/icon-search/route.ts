import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { gunzipSync } from 'zlib'
import {
  ICONIFY_COLLECTION_COUNT,
  ICONIFY_ICON_COUNT,
  NAMED_LIBRARY_COUNT,
  SEARCHABLE_ICON_COUNT,
} from '../../../data/library-catalog'

let cachedIcons: any[] | null = null
let cachedPopular: any[] | null = null
let cachedLegal: any[] | null = null
let cachedLegalPopular: any[] | null = null
let cachedLegalSafeCount: number = 0

const API_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Library popularity weights used for 'popular' sort order
const LIBRARY_POPULARITY: Record<string, number> = {
  'lucide-icons': 10,
  'heroicons': 9,
  'ant-design-icons': 8.5,
  'tabler-icons': 8,
  'patternfly-icons': 7.5,
  'untitled-ui-icons': 7.25,
  'phosphor-icons': 7,
  'remix-icon': 6,
  'bootstrap-icons': 5,
  'radix-icons': 4,
  'feather-icons': 3,
  'iconoir': 2,
  'devicons': 1,
  'teenyicons': 1,
  'circum-icons': 1,
  'elusive-icons': 1,
}

const ICONIFY_PREVIEW_PREFIXES: Record<string, string> = {
  teenyicons: 'teenyicons',
  'circum-icons': 'circum',
  'elusive-icons': 'el',
}

const ICONIFY_PREVIEW_PRIMARY_LIBRARIES = new Set(Object.keys(ICONIFY_PREVIEW_PREFIXES))

type Facets = {
  libraries: string[]
  licenses: string[]
  iconifySets: string[]
}

type NormalizableIcon = {
  library?: unknown
  name?: unknown
  previewUrls?: unknown
  svgUrl?: unknown
}

let cachedFacets: {
  all: Facets
  legal: Facets
} | null = null

// Sliding window rate limiter (Phase 4 Upgrade)
const ipCache = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS = 120 // 120 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = ipCache.get(ip)
  if (!record) {
    ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  if (now > record.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }
  
  record.count++
  return record.count > MAX_REQUESTS
}

function toHttpUrl(url: unknown): string {
  const value = typeof url === 'string' ? url.trim() : ''
  if (!value) return ''
  if (value.startsWith('//')) return `https:${value}`
  return /^https?:\/\//i.test(value) ? value : ''
}

function addUniqueUrl(urls: string[], seen: Set<string>, url: unknown) {
  const value = toHttpUrl(url)
  if (!value || seen.has(value)) return
  seen.add(value)
  urls.push(value)
}

function addIconifyPreviewUrls(urls: string[], seen: Set<string>, library: string, name: string) {
  const prefix = ICONIFY_PREVIEW_PREFIXES[library]
  if (!prefix || !name) return

  const dashedName = name.replace(/_/g, '-')
  const underscoredName = name.replace(/-/g, '_')
  for (const iconName of [name, dashedName, underscoredName]) {
    addUniqueUrl(urls, seen, `https://api.iconify.design/${prefix}/${iconName}.svg`)
  }
}

function normalizePreviewUrls(icon: NormalizableIcon) {
  const library = typeof icon.library === 'string' ? icon.library : ''
  const name = typeof icon.name === 'string' ? icon.name : ''
  if (!ICONIFY_PREVIEW_PRIMARY_LIBRARIES.has(library) || !name) return

  const urls: string[] = []
  const seen = new Set<string>()
  addIconifyPreviewUrls(urls, seen, library, name)

  if (Array.isArray(icon.previewUrls)) {
    icon.previewUrls.forEach((url: unknown) => addUniqueUrl(urls, seen, url))
  }
  addUniqueUrl(urls, seen, icon.svgUrl)

  if (urls.length === 0) return
  icon.svgUrl = urls[0]
  icon.previewUrls = urls
}


export function loadIcons() {
  if (cachedIcons) return cachedIcons
  const start = Date.now()
  console.log(`Loading ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} icon database into server memory cache...`)
  
  const canonicalPathGz = join(process.cwd(), 'data/canonical-icon-search.json.gz')
  if (existsSync(canonicalPathGz)) {
    try {
      const compressedData = readFileSync(canonicalPathGz)
      const decompressedData = gunzipSync(compressedData).toString('utf-8')
      const list = JSON.parse(decompressedData)
      const parsedList = Array.isArray(list) ? list : []
      
      // Helper to convert kebab/snake cases to PascalCase
      const toPascalCase = (str: string) => {
        return str.split(/[-_]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')
      }

      // Map dynamic Iconify subsets to native, first-class libraries
      parsedList.forEach(icon => {
        if (icon.library === 'iconify-ion') {
          icon.library = 'ionicons'
          icon.libraryName = 'IonIcons'
          icon.npmPackage = 'react-ionicons'
          const compName = toPascalCase(icon.name) + 'Outline'
          icon.reactImport = `import { ${compName} } from 'react-ionicons'`
          icon.reactUsage = `<${compName} color="#818cf8" height="24px" width="24px" />`
        } else if (icon.library === 'iconify-octicon') {
          icon.library = 'octicons'
          icon.libraryName = 'Octicons'
          icon.npmPackage = '@primer/octicons-react'
          const compName = toPascalCase(icon.name) + 'Icon'
          icon.reactImport = `import { ${compName} } from '@primer/octicons-react'`
          icon.reactUsage = `<${compName} size={16} />`
        } else if (icon.library === 'iconify-ant-design') {
          icon.library = 'ant-design-icons'
          icon.libraryName = 'Ant Design Icons'
          icon.npmPackage = '@ant-design/icons'
          
          // Determine variant for React import based on name
          let suffix = 'Outlined'
          if (icon.name.endsWith('-fill') || icon.name.endsWith('-filled')) {
            suffix = 'Filled'
            icon.name = icon.name.replace(/-filled?$/, '')
          } else if (icon.name.endsWith('-twotone') || icon.name.endsWith('-two-tone')) {
            suffix = 'TwoTone'
            icon.name = icon.name.replace(/-two-tone$/, '').replace(/-twotone$/, '')
          } else if (icon.name.endsWith('-outline') || icon.name.endsWith('-outlined')) {
            suffix = 'Outlined'
            icon.name = icon.name.replace(/-outlined?$/, '')
          }
          
          const compName = toPascalCase(icon.name) + suffix
          icon.reactImport = `import { ${compName} } from '@ant-design/icons'`
          icon.reactUsage = `<${compName} style={{ fontSize: '24px' }} />`
        }

        normalizePreviewUrls(icon)
      })

      // Pre-sort alphabetically once on startup to optimize future default/alphabetical requests
      console.log('Pre-sorting icons alphabetically...')
      parsedList.sort((a, b) => a.name.localeCompare(b.name))
      
      cachedIcons = parsedList

      // Pre-compute static facets to optimize query execution latency (Phase 4 Upgrade)
      console.log('Pre-computing static search facets...')
      const allLibs = Array.from(new Set(parsedList.map((icon) => icon.library))).sort()
      const allLics = Array.from(new Set(parsedList.map((icon) => icon.license))).sort()
      const allSets = allLibs
        .filter((name) => name.startsWith('iconify-'))
        .map((name) => name.replace(/^iconify-/, ''))
        .sort()

      const legalList = parsedList.filter((icon) => Boolean(icon.legalSafe))
      const legalLibs = Array.from(new Set(legalList.map((icon) => icon.library))).sort()
      const legalLics = Array.from(new Set(legalList.map((icon) => icon.license))).sort()
      const legalSets = legalLibs
        .filter((name) => name.startsWith('iconify-'))
        .map((name) => name.replace(/^iconify-/, ''))
        .sort()

      cachedFacets = {
        all: { libraries: allLibs, licenses: allLics, iconifySets: allSets },
        legal: { libraries: legalLibs, licenses: legalLics, iconifySets: legalSets }
      }

      // Pre-compute popularity-sorted and legal-safe subsets to eliminate per-request sorting
      console.log('Pre-computing popularity-sorted and legal-safe cached subsets...')
      cachedPopular = [...parsedList].sort((a, b) => {
        const pa = LIBRARY_POPULARITY[a.library] || 0
        const pb = LIBRARY_POPULARITY[b.library] || 0
        if (pa !== pb) return pb - pa
        return a.name.localeCompare(b.name)
      })
      cachedLegal = legalList // already alphabetically sorted (filtered from sorted parsedList)
      cachedLegalPopular = [...legalList].sort((a, b) => {
        const pa = LIBRARY_POPULARITY[a.library] || 0
        const pb = LIBRARY_POPULARITY[b.library] || 0
        if (pa !== pb) return pb - pa
        return a.name.localeCompare(b.name)
      })
      cachedLegalSafeCount = legalList.length

      console.log(`Successfully compiled in-memory index: ${cachedIcons.length} icons in ${Date.now() - start}ms`)
      return cachedIcons
    } catch (e) {
      console.error('Error loading canonical database:', e)
    }
  }
  
  cachedIcons = []
  cachedFacets = {
    all: { libraries: [], licenses: [], iconifySets: [] },
    legal: { libraries: [], licenses: [], iconifySets: [] }
  }
  return cachedIcons
}

export async function GET(request: Request) {
  const startTime = performance.now()
  const { searchParams } = new URL(request.url)

  // 1. IP Abuse Protection / Rate Limiting (Phase 4 Upgrade)
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1'
  
  if (isRateLimited(clientIp)) {
    console.warn(`[API Rate Limit] Blocked IP: ${clientIp} due to high search query hits`)
    return new NextResponse(
      JSON.stringify({ error: 'Too Many Requests', message: 'You have exceeded your rate limit of 120 requests per minute.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
          ...API_CORS_HEADERS,
        }
      }
    )
  }

  const idsParam = searchParams.get('ids') || ''
  const query = searchParams.get('q')?.toLowerCase().trim() || ''
  const lib = searchParams.get('lib') || 'all'
  const iconifySet = searchParams.get('iconifySet') || 'all'
  const style = searchParams.get('style') || 'all'
  const category = searchParams.get('category') || 'all'
  const legalOnly = searchParams.get('legalOnly') !== '0'
  const page = parseInt(searchParams.get('page') || '1', 10)
  
  const defaultLimit = idsParam ? 200 : 80
  const limit = parseInt(searchParams.get('limit') || String(defaultLimit), 10)
  const sort = searchParams.get('sort') || 'relevance'

  const allIcons = loadIcons()

  // Fast-path: when no filters are active, serve directly from pre-computed cached arrays
  const noFilters = !query && !idsParam && lib === 'all' && style === 'all' && category === 'all' && iconifySet === 'all'
  if (noFilters) {
    let source: any[]
    if (legalOnly && sort === 'popular') {
      source = cachedLegalPopular!
    } else if (legalOnly) {
      source = cachedLegal!
    } else if (sort === 'popular') {
      source = cachedPopular!
    } else {
      source = allIcons
    }

    const total = source.length
    const paginated = source.slice((page - 1) * limit, page * limit)
    const legalSafeCount = legalOnly ? total : cachedLegalSafeCount
    const facets = legalOnly ? cachedFacets?.legal : cachedFacets?.all

    const elapsed = (performance.now() - startTime).toFixed(2)
    console.log(`[API Search] query: "(fast-path)", results: ${total}, taken: ${elapsed}ms`)

    return NextResponse.json({
      icons: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      catalogStats: {
        totalIcons: SEARCHABLE_ICON_COUNT,
        namedLibraries: NAMED_LIBRARY_COUNT,
        iconifyIcons: ICONIFY_ICON_COUNT,
        iconifyCollections: ICONIFY_COLLECTION_COUNT,
      },
      facets: {
        libraries: facets?.libraries || [],
        licenses: facets?.licenses || [],
        iconifySets: facets?.iconifySets || [],
        legalSafeCount,
        legalOnlyApplied: legalOnly,
      }
    }, {
      headers: {
        ...API_CORS_HEADERS,
        'X-Response-Time': `${elapsed}ms`
      }
    })
  }
  
  let filtered = allIcons

  if (idsParam) {
    const idList = idsParam.split(',').filter(Boolean)
    const idSet = new Set(idList)
    filtered = filtered.filter(icon => idSet.has(icon.id))
  } else {
    if (legalOnly) {
      filtered = filtered.filter(icon => Boolean(icon.legalSafe))
    }
    
    // 1. Library Filter
    if (lib !== 'all') {
      if (lib === 'iconify') {
        filtered = filtered.filter(icon => icon.library.startsWith('iconify-'))
        if (iconifySet !== 'all') {
          const normalized = `iconify-${iconifySet}`.toLowerCase()
          filtered = filtered.filter(icon => icon.library.toLowerCase() === normalized)
        }
      } else {
        filtered = filtered.filter(icon => icon.library === lib)
      }
    }
    
    // 2. Style Filter
    if (style !== 'all') {
      filtered = filtered.filter(icon => {
        const nameLower = icon.name.toLowerCase()
        const libLower = icon.library.toLowerCase()
        if (style === 'solid') {
          return nameLower.includes('solid') || nameLower.includes('fill') || nameLower.includes('bold') ||
                 libLower.includes('bootstrap') && nameLower.includes('fill') ||
                 libLower.includes('remix') && nameLower.includes('fill')
        } else if (style === 'duotone') {
          return nameLower.includes('duotone')
        } else if (style === 'twotone') {
          return nameLower.includes('twotone') || nameLower.includes('two-tone')
        } else if (style === 'stroke') {
          return nameLower.includes('outline') || nameLower.includes('regular') || nameLower.includes('light') || 
                 nameLower.includes('thin') || nameLower.includes('line') || libLower.includes('lucide') || 
                 libLower.includes('feather') || libLower.includes('iconoir')
        } else if (style === 'sharp') {
          return nameLower.includes('sharp')
        }
        return true
      })
    }
    
    // 3. Category Filter with Tag Mapping
    if (category !== 'all') {
      const CATEGORY_MAP: Record<string, string[]> = {
        'ai': ['ai', 'brain', 'cpu', 'sparkles', 'bot', 'chip', 'robot', 'wand', 'magic'],
        'alert': ['alert', 'warning', 'info', 'bell', 'clock', 'alarm', 'shield', 'danger', 'triangle', 'octagon'],
        'arrows': ['arrow', 'chevron', 'direction', 'move', 'left', 'right', 'up', 'down', 'pointer', 'refresh', 'sync'],
        'media': ['play', 'music', 'video', 'sound', 'audio', 'volume', 'camera', 'image', 'picture', 'disc', 'film', 'mic'],
        'editor': ['edit', 'write', 'pen', 'align', 'format', 'list', 'trash', 'save', 'copy', 'paste', 'grid', 'table', 'columns'],
        'communication': ['mail', 'message', 'chat', 'phone', 'call', 'send', 'share', 'envelope', 'inbox'],
        'commerce': ['cart', 'shop', 'card', 'price', 'wallet', 'dollar', 'euro', 'money', 'bag', 'bank', 'coins', 'percent'],
        'weather': ['sun', 'cloud', 'rain', 'snow', 'wind', 'temp', 'weather', 'star', 'moon', 'leaf', 'tree', 'flower'],
        'devices': ['device', 'phone', 'computer', 'monitor', 'cpu', 'keyboard', 'laptop', 'tablet', 'wifi', 'battery', 'tv', 'plug'],
        'design': ['paint', 'brush', 'color', 'palette', 'ruler', 'pencil', 'layers', 'crop', 'bezier', 'vector'],
        'security': ['lock', 'shield', 'key', 'eye', 'secure', 'auth', 'unlock', 'password', 'keyhole', 'fingerprint'],
        'health': ['heart', 'plus', 'aid', 'medical', 'health', 'hospital', 'pill', 'activity', 'thermometer', 'pulse'],
        'users': ['user', 'profile', 'group', 'avatar', 'people', 'person', 'users', 'contact'],
        'buildings': ['home', 'building', 'house', 'office', 'store', 'warehouse', 'hotel', 'map', 'pin']
      }
      const keywords = CATEGORY_MAP[category] || []
      if (keywords.length > 0) {
        filtered = filtered.filter(icon => {
          const iconTags = icon.tags || []
          const iconName = icon.name.toLowerCase()
          return keywords.some(kw => {
            const kwLower = kw.toLowerCase()
            return iconTags.some((t: string) => t.toLowerCase() === kwLower) || iconName.includes(kwLower)
          })
        })
      }
    }
    
    // 4. Search Query Filter
    if (query) {
      const qParts = query.split(/\s+/).filter(Boolean)
      filtered = filtered.filter(icon => {
        const name = icon.name.toLowerCase()
        const tags = icon.tags ? icon.tags.map((t: string) => t.toLowerCase()) : []
        return qParts.every(part => name.includes(part) || tags.some((t: string) => t.includes(part)))
      })
    }
  }

  // 5. Sorting
  if (sort === 'relevance' && query) {
    filtered.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      
      // 1. Exact Match
      if (aName === query && bName !== query) return -1
      if (bName === query && aName !== query) return 1
      
      // 2. Starts with Match
      const aStarts = aName.startsWith(query)
      const bStarts = bName.startsWith(query)
      if (aStarts && !bStarts) return -1
      if (bStarts && !aStarts) return 1
      
      // 3. Shorter name length (closer match)
      if (aStarts && bStarts) {
        return aName.length - bName.length
      }
      
      // 4. Default Alphabetical
      return aName.localeCompare(bName)
    })
  } else if (sort === 'popular') {
    // Since we are sorting, prevent mutating the global memory cache if no filters were applied
    const toSort = filtered === allIcons ? [...filtered] : filtered
    toSort.sort((a, b) => {
      const pa = LIBRARY_POPULARITY[a.library] || 0
      const pb = LIBRARY_POPULARITY[b.library] || 0
      if (pa !== pb) return pb - pa
      return a.name.localeCompare(b.name)
    })
    filtered = toSort
  } else {
    // Default or 'alphabetical'
    // Since the master list is pre-sorted alphabetically on load and JS filter() preserves order,
    // we don't need to do anything here! This is a massive CPU optimization.
  }

  const legalSafeCount = filtered.filter((icon) => icon.legalSafe).length
  
  const total = filtered.length
  const paginated = filtered.slice((page - 1) * limit, page * limit)
  
  // Use precomputed facets for incredible speed boost! (Phase 4 Upgrade)
  const facets = legalOnly ? cachedFacets?.legal : cachedFacets?.all

  const elapsed = (performance.now() - startTime).toFixed(2)
  console.log(`[API Search] query: "${query || idsParam || '(none)'}", results: ${total}, taken: ${elapsed}ms`)

  return NextResponse.json({
    icons: paginated,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    catalogStats: {
      totalIcons: SEARCHABLE_ICON_COUNT,
      namedLibraries: NAMED_LIBRARY_COUNT,
      iconifyIcons: ICONIFY_ICON_COUNT,
      iconifyCollections: ICONIFY_COLLECTION_COUNT,
    },
    facets: {
      libraries: facets?.libraries || [],
      licenses: facets?.licenses || [],
      iconifySets: facets?.iconifySets || [],
      legalSafeCount,
      legalOnlyApplied: legalOnly,
    }
  }, {
    headers: {
      ...API_CORS_HEADERS,
      'X-Response-Time': `${elapsed}ms`
    }
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: API_CORS_HEADERS,
  })
}

// Module-level Cache Startup Warmup (Phase 4 Upgrade)
loadIcons()
