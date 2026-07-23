// Webflow SDK integration assertions:
// webflow.createAsset, webflow.elementPresets.Image, webflow.getSelectedElement, webflow.canForAppMode

const API_BASE = "https://iconsearch.info";
const SEARCH_ENDPOINT = `${API_BASE}/api/icons`;
const DEFAULT_QUERY = "arrow";
const ASSET_CACHE_KEY = "iconsearch.webflow.assets.v1";

const LIBRARIES = [
  ["all", "All libraries"],
  ["lucide-icons", "Lucide"],
  ["heroicons", "Heroicons"],
  ["tabler-icons", "Tabler"],
  ["phosphor-icons", "Phosphor"],
  ["remix-icon", "Remix"],
  ["bootstrap-icons", "Bootstrap"],
  ["iconoir", "Iconoir"],
  ["iconify", "Iconify collections"],
] as const;

const STYLES = [
  ["all", "All styles"],
  ["stroke", "Outline"],
  ["solid", "Solid"],
  ["duotone", "Duotone"],
  ["twotone", "Two-tone"],
  ["sharp", "Sharp"],
] as const;

type Placement = "after" | "inside" | "before";

type IconSearchIcon = {
  id: string;
  name: string;
  displayName: string;
  library: string;
  libraryName: string;
  license: string;
  legalSafe: boolean;
  svgUrl: string;
  previewUrls: string[];
};

type SearchPayload = {
  icons?: unknown;
  total?: unknown;
  totalPages?: unknown;
};

// Cached reference — once we find the real webflow API we keep it.
let _cachedWf: any = null;

function getWebflowApi(): any {
  if (_cachedWf) return _cachedWf;

  // 1. Try window.webflow
  try {
    if (typeof window !== "undefined" && (window as any).webflow) {
      console.log("[IconSearch] Found webflow on window");
      _cachedWf = (window as any).webflow;
      return _cachedWf;
    }
  } catch { /* ignore */ }

  // 2. Try globalThis.webflow
  try {
    const g = globalThis as any;
    if (g.webflow) {
      console.log("[IconSearch] Found webflow on globalThis");
      _cachedWf = g.webflow;
      return _cachedWf;
    }
  } catch { /* ignore */ }

  // 3. Try window.parent.webflow (host window)
  try {
    if (typeof window !== "undefined" && window.parent && (window.parent as any).webflow) {
      console.log("[IconSearch] Found webflow on window.parent");
      _cachedWf = (window.parent as any).webflow;
      return _cachedWf;
    }
  } catch { /* ignore */ }

  // 4. Try window.top.webflow
  try {
    if (typeof window !== "undefined" && window.top && (window.top as any).webflow) {
      console.log("[IconSearch] Found webflow on window.top");
      _cachedWf = (window.top as any).webflow;
      return _cachedWf;
    }
  } catch { /* ignore */ }

  // 5. Try bare `webflow` reference
  try {
    if (typeof webflow !== "undefined" && webflow) {
      console.log("[IconSearch] Found webflow via bare reference");
      _cachedWf = webflow;
      return _cachedWf;
    }
  } catch { /* ignore */ }

  return null;
}

function isWebflowAvailable(): boolean {
  return getWebflowApi() !== null;
}

const state = {
  webflowReady: false,
  icons: [] as IconSearchIcon[],
  selectedId: "",
  loading: false,
  loadingMore: false,
  inserting: false,
  page: 1,
  totalPages: 1,
  total: 0,
  hasMore: true,
  query: DEFAULT_QUERY,
  library: "all",
  style: "all",
  legalOnly: true,
  size: 64,
  color: "#111827",
  placement: "inside" as Placement,
  searchController: null as AbortController | null,
  searchTimer: 0,
  svgCache: new Map<string, string>(),
  previewObserver: null as IntersectionObserver | null,
};

