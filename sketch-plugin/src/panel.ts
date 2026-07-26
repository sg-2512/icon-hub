import { isSafeHex, normalizeHttpsUrl, sanitizeSvg, styleSvg } from "./svg";
import type { InsertPayload, InsertPlacement } from "./native";

const SEARCH_ENDPOINT = "https://iconsearch.info/api/extension/icon-search";
const DEFAULT_QUERY = "arrow";
const SEARCH_LIMIT = 80;
const RECENT_KEY = "iconsearch.sketch.recents.v1";
const RECENT_LIMIT = 20;

const LIBRARIES = [
  ["all", "All libraries (355k+)"],
  ["lucide-icons", "Lucide Icons"],
  ["heroicons", "Heroicons"],
  ["tabler-icons", "Tabler Icons"],
  ["phosphor-icons", "Phosphor Icons"],
  ["remix-icon", "Remix Icon"],
  ["feather-icons", "Feather Icons"],
  ["bootstrap-icons", "Bootstrap Icons"],
  ["ant-design-icons", "Ant Design Icons"],
  ["radix-icons", "Radix Icons"],
  ["octicons", "Octicons (GitHub)"],
  ["iconify-icons", "Material Design / Iconify"],
  ["ionicons", "Ionicons"],
  ["iconoir", "Iconoir"],
  ["devicons", "Devicons"],
  ["circum-icons", "Circum Icons"],
  ["elusive-icons", "Elusive Icons"],
  ["teenyicons", "Teenyicons"],
  ["untitled-ui-icons", "Untitled UI Icons"],
  ["simple-icons", "Simple Icons (Brand Logos)"],
  ["fontawesome", "FontAwesome"],
] as const;

const STYLES = [
  ["all", "All styles"],
  ["stroke", "Outline"],
  ["solid", "Solid"],
  ["duotone", "Duotone"],
  ["twotone", "Two-tone"],
  ["sharp", "Sharp"],
] as const;

type IconView = "browse" | "recent";

type IconSearchIcon = {
  id: string;
  name: string;
  displayName: string;
  library: string;
  libraryName: string;
  license: string;
  svgUrl: string;
  previewUrls: string[];
};

type SearchPayload = { icons?: unknown; total?: unknown };
type InsertResult = { ok?: boolean; error?: string; name?: string; size?: number };

declare global {
  interface Window {
    __ICONSEARCH_SKETCH__?: boolean;
  }
}

const state = {
  sketchReady: Boolean(window.__ICONSEARCH_SKETCH__),
  browseIcons: [] as IconSearchIcon[],
  recentIcons: loadRecents(),
  selectedId: "",
  query: DEFAULT_QUERY,
  library: "all",
  style: "all",
  legalOnly: true,
  size: 64,
  color: "#2563EB",
  placement: "right" as InsertPlacement,
  view: "browse" as IconView,
  total: 0,
  loading: false,
  inserting: false,
  searchTimer: 0,
  searchController: null as AbortController | null,
  previewObserver: null as IntersectionObserver | null,
  svgCache: new Map<string, string>(),
  token: getStoredToken(),
  pendingCode: "",
  pollTimer: 0,
};

function getStoredToken(): string {
  try { return localStorage.getItem("iconsearch_sketch_token") || ""; } catch { return ""; }
}
function setStoredToken(val: string): void {
  try { localStorage.setItem("iconsearch_sketch_token", val); } catch {}
}
function clearStoredToken(): void {
  try { localStorage.removeItem("iconsearch_sketch_token"); } catch {}
}

