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
};

const state = {
  webflowReady: typeof webflow !== "undefined",
  icons: [] as IconSearchIcon[],
  selectedId: "",
  loading: false,
  inserting: false,
  total: 0,
  query: DEFAULT_QUERY,
  library: "all",
  style: "all",
  legalOnly: true,
  size: 64,
  color: "#111827",
  placement: "after" as Placement,
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
  if (!state.webflowReady) {
    elements.runtimeBadge.textContent = "Preview";
    elements.selectionContext.textContent = "Open in Webflow to insert";
    setStatus("Preview mode: search and styling work here. Insertion works inside Webflow Designer.");
    return;
  }

  elements.runtimeBadge.textContent = "Designer live";
  elements.runtimeBadge.classList.add("is-live");
  await updateSelectionContext();
  setStatus("Ready. Select a canvas element, then insert an icon.", "success");
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
  renderLoading();

  const url = new URL(SEARCH_ENDPOINT);
  if (state.query) url.searchParams.set("q", state.query);
  url.searchParams.set("lib", state.library);
  url.searchParams.set("style", state.style);
  url.searchParams.set("legalOnly", state.legalOnly ? "1" : "0");
  url.searchParams.set("limit", "60");
  url.searchParams.set("sort", state.query ? "relevance" : "popular");

  try {
    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`IconSearch returned ${response.status}.`);

    const payload = await response.json() as SearchPayload;
    const rawIcons = Array.isArray(payload.icons) ? payload.icons : [];
    state.icons = rawIcons.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon));
    state.total = numberFrom(payload.total, state.icons.length);
    state.selectedId = state.icons.some((icon) => icon.id === state.selectedId)
      ? state.selectedId
      : state.icons[0]?.id || "";

    setStatus(
      state.webflowReady
        ? "Ready. Select an element and insert, or double-click a result."
        : "Preview mode: open this extension in Webflow Designer to insert icons.",
      state.webflowReady ? "success" : "",
    );
  } catch (error) {
    if (controller.signal.aborted) return;
    state.icons = [];
    state.total = 0;
    setStatus(error instanceof Error ? error.message : "Could not search IconSearch.", "error");
  } finally {
    if (!controller.signal.aborted) {
      state.loading = false;
      renderSelection();
      renderResults();
    }
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

function renderSelection(): void {
  const icon = getSelectedIcon();
  const previewSize = clamp(Math.round(state.size * 0.72), 36, 54);
  elements.insertButton.disabled = !icon || !state.webflowReady || state.inserting;
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
  elements.selectedDetails.textContent = `${icon.libraryName} - ${icon.license}`;
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
    card.title = "Click to preview. Double-click to insert.";

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
    // Keep the direct remote mask as a lightweight fallback if inline hydration fails.
  }
}

async function updateSelectionContext(): Promise<void> {
  if (!state.webflowReady) return;
  try {
    const selected = await webflow.getSelectedElement();
    elements.selectionContext.textContent = selected
      ? `Selected: ${formatIconTitle(selected.type)}`
      : "Select a canvas element first";
  } catch {
    elements.selectionContext.textContent = "Could not read canvas selection";
  }
}

async function insertIcon(icon: IconSearchIcon): Promise<void> {
  if (!state.webflowReady || state.inserting) {
    setStatus("Open this extension inside Webflow Designer to insert icons.", "error");
    return;
  }

  state.inserting = true;
  elements.insertButton.disabled = true;
  elements.insertButton.textContent = "Preparing SVG...";
  setStatus(`Preparing ${icon.displayName}...`);

  try {
    const capabilities = await webflow.canForAppMode([
      webflow.appModes.canDesign,
      webflow.appModes.canManageAssets,
    ]);
    if (!capabilities.canDesign) {
      throw new Error("Switch to Design mode on the primary locale and main branch to insert icons.");
    }
    if (!capabilities.canManageAssets) {
      throw new Error("Your Webflow role cannot upload assets on this site.");
    }

    const selected = await webflow.getSelectedElement();
    if (!selected) throw new Error("Select a canvas element before inserting an icon.");
    if (state.placement === "inside" && !("append" in selected && typeof selected.append === "function")) {
      throw new Error("The selected element cannot contain children. Choose Before or After instead.");
    }

    const svg = await createStyledSvg(icon);
    const asset = await getOrCreateAsset(icon, svg);
    let imageElement;
    if (state.placement === "inside" && "append" in selected && typeof selected.append === "function") {
      imageElement = await selected.append(webflow.elementPresets.Image);
    } else if (state.placement === "before") {
      imageElement = await selected.before(webflow.elementPresets.Image);
    } else {
      imageElement = await selected.after(webflow.elementPresets.Image);
    }

    if (imageElement.type !== "Image") {
      throw new Error("Webflow did not create an Image element.");
    }

    await imageElement.setAsset(asset);
    await imageElement.setAltText(`${icon.displayName} icon`);

    if (imageElement.displayName) {
      await imageElement.setDisplayName(`Icon - ${icon.displayName}`);
    }

    if (imageElement.styles) {
      const style = await getOrCreateSizeStyle(state.size);
      if (style) await imageElement.setStyles([style]);
    }

    await webflow.setSelectedElement(imageElement);
    await webflow.notify({ type: "Success", message: `Inserted ${icon.displayName}.` });
    elements.selectionContext.textContent = `Inserted: ${icon.displayName}`;
    setStatus(`Inserted ${icon.displayName} at ${state.size}px.`, "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not insert the icon.";
    setStatus(message, "error");
    try {
      await webflow.notify({ type: "Error", message });
    } catch {
      // The visible status bar still reports the failure if notifications are unavailable.
    }
  } finally {
    state.inserting = false;
    elements.insertButton.textContent = "Insert selected icon";
    renderSelection();
    await updateSelectionContext();
  }
}

async function getOrCreateAsset(icon: IconSearchIcon, svg: string) {
  const cache = loadAssetCache();
  const signature = `${icon.id}|${state.color.toLowerCase()}|${state.size}`;
  const cachedAssetId = cache[signature];

  if (cachedAssetId) {
    try {
      const cachedAsset = await webflow.getAssetById(cachedAssetId);
      if (cachedAsset) return cachedAsset;
    } catch {
      delete cache[signature];
    }
  }

  const colorName = state.color.replace("#", "").toLowerCase();
  const fileName = `iconsearch-${slugify(icon.library)}-${slugify(icon.name)}-${colorName}-${state.size}.svg`;
  const file = new File([svg], fileName, { type: "image/svg+xml" });
  const asset = await webflow.createAsset(file);
  await asset.setAltText(`${icon.displayName} icon`);
  await asset.setName(fileName);
  cache[signature] = asset.id;
  saveAssetCache(cache);
  return asset;
}

async function getOrCreateSizeStyle(size: number) {
  const styleName = `iconsearch-icon-${size}`;
  const existing = await webflow.getStyleByName(styleName);
  if (existing) return existing;

  const style = await webflow.createStyle(styleName);
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
  return /^https:\/\//i.test(url) ? url : "";
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
