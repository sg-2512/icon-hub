import { framer, type DragCompleteResult } from '@framer/plugin'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

framer.showUI({
  position: 'top right',
  width: 400,
  height: 660,
})

const API_BASE = 'https://iconsearch.info'
const SEARCH_API_URL = `${API_BASE}/api/extension/icon-search`
const AUTH_API_URL = `${API_BASE}/api`
const ICONSEARCH_ORIGIN = new URL(API_BASE).origin
const ICONIFY_ORIGIN = 'https://api.iconify.design'
const JSDELIVR_ORIGIN = 'https://cdn.jsdelivr.net'
const TRUSTED_SVG_ORIGINS = new Set([ICONSEARCH_ORIGIN, ICONIFY_ORIGIN, JSDELIVR_ORIGIN])
const PRODUCT = 'framer'
const SESSION_KEY = 'iconsearchFramerSession'
const RECENT_KEY = 'iconsearchFramerRecent'
const PINNED_KEY = 'iconsearchFramerPinned'
const PAGE_SIZE = 96
const LOAD_AHEAD_PX = 3200
const AUTO_REFILL_DELAY_MS = 45
const PAGE_CACHE_LIMIT = 12
const DRAG_CACHE_LIMIT = 80
const DRAG_PREWARM_COUNT = 28
const SEARCHABLE_ICON_COUNT = 355_702
const DEFAULT_ICON_SIZE = 96
const DEFAULT_ICON_COLOR = '#111827'
const ICON_SIZE_OPTIONS = [48, 64, 96, 128, 192, 256] as const

type Access = {
  email: string
  product: string
  tier: string
  founderNumber: number | null
  expiresAt: string
}

type Session = {
  token: string
  access: Access | null
}

type ApiIcon = {
  id?: string
  name?: string
  library?: string
  libraryName?: string
  svgUrl?: string
  iconifyName?: string
}

type IconResult = {
  id: string
  name: string
  library: string
  libraryName: string
  svgUrl: string
  iconifyName: string
}

type SearchResponse = {
  icons?: ApiIcon[]
  total?: number
  totalPages?: number
  facets?: {
    iconifySets?: string[]
  }
  error?: string
}

type SearchSnapshot = {
  query: string
  library: string
  style: string
  legalOnly: boolean
}

type SearchPagePayload = {
  icons: IconResult[]
  total: number
  totalPages: number
  iconifySets: string[]
}

type IconRenderOptions = {
  size: number
  color: string
  useOriginalColors: boolean
}

const namedLibraries = [
  ['lucide-icons', 'Lucide Icons'],
  ['heroicons', 'Heroicons'],
  ['tabler-icons', 'Tabler Icons'],
  ['patternfly-icons', 'PatternFly Icons'],
  ['untitled-ui-icons', 'Untitled UI Icons'],
  ['phosphor-icons', 'Phosphor Icons'],
  ['remix-icon', 'Remix Icon'],
  ['feather-icons', 'Feather Icons'],
  ['bootstrap-icons', 'Bootstrap Icons'],
  ['radix-icons', 'Radix Icons'],
  ['iconoir', 'Iconoir'],
  ['ionicons', 'Ionicons'],
  ['octicons', 'Octicons'],
  ['ant-design-icons', 'Ant Design Icons'],
  ['devicons', 'Devicons'],
  ['teenyicons', 'Teenyicons'],
  ['circum-icons', 'Circum Icons'],
  ['elusive-icons', 'Elusive Icons'],
] as const

const acronymParts = new Set(['ai', 'bi', 'fa', 'gis', 'ic', 'mdi', 'svg', 'ui'])
const nonGraphicSvgTags = new Set([
  'defs',
  'desc',
  'filter',
  'lineargradient',
  'mask',
  'metadata',
  'pattern',
  'radialgradient',
  'stop',
  'style',
  'symbol',
  'title',
])

function createSearchCacheKey(snapshot: SearchSnapshot, nextPage: number) {
  return [
    snapshot.query,
    snapshot.library,
    snapshot.style,
    snapshot.legalOnly ? '1' : '0',
    nextPage,
  ].join('\u001f')
}

function isSearchPagePromise(value: SearchPagePayload | Promise<SearchPagePayload>): value is Promise<SearchPagePayload> {
  return typeof (value as Promise<SearchPagePayload>).then === 'function'
}

function trimMap<K, V>(map: Map<K, V>, limit: number) {
  while (map.size > limit) {
    const firstKey = map.keys().next().value
    if (firstKey === undefined) return
    map.delete(firstKey)
  }
}