const elements = {
  authScreen: requiredElement<HTMLElement>("authScreen"),
  appShell: requiredElement<HTMLElement>("appShell"),
  authStatusBox: requiredElement<HTMLElement>("authStatusBox"),
  startAuthBtn: requiredElement<HTMLButtonElement>("startAuthBtn"),
  signOutBtn: requiredElement<HTMLButtonElement>("signOutBtn"),
  runtimeBadge: requiredElement<HTMLSpanElement>("runtimeBadge"),
  searchInput: requiredElement<HTMLInputElement>("searchInput"),
  librarySelect: requiredElement<HTMLSelectElement>("librarySelect"),
  styleSelect: requiredElement<HTMLSelectElement>("styleSelect"),
  legalOnlyInput: requiredElement<HTMLInputElement>("legalOnlyInput"),
  selectedPreview: requiredElement<HTMLImageElement>("selectedPreview"),
  selectedName: requiredElement<HTMLElement>("selectedName"),
  selectedDetails: requiredElement<HTMLSpanElement>("selectedDetails"),
  sizeInput: requiredElement<HTMLInputElement>("sizeInput"),
  sizeValue: requiredElement<HTMLOutputElement>("sizeValue"),
  colorInput: requiredElement<HTMLInputElement>("colorInput"),
  colorTextInput: requiredElement<HTMLInputElement>("colorTextInput"),
  positionSelect: requiredElement<HTMLSelectElement>("positionSelect"),
  insertButton: requiredElement<HTMLButtonElement>("insertButton"),
  resultsTitle: requiredElement<HTMLElement>("resultsTitle"),
  resultCount: requiredElement<HTMLSpanElement>("resultCount"),
  recentCount: requiredElement<HTMLSpanElement>("recentCount"),
  loadingLine: requiredElement<HTMLElement>("loadingLine"),
  resultsGrid: requiredElement<HTMLElement>("resultsGrid"),
  statusBar: requiredElement<HTMLElement>("statusBar"),
};

void boot();

async function boot(): Promise<void> {
  hydrateControls();
  bindEvents();
  updateRuntime();

  if (state.token) {
    showApp();
    renderLoading();
    await searchIcons();
  } else {
    showAuth();
  }
}

function showAuth(): void {
  elements.authScreen.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
}

function showApp(): void {
  elements.authScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
}

function signOut(): void {
  state.token = "";
  state.pendingCode = "";
  window.clearInterval(state.pollTimer);
  clearStoredToken();
  showAuth();
}

function hydrateControls(): void {
  elements.searchInput.value = state.query;
  elements.sizeInput.value = String(state.size);
  elements.sizeValue.textContent = `${state.size} px`;
  elements.colorInput.value = state.color;
  elements.colorTextInput.value = state.color;
  elements.legalOnlyInput.checked = state.legalOnly;
  elements.positionSelect.value = state.placement;
  elements.recentCount.textContent = String(state.recentIcons.length);
  fillSelect(elements.librarySelect, LIBRARIES, state.library);
  fillSelect(elements.styleSelect, STYLES, state.style);
  updateSwatches();
}

function fillSelect(select: HTMLSelectElement, options: ReadonlyArray<readonly [string, string]>, selectedValue: string): void {
  const fragment = document.createDocumentFragment();
  for (const [value, label] of options) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = value === selectedValue;
    fragment.appendChild(option);
  }
  select.replaceChildren(fragment);
}

