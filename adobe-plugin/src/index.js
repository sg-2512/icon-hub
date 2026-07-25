const API_BASE = "https://iconsearch.info";
const PRODUCT = "adobe";
const SESSION_KEY = "iconsearch:adobe:session";
const PENDING_KEY = "iconsearch:adobe:pending-device-code";
const SDK_URL = "https://express.adobe.com/static/add-on-sdk/sdk.js";
const DEFAULT_QUERY = "arrow";

const NAMED_LIBRARIES = [
  ["lucide-icons", "Lucide Icons"],
  ["heroicons", "Heroicons"],
  ["tabler-icons", "Tabler Icons"],
  ["patternfly-icons", "PatternFly Icons"],
  ["untitled-ui-icons", "Untitled UI Icons"],
  ["phosphor-icons", "Phosphor Icons"],
  ["remix-icon", "Remix Icon"],
  ["feather-icons", "Feather Icons"],
  ["bootstrap-icons", "Bootstrap Icons"],
  ["radix-icons", "Radix Icons"],
  ["iconoir", "Iconoir"],
  ["ionicons", "Ionicons"],
  ["octicons", "Octicons"],
  ["ant-design-icons", "Ant Design Icons"],
  ["devicons", "Devicons"],
  ["teenyicons", "Teenyicons"],
  ["circum-icons", "Circum Icons"],
  ["elusive-icons", "Elusive Icons"],
];

const LIBRARIES = [
  ["all", "All libraries (355,000+ icons)"],
  ...NAMED_LIBRARIES,
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
  session: readSession(),
  pendingCode: readPendingCode(),
  pollTimer: null,
  icons: [],
  iconifySets: [],
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
  authHeaderBtn: document.getElementById("authHeaderBtn"),
  authScreen: document.getElementById("authScreen"),
  authStatusText: document.getElementById("authStatusText"),
  startAuthBtn: document.getElementById("startAuthBtn"),
  mainApp: document.getElementById("mainApp"),

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
  updateAuthUI();
  await initializeAdobeSdk();

  if (state.session?.token) {
    await searchIcons();
  }
}

async function initializeAdobeSdk() {
  setStatus("Connecting to Adobe Express...");

  try {
    const sdkModule = await import(SDK_URL);
    state.sdk = sdkModule.default;
    await state.sdk.ready;
    state.sdkReady = true;
    setStatus("Ready. Search icons and insert or drag into your Adobe Express canvas.", "success");

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
      "Standalone mode: Open inside Adobe Express to enable 1-click canvas insertion.",
      "info",
    );
  }
}

function hydrateControls() {
  elements.searchInput.value = state.query;
  elements.sizeValue.textContent = `${state.size}px`;
  elements.colorInput.value = state.color;
  elements.legalOnlyInput.checked = state.legalOnly;

  renderLibrarySelect();
  renderStyleSelect();
}

function renderLibrarySelect() {
  elements.librarySelect.innerHTML = "";

  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "All libraries (355,000+ icons)";
  elements.librarySelect.appendChild(allOpt);

  const namedGroup = document.createElement("optgroup");
  namedGroup.label = "Primary Libraries (18)";
  NAMED_LIBRARIES.forEach(([id, name]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = name;
    namedGroup.appendChild(opt);
  });
  elements.librarySelect.appendChild(namedGroup);

  if (state.iconifySets.length > 0) {
    const iconifyGroup = document.createElement("optgroup");
    iconifyGroup.label = `Iconify Collections (${state.iconifySets.length})`;
    state.iconifySets.forEach((setName) => {
      const opt = document.createElement("option");
      opt.value = `iconify:${setName}`;
      opt.textContent = `Iconify: ${formatIconifyTitle(setName)}`;
      iconifyGroup.appendChild(opt);
    });
    elements.librarySelect.appendChild(iconifyGroup);
  }

  elements.librarySelect.value = state.library;
}

function renderStyleSelect() {
  elements.styleSelect.innerHTML = "";
  STYLES.forEach(([id, name]) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = name;
    elements.styleSelect.appendChild(opt);
  });
  elements.styleSelect.value = state.style;
}