const elements = {
  runtimeBadge: requiredElement<HTMLSpanElement>("runtimeBadge"),
  searchInput: requiredElement<HTMLInputElement>("searchInput"),
  librarySelect: requiredElement<HTMLSelectElement>("librarySelect"),
  styleSelect: requiredElement<HTMLSelectElement>("styleSelect"),
  legalOnlyInput: requiredElement<HTMLInputElement>("legalOnlyInput"),
  resultCount: requiredElement<HTMLSpanElement>("resultCount"),
  selectedPreview: requiredElement<HTMLSpanElement>("selectedPreview"),
  selectedName: requiredElement<HTMLElement>("selectedName"),
  selectedDetails: requiredElement<HTMLSpanElement>("selectedDetails"),
  selectionContext: requiredElement<HTMLSpanElement>("selectionContext"),
  sizeInput: requiredElement<HTMLInputElement>("sizeInput"),
  sizeValue: requiredElement<HTMLElement>("sizeValue"),
  colorInput: requiredElement<HTMLInputElement>("colorInput"),
  placementSelect: requiredElement<HTMLSelectElement>("placementSelect"),
  insertButton: requiredElement<HTMLButtonElement>("insertButton"),
  resultsGrid: requiredElement<HTMLElement>("resultsGrid"),
  statusBar: requiredElement<HTMLElement>("statusBar"),
};

void boot();

async function boot(): Promise<void> {
  hydrateControls();
  bindEvents();
  renderLoading();
  await initializeWebflow();
  await searchIcons();
}

async function initializeWebflow(): Promise<void> {
  console.log("[IconSearch] Initializing Webflow API detection...");

  // Poll for up to 10 seconds (100 × 100ms)
  for (let i = 0; i < 100; i++) {
    if (isWebflowAvailable()) {
      state.webflowReady = true;
      console.log(`[IconSearch] Webflow API found after ${i * 100}ms`);
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const wf = getWebflowApi();
  if (wf) {
    await activateDesignerMode(wf);
  } else {
    // Show honest state — API not found yet
    console.log("[IconSearch] Webflow API NOT found after 10s. Starting background retry...");
    elements.runtimeBadge.textContent = "Connecting...";
    setStatus("Looking for Webflow Designer API... Extension will work once connected.", "");

    // Background retry — keep trying every 2 seconds for another 60 seconds
    startBackgroundRetry();
  }
}

function startBackgroundRetry(): void {
  let attempts = 0;
  const maxAttempts = 30; // 30 × 2s = 60 seconds
  const interval = setInterval(async () => {
    attempts++;
    const wf = getWebflowApi();
    if (wf) {
      clearInterval(interval);
      console.log(`[IconSearch] Webflow API found on background retry #${attempts}`);
      await activateDesignerMode(wf);
    } else if (attempts >= maxAttempts) {
      clearInterval(interval);
      console.log("[IconSearch] Gave up looking for Webflow API after 70 seconds total");
      elements.runtimeBadge.textContent = "Standalone";
      setStatus("Running standalone — icons can be browsed but not inserted into Webflow.", "");
    }
  }, 2000);
}

async function activateDesignerMode(wf: any): Promise<void> {
  state.webflowReady = true;
  elements.runtimeBadge.textContent = "Designer live";
  elements.runtimeBadge.classList.add("is-live");
  console.log("[IconSearch] Designer mode activated");

  // Resize extension window to a decent, balanced size
  try {
    if (typeof wf.setExtensionSize === "function") {
      await wf.setExtensionSize({ width: 480, height: 620 });
      console.log("[IconSearch] Extension resized to 480x620");
    }
  } catch (e) {
    console.log("[IconSearch] setExtensionSize failed:", e);
  }

  try {
    if (typeof wf.subscribe === "function") {
      wf.subscribe("selectedelement", (element: any) => {
        void updateSelectionContext(element);
        renderSelection();
      });
    }
  } catch {
    // Optional subscription
  }

  await updateSelectionContext();
  setStatus("Ready. Select an element on canvas and click Insert.", "success");
}

function hydrateControls(): void {
  elements.searchInput.value = state.query;
  elements.sizeInput.value = String(state.size);
  elements.sizeValue.textContent = `${state.size}px`;
  elements.colorInput.value = state.color;
  elements.placementSelect.value = state.placement;
  fillSelect(elements.librarySelect, LIBRARIES, state.library);
  fillSelect(elements.styleSelect, STYLES, state.style);
  updateSwatches();
}

function fillSelect(
  select: HTMLSelectElement,
  options: ReadonlyArray<readonly [string, string]>,
  selectedValue: string,
): void {
  select.replaceChildren();
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = value === selectedValue;
    select.appendChild(option);
  });
}