function bindEvents(): void {
  elements.startAuthBtn.onclick = () => void startAuth();
  elements.signOutBtn.onclick = () => signOut();

  window.addEventListener("iconsearch:sketch-ready", () => {
    state.sketchReady = true;
    updateRuntime();
    renderSelection();
  });
  elements.searchInput.addEventListener("input", () => {
    state.query = elements.searchInput.value.trim();
    switchView("browse");
    scheduleSearch();
  });
  elements.librarySelect.addEventListener("change", () => {
    state.library = elements.librarySelect.value;
    switchView("browse");
    scheduleSearch();
  });
  elements.styleSelect.addEventListener("change", () => {
    state.style = elements.styleSelect.value;
    switchView("browse");
    scheduleSearch();
  });
  elements.legalOnlyInput.addEventListener("change", () => {
    state.legalOnly = elements.legalOnlyInput.checked;
    switchView("browse");
    scheduleSearch();
  });
  elements.sizeInput.addEventListener("input", () => {
    state.size = clamp(Number(elements.sizeInput.value) || 64, 16, 512);
    elements.sizeValue.textContent = `${state.size} px`;
  });
  elements.colorInput.addEventListener("input", () => applyColor(elements.colorInput.value));
  elements.colorTextInput.addEventListener("change", () => {
    const color = elements.colorTextInput.value.trim().toUpperCase();
    if (isSafeHex(color)) applyColor(color);
    else elements.colorTextInput.value = state.color;
  });
  elements.positionSelect.addEventListener("change", () => {
    const placement = elements.positionSelect.value;
    if (placement === "right" || placement === "overlay" || placement === "page-origin") state.placement = placement;
  });
  elements.insertButton.addEventListener("click", () => {
    const icon = selectedIcon();
    if (icon) void insertIcon(icon);
  });
  document.querySelectorAll<HTMLButtonElement>(".swatch").forEach((button) => {
    button.addEventListener("click", () => applyColor(button.dataset.color || ""));
  });
  document.querySelectorAll<HTMLButtonElement>(".view-tabs button").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view === "recent" ? "recent" : "browse"));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== elements.searchInput) {
      event.preventDefault();
      elements.searchInput.focus();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      const icon = selectedIcon();
      if (icon) void insertIcon(icon);
    }
  });
}

function updateRuntime(): void {
  elements.runtimeBadge.textContent = state.sketchReady ? "Sketch live" : "Browser preview";
  elements.runtimeBadge.classList.toggle("is-live", state.sketchReady);
  setStatus(state.sketchReady ? "Ready to insert editable SVG layers." : "Preview mode. Open the plugin in Sketch to insert icons.", state.sketchReady ? "success" : "");
}

function switchView(view: IconView): void {
  state.view = view;
  document.querySelectorAll<HTMLButtonElement>(".view-tabs button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });
  const icons = visibleIcons();
  if (!icons.some((icon) => icon.id === state.selectedId)) state.selectedId = icons[0]?.id || "";
  renderSelection();
  renderResults();
}

function applyColor(value: string): void {
  const color = value.toUpperCase();
  if (!isSafeHex(color)) return;
  state.color = color;
  elements.colorInput.value = color;
  elements.colorTextInput.value = color;
  updateSwatches();
  const selected = selectedIcon();
  if (selected) void hydratePreview(elements.selectedPreview, selected);
  document.querySelectorAll<HTMLImageElement>(".icon-shape[src]").forEach((shape) => {
    const icon = visibleIcons().find((candidate) => candidate.id === shape.dataset.iconId);
    if (icon) void hydratePreview(shape, icon);
  });
}

function updateSwatches(): void {
  document.querySelectorAll<HTMLButtonElement>(".swatch").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.color?.toUpperCase() === state.color);
  });
}

function scheduleSearch(): void {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => void searchIcons(), 160);
}