function bindEvents() {
  elements.authHeaderBtn.addEventListener("click", () => {
    if (state.session) signOut();
    else startAuthDevice();
  });

  elements.startAuthBtn.addEventListener("click", startAuthDevice);

  elements.searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    scheduleSearch();
  });

  elements.librarySelect.addEventListener("change", (e) => {
    state.library = e.target.value;
    searchIcons();
  });

  elements.styleSelect.addEventListener("change", (e) => {
    state.style = e.target.value;
    searchIcons();
  });

  elements.legalOnlyInput.addEventListener("change", (e) => {
    state.legalOnly = e.target.checked;
    searchIcons();
  });

  elements.sizeInput.addEventListener("input", (e) => {
    state.size = Number.parseInt(e.target.value, 10) || 96;
    elements.sizeValue.textContent = `${state.size}px`;
    updateSelectedPreview();
  });

  elements.colorInput.addEventListener("input", (e) => {
    state.color = e.target.value;
    syncColorSwatches();
    updateSelectedPreview();
  });

  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      const color = swatch.dataset.color;
      if (!color) return;
      state.color = color;
      elements.colorInput.value = color;
      syncColorSwatches();
      updateSelectedPreview();
    });
  });

  elements.insertButton.addEventListener("click", () => {
    const icon = getSelectedIcon();
    if (icon) insertIcon(icon);
  });
}

function syncColorSwatches() {
  document.querySelectorAll(".swatch").forEach((swatch) => {
    swatch.classList.toggle("is-active", swatch.dataset.color === state.color);
  });
}

function scheduleSearch() {
  clearTimeout(state.searchTimer);
  state.searchTimer = setTimeout(() => searchIcons(), 200);
}

function updateAuthUI() {
  if (state.session?.token) {
    elements.authScreen.classList.add("hidden");
    elements.mainApp.classList.remove("hidden");
    elements.authHeaderBtn.textContent = "Sign out";
  } else {
    elements.authScreen.classList.remove("hidden");
    elements.mainApp.classList.add("hidden");
    elements.authHeaderBtn.textContent = "Sign in";
  }
}

async function startAuthDevice() {
  setStatus("Starting IconSearch sign-in...");
  elements.authStatusText.textContent = "Requesting sign-in link...";

  try {
    const res = await fetch(`${API_BASE}/api/device/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ product: PRODUCT, clientName: "Adobe Express" }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not start sign-in.");

    savePendingCode(data.deviceCode);
    state.pendingCode = data.deviceCode;

    const uri = data.verificationUriComplete || `${API_BASE}/connect?product=${PRODUCT}&code=${data.deviceCode}`;

    elements.authStatusText.innerHTML = `
      <div style="margin-top:14px;padding:14px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;text-align:center;">
        <p style="margin:0 0 6px 0;font-size:11px;color:#64748b;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;">Connect IconSearch</p>
        <p style="margin:0 0 12px 0;font-size:12px;color:#334155;line-height:1.4;">Click below to authorize this Adobe Express Add-on in your browser tab:</p>
        <a href="${uri}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;font-weight:700;border-radius:8px;text-decoration:none;font-size:13px;box-shadow:0 2px 6px rgba(37,99,235,0.25);">Open iconsearch.info/connect ↗</a>
      </div>
    `;

    startPollTimer();
  } catch (err) {
    elements.authStatusText.textContent = err.message || "Failed to start sign-in.";
    setStatus(err.message, "error");
  }
}

function startPollTimer() {
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    if (!state.pendingCode) return;
    try {
      const res = await fetch(`${API_BASE}/api/device/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ deviceCode: state.pendingCode }),
      });
      const data = await res.json();
      if (res.ok && data.status === "authorized" && data.token) {
        clearInterval(state.pollTimer);
        clearPendingCode();
        state.pendingCode = "";
        const sess = { token: data.token, savedAt: new Date().toISOString() };
        saveSession(sess);
        state.session = sess;
        updateAuthUI();
        setStatus("IconSearch connected.", "success");
        await searchIcons();
      }
    } catch {
      // Ignore transient polling errors
    }
  }, 3000);
}

function signOut() {
  clearSession();
  state.session = null;
  state.pendingCode = "";
  clearInterval(state.pollTimer);
  updateAuthUI();
  setStatus("Signed out.", "info");
}

