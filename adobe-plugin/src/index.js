const API_BASE = "https://iconsearch.info";
const SEARCH_ENDPOINT = `${API_BASE}/api/icons`;
const SDK_URL = "https://express.adobe.com/static/add-on-sdk/sdk.js";
const DEFAULT_QUERY = "arrow";
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
];
const STYLES = [
  ["all", "All styles"],
  ["stroke", "Outline"],
  ["solid", "Solid"],
  ["duotone", "Duotone"],
  ["twotone", "Two-tone"],
  ["sharp", "Sharp"],
];

const state = {
  sdk: null,
  sdkReady: false,
  icons: [],
  selectedId: "",
  loading: false,
  total: 0,
  query: DEFAULT_QUERY,
  library: "all",
  style: "all",
  legalOnly: true,
  size: 96,
  color: "#111827",
  searchController: null,
  searchTimer: 0,
  svgCache: new Map(),
};

const elements = {
  searchInput: document.getElementById("searchInput"),
  librarySelect: document.getElementById("librarySelect"),
  styleSelect: document.getElementById("styleSelect"),
  legalOnlyInput: document.getElementById("legalOnlyInput"),
  sizeInput: document.getElementById("sizeInput"),
  colorInput: document.getElementById("colorInput"),
  sizeValue: document.getElementById("sizeValue"),
  selectedPreview: document.getElementById("selectedPreview"),
  selectedName: document.getElementById("selectedName"),
  selectedDetails: document.getElementById("selectedDetails"),
  insertButton: document.getElementById("insertButton"),
  resultCount: document.getElementById("resultCount"),
  resultsGrid: document.getElementById("resultsGrid"),
  statusBar: document.getElementById("statusBar"),
};

boot();

async function boot() {
  hydrateControls();
  bindEvents();
  renderLoading();
  await initializeAdobeSdk();
  await searchIcons();
}

async function initializeAdobeSdk() {
  setStatus("Connecting to Adobe Express...");

  try {
    const sdkModule = await import(SDK_URL);
    state.sdk = sdkModule.default;
    await state.sdk.ready;
    state.sdkReady = true;
    setStatus("Ready. Click Insert or drag any icon into your Adobe Express canvas.", "success");

    if (state.sdk.app && typeof state.sdk.app.on === "function") {
      state.sdk.app.on("dragend", (eventData) => {
        if (eventData && !eventData.dropCancelled) {
          setStatus("Icon dropped into the Adobe Express document.", "success");
        }
      });
    }
  } catch (error) {
    state.sdk = null;
    state.sdkReady = false;
    setStatus(
      "Preview mode: open this add-on in Adobe Express to enable click insertion and drag-to-document.",
      "error",
    );
    console.warn("Adobe Express SDK is not available in this context.", error);
  }
}

function hydrateControls() {
  elements.searchInput.value = state.query;
  elements.sizeValue.textContent = `${state.size}px`;

  fillSelect(elements.librarySelect, LIBRARIES, state.library);
  fillSelect(elements.styleSelect, STYLES, state.style);
}

function fillSelect(select, options, selected) {
  select.innerHTML = "";
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    option.selected = value === selected;
    select.appendChild(option);
  });
}

function bindEvents() {
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
    state.size = clamp(Number(elements.sizeInput.value) || 96, 24, 256);
    elements.sizeValue.textContent = `${state.size}px`;
    renderSelection();
    renderResults();
  });

  elements.colorInput.addEventListener("input", () => {
    state.color = isSafeHex(elements.colorInput.value) ? elements.colorInput.value : "#111827";
    updateSwatches();
    renderSelection();
    renderResults();
  });

  elements.insertButton.addEventListener("click", () => {
    const icon = getSelectedIcon();
    if (icon) {
      void insertIcon(icon);
    }
  });

  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const color = swatch.getAttribute("data-color") || "#111827";
      state.color = color;
      elements.colorInput.value = color;
      updateSwatches();
      renderSelection();
      renderResults();
    });
  });
}

function scheduleSearch() {
  window.clearTimeout(state.searchTimer);
  state.searchTimer = window.setTimeout(() => {
    void searchIcons();
  }, 180);
}

async function searchIcons() {
  if (state.searchController) state.searchController.abort();
  state.searchController = new AbortController();
  state.loading = true;
  renderLoading();

  const url = new URL(SEARCH_ENDPOINT);
  if (state.query) url.searchParams.set("q", state.query);
  url.searchParams.set("lib", state.library);
  url.searchParams.set("style", state.style);
  url.searchParams.set("legalOnly", state.legalOnly ? "1" : "0");
  url.searchParams.set("limit", "48");
  url.searchParams.set("sort", state.query ? "relevance" : "popular");

  try {
    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      signal: state.searchController.signal,
    });
    if (!response.ok) throw new Error(`IconSearch returned ${response.status}.`);
    const payload = await response.json();
    state.icons = Array.isArray(payload.icons) ? payload.icons.map(normalizeIcon).filter(Boolean) : [];
    state.total = numberFrom(payload.total, state.icons.length);
    state.selectedId = state.icons.some((icon) => icon.id === state.selectedId)
      ? state.selectedId
      : state.icons[0]?.id || "";
    setStatus(
      state.sdkReady
        ? "Ready. Click Insert or drag any icon into your Adobe Express canvas."
        : "Preview mode: search works here, insertion works inside Adobe Express.",
      state.sdkReady ? "success" : "",
    );
  } catch (error) {
    if (state.searchController.signal.aborted) return;
    state.icons = [];
    state.total = 0;
    setStatus(error instanceof Error ? error.message : "Icon search failed.", "error");
  } finally {
    if (!state.searchController.signal.aborted) {
      state.loading = false;
      renderSelection();
      renderResults();
    }
  }
}