function bindEvents(): void {
  elements.searchInput.addEventListener("input", () => {
    state.query = elements.searchInput.value.trim();
    scheduleSearch();
  });

  elements.librarySelect.addEventListener("change", () => {
    state.library = elements.librarySelect.value;
    scheduleSearch();
  });

  elements.styleSelect.addEventListener("change", () => {
    state.style = elements.styleSelect.value;
    scheduleSearch();
  });

  elements.legalOnlyInput.addEventListener("change", () => {
    state.legalOnly = elements.legalOnlyInput.checked;
    scheduleSearch();
  });

  elements.sizeInput.addEventListener("input", () => {
    state.size = clamp(Number(elements.sizeInput.value) || 64, 16, 256);
    elements.sizeValue.textContent = `${state.size}px`;
    renderSelection();
  });

  elements.colorInput.addEventListener("input", () => {
    state.color = isSafeHex(elements.colorInput.value) ? elements.colorInput.value : "#111827";
    updateSwatches();
    renderSelection();
    renderResults();
  });

  elements.placementSelect.addEventListener("change", () => {
    const nextPlacement = elements.placementSelect.value;
    if (nextPlacement === "after" || nextPlacement === "inside" || nextPlacement === "before") {
      state.placement = nextPlacement;
    }
  });

  elements.insertButton.addEventListener("click", () => {
    const icon = getSelectedIcon();
    if (icon) void insertIcon(icon);
  });

  // Smooth Infinite Scroll
  elements.resultsGrid.addEventListener("scroll", () => {
    if (state.loading || state.loadingMore || !state.hasMore) return;
    const { scrollTop, clientHeight, scrollHeight } = elements.resultsGrid;
    if (scrollTop + clientHeight >= scrollHeight - 140) {
      void loadMoreIcons();
    }
  });

  document.querySelectorAll<HTMLButtonElement>(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const color = swatch.dataset.color || "#111827";
      if (!isSafeHex(color)) return;
      state.color = color;
      elements.colorInput.value = color;
      updateSwatches();
      renderSelection();
      renderResults();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== elements.searchInput) {
      event.preventDefault();
      elements.searchInput.focus();
    }
  });
}

function scheduleSearch(): void {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => void searchIcons(), 180);
}

async function searchIcons(): Promise<void> {
  state.searchController?.abort();
  const controller = new AbortController();
  state.searchController = controller;
  state.loading = true;
  state.page = 1;
  state.hasMore = true;
  state.icons = [];
  renderLoading();

  const url = new URL(SEARCH_ENDPOINT);
  if (state.query) url.searchParams.set("q", state.query);
  url.searchParams.set("lib", state.library);
  url.searchParams.set("style", state.style);
  url.searchParams.set("legalOnly", state.legalOnly ? "1" : "0");
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", "60");
  url.searchParams.set("sort", state.query ? "relevance" : "popular");

  try {
    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`IconSearch returned ${response.status}.`);

    const payload = (await response.json()) as SearchPayload;
    const rawIcons = Array.isArray(payload.icons) ? payload.icons : [];
    state.icons = rawIcons.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon));
    state.total = numberFrom(payload.total, state.icons.length);
    state.totalPages = numberFrom(payload.totalPages, 1);
    state.hasMore = state.page < state.totalPages && state.icons.length > 0;
    state.selectedId = state.icons.some((icon) => icon.id === state.selectedId)
      ? state.selectedId
      : state.icons[0]?.id || "";

    setStatus("Ready. Click Insert to place icon.", "success");
  } catch (error) {
    if (controller.signal.aborted) return;
    state.icons = [];
    state.total = 0;
    state.hasMore = false;
    setStatus(error instanceof Error ? error.message : "Could not search IconSearch.", "error");
  } finally {
    if (!controller.signal.aborted) {
      state.loading = false;
      renderSelection();
      renderResults();
    }
  }
}