async function searchIcons() {
  if (!state.session?.token) return;

  if (state.searchController) state.searchController.abort();
  state.searchController = new AbortController();

  state.loading = true;
  renderLoading();
  setStatus("Searching IconSearch catalog...");

  const url = new URL(`${API_BASE}/api/extension/icon-search`);
  if (state.query.trim()) url.searchParams.set("q", state.query.trim());
  url.searchParams.set("limit", "48");
  url.searchParams.set("page", "1");
  url.searchParams.set("sort", state.query.trim() ? "relevance" : "popular");
  url.searchParams.set("legalOnly", state.legalOnly ? "1" : "0");
  if (state.style !== "all") url.searchParams.set("style", state.style);

  applyLibraryParams(url, state.library);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${state.session.token}`,
        "x-iconsearch-product": PRODUCT,
      },
      signal: state.searchController.signal,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Search failed.");

    state.icons = (Array.isArray(data.icons) ? data.icons : [])
      .map(normalizeIcon)
      .filter(Boolean);
    state.total = typeof data.total === "number" ? data.total : state.icons.length;

    if (data.facets && Array.isArray(data.facets.iconifySets) && data.facets.iconifySets.length > 0) {
      state.iconifySets = data.facets.iconifySets;
      renderLibrarySelect();
    }

    if (!state.icons.some((i) => i.id === state.selectedId)) {
      state.selectedId = state.icons[0]?.id || "";
    }

    renderResults();
    updateSelectedPreview();
    setStatus(`${state.total.toLocaleString()} matching icons found`, "success");
  } catch (err) {
    if (err.name === "AbortError") return;
    state.icons = [];
    state.total = 0;
    renderResults();
    setStatus(err.message || "Search failed.", "error");
  } finally {
    state.loading = false;
  }
}

function applyLibraryParams(url, value) {
  if (value === "all") return;
  if (value === "iconify") {
    url.searchParams.set("lib", "iconify");
    return;
  }
  if (value.startsWith("iconify:")) {
    url.searchParams.set("lib", "iconify");
    url.searchParams.set("iconifySet", value.slice("iconify:".length));
    return;
  }
  url.searchParams.set("lib", value);
}

function normalizeIcon(item) {
  if (!item || typeof item !== "object") return null;
  const name = item.name || "";
  const library = item.library || "";
  const rawSvgUrl = item.svgUrl || "";
  if (!name || !library || !rawSvgUrl) return null;

  const absoluteSvgUrl = rawSvgUrl.startsWith("/") ? `${API_BASE}${rawSvgUrl}` : rawSvgUrl;

  const previewUrls = Array.isArray(item.previewUrls)
    ? item.previewUrls
        .map((url) => (typeof url === "string" && url.startsWith("/") ? `${API_BASE}${url}` : url))
        .filter((url) => typeof url === "string" && /^https?:\/\//.test(url))
    : [absoluteSvgUrl];

  return {
    id: item.id || `${library}-${name}`,
    name,
    displayName: formatIconTitle(item.displayName || name),
    library,
    libraryName: item.libraryName || formatIconTitle(library),
    license: item.license || "Open-source",
    svgUrl: previewUrls[0] || absoluteSvgUrl,
    previewUrls,
  };
}

function getSelectedIcon() {
  return state.icons.find((i) => i.id === state.selectedId) || state.icons[0];
}

function updateSelectedPreview() {
  const icon = getSelectedIcon();
  if (!icon) {
    elements.selectedName.textContent = "No icon selected";
    elements.selectedDetails.textContent = "Search and select an icon";
    elements.selectedPreview.innerHTML = "";
    elements.insertButton.disabled = true;
    return;
  }

  elements.selectedName.textContent = icon.displayName;
  elements.selectedDetails.textContent = `${icon.libraryName} · ${icon.license}`;
  elements.insertButton.disabled = false;

  fetchSvg(icon)
    .then((svg) => {
      const styled = styleSvg(svg, state.color, state.size);
      elements.selectedPreview.innerHTML = styled;
    })
    .catch(() => {
      elements.selectedPreview.innerHTML = `<img src="${icon.svgUrl}" alt="" />`;
    });
}

function renderLoading() {
  elements.resultCount.textContent = "Searching...";
  elements.resultsGrid.setAttribute("aria-busy", "true");
}

function renderResults() {
  elements.resultsGrid.setAttribute("aria-busy", "false");
  elements.resultCount.textContent = `${state.total.toLocaleString()} icons`;
  elements.resultsGrid.innerHTML = "";

  if (state.icons.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-msg";
    empty.textContent = "No icons found.";
    elements.resultsGrid.appendChild(empty);
    return;
  }

  state.icons.forEach((icon) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = icon.id === state.selectedId ? "icon-card is-active" : "icon-card";

    const previewSpan = document.createElement("span");
    previewSpan.className = "icon-thumb";

    const img = document.createElement("img");
    img.src = icon.svgUrl;
    img.alt = "";
    img.loading = "lazy";
    previewSpan.appendChild(img);

    const nameSpan = document.createElement("span");
    nameSpan.className = "icon-name";
    nameSpan.textContent = icon.displayName;

    const libSpan = document.className = "icon-lib";
    libSpan.textContent = icon.libraryName;

    card.appendChild(previewSpan);
    card.appendChild(nameSpan);
    card.appendChild(libSpan);

    card.addEventListener("click", () => {
      state.selectedId = icon.id;
      renderResults();
      updateSelectedPreview();
    });

    card.addEventListener("dblclick", () => insertIcon(icon));

    // Support Drag and Drop to Adobe Express Document if SDK enables it
    if (state.sdkReady && state.sdk?.app?.enableDragToDocument) {
      try {
        state.sdk.app.enableDragToDocument(card, {
          preview: (element) => new URL(icon.svgUrl),
          addData: async () => {
            const svgText = await fetchSvg(icon);
            const styledSvg = styleSvg(svgText, state.color, state.size);
            const blob = new Blob([styledSvg], { type: "image/svg+xml" });
            return {
              data: [
                {
                  blob,
                  type: "image/svg+xml",
                  title: `${icon.displayName} icon`,
                },
              ],
            };
          },
        });
      } catch {
        // Drag-and-drop fallback
      }
    }

    elements.resultsGrid.appendChild(card);
  });
}

async function insertIcon(icon) {
  setStatus(`Preparing ${icon.displayName}...`);
  elements.insertButton.disabled = true;

  try {
    const rawSvg = await fetchSvg(icon);
    const styledSvg = styleSvg(rawSvg, state.color, state.size);
    const blob = new Blob([styledSvg], { type: "image/svg+xml" });

    if (state.sdkReady && state.sdk?.app?.document?.addImage) {
      await state.sdk.app.document.addImage(blob, { title: `${icon.displayName} icon` });
      setStatus(`Inserted ${icon.displayName} into document.`, "success");
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${icon.name}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Downloaded ${icon.displayName}.svg`, "success");
    }
  } catch (err) {
    setStatus(err.message || "Failed to insert icon.", "error");
  } finally {
    elements.insertButton.disabled = false;
  }
}

