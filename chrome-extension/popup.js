const API_BASE = 'https://iconsearch.info'
const SEARCH_API_URL = `${API_BASE}/api/extension/icon-search`
const AUTH_API_URL = `${API_BASE}/api`
const PRODUCT = 'chrome'
const SESSION_KEY = 'iconsearchChromeSession'
const PENDING_AUTH_KEY = 'iconsearchChromePendingAuth'
const RECENT_KEY = 'iconsearchChromeRecent'
const FAVORITES_KEY = 'iconsearchChromeFavorites'
const SETTINGS_KEY = 'iconsearchChromeSettings'
const PAGE_SIZE = 144
const LOAD_AHEAD_PX = 2800
const AUTO_FILL_DELAY_MS = 45
const PAGE_CACHE_LIMIT = 12
const DRAG_CACHE_LIMIT = 80
const DEFAULT_OUTPUT_SIZE = 256
const DRAG_PREWARM_COUNT = 18
const DRAG_PREWARM_STAGGER_MS = 65
const SEARCHABLE_ICON_COUNT = 355702
const PRIVACY_URL = `${API_BASE}/privacy-policy`
const LICENSES_URL = `${API_BASE}/licenses`
const SUPPORT_URL = `${API_BASE}/contact`
const EXTENSION_URL = `${API_BASE}/chrome-extension`
const DEFAULT_SETTINGS = {
  outputSize: DEFAULT_OUTPUT_SIZE,
  outputColor: '#000000',
  originalColor: true,
}
const OUTPUT_SIZES = new Set([24, 32, 48, 64, 128, 256, 512, 768])
const SAFE_SVG_STYLE_PROPERTIES = new Set([
  'clip-rule',
  'color',
  'display',
  'fill',
  'fill-opacity',
  'fill-rule',
  'opacity',
  'stop-color',
  'stop-opacity',
  'stroke',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'stroke-miterlimit',
  'stroke-opacity',
  'stroke-width',
  'vector-effect',
  'visibility',
])

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
]

const acronymParts = new Set(['ai', 'bi', 'fa', 'gis', 'ic', 'mdi', 'svg', 'ui'])

const state = {
  token: '',
  access: null,
  icons: [],
  visibleIcons: [],
  total: 0,
  totalPages: 0,
  page: 1,
  query: '',
  library: 'all',
  style: 'all',
  legalOnly: true,
  format: 'graphic',
  loading: false,
  requestId: 0,
  recent: [],
  iconifySets: [],
  selectedIcon: null,
  observer: null,
  pageCache: new Map(),
  dragCache: new Map(),
  dragPreparing: new Map(),
  favorites: [],
  showingFavorites: false,
  focusedIndex: -1,
  settings: { ...DEFAULT_SETTINGS },
}

const elements = {
  unlockView: document.querySelector('#unlockView'),
  searchView: document.querySelector('#searchView'),
  signInBtn: document.querySelector('#signInBtn'),
  signOutBtn: document.querySelector('#signOutBtn'),
  aboutBtn: document.querySelector('#aboutBtn'),
  authStatus: document.querySelector('#authStatus'),
  accessLabel: document.querySelector('#accessLabel'),
  searchInput: document.querySelector('#searchInput'),
  librarySelect: document.querySelector('#librarySelect'),
  styleSelect: document.querySelector('#styleSelect'),
  sizeSelect: document.querySelector('#sizeSelect'),
  colorInput: document.querySelector('#colorInput'),
  originalColor: document.querySelector('#originalColor'),
  legalOnly: document.querySelector('#legalOnly'),
  pinnedBtn: document.querySelector('#pinnedBtn'),
  favoriteCount: document.querySelector('#favoriteCount'),
  resultStatus: document.querySelector('#resultStatus'),
  emptyState: document.querySelector('#emptyState'),
  resultsPanel: document.querySelector('.results-panel'),
  resultsGrid: document.querySelector('#resultsGrid'),
  loadingShelf: document.querySelector('#loadingShelf'),
  loadSentinel: document.querySelector('#loadSentinel'),
  modeButtons: Array.from(document.querySelectorAll('.mode-btn')),
  actionSheet: document.querySelector('#actionSheet'),
  sheetTitle: document.querySelector('#sheetTitle'),
  sheetSource: document.querySelector('#sheetSource'),
  sheetPinBtn: document.querySelector('#sheetPinBtn'),
  sheetCloseControls: Array.from(document.querySelectorAll('[data-sheet-close]')),
  sheetActionButtons: Array.from(document.querySelectorAll('[data-sheet-action]')),
  aboutSheet: document.querySelector('#aboutSheet'),
  versionLabel: document.querySelector('#versionLabel'),
  aboutCloseControls: Array.from(document.querySelectorAll('[data-about-close]')),
  externalLinkButtons: Array.from(document.querySelectorAll('[data-open-url]')),
}

void boot()

async function boot() {
  renderLibraryOptions()
  bindEvents()
  renderVersion()

  const saved = await chrome.storage.local.get([SESSION_KEY, PENDING_AUTH_KEY, RECENT_KEY, FAVORITES_KEY, SETTINGS_KEY])
  const session = saved[SESSION_KEY]
  const pendingAuth = normalizePendingAuth(saved[PENDING_AUTH_KEY])
  state.recent = normalizeIconList(saved[RECENT_KEY])
  state.favorites = normalizeIconList(saved[FAVORITES_KEY])
  state.settings = normalizeSettings(saved[SETTINGS_KEY])
  applySettingsToControls()
  renderFavoriteCount()

  if (saved[PENDING_AUTH_KEY] && !pendingAuth) {
    await chrome.storage.local.remove(PENDING_AUTH_KEY)
  }

  if (session && typeof session.token === 'string') {
    state.token = session.token
    state.access = session.access || null
    showSearch()
    await refreshAccess()
    if (state.token) await loadCatalog()
    renderRecentOrEmpty()
  } else {
    showUnlock()
    if (pendingAuth) {
      await resumePendingSignIn(pendingAuth)
    }
  }
}