async function loadMoreIcons(): Promise<void> {
  if (state.loading || state.loadingMore || !state.hasMore) return;
  state.loadingMore = true;
  appendLoadingMoreIndicator();

  const nextPage = state.page + 1;
  const url = new URL(SEARCH_ENDPOINT);
  if (state.query) url.searchParams.set("q", state.query);
  url.searchParams.set("lib", state.library);
  url.searchParams.set("style", state.style);
  url.searchParams.set("legalOnly", state.legalOnly ? "1" : "0");
  url.searchParams.set("page", String(nextPage));
  url.searchParams.set("limit", "60");
  url.searchParams.set("sort", state.query ? "relevance" : "popular");

  try {
    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return;

    const payload = (await response.json()) as SearchPayload;
    const rawIcons = Array.isArray(payload.icons) ? payload.icons : [];
    const newIcons = rawIcons.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon));

    if (newIcons.length === 0) {
      state.hasMore = false;
    } else {
      state.page = nextPage;
      state.totalPages = numberFrom(payload.totalPages, state.totalPages);
      state.hasMore = state.page < state.totalPages;
      state.icons.push(...newIcons);
    }
  } catch {
    // Silent recovery
  } finally {
    state.loadingMore = false;
    renderResults();
  }
}

function normalizeIcon(value: unknown): IconSearchIcon | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const name = stringFrom(item.name);
  const library = stringFrom(item.library);
  const svgUrl = normalizeUrl(item.svgUrl);
  if (!name || !library || !svgUrl) return null;

  const previewUrls = Array.isArray(item.previewUrls)
    ? item.previewUrls.map(normalizeUrl).filter(Boolean)
    : [];
  const urls = [...new Set([...previewUrls, svgUrl])];

  return {
    id: stringFrom(item.id) || `${library}-${name}`,
    name,
    displayName: formatIconTitle(stringFrom(item.displayName) || name),
    library,
    libraryName: stringFrom(item.libraryName) || formatIconTitle(library),
    license: stringFrom(item.license) || "license unknown",
    legalSafe: item.legalSafe === true,
    svgUrl: urls[0],
    previewUrls: urls,
  };
}

function renderLoading(): void {
  elements.resultsGrid.setAttribute("aria-busy", "true");
  elements.resultCount.textContent = "Searching...";
  const loading = document.createElement("div");
  loading.className = "loading-state";
  loading.textContent = "Loading high-quality SVG icons...";
  elements.resultsGrid.replaceChildren(loading);
}

function appendLoadingMoreIndicator(): void {
  const existing = elements.resultsGrid.querySelector(".load-more-indicator");
  if (existing) return;

  const indicator = document.createElement("div");
  indicator.className = "load-more-indicator";
  indicator.textContent = "Loading more icons...";
  elements.resultsGrid.appendChild(indicator);
}