async function startAuth(): Promise<void> {
  elements.authStatusBox.innerHTML = '<p style="color:var(--muted);font-size:11px;">Requesting sign-in code...</p>';
  try {
    const res = await fetch("https://iconsearch.info/api/device/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "sketch", clientName: "Sketch Plugin" })
    });
    const data = await res.json() as Record<string, unknown>;
    if (!res.ok) throw new Error(String(data.error || "Failed to start device auth."));

    state.pendingCode = String(data.deviceCode || "");
    const uri = String(data.verificationUriComplete || ("https://iconsearch.info/connect?product=sketch&code=" + state.pendingCode));
    const userCode = String(data.userCode || "");

    elements.authStatusBox.innerHTML = `
      <div style="margin-top:12px;padding:12px;background:var(--surface-subtle);border-radius:10px;border:1px solid var(--line);">
        <p style="font-size:10px;color:var(--muted);font-weight:700;margin:0 0 4px 0;">PAIRING CODE</p>
        <div style="font-size:22px;font-weight:900;letter-spacing:0.1em;color:var(--blue);margin:4px 0 10px 0;">${userCode}</div>
        <a href="${uri}" target="_blank" rel="noopener noreferrer" class="btn-primary" style="font-size:11px;height:34px;text-decoration:none;">Open Sign-In Page ↗</a>
        <button id="copyLinkBtn" type="button" class="btn-secondary" style="margin-top:6px;font-size:10px;height:28px;">Copy Sign-In Link</button>
      </div>
    `;

    const copyBtn = document.getElementById("copyLinkBtn");
    if (copyBtn) {
      copyBtn.onclick = () => {
        void navigator.clipboard.writeText(uri);
        setStatus("Sign-In link copied!", "success");
      };
    }

    window.open(uri, "_blank");

    window.clearInterval(state.pollTimer);
    state.pollTimer = window.setInterval(() => void pollAuthStatus(), 3000);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Auth start failed";
    elements.authStatusBox.innerHTML = `
      <p style="color:var(--error);font-size:11px;margin-bottom:8px;">${msg}</p>
      <button id="retryAuthBtn" type="button" class="btn-primary">Retry Connect</button>
    `;
    const retryBtn = document.getElementById("retryAuthBtn");
    if (retryBtn) retryBtn.onclick = () => void startAuth();
  }
}

async function pollAuthStatus(): Promise<void> {
  if (!state.pendingCode) return;
  try {
    const res = await fetch("https://iconsearch.info/api/device/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceCode: state.pendingCode })
    });
    const data = await res.json() as Record<string, unknown>;
    if (res.ok && data.status === "authorized" && typeof data.token === "string") {
      window.clearInterval(state.pollTimer);
      state.token = data.token;
      setStoredToken(data.token);
      showApp();
      renderLoading();
      await searchIcons();
    }
  } catch {}
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
  url.searchParams.set("limit", String(SEARCH_LIMIT));
  url.searchParams.set("sort", state.query ? "relevance" : "popular");

  try {
    const headers: Record<string, string> = {
      accept: "application/json",
      "x-iconsearch-product": "sketch",
    };
    if (state.token) {
      headers.authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(url.toString(), {
      headers,
      signal: controller.signal,
    });
    if (response.status === 401) {
      signOut();
      return;
    }
    if (!response.ok) throw new Error(`IconSearch returned ${response.status}.`);
    const payload = await response.json() as SearchPayload;
    const rawIcons = Array.isArray(payload.icons) ? payload.icons : [];
    state.browseIcons = rawIcons.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon));
    state.total = numberFrom(payload.total, state.browseIcons.length);
    state.selectedId = state.browseIcons.some((icon) => icon.id === state.selectedId) ? state.selectedId : state.browseIcons[0]?.id || "";
  } catch (error) {
    if (controller.signal.aborted) return;
    state.browseIcons = [];
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
  const svgUrl = normalizeHttpsUrl(item.svgUrl);
  if (!name || !library || !svgUrl) return null;
  const previewUrls = Array.isArray(item.previewUrls) ? item.previewUrls.map(normalizeHttpsUrl).filter(Boolean) : [];
  const urls = [...new Set([...previewUrls, svgUrl])];
  return {
    id: stringFrom(item.id) || `${library}-${name}`,
    name,
    displayName: formatTitle(stringFrom(item.displayName) || name),
    library,
    libraryName: stringFrom(item.libraryName) || formatTitle(library),
    license: stringFrom(item.license) || "License not listed",
    svgUrl: urls[0] || svgUrl,
    previewUrls: urls,
  };
}

function renderLoading(): void {
  elements.resultsGrid.setAttribute("aria-busy", "true");
  elements.loadingLine.classList.add("is-active");
  elements.resultCount.textContent = "Searching...";
  if (visibleIcons().length) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 9; index += 1) {
    const skeleton = document.createElement("span");
    skeleton.className = "result-skeleton";
    fragment.appendChild(skeleton);
  }
  elements.resultsGrid.replaceChildren(fragment);
}

