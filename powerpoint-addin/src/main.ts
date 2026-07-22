import "./styles.css";
import { encodeSvgBase64, isSafeHex, normalizeHttpsUrl, sanitizeSvg, styleSvg } from "./svg";

const SEARCH_ENDPOINT = "https://iconsearch.info/api/icons";
const DEFAULT_QUERY = "arrow";
const SEARCH_LIMIT = 48;

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

type InsertPosition = "default" | "top-left" | "content";

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
  officeReady: false,
  icons: [] as IconSearchIcon[],
  selectedId: "",
  query: DEFAULT_QUERY,
  library: "all",
  style: "all",
  legalOnly: true,
  size: 72,
  color: "",
  position: "default" as InsertPosition,
  total: 0,
  page: 1,
  hasMore: true,
  loading: false,
  loadingMore: false,
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
  resultsSection: requiredElement<HTMLElement>("resultsSection"),
  statusBar: requiredElement<HTMLElement>("statusBar"),
};

void boot();

async function boot(): Promise<void> {
  hydrateControls();
  bindEvents();
  renderLoading();
  void initializeOffice();
  await searchIcons(false);
}

async function initializeOffice(): Promise<void> {
  state.officeReady = await detectPowerPointHost();
  elements.runtimeBadge.textContent = state.officeReady ? "PowerPoint live" : "Browser preview";
  elements.runtimeBadge.classList.toggle("is-live", state.officeReady);
  renderSelection();
  setStatus(
    state.officeReady
      ? "Ready to insert into the current slide."
      : "Preview mode. Open the add-in in PowerPoint to enable insertion.",
    state.officeReady ? "success" : "",
  );
}

function detectPowerPointHost(): Promise<boolean> {
  if (typeof Office === "undefined") return Promise.resolve(false);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (ready: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve(ready);
    };
    const timeout = window.setTimeout(() => finish(false), 4000);

    try {
      void Office.onReady((info) => finish(info.host === Office.HostType.PowerPoint));
    } catch {
      finish(false);
    }
  });
}

function hydrateControls(): void {
  elements.searchInput.value = state.query;
  elements.sizeInput.value = String(state.size);
  elements.sizeValue.textContent = `${state.size} pt`;
  elements.colorInput.value = state.color || "#000000";
  elements.colorTextInput.value = state.color ? state.color : "Original";
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
    const raw = elements.colorTextInput.value.trim();
    if (!raw || raw.toLowerCase() === "original") {
      applyColor("");
      return;
    }
    const color = raw.toUpperCase();
    if (isSafeHex(color)) applyColor(color);
    else elements.colorTextInput.value = state.color || "Original";
  });
  elements.positionSelect.addEventListener("change", () => {
    const position = elements.positionSelect.value;
    if (position === "default" || position === "top-left" || position === "content") {
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
  elements.resultsSection.addEventListener("scroll", () => {
    const { scrollTop, clientHeight, scrollHeight } = elements.resultsSection;
    if (scrollTop + clientHeight >= scrollHeight - 350) {
      void loadNextPage();
    }
  });
  window.addEventListener("scroll", () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - 400) {
      void loadNextPage();
    }
  });
}


function applyColor(value: string): void {
  if (!value || value.toLowerCase() === "original") {
    state.color = "";
    elements.colorTextInput.value = "Original";
  } else {
    const color = value.toUpperCase();
    if (!isSafeHex(color)) return;
    state.color = color;
    elements.colorInput.value = color;
    elements.colorTextInput.value = color;
  }

  document.querySelectorAll<HTMLImageElement>(".icon-shape").forEach((shape) => {
    const icon = state.icons.find((candidate) => candidate.id === shape.dataset.iconId);
    if (icon && !shape.classList.contains("is-pending")) void hydratePreview(shape, icon, 48);
  });
  updateSwatches();
  const icon = selectedIcon();
  if (icon) void hydratePreview(elements.selectedPreview, icon, 96);
}