function normalizeIcon(value) {
  if (!value || typeof value !== "object") return null;
  const name = stringFrom(value.name);
  const library = stringFrom(value.library);
  const svgUrl = normalizeUrl(value.svgUrl);
  if (!name || !library || !svgUrl) return null;

  const previewUrls = Array.isArray(value.previewUrls)
    ? value.previewUrls.map(normalizeUrl).filter(Boolean)
    : [];

  return {
    id: stringFrom(value.id) || `${library}-${name}`,
    name,
    displayName: formatIconTitle(stringFrom(value.displayName) || name),
    library,
    libraryName: stringFrom(value.libraryName) || formatIconTitle(library),
    license: stringFrom(value.license) || "license unknown",
    legalSafe: value.legalSafe === true,
    svgUrl: previewUrls[0] || svgUrl,
    previewUrls: previewUrls.length ? previewUrls : [svgUrl],
  };
}

function renderLoading() {
  elements.resultsGrid.setAttribute("aria-busy", "true");
  elements.resultCount.textContent = "Searching...";
  elements.resultsGrid.innerHTML = '<div class="loading-state">Loading high-quality SVG icons from IconSearch...</div>';
}

function renderSelection() {
  const icon = getSelectedIcon();
  const size = clamp(state.size, 24, 256);
  const previewSize = clamp(Math.round(size * 0.66), 40, 76);

  elements.insertButton.disabled = !icon || !state.sdkReady;
  elements.sizeValue.textContent = `${size}px`;
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
  applyMask(elements.selectedPreview, icon);
}

function renderResults() {
  elements.resultsGrid.setAttribute("aria-busy", state.loading ? "true" : "false");
  elements.resultCount.textContent = state.loading
    ? "Searching..."
    : `${state.total.toLocaleString()} icons`;

  if (state.loading) {
    renderLoading();
    return;
  }

  elements.resultsGrid.innerHTML = "";

  if (!state.icons.length) {
    elements.resultsGrid.innerHTML = '<div class="empty-state">No icons found. Try a broader search or switch libraries.</div>';
    return;
  }

  const selectedId = getSelectedIcon()?.id || "";
  const fragment = document.createDocumentFragment();

  state.icons.forEach((icon) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = `icon-card${icon.id === selectedId ? " is-selected" : ""}`;
    card.title = state.sdkReady ? "Click to select. Drag into Adobe Express." : "Click to preview. Drag works in Adobe Express.";

    const thumb = document.createElement("span");
    thumb.className = "icon-thumb";

    const shape = document.createElement("span");
    shape.className = "icon-shape";
    shape.style.backgroundColor = state.color;
    applyMask(shape, icon);
    thumb.appendChild(shape);

    const title = document.createElement("span");
    title.className = "icon-title";
    title.textContent = icon.displayName;

    const subtitle = document.createElement("span");
    subtitle.className = "icon-subtitle";
    subtitle.textContent = icon.libraryName;

    const dragHint = document.createElement("span");
    dragHint.className = "drag-hint";
    dragHint.textContent = state.sdkReady ? "Drag to canvas" : "Adobe required";

    card.append(thumb, title, subtitle, dragHint);
    card.addEventListener("click", () => {
      state.selectedId = icon.id;
      renderSelection();
      renderResults();
    });
    card.addEventListener("dblclick", () => {
      void insertIcon(icon);
    });

    enableAdobeDrag(card, icon);
    fragment.appendChild(card);
  });

  elements.resultsGrid.appendChild(fragment);
}

function enableAdobeDrag(card, icon) {
  if (!state.sdkReady || !state.sdk?.app || typeof state.sdk.app.enableDragToDocument !== "function") {
    return;
  }

  try {
    state.sdk.app.enableDragToDocument(card, {
      previewCallback: () => new URL(icon.svgUrl),
      completionCallback: async () => [
        {
          blob: await createStyledSvgBlob(icon),
          attributes: {
            title: `${icon.displayName} icon`,
            author: "IconSearch",
          },
          importAddOnData: {
            nodeAddOnData: {
              source: "iconsearch",
              iconId: icon.id,
              library: icon.library,
              size: String(state.size),
              color: state.color,
            },
            mediaAddOnData: {
              source: "iconsearch",
              iconId: icon.id,
            },
          },
        },
      ],
    });
    card.classList.add("is-drag-enabled");
  } catch (error) {
    console.warn("Could not enable drag for icon.", icon.id, error);
  }
}