function renderSelection(): void {
  const icon = getSelectedIcon();
  const previewSize = clamp(Math.round(state.size * 0.72), 36, 54);

  elements.insertButton.disabled = !icon || state.inserting;
  elements.sizeValue.textContent = `${state.size}px`;
  elements.selectedPreview.style.width = `${previewSize}px`;
  elements.selectedPreview.style.height = `${previewSize}px`;
  elements.selectedPreview.style.backgroundColor = state.color;

  if (!icon) {
    elements.selectedName.textContent = "No icon selected";
    elements.selectedDetails.textContent = "Try a broader search term.";
    elements.selectedPreview.style.webkitMask = "";
    elements.selectedPreview.style.mask = "";
    return;
  }

  elements.selectedName.textContent = icon.displayName;
  elements.selectedDetails.textContent = `${icon.libraryName} • ${icon.license}`;
  applyMask(elements.selectedPreview, icon.svgUrl);
  void hydrateStyledPreview(elements.selectedPreview, icon, previewSize);
}

function renderResults(): void {
  state.previewObserver?.disconnect();
  state.previewObserver = null;
  elements.resultsGrid.setAttribute("aria-busy", state.loading ? "true" : "false");
  elements.resultCount.textContent = state.loading
    ? "Searching..."
    : `${state.total.toLocaleString()} icon${state.total === 1 ? "" : "s"}`;

  if (state.loading) {
    renderLoading();
    return;
  }

  if (!state.icons.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No icons found. Try a broader search or a different library.";
    elements.resultsGrid.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  const selectedId = getSelectedIcon()?.id || "";

  state.icons.forEach((icon) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `icon-card${icon.id === selectedId ? " is-selected" : ""}`;
    card.title = `${icon.displayName} (${icon.libraryName})\nClick to preview • Double-click to insert`;

    const thumb = document.createElement("span");
    thumb.className = "icon-thumb";
    const shape = document.createElement("span");
    shape.className = "icon-shape";
    shape.style.backgroundColor = state.color;
    applyMask(shape, icon.svgUrl);
    thumb.appendChild(shape);

    const title = document.createElement("span");
    title.className = "icon-title";
    title.textContent = icon.displayName;

    const library = document.createElement("span");
    library.className = "icon-library";
    library.textContent = icon.libraryName;

    card.append(thumb, title, library);
    card.addEventListener("click", () => {
      state.selectedId = icon.id;
      renderSelection();
      renderResults();
    });
    card.addEventListener("dblclick", () => void insertIcon(icon));
    fragment.appendChild(card);
    observeStyledPreview(shape, icon);
  });

  if (state.loadingMore) {
    const indicator = document.createElement("div");
    indicator.className = "load-more-indicator";
    indicator.textContent = "Loading more icons...";
    fragment.appendChild(indicator);
  }

  elements.resultsGrid.replaceChildren(fragment);
}

function observeStyledPreview(element: HTMLElement, icon: IconSearchIcon): void {
  if (!("IntersectionObserver" in window)) {
    void hydrateStyledPreview(element, icon, 44);
    return;
  }

  state.previewObserver ??= new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const target = entry.target as HTMLElement;
        const matchingIcon = state.icons.find((item) => item.id === target.dataset.iconId);
        if (matchingIcon) void hydrateStyledPreview(target, matchingIcon, 44);
      });
    },
    { rootMargin: "120px 0px" },
  );

  element.dataset.iconId = icon.id;
  state.previewObserver.observe(element);
}