function updateSwatches(): void {
  document.querySelectorAll<HTMLButtonElement>(".swatch").forEach((button) => {
    const buttonColor = (button.dataset.color || "").toUpperCase();
    const activeColor = state.color.toUpperCase();
    button.classList.toggle("is-active", buttonColor === activeColor);
  });
}


function scheduleSearch(): void {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => {
    state.page = 1;
    state.hasMore = true;
    void searchIcons(false);
  }, 160);
}

async function loadNextPage(): Promise<void> {
  if (state.loading || state.loadingMore || !state.hasMore) return;
  state.page += 1;
  await searchIcons(true);
}

async function searchIcons(isNextPage = false): Promise<void> {
  if (!isNextPage) {
    state.searchController?.abort();
    const controller = new AbortController();
    state.searchController = controller;
    state.loading = true;
    state.page = 1;
    state.hasMore = true;
    renderLoading();

    const url = new URL(SEARCH_ENDPOINT);
    if (state.query) url.searchParams.set("q", state.query);
    url.searchParams.set("lib", state.library);
    url.searchParams.set("style", state.style);
    url.searchParams.set("legalOnly", state.legalOnly ? "1" : "0");
    url.searchParams.set("limit", "60");
    url.searchParams.set("page", "1");
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
      state.hasMore = state.icons.length >= 60;
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
  } else {
    state.loadingMore = true;
    elements.loadingLine.classList.add("is-active");

    const url = new URL(SEARCH_ENDPOINT);
    if (state.query) url.searchParams.set("q", state.query);
    url.searchParams.set("lib", state.library);
    url.searchParams.set("style", state.style);
    url.searchParams.set("legalOnly", state.legalOnly ? "1" : "0");
    url.searchParams.set("limit", "60");
    url.searchParams.set("page", String(state.page));
    url.searchParams.set("sort", state.query ? "relevance" : "popular");

    try {
      const response = await fetch(url.toString(), {
        headers: { accept: "application/json" },
      });
      if (!response.ok) return;

      const payload = await response.json() as SearchPayload;
      const rawIcons = Array.isArray(payload.icons) ? payload.icons : [];
      const newIcons = rawIcons.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon));
      if (newIcons.length === 0) {
        state.hasMore = false;
        return;
      }
      state.hasMore = newIcons.length >= 60;
      state.icons.push(...newIcons);
      appendResults(newIcons);
    } catch {
      state.hasMore = false;
    } finally {
      state.loadingMore = false;
      elements.loadingLine.classList.remove("is-active");
    }
  }
}

function createCardElement(icon: IconSearchIcon): HTMLButtonElement {
  const card = document.createElement("button");
  card.type = "button";
  card.className = `icon-card${icon.id === state.selectedId ? " is-selected" : ""}`;
  card.dataset.iconId = icon.id;
  card.title = `${icon.displayName} · ${icon.libraryName}`;

  const preview = document.createElement("span");
  preview.className = "icon-card-preview";
  const shape = document.createElement("img");
  shape.className = "icon-shape";
  shape.alt = "";
  shape.loading = "lazy";
  shape.setAttribute("aria-hidden", "true");
  shape.dataset.iconId = icon.id;

  if (!state.color) {
    shape.src = icon.svgUrl;
    let attemptIndex = 0;
    shape.addEventListener("error", () => {
      attemptIndex += 1;
      const fallbackUrl = icon.previewUrls[attemptIndex];
      if (attemptIndex < icon.previewUrls.length && fallbackUrl) {
        shape.src = fallbackUrl;
      } else {
        void hydratePreview(shape, icon, 48);
      }
    });
  } else {
    shape.classList.add("is-pending");
    observePreview(shape, icon);
  }

  preview.appendChild(shape);

  const quickInsertBtn = document.createElement("span");
  quickInsertBtn.className = "card-quick-insert";
  quickInsertBtn.title = "Insert into slide";
  quickInsertBtn.textContent = "＋";
  quickInsertBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    selectIcon(icon);
    void insertIcon(icon);
  });
  preview.appendChild(quickInsertBtn);

  const name = document.createElement("strong");
  name.textContent = icon.displayName;
  const library = document.createElement("small");
  library.textContent = icon.libraryName;
  card.append(preview, name, library);

  card.addEventListener("click", () => selectIcon(icon));
  card.addEventListener("dblclick", () => void insertIcon(icon));
  return card;
}