export function App() {
  const [session, setSession] = useState<Session | null>(() => readSession())
  const [recent, setRecent] = useState<IconResult[]>(() => readJson<IconResult[]>(RECENT_KEY, []))
  const [pinned, setPinned] = useState<IconResult[]>(() => readJson<IconResult[]>(PINNED_KEY, []))
  const [icons, setIcons] = useState<IconResult[]>([])
  const [iconifySets, setIconifySets] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [library, setLibrary] = useState('all')
  const [style, setStyle] = useState('all')
  const [legalOnly, setLegalOnly] = useState(true)
  const [iconSize, setIconSize] = useState(DEFAULT_ICON_SIZE)
  const [iconColor, setIconColor] = useState(DEFAULT_ICON_COLOR)
  const [useOriginalColors, setUseOriginalColors] = useState(true)
  const [showPinnedOnly, setShowPinnedOnly] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const requestIdRef = useRef(0)
  const iconsLengthRef = useRef(0)
  const recentLengthRef = useRef(0)
  const loadingRef = useRef(false)
  const pageRef = useRef(1)
  const totalPagesRef = useRef(0)
  const showHomeRef = useRef(false)
  const pageCacheRef = useRef(new Map<string, SearchPagePayload | Promise<SearchPagePayload>>())
  const dragSvgCacheRef = useRef(new Map<string, string>())
  const dragPreparingRef = useRef(new Map<string, Promise<string>>())
  const scrollingRef = useRef<HTMLDivElement | null>(null)
  const activeSession = session?.token ? session : null
  const token = activeSession?.token || ''

  const canSearch = Boolean(token)
  const renderOptions = useMemo<IconRenderOptions>(() => ({
    size: iconSize,
    color: iconColor,
    useOriginalColors,
  }), [iconColor, iconSize, useOriginalColors])
  const accessLabel = useMemo(() => {
    const access = activeSession?.access
    if (!access) return 'Free access'
    const tier = access.tier === 'founder' && access.founderNumber
      ? `Founder #${access.founderNumber}`
      : 'Free access'
    return access.email ? `${access.email} - ${tier}` : tier
  }, [activeSession])

  const showHome = !query.trim() && library === 'all' && style === 'all'
  const homeIcons = useMemo(() => mergeUniqueIcons(pinned.concat(recent)), [pinned, recent])
  const pinnedIds = useMemo(() => new Set(pinned.map((icon) => icon.id)), [pinned])
  const displayIcons = showPinnedOnly ? pinned : showHome ? homeIcons : icons

  useEffect(() => {
    iconsLengthRef.current = icons.length
  }, [icons.length])

  useEffect(() => {
    recentLengthRef.current = recent.length
  }, [recent.length])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  useEffect(() => {
    pageRef.current = page
  }, [page])

  useEffect(() => {
    totalPagesRef.current = totalPages
  }, [totalPages])

  useEffect(() => {
    showHomeRef.current = showHome || showPinnedOnly
  }, [showHome, showPinnedOnly])

  const persistSession = useCallback((nextSession: Session | null) => {
    setSession(nextSession)
    if (nextSession) {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
      window.localStorage.removeItem(SESSION_KEY)
    } else {
      window.sessionStorage.removeItem(SESSION_KEY)
      window.localStorage.removeItem(SESSION_KEY)
    }
  }, [])

  const refreshAccess = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(`${AUTH_API_URL}/entitlements/me`, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        persistSession(null)
        setStatus('Please sign in again.')
        return
      }

      if (!response.ok) return
      const payload = await response.json() as { access?: Access }
      const refreshedSession = {
        token,
        access: normalizeAccess(payload.access),
      }
      persistSession(refreshedSession)
    } catch {
      // Keep the saved session. The search API will be the source of truth.
    }
  }, [persistSession, token])

  const loadCatalog = useCallback(async () => {
    if (!token) return

    try {
      const url = new URL(SEARCH_API_URL)
      url.searchParams.set('limit', '1')
      url.searchParams.set('page', '1')
      url.searchParams.set('sort', 'popular')
      url.searchParams.set('legalOnly', '0')

      const response = await fetch(url.toString(), {
        headers: authHeaders(token),
      })
      if (!response.ok) return

      const payload = await response.json() as SearchResponse
      const sets = Array.isArray(payload.facets?.iconifySets)
        ? payload.facets.iconifySets.filter((set): set is string => typeof set === 'string')
        : []

      if (sets.length > 0) setIconifySets(sets)
    } catch {
      // The hard-coded collection count keeps the UI honest while offline checks fail.
    }
  }, [token])

  const fetchSearchPage = useCallback(async (snapshot: SearchSnapshot, nextPage: number): Promise<SearchPagePayload> => {
    if (!token) throw new Error('Please sign in again.')

    const url = new URL(SEARCH_API_URL)
    if (snapshot.query) url.searchParams.set('q', snapshot.query)
    url.searchParams.set('limit', String(PAGE_SIZE))
    url.searchParams.set('page', String(nextPage))
    url.searchParams.set('sort', 'relevance')
    url.searchParams.set('legalOnly', snapshot.legalOnly ? '1' : '0')
    applyLibraryParams(url, snapshot.library)
    if (snapshot.style !== 'all') url.searchParams.set('style', snapshot.style)

    const response = await fetch(url.toString(), {
      headers: authHeaders(token),
    })
    const payload = await response.json() as SearchResponse
    if (!response.ok) throw new Error(payload.error || `IconSearch API returned ${response.status}`)

    const nextIcons = Array.isArray(payload.icons)
      ? payload.icons.map(normalizeIcon).filter((icon): icon is IconResult => Boolean(icon))
      : []
    const nextTotal = Number(payload.total) || nextIcons.length
    const nextTotalPages = Number(payload.totalPages) || Math.ceil(nextTotal / PAGE_SIZE)
    const nextIconifySets = Array.isArray(payload.facets?.iconifySets)
      ? payload.facets.iconifySets.filter((set): set is string => typeof set === 'string')
      : []

    return {
      icons: nextIcons,
      total: nextTotal,
      totalPages: nextTotalPages,
      iconifySets: nextIconifySets,
    }
  }, [token])

  const readSearchPage = useCallback(async (snapshot: SearchSnapshot, nextPage: number) => {
    const key = createSearchCacheKey(snapshot, nextPage)
    const cached = pageCacheRef.current.get(key)
    if (cached) {
      return isSearchPagePromise(cached) ? cached : cached
    }

    const promise = fetchSearchPage(snapshot, nextPage)
    pageCacheRef.current.set(key, promise)

    try {
      const payload = await promise
      pageCacheRef.current.set(key, payload)
      trimMap(pageCacheRef.current, PAGE_CACHE_LIMIT)
      return payload
    } catch (error) {
      pageCacheRef.current.delete(key)
      throw error
    }
  }, [fetchSearchPage])

  const prefetchSearchPage = useCallback((snapshot: SearchSnapshot, nextPage: number) => {
    if (!token || nextPage < 1) return

    const key = createSearchCacheKey(snapshot, nextPage)
    if (pageCacheRef.current.has(key)) return

    const promise = fetchSearchPage(snapshot, nextPage)
      .then((payload) => {
        pageCacheRef.current.set(key, payload)
        trimMap(pageCacheRef.current, PAGE_CACHE_LIMIT)
        return payload
      })
      .catch((error) => {
        pageCacheRef.current.delete(key)
        throw error
      })

    pageCacheRef.current.set(key, promise)
    void promise.catch(() => {
      // Prefetch failures should not interrupt the active search.
    })
  }, [fetchSearchPage, token])

  const search = useCallback(async ({ nextPage, append }: { nextPage: number; append: boolean }) => {
    if (!token) return

    const trimmedQuery = query.trim()
    const hasFilter = library !== 'all' || style !== 'all'
    if (trimmedQuery.length === 1 || (!trimmedQuery && !hasFilter)) {
      setIcons([])
      setTotal(0)
      setTotalPages(0)
      setPage(1)
      pageCacheRef.current.clear()
      setStatus(recentLengthRef.current ? 'Showing saved icons.' : `${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} online icons ready.`)
      return
    }

    const snapshot: SearchSnapshot = {
      query: trimmedQuery,
      library,
      style,
      legalOnly,
    }
    const cached = pageCacheRef.current.get(createSearchCacheKey(snapshot, nextPage))
    const hasResolvedCachedPage = Boolean(cached && !isSearchPagePromise(cached))
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    loadingRef.current = true
    if (!append || !hasResolvedCachedPage) setLoading(true)
    setError('')
    if (!append || !hasResolvedCachedPage) {
      setStatus(append ? 'Loading more icons...' : 'Searching online...')
    }

    try {
      const payload = await readSearchPage(snapshot, nextPage)
      if (requestId !== requestIdRef.current) return

      const shown = append ? iconsLengthRef.current + payload.icons.length : payload.icons.length
      setIcons((current) => append ? current.concat(payload.icons) : payload.icons)
      setPage(nextPage)
      setTotal(payload.total)
      setTotalPages(payload.totalPages)
      setStatus(`${shown.toLocaleString('en-US')} shown from ${payload.total.toLocaleString('en-US')} online results.`)

      if (payload.iconifySets.length > 0) {
        setIconifySets((current) => payload.iconifySets.length > current.length ? payload.iconifySets : current)
      }

      if (payload.icons.length === 0 && !append) {
        setError('No icons found. Try a broader query or another library.')
      } else if (nextPage < payload.totalPages) {
        prefetchSearchPage(snapshot, nextPage + 1)
      }
    } catch (searchError) {
      if (requestId !== requestIdRef.current) return
      setError(searchError instanceof Error ? searchError.message : 'Online search failed.')
      setStatus('Could not load icons.')
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false
        setLoading(false)
      }
    }
  }, [legalOnly, library, prefetchSearchPage, query, readSearchPage, style, token])

  useEffect(() => {
    if (!token) return
    const timer = window.setTimeout(() => {
      void refreshAccess()
      void loadCatalog()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadCatalog, refreshAccess, token])

  useEffect(() => {
    if (!canSearch) return
    const timer = window.setTimeout(() => {
      void search({ nextPage: 1, append: false })
    }, 220)
    return () => window.clearTimeout(timer)
  }, [canSearch, search])

  const beginSignIn = async () => {
    setAuthLoading(true)
    setError('')
    setStatus('Opening secure sign-in in your browser...')

    try {
      const startResponse = await fetch(`${AUTH_API_URL}/device/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ product: PRODUCT, clientName: `Framer ${navigator.userAgent.slice(0, 48)}` }),
      })
      const startPayload = await startResponse.json() as {
        deviceCode?: string
        verificationUriComplete?: string
        expiresIn?: number
        interval?: number
        error?: string
      }
      if (!startResponse.ok) throw new Error(startPayload.error || 'Could not start sign-in.')

      const deviceCode = startPayload.deviceCode
      const verificationUrl = startPayload.verificationUriComplete
      if (!deviceCode || !verificationUrl) throw new Error('The sign-in response was incomplete.')

      window.open(verificationUrl, '_blank', 'noopener,noreferrer')
      setStatus('Approve the browser page. This plugin will update automatically.')

      const deadline = Date.now() + (Number(startPayload.expiresIn) || 600) * 1000
      const interval = Math.max(2, Number(startPayload.interval) || 3) * 1000

      while (Date.now() < deadline) {
        await delay(interval)
        const statusResponse = await fetch(`${AUTH_API_URL}/device/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ deviceCode }),
        })
        const statusPayload = await statusResponse.json() as {
          status?: string
          token?: string
          access?: Access
          error?: string
        }

        if (statusPayload.status === 'pending') continue
        if (statusPayload.status !== 'authorized' || !statusPayload.token) {
          throw new Error(statusPayload.error || 'The sign-in link expired. Please try again.')
        }

        persistSession({
          token: statusPayload.token,
          access: normalizeAccess(statusPayload.access),
        })
        setStatus('IconSearch connected. Search and insert icons.')
        return
      }

      throw new Error('The sign-in link expired. Please try again.')
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Could not connect your account.')
    } finally {
      setAuthLoading(false)
    }
  }

  const signOut = async () => {
    const currentToken = token
    persistSession(null)
    setIcons([])
    setStatus('Signed out.')

    if (!currentToken) return
    try {
      await fetch(`${AUTH_API_URL}/device/revoke`, {
        method: 'POST',
        headers: { authorization: `Bearer ${currentToken}` },
      })
    } catch {
      // Local sign-out already happened.
    }
  }

  const rememberIcon = useCallback((icon: IconResult) => {
    const nextRecent = [icon].concat(recent.filter((item) => item.id !== icon.id)).slice(0, 16)
    setRecent(nextRecent)
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(nextRecent))
  }, [recent])

  const togglePinned = useCallback((icon: IconResult) => {
    setPinned((current) => {
      const isPinned = current.some((item) => item.id === icon.id)
      const nextPinned = isPinned
        ? current.filter((item) => item.id !== icon.id)
        : [icon].concat(current.filter((item) => item.id !== icon.id)).slice(0, 32)

      window.localStorage.setItem(PINNED_KEY, JSON.stringify(nextPinned))
      setStatus(isPinned ? `Unpinned ${icon.name}.` : `Pinned ${icon.name}.`)
      return nextPinned
    })
  }, [])

  const prepareDragSvg = useCallback((icon: IconResult) => {
    const cacheKey = createDragCacheKey(icon, renderOptions)
    if (dragSvgCacheRef.current.has(cacheKey) || dragPreparingRef.current.has(cacheKey)) return

    const promise = fetchSvg(icon)
      .then((svg) => {
        const cleaned = prepareSvgForFramer(svg, renderOptions)
        dragSvgCacheRef.current.set(cacheKey, cleaned)
        trimMap(dragSvgCacheRef.current, DRAG_CACHE_LIMIT)
        return cleaned
      })
      .finally(() => {
        dragPreparingRef.current.delete(cacheKey)
      })

    dragPreparingRef.current.set(cacheKey, promise)
    void promise.catch(() => {
      // Drag preloading is opportunistic; click insertion can still fetch on demand.
    })
  }, [renderOptions])

  const getDragSvg = useCallback((icon: IconResult) => {
    return dragSvgCacheRef.current.get(createDragCacheKey(icon, renderOptions)) || null
  }, [renderOptions])

  const handleDragComplete = useCallback((icon: IconResult, result: DragCompleteResult) => {
    if (result.status === 'success') {
      rememberIcon(icon)
      setStatus(`Dropped ${icon.name} onto the canvas.`)
      return
    }

    setError(result.reason || 'Could not drop this icon into Framer.')
  }, [rememberIcon])

  const insertIcon = async (icon: IconResult) => {
    setError('')
    setStatus(`Loading ${icon.name} SVG...`)

    try {
      const svg = prepareSvgForFramer(await fetchSvg(icon), renderOptions)
      dragSvgCacheRef.current.set(createDragCacheKey(icon, renderOptions), svg)
      trimMap(dragSvgCacheRef.current, DRAG_CACHE_LIMIT)
      await framer.addSVG({
        svg,
        name: `${safeFileName(icon.name)}.svg`,
      })
      rememberIcon(icon)
      setStatus(`Inserted ${icon.name} at ${renderOptions.size}px.`)
      notify(`Inserted ${icon.name}`)
    } catch (insertError) {
      setError(insertError instanceof Error ? insertError.message : 'Could not insert this icon.')
      setStatus('Insert failed.')
    }
  }

  const loadMore = useCallback(() => {
    if (loadingRef.current || showHomeRef.current) return
    if (totalPagesRef.current && pageRef.current >= totalPagesRef.current) return
    loadingRef.current = true
    void search({ nextPage: pageRef.current + 1, append: true })
  }, [search])

  const handleScroll = useCallback(() => {
    const node = scrollingRef.current
    if (!node) return
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight
    if (remaining < LOAD_AHEAD_PX) loadMore()
  }, [loadMore])

  useEffect(() => {
    if (!token || showHome || showPinnedOnly || loading || displayIcons.length === 0) return
    const node = scrollingRef.current
    if (!node) return
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight
    if (remaining > LOAD_AHEAD_PX * 0.7) return

    const timer = window.setTimeout(loadMore, AUTO_REFILL_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [displayIcons.length, loading, loadMore, showHome, showPinnedOnly, token])

  useEffect(() => {
    if (!token || displayIcons.length === 0) return

    const timer = window.setTimeout(() => {
      displayIcons.slice(0, DRAG_PREWARM_COUNT).forEach(prepareDragSvg)
    }, 120)

    return () => window.clearTimeout(timer)
  }, [displayIcons, prepareDragSvg, token])

  if (!token) {
    return (
      <main className="plugin-shell unlock-shell">
        <div className="brand-row">
          <span className="brand-mark">IS</span>
          <span>IconSearch</span>
          <strong>FREE</strong>
        </div>

        <section className="unlock-card">
          <div className="eyebrow">Live icon search</div>
          <h1>Search 355,702 SVG icons inside Framer.</h1>
          <p>
            Sign in securely in your browser. Framer stores only a revocable IconSearch app token.
          </p>
          <button type="button" onClick={() => void beginSignIn()} disabled={authLoading} className="primary-button">
            {authLoading ? 'Waiting for approval...' : 'Sign in with IconSearch'}
          </button>
          <div className="trust-line">18 named libraries + 227 Iconify collections. Online-only results.</div>
        </section>

        {status && <p className="status-line">{status}</p>}
        {error && <p className="error-line">{error}</p>}
      </main>
    )
  }

  return (
    <main className="plugin-shell">
      <header className="toolbar">
        <div className="brand-row compact">
          <span className="brand-mark">IS</span>
          <div>
            <strong>IconSearch</strong>
            <small>{accessLabel}</small>
          </div>
          <button type="button" onClick={() => void signOut()} className="ghost-button">Sign out</button>
        </div>

        <label className="search-field" htmlFor="iconsearch-query">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" />
          </svg>
          <input
            id="iconsearch-query"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setShowPinnedOnly(false)
            }}
            placeholder="Search home, arrow, chart..."
          />
        </label>

        <div className="filter-row">
          <select
            value={library}
            onChange={(event) => {
              setLibrary(event.target.value)
              setShowPinnedOnly(false)
            }}
            aria-label="Library"
          >
            <option value="all">All libraries</option>
            <optgroup label="Named libraries">
              {namedLibraries.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </optgroup>
            <optgroup label="Iconify">
              <option value="iconify">All Iconify</option>
              {iconifySets.map((set) => (
                <option key={set} value={`iconify:${set}`}>{formatIconifySet(set)}</option>
              ))}
            </optgroup>
          </select>

          <select
            value={style}
            onChange={(event) => {
              setStyle(event.target.value)
              setShowPinnedOnly(false)
            }}
            aria-label="Style"
          >
            <option value="all">All styles</option>
            <option value="stroke">Outline</option>
            <option value="solid">Solid</option>
            <option value="duotone">Duotone</option>
            <option value="twotone">Two tone</option>
            <option value="sharp">Sharp</option>
          </select>
        </div>

        <div className="render-row">
          <label>
            <span>Size</span>
            <select
              value={iconSize}
              onChange={(event) => setIconSize(Number(event.target.value))}
              aria-label="Inserted icon size"
            >
              {ICON_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </label>

          <label className="color-control">
            <span>Color</span>
            <input
              type="color"
              value={iconColor}
              onChange={(event) => {
                setIconColor(event.target.value)
                setUseOriginalColors(false)
              }}
              disabled={useOriginalColors}
              aria-label="Icon color"
            />
          </label>

          <label className="original-toggle">
            <input
              type="checkbox"
              checked={useOriginalColors}
              onChange={(event) => setUseOriginalColors(event.target.checked)}
            />
            Original
          </label>
        </div>

        <div className="sub-toolbar">
          <label>
            <input
              type="checkbox"
              checked={legalOnly}
              onChange={(event) => {
                setLegalOnly(event.target.checked)
                setShowPinnedOnly(false)
              }}
            />
            Legal-safe only
          </label>
          <div className="saved-actions">
            <button
              type="button"
              className={showPinnedOnly ? 'saved-chip active' : 'saved-chip'}
              onClick={() => setShowPinnedOnly((value) => !value)}
            >
              Pinned {pinned.length}
            </button>
            <span>{showPinnedOnly ? 'Pinned' : showHome ? 'Recent' : `${icons.length.toLocaleString('en-US')} / ${total.toLocaleString('en-US')}`}</span>
          </div>
        </div>
      </header>

      <section className="results-panel" ref={scrollingRef} onScroll={handleScroll}>
        {displayIcons.length === 0 && !loading ? (
          <div className="empty-state">
            <strong>{getEmptyTitle({ error, query, showHome, showPinnedOnly })}</strong>
            <span>{getEmptyBody({ query, showHome, showPinnedOnly })}</span>
          </div>
        ) : (
          <div className="icon-grid">
            {displayIcons.map((icon) => (
              <IconCard
                key={icon.id}
                icon={icon}
                isPinned={pinnedIds.has(icon.id)}
                onInsert={insertIcon}
                onTogglePinned={togglePinned}
                onPrepareDrag={prepareDragSvg}
                getDragSvg={getDragSvg}
                onDragComplete={handleDragComplete}
                renderOptions={renderOptions}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="loading-grid" role="status" aria-live="polite" aria-label="Loading icons">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index} aria-hidden="true" />
            ))}
          </div>
        )}
      </section>

      <footer className="plugin-footer">
        <span className={error ? 'footer-error' : ''}>{error || status || 'Click any icon to insert a clean SVG.'}</span>
      </footer>
    </main>
  )
}