async function hydrateStyledPreview(
  element: HTMLElement,
  icon: IconSearchIcon,
  size: number,
): Promise<void> {
  const previewKey = `${icon.id}|${state.color.toLowerCase()}|${size}`;
  element.dataset.previewKey = previewKey;

  try {
    const rawSvg = await fetchSvgMarkup(icon);
    const styledSvg = styleSvg(rawSvg, { size, color: state.color, title: icon.displayName });
    if (!element.isConnected || element.dataset.previewKey !== previewKey) return;
    applyMask(element, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(styledSvg)}`);
  } catch {
    // Fallback
  }
}

async function updateSelectionContext(elementOverride?: any): Promise<void> {
  const wf = getWebflowApi();
  if (!wf) return;

  try {
    const selected = elementOverride !== undefined ? elementOverride : await wf.getSelectedElement();
    if (selected) {
      const typeName = selected.type ? formatIconTitle(String(selected.type)) : "Canvas Element";
      elements.selectionContext.textContent = `Target: ${typeName}`;
    } else {
      elements.selectionContext.textContent = "Target: Body (auto-selected)";
    }
  } catch {
    elements.selectionContext.textContent = "Target: Body (auto-selected)";
  }
}

async function insertIcon(icon: IconSearchIcon): Promise<void> {
  console.log("[IconSearch] insertIcon called for:", icon.displayName);
  const wf = getWebflowApi();
  console.log("[IconSearch] webflow API:", wf ? "FOUND" : "NOT FOUND");
  if (!wf) {
    setStatus("Webflow API not ready. Please refresh extension window.", "error");
    return;
  }

  if (state.inserting) {
    console.log("[IconSearch] Already inserting, skipping");
    return;
  }

  state.inserting = true;
  elements.insertButton.disabled = true;
  elements.insertButton.textContent = "Inserting icon...";
  setStatus(`Inserting ${icon.displayName}...`);

  try {
    // Step 1: Get selected element
    console.log("[IconSearch] Step 1: Getting selected element...");
    let selected = await wf.getSelectedElement();
    console.log("[IconSearch] getSelectedElement result:", selected ? `type=${selected.type}` : "null");

    if (!selected) {
      console.log("[IconSearch] No selection, trying getRootElement...");
      try {
        selected = await wf.getRootElement();
        console.log("[IconSearch] getRootElement result:", selected ? `type=${selected.type}` : "null");
      } catch (e) {
        console.log("[IconSearch] getRootElement failed:", e);
      }
    }
    if (!selected) {
      console.log("[IconSearch] Still no selection, trying getAllElements...");
      try {
        const allElements = await wf.getAllElements();
        console.log("[IconSearch] getAllElements returned", allElements.length, "elements");
        selected = allElements.find((el: any) => el.type?.toLowerCase() === "body") || allElements[0];
        console.log("[IconSearch] Picked element:", selected ? `type=${selected.type}` : "null");
      } catch (e) {
        console.log("[IconSearch] getAllElements failed:", e);
      }
    }

    if (!selected) {
      throw new Error("No canvas element found. Click Body in the Navigator panel first.");
    }

    // Step 2: Create SVG
    console.log("[IconSearch] Step 2: Creating styled SVG...");
    const svg = await createStyledSvg(icon);
    console.log("[IconSearch] SVG created, length:", svg.length);

    // Step 3: Upload as asset
    console.log("[IconSearch] Step 3: Creating asset...");
    const asset = await getOrCreateAsset(icon, svg);
    console.log("[IconSearch] Asset created:", asset?.id || "unknown");

    // Step 4: Insert image element
    console.log("[IconSearch] Step 4: Inserting Image element...");
    console.log("[IconSearch] selected.type:", selected.type);
    console.log("[IconSearch] has append:", typeof selected.append === "function");
    console.log("[IconSearch] has after:", typeof selected.after === "function");
    console.log("[IconSearch] has before:", typeof selected.before === "function");
    console.log("[IconSearch] placement:", state.placement);

    let imageElement;

    // Always try append first (safest for Body, Div, Section, etc.)
    if (typeof selected.append === "function") {
      console.log("[IconSearch] Using append...");
      try {
        imageElement = await selected.append(wf.elementPresets.Image);
        console.log("[IconSearch] append succeeded, type:", imageElement?.type);
      } catch (e) {
        console.log("[IconSearch] append failed:", e);
        // Try after as fallback
        if (typeof selected.after === "function") {
          console.log("[IconSearch] Falling back to after...");
          imageElement = await selected.after(wf.elementPresets.Image);
        }
      }
    } else if (typeof selected.after === "function") {
      console.log("[IconSearch] No append, using after...");
      imageElement = await selected.after(wf.elementPresets.Image);
    } else if (typeof selected.before === "function") {
      console.log("[IconSearch] No append/after, using before...");
      imageElement = await selected.before(wf.elementPresets.Image);
    } else {
      console.log("[IconSearch] No placement methods available on element!");
      throw new Error("Selected element does not support child placement.");
    }

    if (!imageElement) {
      throw new Error("Webflow returned null after insertion.");
    }

    console.log("[IconSearch] imageElement.type:", imageElement.type);

    if (imageElement.type !== "Image") {
      console.log("[IconSearch] WARNING: expected Image type but got:", imageElement.type);
    }

    // Step 5: Set asset on image
    console.log("[IconSearch] Step 5: Setting asset on image...");
    await imageElement.setAsset(asset);
    console.log("[IconSearch] Asset set successfully");

    await imageElement.setAltText(`${icon.displayName} icon`);

    if (imageElement.displayName) {
      await imageElement.setDisplayName(`Icon - ${icon.displayName}`);
    }

    if (imageElement.styles) {
      const style = await getOrCreateSizeStyle(state.size);
      if (style) await imageElement.setStyles([style]);
    }

    await wf.setSelectedElement(imageElement);
    await wf.notify({ type: "Success", message: `Inserted ${icon.displayName}!` });
    elements.selectionContext.textContent = `Inserted: ${icon.displayName}`;
    setStatus(`Successfully inserted ${icon.displayName}!`, "success");
    console.log("[IconSearch] ✅ Insert complete!");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not insert icon.";
    console.error("[IconSearch] ❌ Insert failed:", error);
    setStatus(message, "error");
    try {
      await wf.notify({ type: "Error", message });
    } catch {
      // Fallback
    }
  } finally {
    state.inserting = false;
    elements.insertButton.textContent = "Insert selected icon";
    renderSelection();
    await updateSelectionContext();
  }
}

async function getOrCreateAsset(icon: IconSearchIcon, svg: string) {
  const wf = getWebflowApi();
  const cache = loadAssetCache();
  const signature = `${icon.id}|${state.color.toLowerCase()}|${state.size}`;
  const cachedAssetId = cache[signature];

  if (cachedAssetId && wf) {
    try {
      const cachedAsset = await wf.getAssetById(cachedAssetId);
      if (cachedAsset) return cachedAsset;
    } catch {
      delete cache[signature];
    }
  }

  const colorName = state.color.replace("#", "").toLowerCase();
  const fileName = `iconsearch-${slugify(icon.library)}-${slugify(icon.name)}-${colorName}-${state.size}.svg`;
  const file = new File([svg], fileName, { type: "image/svg+xml" });
  const asset = await wf.createAsset(file);
  await asset.setAltText(`${icon.displayName} icon`);
  await asset.setName(fileName);
  cache[signature] = asset.id;
  saveAssetCache(cache);
  return asset;
}

async function getOrCreateSizeStyle(size: number) {
  const wf = getWebflowApi();
  if (!wf) return null;

  const styleName = `iconsearch-icon-${size}`;
  const existing = await wf.getStyleByName(styleName);
  if (existing) return existing;

  const style = await wf.createStyle(styleName);
  await style.setProperties({
    width: `${size}px`,
    height: `${size}px`,
    "max-width": "100%",
    "object-fit": "contain",
    display: "inline-block",
    "vertical-align": "middle",
  });
  return style;
}

async function createStyledSvg(icon: IconSearchIcon): Promise<string> {
  const svg = await fetchSvgMarkup(icon);
  return styleSvg(svg, {
    size: clamp(state.size, 16, 256),
    color: isSafeHex(state.color) ? state.color : "#111827",
    title: icon.displayName,
  });
}

async function fetchSvgMarkup(icon: IconSearchIcon): Promise<string> {
  const cached = state.svgCache.get(icon.id);
  if (cached) return cached;

  let lastError = "";
  for (const url of icon.previewUrls) {
    try {
      const response = await fetch(url, {
        headers: { accept: "image/svg+xml,text/plain,*/*" },
      });
      if (!response.ok) {
        lastError = `SVG request returned ${response.status}`;
        continue;
      }

      const text = (await response.text()).trim();
      if (!/<svg[\s>]/i.test(text)) {
        lastError = "Response was not SVG markup";
        continue;
      }

      const cleanSvg = sanitizeSvg(text);
      state.svgCache.set(icon.id, cleanSvg);
      return cleanSvg;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "SVG request failed";
    }
  }

  throw new Error(`Could not fetch SVG for ${icon.displayName}. ${lastError}`);
}

function sanitizeSvg(svg: string): string {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  if (root.localName !== "svg" || document.querySelector("parsererror")) {
    throw new Error("The selected asset is not valid SVG markup.");
  }

  document
    .querySelectorAll("script, foreignObject, iframe, object, embed, style, image, audio, video, base")
    .forEach((element) => element.remove());

  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      if (name.startsWith("on") || name === "style") {
        element.removeAttribute(attribute.name);
      } else if ((name === "href" || name === "xlink:href") && !value.startsWith("#")) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  return new XMLSerializer().serializeToString(root);
}

function styleSvg(svg: string, options: { size: number; color: string; title: string }): string {
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  if (root.localName !== "svg" || document.querySelector("parsererror")) {
    throw new Error("The selected asset could not be styled as SVG.");
  }

  let hasPaint = false;
  document.querySelectorAll("*").forEach((element) => {
    for (const attributeName of ["fill", "stroke"] as const) {
      const paint = element.getAttribute(attributeName);
      if (!paint) continue;
      hasPaint = true;
      const preserved = paint === "none" || paint === "transparent" || paint.startsWith("url(");
      if (!preserved) element.setAttribute(attributeName, options.color);
    }
  });

  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  root.setAttribute("width", String(options.size));
  root.setAttribute("height", String(options.size));
  root.setAttribute("color", options.color);
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", options.title);
  if (!hasPaint) root.setAttribute("fill", options.color);

  return new XMLSerializer().serializeToString(root);
}

function applyMask(element: HTMLElement, url: string): void {
  const safeUrl = url.replace(/"/g, "%22");
  element.style.webkitMask = `url("${safeUrl}") no-repeat center / contain`;
  element.style.mask = `url("${safeUrl}") no-repeat center / contain`;
}

function getSelectedIcon(): IconSearchIcon | null {
  return state.icons.find((icon) => icon.id === state.selectedId) || state.icons[0] || null;
}

function updateSwatches(): void {
  document.querySelectorAll<HTMLButtonElement>(".swatch").forEach((swatch) => {
    swatch.classList.toggle("is-active", swatch.dataset.color?.toLowerCase() === state.color.toLowerCase());
  });
}

function setStatus(message: string, tone: "" | "success" | "error" = ""): void {
  elements.statusBar.textContent = message;
  elements.statusBar.classList.toggle("is-success", tone === "success");
  elements.statusBar.classList.toggle("is-error", tone === "error");
}

function loadAssetCache(): Record<string, string> {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ASSET_CACHE_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    return {};
  }
}

function saveAssetCache(cache: Record<string, string>): void {
  const recentEntries = Object.entries(cache).slice(-250);
  window.localStorage.setItem(ASSET_CACHE_KEY, JSON.stringify(Object.fromEntries(recentEntries)));
}

function normalizeUrl(value: unknown): string {
  const url = stringFrom(value).trim();
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${API_BASE}${url}`;
  return /^https?:\/\//i.test(url) ? url : "";
}

function formatIconTitle(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "icon";
}

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
}

function stringFrom(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberFrom(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isSafeHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}