function appendResults(newIcons: IconSearchIcon[]): void {
  const fragment = document.createDocumentFragment();
  for (const icon of newIcons) {
    fragment.appendChild(createCardElement(icon));
  }
  elements.resultsGrid.appendChild(fragment);
  elements.resultCount.textContent = `${state.icons.length.toLocaleString()} of ${state.total.toLocaleString()} icons`;
}


function buildIconifyCdnUrl(library: string, name: string): string {
  const prefixMap: Record<string, string> = {
    "lucide-icons": "lucide",
    "material-design-icons": "mdi",
    "tabler-icons": "tabler",
    "remix-icon": "ri",
    "font-awesome": "fa-solid",
    "bootstrap-icons": "bi",
    "feather-icons": "feather",
    "heroicons": "heroicons",
    "octicons": "octicon",
    "radix-icons": "radix-icons",
    "simple-icons": "simple-icons",
    "carbon-icons": "carbon",
    "ionicons": "ion",
    "line-md": "line-md",
  };
  const prefix = prefixMap[library] || library.replace(/-icons$/, "");
  return `https://api.iconify.design/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg`;
}

function normalizeIcon(value: unknown): IconSearchIcon | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const name = stringFrom(item.name);
  const library = stringFrom(item.library);
  if (!name || !library) return null;

  const rawSvgUrl = stringFrom(item.svgUrl);
  const normalizedSvgUrl = normalizeHttpsUrl(rawSvgUrl);
  const cdnUrl = buildIconifyCdnUrl(library, name);

  const previewUrls = Array.isArray(item.previewUrls)
    ? item.previewUrls.map(normalizeHttpsUrl).filter(Boolean)
    : [];
  const urls = [...new Set([...previewUrls, normalizedSvgUrl, cdnUrl].filter(Boolean))];

  return {
    id: stringFrom(item.id) || `${library}-${name}`,
    name,
    displayName: formatTitle(stringFrom(item.displayName) || name),
    library,
    libraryName: stringFrom(item.libraryName) || formatTitle(library),
    license: stringFrom(item.license) || "License not listed",
    legalSafe: item.legalSafe === true,
    svgUrl: urls[0] || cdnUrl,
    previewUrls: urls,
  };
}

function renderLoading(): void {
  elements.resultsGrid.setAttribute("aria-busy", "true");
  elements.loadingLine.classList.add("is-active");
  elements.resultCount.textContent = "Searching...";
  if (state.icons.length) return;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 8; index += 1) {
    const skeleton = document.createElement("span");
    skeleton.className = "result-skeleton";
    fragment.appendChild(skeleton);
  }
  elements.resultsGrid.replaceChildren(fragment);
}

function renderSelection(): void {
  const icon = selectedIcon();
  elements.insertButton.disabled = !icon || !state.officeReady || state.inserting;
  elements.sizeValue.textContent = `${state.size} pt`;
  if (!icon) {
    elements.selectedName.textContent = "No icon selected";
    elements.selectedDetails.textContent = "Try a broader search";
    elements.selectedPreview.removeAttribute("src");
    return;
  }

  elements.selectedName.textContent = icon.displayName;
  elements.selectedDetails.textContent = `${icon.libraryName} · ${icon.license}`;
  elements.selectedPreview.removeAttribute("src");
  elements.selectedPreview.classList.add("is-pending");
  void hydratePreview(elements.selectedPreview, icon, 96);
}

