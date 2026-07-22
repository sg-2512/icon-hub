import { isSafeHex, normalizeHttpsUrl, sanitizeSvg, styleSvg } from "./svg";

const SEARCH_ENDPOINT = "https://iconsearch.info/api/icons";
const DEFAULT_QUERY = "arrow";
const SEARCH_LIMIT = 36;

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

type InsertPosition = "center" | "top-left" | "top-right" | "content";

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

type InsertPayload = {
  base64: string;
  color: string;
  library: string;
  name: string;
  position: InsertPosition;
  size: number;
};

type InsertResult = {
  name?: string;
  position?: string;
  size?: number;
};

type AppsScriptError = { message?: string } | string;

type AppsScriptRunner = {
  withSuccessHandler(handler: (result: InsertResult) => void): AppsScriptRunner;
  withFailureHandler(handler: (error: AppsScriptError) => void): AppsScriptRunner;
  insertIcon(payload: InsertPayload): void;
};

declare global {
  interface Window {
    google?: { script?: { run?: AppsScriptRunner } };
  }
}

const state = {
  addonReady: Boolean(window.google?.script?.run),
  icons: [] as IconSearchIcon[],
  selectedId: "",
  query: DEFAULT_QUERY,
  library: "all",
  style: "all",
  legalOnly: true,
  size: 72,
  color: "#2563EB",
  position: "center" as InsertPosition,
  total: 0,
  loading: false,
  inserting: false,
  searchTimer: 0,
  searchController: null as AbortController | null,
  previewObserver: null as IntersectionObserver | null,
  svgCache: new Map<string, string>(),
};

const elements = {
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
  resultCount: requiredElement<HTMLSpanElement>("resultCount"),
  loadingLine: requiredElement<HTMLElement>("loadingLine"),
  resultsGrid: requiredElement<HTMLElement>("resultsGrid"),
  statusBar: requiredElement<HTMLElement>("statusBar"),
};

void boot();

async function boot(): Promise<void> {
  hydrateControls();
  bindEvents();
  renderLoading();
  elements.runtimeBadge.textContent = state.addonReady ? "Slides live" : "Browser preview";
  elements.runtimeBadge.classList.toggle("is-live", state.addonReady);
  setStatus(
    state.addonReady ? "Ready to insert into the current slide." : "Preview mode. Open the add-on in Google Slides to insert icons.",
    state.addonReady ? "success" : "",
  );
  await searchIcons();
}

function hydrateControls(): void {
  elements.searchInput.value = state.query;
  elements.sizeInput.value = String(state.size);
  elements.sizeValue.textContent = `${state.size} pt`;
  elements.colorInput.value = state.color;
  elements.colorTextInput.value = state.color;
  elements.legalOnlyInput.checked = state.legalOnly;
  elements.positionSelect.value = state.position;
  fillSelect(elements.librarySelect, LIBRARIES, state.library);
  fillSelect(elements.styleSelect, STYLES, state.style);
  updateSwatches();
}

function fillSelect(
  select: HTMLSelectElement,
  options: ReadonlyArray<readonly [string, string]>,
  selectedValue: string,
): void {
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
    state.size = clamp(Number(elements.sizeInput.value) || 72, 24, 240);
    elements.sizeValue.textContent = `${state.size} pt`;
  });
  elements.colorInput.addEventListener("input", () => applyColor(elements.colorInput.value));
  elements.colorTextInput.addEventListener("change", () => {
    const color = elements.colorTextInput.value.trim().toUpperCase();
    if (isSafeHex(color)) applyColor(color);
    else elements.colorTextInput.value = state.color;
  });
  elements.positionSelect.addEventListener("change", () => {
    const position = elements.positionSelect.value;
    if (position === "center" || position === "top-left" || position === "top-right" || position === "content") {
      state.position = position;
    }
  });
  elements.insertButton.addEventListener("click", () => {
    const icon = selectedIcon();
    if (icon) void insertIcon(icon);
  });
  document.querySelectorAll<HTMLButtonElement>(".swatch").forEach((button) => {
    button.addEventListener("click", () => applyColor(button.dataset.color || ""));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && document.activeElement !== elements.searchInput) {
      event.preventDefault();
      elements.searchInput.focus();
    }
  });
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
    const icon = state.icons.find((candidate) => candidate.id === shape.dataset.iconId);
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
  const svgUrl = normalizeHttpsUrl(item.svgUrl);
  if (!name || !library || !svgUrl) return null;
  const previewUrls = Array.isArray(item.previewUrls)
    ? item.previewUrls.map(normalizeHttpsUrl).filter(Boolean)
    : [];
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
  if (state.icons.length) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 6; index += 1) {
    const skeleton = document.createElement("span");
    skeleton.className = "result-skeleton";
    fragment.appendChild(skeleton);
  }
  elements.resultsGrid.replaceChildren(fragment);
}