function bindEvents() {
  elements.signInBtn.addEventListener('click', () => {
    void beginSignIn()
  })

  elements.signOutBtn.addEventListener('click', () => {
    void signOut()
  })

  elements.aboutBtn.addEventListener('click', showAboutSheet)

  elements.searchInput.addEventListener('input', debounce(() => {
    state.query = elements.searchInput.value.trim()
    void search({ page: 1, append: false })
  }, 220))

  elements.librarySelect.addEventListener('change', () => {
    state.library = elements.librarySelect.value
    void search({ page: 1, append: false })
  })

  elements.styleSelect.addEventListener('change', () => {
    state.style = elements.styleSelect.value
    void search({ page: 1, append: false })
  })

  elements.legalOnly.addEventListener('change', () => {
    state.legalOnly = elements.legalOnly.checked
    void search({ page: 1, append: false })
  })

  elements.sizeSelect.addEventListener('change', () => {
    updateOutputSettings({ outputSize: Number(elements.sizeSelect.value) })
  })

  elements.colorInput.addEventListener('input', () => {
    updateOutputSettings({ outputColor: elements.colorInput.value })
  })

  elements.originalColor.addEventListener('change', () => {
    updateOutputSettings({ originalColor: elements.originalColor.checked })
  })

  elements.pinnedBtn.addEventListener('click', () => {
    if (state.showingFavorites) {
      state.showingFavorites = false
      renderRecentOrEmpty()
    } else {
      renderFavorites()
    }
  })

  elements.modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.format = button.dataset.format || 'graphic'
      elements.modeButtons.forEach((item) => item.classList.toggle('active', item === button))
    })
  })

  elements.sheetCloseControls.forEach((button) => {
    button.addEventListener('click', closeActionSheet)
  })

  elements.aboutCloseControls.forEach((button) => {
    button.addEventListener('click', closeAboutSheet)
  })

  elements.externalLinkButtons.forEach((button) => {
    button.addEventListener('click', () => {
      void chrome.tabs.create({ url: button.dataset.openUrl || EXTENSION_URL, active: true })
    })
  })

  elements.sheetActionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      void handleSheetAction(button.dataset.sheetAction || '')
    })
  })

  document.addEventListener('keydown', handleKeyboardNavigation)

  state.observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      void loadMore()
    }
  }, { root: elements.resultsPanel, rootMargin: `${LOAD_AHEAD_PX}px 0px` })
  state.observer.observe(elements.loadSentinel)

  elements.resultsPanel.addEventListener('scroll', () => {
    const node = elements.resultsPanel
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight
    if (remaining < LOAD_AHEAD_PX) void loadMore()
  }, { passive: true })
}

function renderLibraryOptions() {
  const selected = elements.librarySelect.value || state.library
  const allLabel = 'All libraries'
  const iconifyLabel = 'Iconify collections'
  const namedOptions = namedLibraries
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join('')
  const iconifyOptions = state.iconifySets
    .map((set) => `<option value="iconify:${escapeHtml(set)}">${escapeHtml(formatIconifySet(set))}</option>`)
    .join('')

  elements.librarySelect.innerHTML = `
    <option value="all">${escapeHtml(allLabel)}</option>
    <optgroup label="Named libraries">
      ${namedOptions}
    </optgroup>
    <optgroup label="${escapeAttribute(iconifyLabel)}">
      <option value="iconify">All Iconify collections</option>
      ${iconifyOptions}
    </optgroup>
  `

  const nextValue = Array.from(elements.librarySelect.options).some((option) => option.value === selected)
    ? selected
    : 'all'
  elements.librarySelect.value = nextValue
  state.library = nextValue
}

async function loadCatalog() {
  if (!state.token) return

  try {
    const url = new URL(SEARCH_API_URL)
    url.searchParams.set('limit', '1')
    url.searchParams.set('page', '1')
    url.searchParams.set('sort', 'popular')
    url.searchParams.set('legalOnly', '0')

    const response = await fetch(url.toString(), {
      headers: authHeaders(),
    })
    const payload = await response.json()
    if (!response.ok) return

    const sets = Array.isArray(payload.facets?.iconifySets)
      ? payload.facets.iconifySets.filter((set) => typeof set === 'string')
      : []
    if (sets.length > 0) {
      state.iconifySets = sets
      renderLibraryOptions()
    }
  } catch {
    renderLibraryOptions()
  }
}

function showUnlock() {
  elements.unlockView.classList.remove('hidden')
  elements.searchView.classList.add('hidden')
  closeActionSheet()
}

function showSearch() {
  elements.unlockView.classList.add('hidden')
  elements.searchView.classList.remove('hidden')
  const access = state.access || {}
  const tier = access.tier === 'founder' && access.founderNumber
    ? `Founder #${access.founderNumber}`
    : 'Free access'
  elements.accessLabel.textContent = access.email ? `${access.email} - ${tier}` : tier
}

async function beginSignIn() {
  elements.signInBtn.disabled = true
  elements.signInBtn.textContent = 'Waiting for approval...'
  elements.authStatus.textContent = 'Opening secure sign-in in your browser...'

  try {
    const startResponse = await fetch(`${AUTH_API_URL}/device/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ product: PRODUCT, clientName: `Chrome ${navigator.userAgent.slice(0, 44)}` }),
    })
    const startPayload = await startResponse.json()
    if (!startResponse.ok) throw new Error(startPayload.error || 'Could not start sign-in.')

    const deviceCode = startPayload.deviceCode
    const verificationUrl = startPayload.verificationUriComplete
    if (!deviceCode || !verificationUrl) throw new Error('The sign-in response was incomplete.')

    const pendingAuth = {
      deviceCode,
      deadline: Date.now() + (Number(startPayload.expiresIn) || 600) * 1000,
      interval: Math.max(2, Number(startPayload.interval) || 3) * 1000,
    }

    await chrome.storage.local.set({ [PENDING_AUTH_KEY]: pendingAuth })
    await chrome.tabs.create({ url: verificationUrl, active: true })
    elements.authStatus.textContent = 'Approve the connection in your browser, then reopen this popup.'
    await completeSignIn(pendingAuth)
  } catch (error) {
    await chrome.storage.local.remove(PENDING_AUTH_KEY)
    elements.authStatus.textContent = error instanceof Error ? error.message : 'Could not connect your account.'
  } finally {
    elements.signInBtn.disabled = false
    elements.signInBtn.textContent = 'Sign in with IconSearch'
  }
}

async function resumePendingSignIn(pendingAuth) {
  elements.signInBtn.disabled = true
  elements.signInBtn.textContent = 'Checking approval...'
  elements.authStatus.textContent = 'Checking whether your browser approval finished...'

  try {
    await completeSignIn(pendingAuth)
  } catch (error) {
    await chrome.storage.local.remove(PENDING_AUTH_KEY)
    elements.authStatus.textContent = error instanceof Error
      ? error.message
      : 'The sign-in link expired. Please try again.'
  } finally {
    elements.signInBtn.disabled = false
    elements.signInBtn.textContent = 'Sign in with IconSearch'
  }
}

async function completeSignIn(pendingAuth) {
  const pending = normalizePendingAuth(pendingAuth)
  if (!pending) throw new Error('The sign-in link expired. Please try again.')

  while (Date.now() < pending.deadline) {
    const statusResponse = await fetch(`${AUTH_API_URL}/device/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ deviceCode: pending.deviceCode }),
    })
    const statusPayload = await statusResponse.json()

    if (statusPayload.status === 'pending') {
      await delay(pending.interval)
      continue
    }

    if (statusPayload.status !== 'authorized' || !statusPayload.token) {
      throw new Error(statusPayload.error || 'The sign-in request was not approved.')
    }

    state.token = statusPayload.token
    state.access = normalizeAccess(statusPayload.access)
    await chrome.storage.local.set({ [SESSION_KEY]: { token: state.token, access: state.access } })
    await chrome.storage.local.remove(PENDING_AUTH_KEY)
    showSearch()
    await loadCatalog()
    renderRecentOrEmpty()
    return
  }

  await chrome.storage.local.remove(PENDING_AUTH_KEY)
  throw new Error('The sign-in link expired. Please try again.')
}