type IconCardProps = {
  icon: IconResult
  isPinned: boolean
  onInsert: (icon: IconResult) => Promise<void>
  onTogglePinned: (icon: IconResult) => void
  onPrepareDrag: (icon: IconResult) => void
  getDragSvg: (icon: IconResult) => string | null
  onDragComplete: (icon: IconResult, result: DragCompleteResult) => void
  renderOptions: IconRenderOptions
}

function IconCard({
  icon,
  isPinned,
  onInsert,
  onTogglePinned,
  onPrepareDrag,
  getDragSvg,
  onDragComplete,
  renderOptions,
}: IconCardProps) {
  const cardRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const node = cardRef.current
    if (!node) return

    try {
      return framer.makeDraggable(
        node,
        () => {
          const svg = getDragSvg(icon)
          if (!svg) onPrepareDrag(icon)

          return {
            type: 'svg',
            svg: svg || createRemoteSvgShell(icon, renderOptions),
            name: `${safeFileName(icon.name)}.svg`,
            previewImage: icon.svgUrl,
            invertInDarkMode: false,
          }
        },
        (result) => onDragComplete(icon, result),
      )
    } catch {
      return undefined
    }
  }, [getDragSvg, icon, onDragComplete, onPrepareDrag, renderOptions])

  return (
    <article
      ref={cardRef}
      className="icon-card"
      onPointerEnter={() => onPrepareDrag(icon)}
      title={`${icon.name} - ${icon.libraryName}`}
    >
      <button
        type="button"
        className="icon-insert-button"
        onClick={() => void onInsert(icon)}
        onFocus={() => onPrepareDrag(icon)}
      >
        <span className="icon-preview">
          <img alt="" src={icon.svgUrl} loading="lazy" decoding="async" />
        </span>
        <span className="icon-name">{icon.name}</span>
        <span className="icon-library">{shortLibraryLabel(icon.libraryName)}</span>
      </button>
      <button
        type="button"
        className={isPinned ? 'pin-button active' : 'pin-button'}
        onClick={() => onTogglePinned(icon)}
        aria-label={isPinned ? `Unpin ${icon.name}` : `Pin ${icon.name}`}
        title={isPinned ? 'Unpin' : 'Pin'}
      >
        {isPinned ? 'Pinned' : 'Pin'}
      </button>
    </article>
  )
}