function renderSelection(): void {
  const icon = selectedIcon();
  elements.insertButton.disabled = !icon || !state.addonReady || state.inserting;
  elements.sizeValue.textContent = `${state.size} pt`;
  if (!icon) {
    elements.selectedName.textContent = "No icon selected";
    elements.selectedDetails.textContent = "Try a broader search";
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
  elements.loadingLine.classList.remove("is-active");
  elements.resultCount.textContent = `${state.total.toLocaleString()} icon${state.total === 1 ? "" : "s"}`;
  if (!state.icons.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No matching icons";
    elements.resultsGrid.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const icon of state.icons) {
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
  for (const icon of state.icons.slice(0, 6)) void fetchIconSvg(icon).catch(() => undefined);
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
      const targetIcon = state.icons.find((candidate) => candidate.id === target.dataset.iconId);
      if (targetIcon) void hydratePreview(target, targetIcon);
    }
  }, { rootMargin: "140px 0px" });
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
  if (!state.addonReady || state.inserting) return;
  state.inserting = true;
  elements.insertButton.disabled = true;
  elements.insertButton.classList.add("is-busy");
  setStatus(`Preparing ${icon.displayName}...`);
  try {
    const source = await fetchIconSvg(icon);
    const styled = styleSvg(source, { color: state.color, title: `${icon.displayName} icon` });
    const base64 = await svgToPngBase64(styled, state.size);
    await runInsert({
      base64,
      color: state.color,
      library: icon.libraryName,
      name: icon.displayName,
      position: state.position,
      size: state.size,
    });
    setStatus(`Inserted ${icon.displayName} at ${state.size} pt.`, "success");
  } catch (error) {
    setStatus(errorMessage(error), "error");
  } finally {
    state.inserting = false;
    elements.insertButton.classList.remove("is-busy");
    renderSelection();
  }
}

function runInsert(payload: InsertPayload): Promise<InsertResult> {
  const runner = window.google?.script?.run;
  if (!runner) return Promise.reject(new Error("Open IconSearch inside Google Slides to insert icons."));
  return new Promise((resolve, reject) => {
    runner
      .withSuccessHandler(resolve)
      .withFailureHandler((error) => reject(new Error(errorMessage(error))))
      .insertIcon(payload);
  });
}

function svgToPngBase64(svg: string, pointSize: number): Promise<string> {
  const pixelSize = clamp(Math.round(pointSize * 4), 256, 1024);
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    const release = () => URL.revokeObjectURL(blobUrl);
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = pixelSize;
        canvas.height = pixelSize;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("This browser cannot create the PNG image.");
        context.drawImage(image, 0, 0, pixelSize, pixelSize);
        const dataUrl = canvas.toDataURL("image/png");
        release();
        resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
      } catch (error) {
        release();
        reject(error);
      }
    };
    image.onerror = () => {
      release();
      reject(new Error("The selected SVG could not be converted to PNG."));
    };
    image.src = blobUrl;
  });
}

function selectedIcon(): IconSearchIcon | null {
  return state.icons.find((icon) => icon.id === state.selectedId) || state.icons[0] || null;
}

function setStatus(message: string, tone: "" | "success" | "error" = ""): void {
  elements.statusBar.textContent = message;
  elements.statusBar.classList.toggle("is-success", tone === "success");
  elements.statusBar.classList.toggle("is-error", tone === "error");
}

function errorMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Google Slides could not insert the icon.";
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