function normalizePendingAuth(value) {
  if (!value || typeof value !== 'object') return null

  const deviceCode = typeof value.deviceCode === 'string' ? value.deviceCode : ''
  const deadline = Number(value.deadline)
  const interval = Math.max(2000, Number(value.interval || 3000))

  if (!deviceCode || !Number.isFinite(deadline) || deadline <= Date.now()) return null

  return { deviceCode, deadline, interval }
}

async function refreshAccess() {
  if (!state.token) return

  try {
    const response = await fetch(`${AUTH_API_URL}/entitlements/me`, {
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${state.token}`,
      },
    })
    if (response.status === 401) {
      await signOut(false)
      return
    }
    if (!response.ok) return

    const payload = await response.json()
    state.access = normalizeAccess(payload.access)
    await chrome.storage.local.set({ [SESSION_KEY]: { token: state.token, access: state.access } })
    showSearch()
  } catch {
    showSearch()
  }
}

async function signOut(callApi = true) {
  const token = state.token
  state.token = ''
  state.access = null
  state.icons = []
  state.pageCache.clear()

  if (callApi && token) {
    try {
      await fetch(`${AUTH_API_URL}/device/revoke`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      })
    } catch {}
  }

  await chrome.storage.local.remove([SESSION_KEY, PENDING_AUTH_KEY])
  showUnlock()
}

function getSearchSnapshot() {
  return {
    query: elements.searchInput.value.trim(),
    library: elements.librarySelect.value,
    style: elements.styleSelect.value,
    legalOnly: elements.legalOnly.checked,
  }
}

function createSearchCacheKey(snapshot, page) {
  return [
    snapshot.query,
    snapshot.library,
    snapshot.style,
    snapshot.legalOnly ? '1' : '0',
    page,
  ].join('\u001f')
}

function isPromise(value) {
  return Boolean(value && typeof value.then === 'function')
}

function buildSearchUrl(snapshot, page) {
  const url = new URL(SEARCH_API_URL)
  if (snapshot.query) url.searchParams.set('q', snapshot.query)
  url.searchParams.set('limit', String(PAGE_SIZE))
  url.searchParams.set('page', String(page))
  url.searchParams.set('sort', 'relevance')
  url.searchParams.set('legalOnly', snapshot.legalOnly ? '1' : '0')
  applyLibraryParams(url, snapshot.library)
  if (snapshot.style !== 'all') url.searchParams.set('style', snapshot.style)
  return url
}

async function fetchSearchPage(snapshot, page) {
  const response = await fetch(buildSearchUrl(snapshot, page).toString(), {
    headers: authHeaders(),
  })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || `IconSearch API returned ${response.status}`)

  const icons = Array.isArray(payload.icons) ? payload.icons.map(normalizeIcon).filter(Boolean) : []
  return {
    icons,
    total: Number(payload.total) || icons.length,
    totalPages: Number(payload.totalPages) || Math.ceil((Number(payload.total) || icons.length) / PAGE_SIZE),
    iconifySets: Array.isArray(payload.facets?.iconifySets)
      ? payload.facets.iconifySets.filter((set) => typeof set === 'string')
      : [],
  }
}

async function readSearchPage(snapshot, page) {
  const key = createSearchCacheKey(snapshot, page)
  const cached = state.pageCache.get(key)
  if (cached) return cached

  const promise = fetchSearchPage(snapshot, page)
  state.pageCache.set(key, promise)

  try {
    const payload = await promise
    state.pageCache.set(key, payload)
    trimMap(state.pageCache, PAGE_CACHE_LIMIT)
    return payload
  } catch (error) {
    state.pageCache.delete(key)
    throw error
  }
}

function prefetchSearchPage(snapshot, page) {
  if (!state.token || page < 1) return

  const key = createSearchCacheKey(snapshot, page)
  if (state.pageCache.has(key)) return

  const promise = fetchSearchPage(snapshot, page)
    .then((payload) => {
      state.pageCache.set(key, payload)
      trimMap(state.pageCache, PAGE_CACHE_LIMIT)
      return payload
    })
    .catch((error) => {
      state.pageCache.delete(key)
      throw error
    })

  state.pageCache.set(key, promise)
  void promise.catch(() => {})
}

function showLoadingShelf(show) {
  elements.loadingShelf.classList.toggle('hidden', !show)
}

async function search({ page, append }) {
  state.showingFavorites = false
  renderFavoriteCount()
  const snapshot = getSearchSnapshot()
  const hasFilter = snapshot.library !== 'all' || snapshot.style !== 'all'
  if (snapshot.query.length === 1 || (!snapshot.query && !hasFilter)) {
    state.icons = []
    state.total = 0
    state.totalPages = 0
    state.page = 1
    state.pageCache.clear()
    showLoadingShelf(false)
    renderRecentOrEmpty()
    return
  }

  const requestId = ++state.requestId
  const cached = state.pageCache.get(createSearchCacheKey(snapshot, page))
  const hasResolvedCachedPage = Boolean(cached && !isPromise(cached))
  state.loading = true
  let shouldRefill = false
  state.query = snapshot.query
  state.library = snapshot.library
  state.style = snapshot.style
  state.legalOnly = snapshot.legalOnly
  state.page = page

  if (!append) {
    elements.resultsGrid.innerHTML = ''
    elements.emptyState.classList.add('hidden')
    elements.resultStatus.textContent = 'Searching online...'
    showLoadingShelf(false)
  } else if (!hasResolvedCachedPage) {
    showLoadingShelf(true)
    elements.resultStatus.textContent = `Loading more from ${state.total.toLocaleString('en-US')} results...`
  } else {
    showLoadingShelf(false)
  }

  try {
    const payload = await readSearchPage(snapshot, page)
    if (requestId !== state.requestId) return

    const icons = payload.icons
    state.total = payload.total
    state.totalPages = payload.totalPages
    state.icons = append ? state.icons.concat(icons) : icons

    if (payload.iconifySets.length > state.iconifySets.length) {
      state.iconifySets = payload.iconifySets
      renderLibraryOptions()
    }

    renderResults(append ? icons : state.icons, append)
    shouldRefill = icons.length > 0
    elements.resultStatus.textContent = `${state.icons.length.toLocaleString('en-US')} shown from ${state.total.toLocaleString('en-US')} online results`
    if (state.icons.length === 0) showEmpty('No icons found. Try a broader query or another library.')
    if (icons.length > 0 && page < state.totalPages) prefetchSearchPage(snapshot, page + 1)
  } catch (error) {
    if (requestId !== state.requestId) return
    if (append) {
      elements.resultStatus.textContent = error instanceof Error ? error.message : 'Could not load more icons.'
    } else {
      showEmpty(error instanceof Error ? error.message : 'Online search failed.')
      elements.resultStatus.textContent = 'Could not load icons.'
    }
  } finally {
    if (requestId === state.requestId) {
      state.loading = false
      showLoadingShelf(false)
      if (shouldRefill) queueViewportRefill()
    }
  }
}

async function loadMore() {
  if (state.loading || !state.token) return
  if (state.showingFavorites) return
  if (!state.query && state.library === 'all' && state.style === 'all') return
  if (state.totalPages && state.page >= state.totalPages) return

  await search({ page: state.page + 1, append: true })
}

function queueViewportRefill() {
  window.setTimeout(() => {
    if (state.loading || !state.token) return
    if (state.showingFavorites) return
    if (!state.query && state.library === 'all' && state.style === 'all') return
    if (state.totalPages && state.page >= state.totalPages) return

    const node = elements.resultsPanel
    const remaining = node.scrollHeight - node.scrollTop - node.clientHeight
    if (remaining < LOAD_AHEAD_PX) void loadMore()
  }, AUTO_FILL_DELAY_MS)
}

function renderResults(icons, append) {
  if (!append) {
    elements.resultsGrid.innerHTML = ''
    state.focusedIndex = -1
    state.visibleIcons = icons.slice()
  } else {
    state.visibleIcons = state.visibleIcons.concat(icons)
  }
  elements.emptyState.classList.add('hidden')

  const fragment = document.createDocumentFragment()
  icons.forEach((icon, index) => {
    const eager = !append && index < 36
    const pinned = isFavorite(icon.id)
    const card = document.createElement('article')
    card.className = `icon-card${pinned ? ' is-pinned' : ''}`
    card.draggable = true
    card.tabIndex = 0
    card.dataset.iconId = icon.id
    card.setAttribute('aria-label', `${icon.name} from ${icon.libraryName}`)
    card.innerHTML = `
      <div class="icon-preview">
        <img alt="" src="${escapeAttribute(icon.svgUrl)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">
      </div>
      <div class="icon-meta">
        <strong title="${escapeAttribute(icon.name)}">${escapeHtml(icon.name)}</strong>
        <small title="${escapeAttribute(icon.libraryName)}">${escapeHtml(icon.libraryName)}</small>
        <small class="icon-license" title="${escapeAttribute(formatIconSource(icon))}">${escapeHtml(formatIconLicense(icon))}</small>
      </div>
      <div class="card-actions">
        <button class="primary" type="button" data-action="copy">Copy</button>
        <button class="${pinned ? 'active' : ''}" type="button" data-action="pin">${pinned ? 'Pinned' : 'Pin'}</button>
        <button class="icon-action" type="button" data-action="more" title="Actions" aria-label="Actions">...</button>
      </div>
    `

    const copyButton = card.querySelector('[data-action="copy"]')
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        void runAction(() => copyIcon(icon, copyButton))
      })
    }
    const pinButton = card.querySelector('[data-action="pin"]')
    if (pinButton) {
      pinButton.addEventListener('click', () => {
        void toggleFavorite(icon)
      })
    }
    card.querySelector('[data-action="more"]').addEventListener('click', () => {
      showIconActions(icon)
    })
    card.addEventListener('focus', () => {
      state.focusedIndex = Array.from(elements.resultsGrid.querySelectorAll('.icon-card')).indexOf(card)
    })
    card.addEventListener('dragstart', (event) => handleIconDragStart(event, icon, card))
    card.addEventListener('dragend', () => card.classList.remove('is-dragging'))
    card.addEventListener('pointerenter', () => prepareDragAssetSoon(icon, card))
    card.addEventListener('focusin', () => prepareDragAssetSoon(icon, card))
    fragment.appendChild(card)
  })

  elements.resultsGrid.appendChild(fragment)
  prewarmDragAssets(icons.slice(0, append ? 10 : 24))
  queueViewportRefill()
}

function renderRecentOrEmpty() {
  state.showingFavorites = false
  renderFavoriteCount()
  showLoadingShelf(false)
  if (state.recent.length > 0) {
    elements.emptyState.classList.add('hidden')
    renderResults(state.recent, false)
    elements.resultStatus.textContent = `Recent icons - ${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} searchable online`
    return
  }

  elements.resultsGrid.innerHTML = ''
  showEmpty('Search the live IconSearch API, or pick from recent icons after your first copy.')
  elements.resultStatus.textContent = `${SEARCHABLE_ICON_COUNT.toLocaleString('en-US')} online icons ready`
}

function renderFavorites() {
  state.showingFavorites = true
  renderFavoriteCount()
  showLoadingShelf(false)

  if (!state.favorites.length) {
    showEmpty('Pinned icons will appear here.')
    elements.resultStatus.textContent = 'No pinned icons yet.'
    return
  }

  elements.emptyState.classList.add('hidden')
  renderResults(state.favorites, false)
  state.showingFavorites = true
  renderFavoriteCount()
  elements.resultStatus.textContent = `${state.favorites.length.toLocaleString('en-US')} pinned icons`
}

function showEmpty(message) {
  elements.resultsGrid.innerHTML = ''
  state.visibleIcons = []
  state.focusedIndex = -1
  showLoadingShelf(false)
  elements.emptyState.textContent = message
  elements.emptyState.classList.remove('hidden')
}

function prewarmDragAssets(icons) {
  icons.slice(0, DRAG_PREWARM_COUNT).forEach((icon, index) => {
    window.setTimeout(() => {
      void prepareDragAsset(icon).catch(() => {})
    }, index * DRAG_PREWARM_STAGGER_MS)
  })
}

function prepareDragAssetSoon(icon, card) {
  if (state.dragCache.has(icon.id)) return

  card.classList.add('is-preparing')
  void prepareDragAsset(icon)
    .catch(() => {
      elements.resultStatus.textContent = 'Could not prepare this icon for drag. Use Copy, SVG, or URL instead.'
    })
    .finally(() => {
      card.classList.remove('is-preparing')
    })
}

function prepareDragAsset(icon) {
  const cached = state.dragCache.get(icon.id)
  if (cached) return Promise.resolve(cached)

  const preparing = state.dragPreparing.get(icon.id)
  if (preparing) return preparing

  const promise = fetchSvg(icon)
    .then(async (svg) => {
      const outputSize = getOutputSize()
      const cleanedSvg = prepareSvgForOutput(svg)
      const baseName = safeFileName(icon.name)
      const pngBlob = await svgToPngBlob(cleanedSvg, outputSize)
      const pngDataUrl = await blobToDataUrl(pngBlob)
      const asset = {
        svg: cleanedSvg,
        size: outputSize,
        pngFile: new File([pngBlob], `${baseName}-${outputSize}.png`, { type: 'image/png' }),
        pngDataUrl,
      }
      state.dragCache.set(icon.id, asset)
      trimMap(state.dragCache, DRAG_CACHE_LIMIT)
      return asset
    })
    .finally(() => {
      state.dragPreparing.delete(icon.id)
    })

  state.dragPreparing.set(icon.id, promise)
  return promise
}

function handleIconDragStart(event, icon, card) {
  const transfer = event.dataTransfer
  if (!transfer) return

  const cached = state.dragCache.get(icon.id)
  if (!cached) {
    event.preventDefault()
    card.classList.add('is-preparing')
    void prepareDragAsset(icon)
      .then(() => {
        elements.resultStatus.textContent = 'Drag image ready. Drag the icon again to drop it.'
      })
      .catch(() => {
        elements.resultStatus.textContent = 'Could not prepare this icon for drag. Use Copy, SVG, or URL instead.'
      })
      .finally(() => {
        card.classList.remove('is-preparing')
      })
    elements.resultStatus.textContent = 'Preparing a Google Docs-ready image. Drag again in a moment.'
    return
  }

  card.classList.add('is-dragging')
  transfer.effectAllowed = 'copy'

  try {
    transfer.clearData()
  } catch {}

  try {
    transfer.items?.add(cached.pngFile)
  } catch {}

  setTransferData(transfer, 'text/html', createPngDragHtml(cached.pngDataUrl, icon, cached.size))
  setTransferData(transfer, 'text/plain', cached.svg)
  setTransferData(transfer, 'image/png', cached.pngDataUrl)
  setTransferData(transfer, 'image/svg+xml', cached.svg)
  setTransferData(transfer, 'DownloadURL', `image/png:${cached.pngFile.name}:${cached.pngDataUrl}`)

  const preview = card.querySelector('.icon-preview')
  if (preview) {
    try {
      transfer.setDragImage(preview, 24, 24)
    } catch {}
  }

  void rememberIcon(icon)
  elements.resultStatus.textContent = `Dragging ${icon.name} as a PNG image.`
}

function setTransferData(transfer, type, value) {
  try {
    transfer.setData(type, value)
  } catch {}
}

function createPngDragHtml(dataUrl, icon, size = getOutputSize()) {
  return `<img src="${escapeAttribute(dataUrl)}" alt="${escapeAttribute(icon.name)}" width="${size}" height="${size}">`
}

async function copyIcon(icon) {
  const format = state.format
  let status = ''

  if (format === 'graphic') {
    const svg = await fetchSvg(icon)
    const graphicCopy = await writeGraphicToClipboard(svg)
    if (graphicCopy) {
      status = 'Copied a graphic. Paste it into Canva, Google Docs, or Slides.'
    } else {
      status = 'Chrome blocked graphic copy. Use SVG or URL mode for this icon.'
    }
  } else if (format === 'svg') {
    const svg = await fetchSvg(icon)
    await navigator.clipboard.writeText(prepareSvgForOutput(svg))
    status = 'Copied SVG markup.'
  } else {
    await navigator.clipboard.writeText(icon.svgUrl)
    status = 'Copied online SVG URL.'
  }

  await rememberIcon(icon)
  elements.resultStatus.textContent = status
}

function showIconActions(icon) {
  state.selectedIcon = icon
  elements.sheetTitle.textContent = icon.name
  elements.sheetSource.textContent = `${icon.libraryName} - ${formatIconLicense(icon)}`
  elements.sheetPinBtn.textContent = isFavorite(icon.id) ? 'Unpin icon' : 'Pin icon'
  elements.actionSheet.classList.remove('hidden')
  elements.actionSheet.setAttribute('aria-hidden', 'false')
}

function closeActionSheet() {
  state.selectedIcon = null
  elements.actionSheet.classList.add('hidden')
  elements.actionSheet.setAttribute('aria-hidden', 'true')
}

async function handleSheetAction(action) {
  const icon = state.selectedIcon
  if (!icon) return
  closeActionSheet()

  await runAction(async () => {
    if (action === 'copy') await copyIcon(icon)
    if (action === 'pin') await toggleFavorite(icon)
    if (action === 'svg') {
      const previous = state.format
      try {
        state.format = 'svg'
        await copyIcon(icon)
      } finally {
        state.format = previous
      }
    }
    if (action === 'url') {
      await navigator.clipboard.writeText(icon.svgUrl)
      await rememberIcon(icon)
      elements.resultStatus.textContent = 'Copied online SVG URL.'
    }
    if (action === 'license') await chrome.tabs.create({ url: icon.licenseUrl || LICENSES_URL, active: true })
    if (action === 'download') await downloadIcon(icon)
    if (action === 'open') await chrome.tabs.create({ url: icon.svgUrl, active: true })
  })
}

async function runAction(task) {
  try {
    await task()
  } catch (error) {
    elements.resultStatus.textContent = error instanceof Error ? error.message : 'Action failed.'
  }
}

async function downloadIcon(icon) {
  const svg = await fetchSvg(icon)
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(blob)
  await chrome.downloads.download({
    url,
    filename: `iconsearch/${safeFileName(icon.name)}.svg`,
    saveAs: false,
  })
  window.setTimeout(() => URL.revokeObjectURL(url), 15000)
  await rememberIcon(icon)
  elements.resultStatus.textContent = 'SVG download started.'
}

async function fetchSvg(icon) {
  const response = await fetch(icon.svgUrl, { headers: { accept: 'image/svg+xml,text/plain,*/*' } })
  if (!response.ok) throw new Error(`SVG source returned ${response.status}`)
  const text = await response.text()
  if (!text.includes('<svg')) throw new Error('The source did not return SVG markup.')
  return text.trim()
}

async function writeGraphicToClipboard(svg) {
  const outputSize = getOutputSize()
  const cleanedSvg = prepareSvgForOutput(svg)
  const richClipboardAvailable = typeof navigator.clipboard.write === 'function' && typeof globalThis.ClipboardItem === 'function'

  if (richClipboardAvailable) {
    const itemData = {}

    try {
      const pngBlob = await svgToPngBlob(cleanedSvg, outputSize)

      if (clipboardSupports('image/png')) {
        itemData['image/png'] = pngBlob
      }

      // Google Docs rejects SVG clipboard HTML. Use a PNG data URL so rich editors
      // that prefer text/html still receive a normal image instead of SVG markup.
      if (clipboardSupports('text/html')) {
        const pngDataUrl = await blobToDataUrl(pngBlob)
        itemData['text/html'] = new Blob([createImageClipboardHtml(pngDataUrl, outputSize)], { type: 'text/html' })
      }

      if (!Object.keys(itemData).length) return false
      await navigator.clipboard.write([new globalThis.ClipboardItem(itemData)])
      return true
    } catch {
      return false
    }
  }

  return false
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Could not encode PNG clipboard image.'))
    }
    reader.onerror = () => reject(reader.error || new Error('Could not encode PNG clipboard image.'))
    reader.readAsDataURL(blob)
  })
}

function createImageClipboardHtml(imageUrl, size = getOutputSize()) {
  return `<!doctype html><html><body><img src="${imageUrl}" alt="IconSearch icon" width="${size}" height="${size}"></body></html>`
}

function svgToPngBlob(svg, size) {
  const rasterSvg = normalizeSvgForRaster(svg, size)

  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(new Blob([rasterSvg], { type: 'image/svg+xml' }))

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Could not create canvas context.')

        context.clearRect(0, 0, size, size)
        context.drawImage(image, 0, 0, size, size)
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject(new Error('Could not render PNG clipboard image.'))
        }, 'image/png')
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }

    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not render SVG for clipboard.'))
    }

    image.src = url
  })
}

function normalizeSvgForRaster(svg, size) {
  const safeSvg = sanitizeSvgForExtension(svg)
  const parser = new DOMParser()
  const document = parser.parseFromString(safeSvg, 'image/svg+xml')
  const root = document.documentElement

  if (!root || root.tagName.toLowerCase() !== 'svg' || document.querySelector('parsererror')) {
    return safeSvg.trim()
  }

  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  if (!root.getAttribute('viewBox')) {
    const width = parseFloat(root.getAttribute('width') || '')
    const height = parseFloat(root.getAttribute('height') || '')
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      root.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }
  }

  root.setAttribute('width', String(size))
  root.setAttribute('height', String(size))
  root.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  if (!root.getAttribute('color')) root.setAttribute('color', '#000000')

  return new XMLSerializer().serializeToString(root)
}

function clipboardSupports(type) {
  if (typeof globalThis.ClipboardItem?.supports !== 'function') {
    return type === 'text/html'
  }
  return globalThis.ClipboardItem.supports(type)
}

function sanitizeSvgForExtension(svg) {
  const withoutBlockedElements = String(svg)
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, '')
    .replace(/<link\b[\s\S]*?>/gi, '')

  const classStyles = collectClassStyles(withoutBlockedElements)
  const withoutStyleBlocks = withoutBlockedElements
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<style\b[^>]*\/>/gi, '')
  const withClassStyles = applyClassStylesToTags(withoutStyleBlocks, classStyles)

  return convertInlineStylesToAttributes(withClassStyles)
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, '')
    .replace(/<style\b[^>]*\/>/gi, '')
    .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '')
    .trim()
}

function collectClassStyles(svg) {
  const classStyles = new Map()
  const styleBlockPattern = /<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi
  let styleBlockMatch

  while ((styleBlockMatch = styleBlockPattern.exec(svg)) !== null) {
    const css = String(styleBlockMatch[1] || '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/<!\[CDATA\[/gi, '')
      .replace(/\]\]>/g, '')
    const rulePattern = /([^{}]+)\{([^{}]+)\}/g
    let ruleMatch

    while ((ruleMatch = rulePattern.exec(css)) !== null) {
      const declarations = parseStyleDeclarations(ruleMatch[2] || '')
      if (!declarations.length) continue

      String(ruleMatch[1] || '')
        .split(',')
        .map((selector) => selector.trim().match(/^\.([_a-zA-Z][\w-]*)$/)?.[1])
        .filter(Boolean)
        .forEach((className) => {
          const current = classStyles.get(className) || []
          classStyles.set(className, current.concat(declarations))
        })
    }
  }

  return classStyles
}

function applyClassStylesToTags(svg, classStyles) {
  if (!classStyles.size) return svg

  return svg.replace(/<([a-zA-Z][\w:.-]*)([^<>]*?)>/g, (tag, tagName, attributes) => {
    if (tag.startsWith('</')) return tag

    const classMatch = String(attributes).match(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i)
    const classValue = classMatch?.[1] || classMatch?.[2] || classMatch?.[3] || ''
    if (!classValue) return tag

    const declarations = classValue
      .split(/\s+/)
      .flatMap((className) => classStyles.get(className) || [])

    if (!declarations.length) return tag
    return buildTagWithStyleAttributes(tagName, attributes, '', declarations)
  })
}

function convertInlineStylesToAttributes(svg) {
  return svg.replace(
    /<([a-zA-Z][\w:.-]*)([^<>]*?)\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))([^<>]*?)>/gi,
    (_tag, tagName, before, doubleQuoted, singleQuoted, unquoted, after) => {
      const styleValue = doubleQuoted || singleQuoted || unquoted || ''
      return buildTagWithStyleAttributes(tagName, before, after, parseStyleDeclarations(styleValue))
    },
  )
}

function parseStyleDeclarations(styleValue) {
  return String(styleValue)
    .split(';')
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex === -1) return null

      const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
      const value = declaration.slice(separatorIndex + 1).trim()

      if (!SAFE_SVG_STYLE_PROPERTIES.has(property) || !isSafeSvgStyleValue(value)) return null
      return [property, value]
    })
    .filter(Boolean)
}

function buildTagWithStyleAttributes(tagName, before, after, declarations) {
  const existingAttributes = `${before || ''} ${after || ''}`
  const nextAttributes = declarations
    .filter(([property]) => !new RegExp(`\\s${escapeRegExp(property)}\\s*=`, 'i').test(existingAttributes))
    .map(([property, value]) => ` ${property}="${escapeAttribute(value)}"`)
    .join('')

  return `<${tagName}${before || ''}${nextAttributes}${after || ''}>`
}

function isSafeSvgStyleValue(value) {
  const normalized = String(value).trim().toLowerCase()
  return Boolean(normalized) &&
    !normalized.includes('javascript:') &&
    !normalized.includes('expression(') &&
    !normalized.includes('<') &&
    !normalized.includes('>')
}

function cleanSvgForClipboard(svg) {
  const safeSvg = sanitizeSvgForExtension(svg)
  const parser = new DOMParser()
  const document = parser.parseFromString(safeSvg, 'image/svg+xml')
  const root = document.documentElement

  if (!root || root.tagName.toLowerCase() !== 'svg' || document.querySelector('parsererror')) {
    return safeSvg.trim()
  }

  document.querySelectorAll('script, style, link, foreignObject').forEach((node) => node.remove())
  document.querySelectorAll('*').forEach((node) => {
    Array.from(node.attributes).forEach((attribute) => {
      const value = attribute.value.trim().toLowerCase()
      const name = attribute.name.toLowerCase()
      if (name === 'style' || name.startsWith('on') || value.startsWith('javascript:')) {
        node.removeAttribute(attribute.name)
      }
    })
  })

  return new XMLSerializer().serializeToString(root)
}

function renderVersion() {
  const version = chrome.runtime?.getManifest?.().version || 'local'
  elements.versionLabel.textContent = `Chrome extension ${version}`
}

function normalizeSettings(value) {
  const outputSize = Number(value?.outputSize)
  const outputColor = typeof value?.outputColor === 'string' && /^#[0-9a-f]{6}$/i.test(value.outputColor)
    ? value.outputColor
    : DEFAULT_SETTINGS.outputColor

  return {
    outputSize: OUTPUT_SIZES.has(outputSize) ? outputSize : DEFAULT_SETTINGS.outputSize,
    outputColor,
    originalColor: typeof value?.originalColor === 'boolean' ? value.originalColor : DEFAULT_SETTINGS.originalColor,
  }
}

function applySettingsToControls() {
  elements.sizeSelect.value = String(state.settings.outputSize)
  elements.colorInput.value = state.settings.outputColor
  elements.originalColor.checked = state.settings.originalColor
  elements.colorInput.disabled = state.settings.originalColor
}

function updateOutputSettings(nextSettings) {
  state.settings = normalizeSettings({ ...state.settings, ...nextSettings })
  state.dragCache.clear()
  applySettingsToControls()
  void chrome.storage.local.set({ [SETTINGS_KEY]: state.settings })
}

function getOutputSize() {
  return state.settings.outputSize
}

function getOutputColor() {
  return state.settings.originalColor ? '' : state.settings.outputColor
}

function prepareSvgForOutput(svg) {
  const cleanedSvg = cleanSvgForClipboard(svg)
  const color = getOutputColor()
  return color ? applySvgOutputColor(cleanedSvg, color) : cleanedSvg
}

function applySvgOutputColor(svg, color) {
  const parser = new DOMParser()
  const document = parser.parseFromString(svg, 'image/svg+xml')
  const root = document.documentElement

  if (!root || root.tagName.toLowerCase() !== 'svg' || document.querySelector('parsererror')) {
    return svg
  }

  root.setAttribute('color', color)
  document.querySelectorAll('*').forEach((node) => {
    ['fill', 'stroke'].forEach((attributeName) => {
      const value = node.getAttribute(attributeName)
      if (shouldReplacePaintValue(value)) node.setAttribute(attributeName, color)
    })
  })

  if (!root.getAttribute('fill')) root.setAttribute('fill', color)
  return new XMLSerializer().serializeToString(root)
}

function shouldReplacePaintValue(value) {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  return normalized !== 'none' &&
    normalized !== 'transparent' &&
    !normalized.startsWith('url(')
}

function normalizeIconList(value) {
  return Array.isArray(value) ? value.map(normalizeIcon).filter(Boolean) : []
}

function isFavorite(iconId) {
  return state.favorites.some((icon) => icon.id === iconId)
}

async function toggleFavorite(icon) {
  const pinned = isFavorite(icon.id)
  state.favorites = pinned
    ? state.favorites.filter((item) => item.id !== icon.id)
    : [icon].concat(state.favorites.filter((item) => item.id !== icon.id)).slice(0, 60)

  await chrome.storage.local.set({ [FAVORITES_KEY]: state.favorites })
  renderFavoriteCount()

  if (state.showingFavorites) {
    renderFavorites()
  } else {
    refreshFavoriteCards(icon.id)
  }

  elements.resultStatus.textContent = pinned ? 'Removed from pinned icons.' : 'Pinned icon saved.'
}

function renderFavoriteCount() {
  elements.favoriteCount.textContent = String(state.favorites.length)
  elements.pinnedBtn.classList.toggle('active', state.showingFavorites)
}

function refreshFavoriteCards(iconId) {
  const pinned = isFavorite(iconId)
  elements.resultsGrid.querySelectorAll(`[data-icon-id="${cssEscape(iconId)}"]`).forEach((card) => {
    card.classList.toggle('is-pinned', pinned)
    const button = card.querySelector('[data-action="pin"]')
    if (button) {
      button.classList.toggle('active', pinned)
      button.textContent = pinned ? 'Pinned' : 'Pin'
    }
  })
}

function formatIconLicense(icon) {
  return icon.license ? `${icon.license} license` : 'Source license'
}

function formatIconSource(icon) {
  const safety = icon.legalSafe ? 'legal-safe' : 'verify before commercial use'
  return `${icon.libraryName} - ${formatIconLicense(icon)} - ${safety}`
}

function showAboutSheet() {
  elements.aboutSheet.classList.remove('hidden')
  elements.aboutSheet.setAttribute('aria-hidden', 'false')
}

function closeAboutSheet() {
  elements.aboutSheet.classList.add('hidden')
  elements.aboutSheet.setAttribute('aria-hidden', 'true')
}

function handleKeyboardNavigation(event) {
  if (event.key === 'Escape') {
    closeActionSheet()
    closeAboutSheet()
    return
  }

  if (isTypingTarget(event.target)) return

  if (event.key === '/') {
    event.preventDefault()
    elements.searchInput.focus()
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
    event.preventDefault()
    focusResultCard(state.focusedIndex + 1)
    return
  }

  if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
    event.preventDefault()
    focusResultCard(state.focusedIndex - 1)
    return
  }

  const icon = state.visibleIcons[state.focusedIndex]
  if (!icon) return

  if (event.key === 'Enter') {
    event.preventDefault()
    void runAction(() => copyIcon(icon))
  }

  if (event.key.toLowerCase() === 'p') {
    event.preventDefault()
    void toggleFavorite(icon)
  }
}

function focusResultCard(index) {
  const cards = Array.from(elements.resultsGrid.querySelectorAll('.icon-card'))
  if (!cards.length) return

  const nextIndex = (index + cards.length) % cards.length
  state.focusedIndex = nextIndex
  cards[nextIndex].focus()
}

function isTypingTarget(target) {
  const tagName = target?.tagName?.toLowerCase()
  return tagName === 'input' || tagName === 'select' || tagName === 'textarea'
}

async function rememberIcon(icon) {
  state.recent = [icon].concat(state.recent.filter((item) => item.id !== icon.id)).slice(0, 12)
  await chrome.storage.local.set({ [RECENT_KEY]: state.recent })
}

function applyLibraryParams(url, value) {
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

function authHeaders() {
  return {
    accept: 'application/json',
    authorization: `Bearer ${state.token}`,
    'x-iconsearch-product': PRODUCT,
  }
}

function normalizeIcon(value) {
  if (!value || typeof value !== 'object') return null
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
    license: String(value.license || ''),
    licenseUrl: String(value.licenseUrl || value.license_url || LICENSES_URL),
    legalSafe: Boolean(value.legalSafe),
    sourceUrl: String(value.sourceUrl || value.source_url || svgUrl),
    iconifyName: String(value.iconifyName || toIconifyName(library, name)),
    reactImport: String(value.reactImport || ''),
    reactUsage: String(value.reactUsage || ''),
  }
}

function normalizeSvgUrl(url, library, name) {
  if (url && url.startsWith('//')) return `https:${url}`
  const dashedName = name.replace(/_/g, '-')

  if (library === 'patternfly-icons') {
    return `${API_BASE}/api/icon-preview/patternfly-icons/${dashedName}?v=named-library-preview-v3`
  }

  if (library === 'untitled-ui-icons') {
    return `${API_BASE}/api/icon-preview/untitled-ui-icons/${dashedName}?v=named-library-preview-v4`
  }

  if (url && /^https?:\/\//.test(url)) return url

  const prefixes = {
    'lucide-icons': 'lucide',
    'heroicons': 'heroicons',
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
    return `https://api.iconify.design/${library.replace(/^iconify-/, '')}/${dashedName}.svg`
  }

  const prefix = prefixes[library]
  return prefix ? `https://api.iconify.design/${prefix}/${dashedName}.svg` : ''
}

function toIconifyName(library, name) {
  const prefixMap = {
    'lucide-icons': 'lucide',
    'heroicons': 'heroicons',
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

function getLibraryLabel(library) {
  const found = namedLibraries.find(([id]) => id === library)
  if (found) return found[1]
  if (library.startsWith('iconify-')) return `${formatIconifySet(library.replace(/^iconify-/, ''))} (Iconify)`
  return library
}

function formatIconifySet(value) {
  return String(value)
    .replace(/^iconify-/, '')
    .split('-')
    .map((part) => acronymParts.has(part) ? part.toUpperCase() : `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

function normalizeAccess(value) {
  if (!value || typeof value !== 'object') return null
  return {
    email: String(value.email || ''),
    product: String(value.product || PRODUCT),
    tier: String(value.tier || 'free'),
    founderNumber: typeof value.founderNumber === 'number' ? value.founderNumber : null,
    expiresAt: String(value.expiresAt || ''),
  }
}

function debounce(fn, wait) {
  let timeout = 0
  return (...args) => {
    window.clearTimeout(timeout)
    timeout = window.setTimeout(() => fn(...args), wait)
  }
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function trimMap(map, limit) {
  while (map.size > limit) {
    const firstKey = map.keys().next().value
    if (typeof firstKey === 'undefined') return
    map.delete(firstKey)
  }
}

function safeFileName(value) {
  return value.replace(/[^a-z0-9._-]+/gi, '-').replace(/^-+|-+$/g, '') || 'icon'
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function escapeAttribute(value) {
  return escapeHtml(value)
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function cssEscape(value) {
  if (typeof globalThis.CSS?.escape === 'function') return globalThis.CSS.escape(String(value))
  return String(value).replace(/["\\]/g, '\\$&')
}