function authHeaders(token: string) {
  return {
    accept: 'application/json',
    authorization: `Bearer ${token}`,
    'x-iconsearch-product': PRODUCT,
  }
}

function applyLibraryParams(url: URL, value: string) {
  if (value === 'all') return
  if (value === 'iconify') {
    url.searchParams.set('lib', 'iconify')
    return
  }
  if (value.startsWith('iconify:')) {
    url.searchParams.set('lib', 'iconify')
    url.searchParams.set('iconifySet', value.slice('iconify:'.length))
    return
  }
  url.searchParams.set('lib', value)
}

function normalizeIcon(value: ApiIcon): IconResult | null {
  const name = String(value.name || '')
  const library = String(value.library || '')
  if (!name || !library) return null

  const svgUrl = normalizeSvgUrl(String(value.svgUrl || ''), library, name)
  if (!svgUrl) return null

  return {
    id: String(value.id || `${library}-${name}`),
    name,
    library,
    libraryName: String(value.libraryName || getLibraryLabel(library)),
    svgUrl,
    iconifyName: String(value.iconifyName || toIconifyName(library, name)),
  }
}

function normalizeSvgUrl(url: string, library: string, name: string) {
  const dashedName = name.replace(/_/g, '-')
  if (library === 'patternfly-icons') {
    return normalizeTrustedSvgUrl(`${ICONSEARCH_ORIGIN}/api/icon-preview/patternfly-icons/${dashedName}?v=named-library-preview-v3`)
  }
  if (library === 'untitled-ui-icons') {
    return normalizeTrustedSvgUrl(`${ICONSEARCH_ORIGIN}/api/icon-preview/untitled-ui-icons/${dashedName}?v=named-library-preview-v4`)
  }

  const trustedUrl = normalizeTrustedSvgUrl(url)
  if (trustedUrl) return trustedUrl
  if (url.startsWith('//') || /^https?:\/\//i.test(url)) return ''

  const prefixes: Record<string, string> = {
    'lucide-icons': 'lucide',
    heroicons: 'heroicons',
    'tabler-icons': 'tabler',
    'untitled-ui-icons': 'untitled-ui-icons',
    'phosphor-icons': 'ph',
    'remix-icon': 'ri',
    'feather-icons': 'feather',
    'bootstrap-icons': 'bi',
    'radix-icons': 'radix-icons',
    iconoir: 'iconoir',
    ionicons: 'ion',
    octicons: 'octicon',
    'ant-design-icons': 'ant-design',
    devicons: 'devicon',
    teenyicons: 'teenyicons',
    'circum-icons': 'circum',
    'elusive-icons': 'el',
  }

  if (library.startsWith('iconify-')) {
    return normalizeTrustedSvgUrl(`${ICONIFY_ORIGIN}/${library.replace(/^iconify-/, '')}/${dashedName}.svg`)
  }

  const prefix = prefixes[library]
  return prefix ? normalizeTrustedSvgUrl(`${ICONIFY_ORIGIN}/${prefix}/${dashedName}.svg`) : ''
}

function normalizeTrustedSvgUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const normalized = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed
  if (!/^https?:\/\//i.test(normalized)) return ''

  try {
    const parsed = new URL(normalized)
    if (parsed.protocol !== 'https:') return ''
    if (!TRUSTED_SVG_ORIGINS.has(parsed.origin)) return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

function isTrustedSvgUrl(value: string) {
  return Boolean(normalizeTrustedSvgUrl(value))
}

function toIconifyName(library: string, name: string) {
  const prefixMap: Record<string, string> = {
    'lucide-icons': 'lucide',
    heroicons: 'heroicons',
    'tabler-icons': 'tabler',
    'untitled-ui-icons': 'untitled-ui-icons',
    'phosphor-icons': 'ph',
    'remix-icon': 'ri',
    'feather-icons': 'feather',
    'bootstrap-icons': 'bi',
    'radix-icons': 'radix-icons',
    iconoir: 'iconoir',
    ionicons: 'ion',
    octicons: 'octicon',
    'ant-design-icons': 'ant-design',
    devicons: 'devicon',
    teenyicons: 'teenyicons',
    'circum-icons': 'circum',
    'elusive-icons': 'el',
  }
  const prefix = library.startsWith('iconify-') ? library.replace(/^iconify-/, '') : prefixMap[library]
  return `${prefix || library}:${name.replace(/_/g, '-')}`
}

function getLibraryLabel(library: string) {
  const found = namedLibraries.find(([id]) => id === library)
  if (found) return found[1]
  if (library.startsWith('iconify-')) return `${formatIconifySet(library.replace(/^iconify-/, ''))} (Iconify)`
  return library
}

function formatIconifySet(value: string) {
  return String(value)
    .replace(/^iconify-/, '')
    .split('-')
    .map((part) => acronymParts.has(part) ? part.toUpperCase() : `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

async function fetchSvg(icon: IconResult) {
  if (!isTrustedSvgUrl(icon.svgUrl)) {
    throw new Error('SVG source is not on the trusted IconSearch allowlist.')
  }

  const response = await fetch(icon.svgUrl, { headers: { accept: 'image/svg+xml,text/plain,*/*' } })
  if (!response.ok) throw new Error(`SVG source returned ${response.status}`)
  const text = await response.text()
  if (!text.includes('<svg')) throw new Error('The source did not return SVG markup.')
  return text.trim()
}

function mergeUniqueIcons(items: IconResult[]) {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

function createDragCacheKey(icon: IconResult, options: IconRenderOptions) {
  return [
    icon.id,
    options.size,
    options.useOriginalColors ? 'original' : normalizeIconColor(options.color),
  ].join('\u001f')
}

function getEmptyTitle({
  error,
  query,
  showHome,
  showPinnedOnly,
}: {
  error: string
  query: string
  showHome: boolean
  showPinnedOnly: boolean
}) {
  if (error) return error
  if (showPinnedOnly) return 'No pinned icons yet.'
  if (query.trim().length === 1) return 'Keep typing to search.'
  if (showHome) return 'Search for an icon to get started.'
  return 'No icons found.'
}

function getEmptyBody({
  query,
  showHome,
  showPinnedOnly,
}: {
  query: string
  showHome: boolean
  showPinnedOnly: boolean
}) {
  if (showPinnedOnly) return 'Pin any icon to keep it available above recent results.'
  if (query.trim().length === 1) return 'Use at least 2 characters, or choose a library filter.'
  if (showHome) return 'Try "home", "arrow", "chart", "calendar", or "settings".'
  return 'Try a broader query, another style, or turn off Legal-safe only.'
}

function shortLibraryLabel(label: string) {
  return label
    .replace(/\s+\(Iconify\)$/i, '')
    .replace(/\s+Icons$/i, '')
    .replace(/\s+Icon$/i, '')
}

function prepareSvgForFramer(svg: string, options: IconRenderOptions) {
  const parser = new DOMParser()
  const document = parser.parseFromString(svg, 'image/svg+xml')
  const root = document.documentElement

  if (!root || root.tagName.toLowerCase() !== 'svg' || document.querySelector('parsererror')) {
    throw new Error('Could not parse SVG markup.')
  }

  document.querySelectorAll('script, foreignObject').forEach((node) => node.remove())
  document.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const value = attribute.value.trim().toLowerCase()
      if (attribute.name.toLowerCase().startsWith('on') || value.startsWith('javascript:')) {
        node.removeAttribute(attribute.name)
      }
    })
  })

  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  if (!root.getAttribute('viewBox')) {
    const width = parseSvgLength(root.getAttribute('width'))
    const height = parseSvgLength(root.getAttribute('height'))
    root.setAttribute('viewBox', `0 0 ${formatSvgNumber(width || 24)} ${formatSvgNumber(height || width || 24)}`)
  }

  root.setAttribute('width', String(options.size))
  root.setAttribute('height', String(options.size))
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet')

  if (!options.useOriginalColors) {
    applySvgColor(document, root, normalizeIconColor(options.color))
  }

  return new XMLSerializer().serializeToString(root)
}

function createRemoteSvgShell(icon: IconResult, options: IconRenderOptions) {
  const url = escapeXml(icon.svgUrl)
  const size = formatSvgNumber(options.size)
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    `<image href="${url}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid meet" />`,
    '</svg>',
  ].join('')
}

function applySvgColor(document: Document, root: Element, color: string) {
  root.setAttribute('color', color)
  if (shouldRecolorPaint(root.getAttribute('fill'))) root.setAttribute('fill', color)
  if (shouldRecolorPaint(root.getAttribute('stroke'))) root.setAttribute('stroke', color)

  document.querySelectorAll('*').forEach((node) => {
    const tagName = node.tagName.toLowerCase()
    if (node === root || nonGraphicSvgTags.has(tagName)) return

    const style = node.getAttribute('style')
    if (style) {
      const nextStyle = recolorInlineStyle(style, color)
      if (nextStyle) {
        node.setAttribute('style', nextStyle)
      } else {
        node.removeAttribute('style')
      }
    }

    const fill = node.getAttribute('fill')
    const stroke = node.getAttribute('stroke')
    if (shouldRecolorPaint(fill)) node.setAttribute('fill', color)
    if (shouldRecolorPaint(stroke)) node.setAttribute('stroke', color)
  })
}

function recolorInlineStyle(style: string, color: string) {
  return style
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex < 0) return declaration
      const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
      const value = declaration.slice(separatorIndex + 1).trim()
      if (!['color', 'fill', 'stroke'].includes(property)) return declaration
      return shouldRecolorPaint(value) ? `${property}: ${color}` : `${property}: ${value}`
    })
    .join('; ')
}

function shouldRecolorPaint(value: string | null) {
  if (!value) return true
  const normalized = value.trim().toLowerCase()
  if (!normalized || normalized === 'inherit' || normalized === 'currentcolor') return true
  if (normalized === 'none' || normalized === 'transparent') return false
  return !normalized.startsWith('url(')
}

function parseSvgLength(value: string | null) {
  if (!value) return null
  if (/%|em|rem|vh|vw|calc|auto/i.test(value)) return null
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

function formatSvgNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

function normalizeIconColor(value: string) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : DEFAULT_ICON_COLOR
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function normalizeAccess(value: Access | undefined): Access | null {
  if (!value || typeof value !== 'object') return null
  return {
    email: String(value.email || ''),
    product: String(value.product || PRODUCT),
    tier: String(value.tier || 'free'),
    founderNumber: typeof value.founderNumber === 'number' ? value.founderNumber : null,
    expiresAt: String(value.expiresAt || ''),
  }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) as T : fallback
  } catch {
    return fallback
  }
}

function readSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
    const value = window.sessionStorage.getItem(SESSION_KEY)
    return value ? JSON.parse(value) as Session : null
  } catch {
    return null
  }
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'icon'
}

function notify(message: string) {
  const maybeFramer = framer as unknown as { notify?: (text: string) => void }
  maybeFramer.notify?.(message)
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