async function fetchSvg(icon) {
  if (state.svgCache.has(icon.id)) return state.svgCache.get(icon.id);
  const res = await fetch(icon.svgUrl);
  if (!res.ok) throw new Error("Could not fetch SVG markup.");
  const text = await res.text();
  state.svgCache.set(icon.id, text);
  return text;
}

function styleSvg(svgText, color, size) {
  let svg = svgText.trim();
  if (color) {
    svg = svg.replace(/stroke="((?!none)[^"]*)"/gi, `stroke="${color}"`);
    svg = svg.replace(/fill="((?!none)[^"]*)"/gi, `fill="${color}"`);
  }
  if (size) {
    svg = svg.replace(/\s(width|height)="[^"]*"/gi, "");
    svg = svg.replace(/^<svg\b/i, `<svg width="${size}" height="${size}"`);
  }
  return svg;
}

function formatIconTitle(val) {
  return val
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((p) => `${p.charAt(0).toUpperCase()}${p.slice(1)}`)
    .join(" ");
}

const acronymParts = new Set(["ai", "bi", "fa", "gis", "ic", "mdi", "svg", "ui", "carbon", "uil", "uis"]);
function formatIconifyTitle(id) {
  return id
    .replace(/^iconify-/, "")
    .split("-")
    .map((p) => (acronymParts.has(p) ? p.toUpperCase() : `${p.charAt(0).toUpperCase()}${p.slice(1)}`))
    .join(" ");
}

function setStatus(text, type = "info") {
  elements.statusBar.textContent = text;
  elements.statusBar.className = `status-bar is-${type}`;
}

function readSession() {
  try {
    const val = localStorage.getItem(SESSION_KEY);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

function saveSession(sess) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PENDING_KEY);
}

function readPendingCode() {
  return localStorage.getItem(PENDING_KEY) || "";
}

function savePendingCode(code) {
  localStorage.setItem(PENDING_KEY, code);
}

function clearPendingCode() {
  localStorage.removeItem(PENDING_KEY);
}