function renderSelection(): void {
  const icon = selectedIcon();
  elements.insertButton.disabled = !icon || !state.sketchReady || state.inserting;
  elements.sizeValue.textContent = `${state.size} px`;
  if (!icon) {
    elements.selectedName.textContent = state.view === "recent" ? "No recent icons" : "No icon selected";
    elements.selectedDetails.textContent = state.view === "recent" ? "Insert an icon to add it here" : "Try a broader search";
    elements.selectedPreview.removeAttribute("src");
    return;
  }
  elements.selectedName.textContent = icon.displayName;
  elements.selectedDetails.textContent = `${icon.libraryName} | ${icon.license}`;
  elements.selectedPreview.removeAttribute("src");
  elements.selectedPreview.classList.add("is-pending");
  void hydratePreview(elements.selectedPreview, icon);
}

function renderResults(): void {
  state.previewObserver?.disconnect();
  state.previewObserver = null;
  elements.resultsGrid.setAttribute("aria-busy", "false");
  elements.loadingLine.classList.toggle("is-active", state.loading && state.view === "browse");
  elements.resultsTitle.textContent = state.view === "recent" ? "Recently inserted" : "Results";
  const icons = visibleIcons();
  elements.resultCount.textContent = state.view === "recent" ? `${icons.length} saved` : `${state.total.toLocaleString()} icon${state.total === 1 ? "" : "s"}`;
  if (!icons.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = state.view === "recent" ? "Your recent icons will appear here" : "No matching icons";
    elements.resultsGrid.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const icon of icons) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `icon-card${icon.id === state.selectedId ? " is-selected" : ""}`;
    card.dataset.iconId = icon.id;
    card.title = `${icon.displayName} | ${icon.libraryName}`;
    const preview = document.createElement("span");
    preview.className = "icon-card-preview";
    const shape = document.createElement("img");
    shape.className = "icon-shape is-pending";
    shape.dataset.iconId = icon.id;
    shape.alt = "";
    shape.setAttribute("aria-hidden", "true");
    preview.appendChild(shape);
    const name = document.createElement("strong");
    name.textContent = icon.displayName;
    const library = document.createElement("small");
    library.textContent = icon.libraryName;
    card.append(preview, name, library);
    card.addEventListener("click", () => selectIcon(icon));
    card.addEventListener("dblclick", () => void insertIcon(icon));
    fragment.appendChild(card);
    observePreview(shape, icon);
  }
  elements.resultsGrid.replaceChildren(fragment);
  for (const icon of icons.slice(0, 9)) void fetchIconSvg(icon).catch(() => undefined);
}

function selectIcon(icon: IconSearchIcon): void {
  state.selectedId = icon.id;
  elements.resultsGrid.querySelectorAll<HTMLElement>(".icon-card").forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.iconId === icon.id);
  });
  renderSelection();
}

function observePreview(element: HTMLImageElement, icon: IconSearchIcon): void {
  if (!("IntersectionObserver" in window)) {
    void hydratePreview(element, icon);
    return;
  }
  state.previewObserver ??= new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      const target = entry.target as HTMLImageElement;
      const targetIcon = visibleIcons().find((candidate) => candidate.id === target.dataset.iconId);
      if (targetIcon) void hydratePreview(target, targetIcon);
    }
  }, { rootMargin: "180px 0px" });
  state.previewObserver.observe(element);
}