async function insertIcon(icon) {
  if (!state.sdkReady || !state.sdk?.app?.document) {
    setStatus("Open this add-on inside Adobe Express to insert icons.", "error");
    return;
  }

  elements.insertButton.disabled = true;
  elements.insertButton.textContent = "Inserting...";
  setStatus(`Preparing ${icon.displayName}...`);

  try {
    const blob = await createStyledSvgBlob(icon);
    await state.sdk.app.document.addImage(
      blob,
      {
        title: `${icon.displayName} icon`,
        author: "IconSearch",
      },
      {
        nodeAddOnData: {
          source: "iconsearch",
          iconId: icon.id,
          library: icon.library,
          size: String(state.size),
          color: state.color,
        },
        mediaAddOnData: {
          source: "iconsearch",
          iconId: icon.id,
        },
      },
    );
    setStatus(`Inserted ${icon.displayName}.`, "success");
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "Could not insert icon.", "error");
  } finally {
    elements.insertButton.textContent = "Insert selected";
    renderSelection();
  }
}

async function createStyledSvgBlob(icon) {
  const svg = await fetchSvgMarkup(icon);
  const styledSvg = styleSvg(svg, {
    size: clamp(state.size, 24, 256),
    color: isSafeHex(state.color) ? state.color : "#111827",
    title: icon.displayName,
  });
  return new Blob([styledSvg], { type: "image/svg+xml" });
}

async function fetchSvgMarkup(icon) {
  if (state.svgCache.has(icon.id)) return state.svgCache.get(icon.id);

  let lastError = "";
  for (const url of icon.previewUrls) {
    try {
      const response = await fetch(url, { headers: { accept: "image/svg+xml,text/plain,*/*" } });
      if (!response.ok) {
        lastError = `SVG request returned ${response.status}`;
        continue;
      }

      const text = (await response.text()).trim();
      if (/<svg[\s>]/i.test(text)) {
        const cleanSvg = sanitizeSvg(text);
        state.svgCache.set(icon.id, cleanSvg);
        return cleanSvg;
      }
      lastError = "Response was not SVG markup";
    } catch (error) {
      lastError = error instanceof Error ? error.message : "SVG request failed";
    }
  }

  throw new Error(`Could not fetch SVG for ${icon.displayName}. ${lastError}`);
}

function sanitizeSvg(svg) {
  return svg
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/<a\b[\s\S]*?<\/a\s*>/gi, "")
    .replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, "")
    .trim();
}

function styleSvg(svg, options) {
  const color = options.color;
  let next = svg;

  if (!/currentColor/i.test(next)) {
    next = next
      .replace(/\sfill=(["'])(?!none|transparent|url\()[^"']*\1/gi, ` fill="${color}"`)
      .replace(/\sstroke=(["'])(?!none|transparent|url\()[^"']*\1/gi, ` stroke="${color}"`);
  }

  const hasPaint = /\s(?:fill|stroke)=/i.test(next);
  next = next.replace(/<svg\b([^>]*)>/i, (match, attrs) => {
    let cleanAttrs = attrs
      .replace(/\swidth=(["'])[\s\S]*?\1/i, "")
      .replace(/\sheight=(["'])[\s\S]*?\1/i, "")
      .replace(/\scolor=(["'])[\s\S]*?\1/i, "")
      .trim();
    if (!/\sxmlns=/.test(` ${cleanAttrs}`)) {
      cleanAttrs += ' xmlns="http://www.w3.org/2000/svg"';
    }
    if (!hasPaint) {
      cleanAttrs += ` fill="${color}"`;
    }
    return `<svg ${cleanAttrs} width="${options.size}" height="${options.size}" color="${color}" role="img" aria-label="${escapeAttr(options.title)}">`;
  });

  return next;
}

function applyMask(element, icon) {
  const url = icon.svgUrl.replace(/"/g, "%22");
  element.style.webkitMask = `url("${url}") no-repeat center / contain`;
  element.style.mask = `url("${url}") no-repeat center / contain`;
}

function getSelectedIcon() {
  return state.icons.find((icon) => icon.id === state.selectedId) || state.icons[0] || null;
}

function updateSwatches() {
  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.classList.toggle("is-active", swatch.getAttribute("data-color") === state.color);
  });
}

function setStatus(message, tone = "") {
  elements.statusBar.textContent = message;
  elements.statusBar.classList.toggle("is-error", tone === "error");
  elements.statusBar.classList.toggle("is-success", tone === "success");
}

function normalizeUrl(value) {
  const url = stringFrom(value).trim();
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  return /^https:\/\//i.test(url) ? url : "";
}

function formatIconTitle(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stringFrom(value) {
  return typeof value === "string" ? value : "";
}

function numberFrom(value, fallback) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isSafeHex(value) {
  return /^#[0-9a-f]{3,8}$/i.test(String(value || ""));
}