function renderResults(): void {
  state.previewObserver?.disconnect();
  state.previewObserver = null;
  elements.resultsGrid.setAttribute("aria-busy", "false");
  elements.loadingLine.classList.remove("is-active");
  elements.resultCount.textContent = `${state.icons.length.toLocaleString()} of ${state.total.toLocaleString()} icons`;

  if (!state.icons.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No matching icons";
    elements.resultsGrid.replaceChildren(empty);
    return;
  }
  const fragment = document.createDocumentFragment();
  for (const icon of state.icons) {
    fragment.appendChild(createCardElement(icon));
  }
  elements.resultsGrid.replaceChildren(fragment);
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
    void hydratePreview(element, icon, 48);
    return;
  }

  state.previewObserver ??= new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      const target = entry.target as HTMLImageElement;
      const targetIcon = state.icons.find((candidate) => candidate.id === target.dataset.iconId);
      if (targetIcon) void hydratePreview(target, targetIcon, 48);
    }
  }, { rootMargin: "600px 0px" });
  element.dataset.iconId = icon.id;
  state.previewObserver.observe(element);
}

async function hydratePreview(element: HTMLImageElement, icon: IconSearchIcon, size: number): Promise<void> {
  const previewKey = `${icon.id}|${state.color}|${size}`;
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
  if (!state.officeReady || state.inserting) return;
  state.inserting = true;
  elements.insertButton.disabled = true;
  elements.insertButton.classList.add("is-busy");
  setStatus(`Preparing ${icon.displayName}...`);

  try {
    const safeSvg = await fetchIconSvg(icon);
    const styledSvg = styleSvg(safeSvg, { color: state.color, title: `${icon.displayName} icon` });
    const xmlSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${styledSvg}`;
    const canInsertSvg = Office.context.requirements.isSetSupported("ImageCoercion", "1.2");
    let insertedAs = "SVG";

    if (canInsertSvg) {
      try {
        await insertSelectedData(xmlSvg, Office.CoercionType.XmlSvg);
      } catch {
        const png = await svgToPngBase64(styledSvg, state.size);
        await insertSelectedData(png, Office.CoercionType.Image);
        insertedAs = "PNG";
      }
    } else {
      const png = await svgToPngBase64(styledSvg, state.size);
      await insertSelectedData(png, Office.CoercionType.Image);
      insertedAs = "PNG";
    }


    setStatus(`Inserted ${icon.displayName} as ${insertedAs}.`, "success");
  } catch {
    try {
      const safeSvg = await fetchIconSvg(icon);
      const styledSvg = styleSvg(safeSvg, { color: state.color, title: `${icon.displayName} icon` });
      const png = await svgToPngBase64(styledSvg, state.size);
      await insertSelectedData(png, Office.CoercionType.Image);
      setStatus(`Inserted ${icon.displayName} as PNG image.`, "success");
    } catch (fallbackErr) {
      setStatus(fallbackErr instanceof Error ? fallbackErr.message : "PowerPoint could not insert the icon.", "error");
    }
  } finally {
    state.inserting = false;
    elements.insertButton.classList.remove("is-busy");
    renderSelection();
  }
}

function insertSelectedData(data: string, coercionType: Office.CoercionType): Promise<void> {

  const position = getImagePosition(state.position);
  return new Promise((resolve, reject) => {
    Office.context.document.setSelectedDataAsync(
      data,
      {
        coercionType,
        imageWidth: state.size,
        imageHeight: state.size,
        ...position,
      },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) resolve();
        else reject(new Error(result.error?.message || "PowerPoint rejected the image data."));
      },
    );
  });
}

function getImagePosition(position: InsertPosition): { imageLeft?: number; imageTop?: number } {
  if (position === "top-left") return { imageLeft: 24, imageTop: 24 };
  if (position === "content") return { imageLeft: 60, imageTop: 108 };
  return {};
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
        if (!context) throw new Error("This browser cannot create the PNG fallback.");
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
      reject(new Error("The SVG could not be converted to a PNG fallback."));
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