async function hydratePreview(element: HTMLImageElement, icon: IconSearchIcon): Promise<void> {
  const previewKey = `${icon.id}|${state.color}`;
  element.dataset.previewKey = previewKey;
  try {
    const source = await fetchIconSvg(icon);
    const styled = styleSvg(source, { color: state.color, title: icon.displayName });
    if (!element.isConnected || element.dataset.previewKey !== previewKey) return;
    element.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(styled)}`;
    element.classList.remove("is-pending", "is-failed");
  } catch {
    element.classList.add("is-failed");
  }
}

async function fetchIconSvg(icon: IconSearchIcon): Promise<string> {
  const cached = state.svgCache.get(icon.id);
  if (cached) return cached;
  let lastFailure = "SVG request failed";
  for (const url of icon.previewUrls) {
    try {
      const response = await fetch(url, { headers: { accept: "image/svg+xml,text/plain,*/*" } });
      if (!response.ok) {
        lastFailure = `SVG request returned ${response.status}`;
        continue;
      }
      const markup = (await response.text()).trim();
      if (!/<svg[\s>]/i.test(markup)) {
        lastFailure = "Asset response was not SVG markup";
        continue;
      }
      const safeSvg = sanitizeSvg(markup);
      state.svgCache.set(icon.id, safeSvg);
      return safeSvg;
    } catch (error) {
      lastFailure = error instanceof Error ? error.message : lastFailure;
    }
  }
  throw new Error(`Could not fetch ${icon.displayName}. ${lastFailure}`);
}

async function insertIcon(icon: IconSearchIcon): Promise<void> {
  if (!state.sketchReady || state.inserting) return;
  state.inserting = true;
  elements.insertButton.disabled = true;
  elements.insertButton.classList.add("is-busy");
  setStatus(`Preparing ${icon.displayName}...`);
  try {
    const source = await fetchIconSvg(icon);
    const payload: InsertPayload = {
      color: state.color,
      library: icon.libraryName,
      name: icon.displayName,
      placement: state.placement,
      size: state.size,
      svg: styleSvg(source, { color: state.color, title: `${icon.displayName} icon` }),
    };
    const results = await postToSketch("insertIcon", payload);
    const result = results[0] as InsertResult | undefined;
    if (!result?.ok) throw new Error(result?.error || "Sketch could not insert the icon.");
    rememberIcon(icon);
    setStatus(`Inserted ${icon.displayName} as an editable ${state.size} px layer.`, "success");
  } catch (error) {
    setStatus(errorMessage(error), "error");
  } finally {
    state.inserting = false;
    elements.insertButton.classList.remove("is-busy");
    renderSelection();
  }
}

function postToSketch(eventName: string, payload: InsertPayload): Promise<unknown[]> {
  if (!state.sketchReady) return Promise.reject(new Error("Open IconSearch inside Sketch to insert icons."));
  const bridge = window.postMessage as unknown as (name: string, value: InsertPayload) => Promise<unknown[]>;
  const result = bridge(eventName, payload);
  if (!result || typeof result.then !== "function") return Promise.reject(new Error("The Sketch bridge is unavailable."));
  return result;
}

function rememberIcon(icon: IconSearchIcon): void {
  state.recentIcons = [icon, ...state.recentIcons.filter((candidate) => candidate.id !== icon.id)].slice(0, RECENT_LIMIT);
  elements.recentCount.textContent = String(state.recentIcons.length);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(state.recentIcons));
  } catch {
    // Insertion remains successful when webview storage is unavailable.
  }
  if (state.view === "recent") renderResults();
}

function loadRecents(): IconSearchIcon[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon)).slice(0, RECENT_LIMIT);
  } catch {
    return [];
  }
}

function visibleIcons(): IconSearchIcon[] {
  return state.view === "recent" ? state.recentIcons : state.browseIcons;
}

function selectedIcon(): IconSearchIcon | null {
  const icons = visibleIcons();
  return icons.find((icon) => icon.id === state.selectedId) || icons[0] || null;
}

function setStatus(message: string, tone: "" | "success" | "error" = ""): void {
  elements.statusBar.textContent = message;
  elements.statusBar.classList.toggle("is-success", tone === "success");
  elements.statusBar.classList.toggle("is-error", tone === "error");
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Sketch could not insert the icon.";
}

function requiredElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element #${id}`);
  return element as T;
}

function stringFrom(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberFrom(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function formatTitle(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}
