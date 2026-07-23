"use strict";
(() => {
  // src/index.ts
  var API_BASE = "https://iconsearch.info";
  var SEARCH_ENDPOINT = `${API_BASE}/api/icons`;
  var DEFAULT_QUERY = "arrow";
  var ASSET_CACHE_KEY = "iconsearch.webflow.assets.v1";
  var LIBRARIES = [
    ["all", "All libraries"],
    ["lucide-icons", "Lucide"],
    ["heroicons", "Heroicons"],
    ["tabler-icons", "Tabler"],
    ["phosphor-icons", "Phosphor"],
    ["remix-icon", "Remix"],
    ["bootstrap-icons", "Bootstrap"],
    ["iconoir", "Iconoir"],
    ["iconify", "Iconify collections"]
  ];
  var STYLES = [
    ["all", "All styles"],
    ["stroke", "Outline"],
    ["solid", "Solid"],
    ["duotone", "Duotone"],
    ["twotone", "Two-tone"],
    ["sharp", "Sharp"]
  ];
  var _cachedWf = null;
  function getWebflowApi() {
    if (_cachedWf) return _cachedWf;
    try {
      if (typeof window !== "undefined" && window.webflow) {
        console.log("[IconSearch] Found webflow on window");
        _cachedWf = window.webflow;
        return _cachedWf;
      }
    } catch {
    }
    try {
      const g = globalThis;
      if (g.webflow) {
        console.log("[IconSearch] Found webflow on globalThis");
        _cachedWf = g.webflow;
        return _cachedWf;
      }
    } catch {
    }
    try {
      if (typeof window !== "undefined" && window.parent && window.parent.webflow) {
        console.log("[IconSearch] Found webflow on window.parent");
        _cachedWf = window.parent.webflow;
        return _cachedWf;
      }
    } catch {
    }
    try {
      if (typeof window !== "undefined" && window.top && window.top.webflow) {
        console.log("[IconSearch] Found webflow on window.top");
        _cachedWf = window.top.webflow;
        return _cachedWf;
      }
    } catch {
    }
    try {
      if (typeof webflow !== "undefined" && webflow) {
        console.log("[IconSearch] Found webflow via bare reference");
        _cachedWf = webflow;
        return _cachedWf;
      }
    } catch {
    }
    return null;
  }
  function isWebflowAvailable() {
    return getWebflowApi() !== null;
  }
  var state = {
    webflowReady: false,
    icons: [],
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
    placement: "inside",
    searchController: null,
    searchTimer: 0,
    svgCache: /* @__PURE__ */ new Map(),
    previewObserver: null
  };
  var elements = {
    runtimeBadge: requiredElement("runtimeBadge"),
    searchInput: requiredElement("searchInput"),
    librarySelect: requiredElement("librarySelect"),
    styleSelect: requiredElement("styleSelect"),
    legalOnlyInput: requiredElement("legalOnlyInput"),
    resultCount: requiredElement("resultCount"),
    selectedPreview: requiredElement("selectedPreview"),
    selectedName: requiredElement("selectedName"),
    selectedDetails: requiredElement("selectedDetails"),
    selectionContext: requiredElement("selectionContext"),
    sizeInput: requiredElement("sizeInput"),
    sizeValue: requiredElement("sizeValue"),
    colorInput: requiredElement("colorInput"),
    placementSelect: requiredElement("placementSelect"),
    insertButton: requiredElement("insertButton"),
    resultsGrid: requiredElement("resultsGrid"),
    statusBar: requiredElement("statusBar")
  };
  void boot();
  async function boot() {
    hydrateControls();
    bindEvents();
    renderLoading();
    await initializeWebflow();
    await searchIcons();
  }
  async function initializeWebflow() {
    console.log("[IconSearch] Initializing Webflow API detection...");
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
      console.log("[IconSearch] Webflow API NOT found after 10s. Starting background retry...");
      elements.runtimeBadge.textContent = "Connecting...";
      setStatus("Looking for Webflow Designer API... Extension will work once connected.", "");
      startBackgroundRetry();
    }
  }
  function startBackgroundRetry() {
    let attempts = 0;
    const maxAttempts = 30;
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
        setStatus("Running standalone \u2014 icons can be browsed but not inserted into Webflow.", "");
      }
    }, 2e3);
  }
  async function activateDesignerMode(wf) {
    state.webflowReady = true;
    elements.runtimeBadge.textContent = "Designer live";
    elements.runtimeBadge.classList.add("is-live");
    console.log("[IconSearch] Designer mode activated");
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
        wf.subscribe("selectedelement", (element) => {
          void updateSelectionContext(element);
          renderSelection();
        });
      }
    } catch {
    }
    await updateSelectionContext();
    setStatus("Ready. Select an element on canvas and click Insert.", "success");
  }
  function hydrateControls() {
    elements.searchInput.value = state.query;
    elements.sizeInput.value = String(state.size);
    elements.sizeValue.textContent = `${state.size}px`;
    elements.colorInput.value = state.color;
    elements.placementSelect.value = state.placement;
    fillSelect(elements.librarySelect, LIBRARIES, state.library);
    fillSelect(elements.styleSelect, STYLES, state.style);
    updateSwatches();
  }
  function fillSelect(select, options, selectedValue) {
    select.replaceChildren();
    options.forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = value === selectedValue;
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
    elements.resultsGrid.addEventListener("scroll", () => {
      if (state.loading || state.loadingMore || !state.hasMore) return;
      const { scrollTop, clientHeight, scrollHeight } = elements.resultsGrid;
      if (scrollTop + clientHeight >= scrollHeight - 140) {
        void loadMoreIcons();
      }
    });
    document.querySelectorAll(".swatch").forEach((swatch) => {
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
  function scheduleSearch() {
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(() => void searchIcons(), 180);
  }
  async function searchIcons() {
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
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`IconSearch returned ${response.status}.`);
      const payload = await response.json();
      const rawIcons = Array.isArray(payload.icons) ? payload.icons : [];
      state.icons = rawIcons.map(normalizeIcon).filter((icon) => Boolean(icon));
      state.total = numberFrom(payload.total, state.icons.length);
      state.totalPages = numberFrom(payload.totalPages, 1);
      state.hasMore = state.page < state.totalPages && state.icons.length > 0;
      state.selectedId = state.icons.some((icon) => icon.id === state.selectedId) ? state.selectedId : state.icons[0]?.id || "";
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
  async function loadMoreIcons() {
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
        headers: { accept: "application/json" }
      });
      if (!response.ok) return;
      const payload = await response.json();
      const rawIcons = Array.isArray(payload.icons) ? payload.icons : [];
      const newIcons = rawIcons.map(normalizeIcon).filter((icon) => Boolean(icon));
      if (newIcons.length === 0) {
        state.hasMore = false;
      } else {
        state.page = nextPage;
        state.totalPages = numberFrom(payload.totalPages, state.totalPages);
        state.hasMore = state.page < state.totalPages;
        state.icons.push(...newIcons);
      }
    } catch {
    } finally {
      state.loadingMore = false;
      renderResults();
    }
  }
  function normalizeIcon(value) {
    if (!value || typeof value !== "object") return null;
    const item = value;
    const name = stringFrom(item.name);
    const library = stringFrom(item.library);
    const svgUrl = normalizeUrl(item.svgUrl);
    if (!name || !library || !svgUrl) return null;
    const previewUrls = Array.isArray(item.previewUrls) ? item.previewUrls.map(normalizeUrl).filter(Boolean) : [];
    const urls = [.../* @__PURE__ */ new Set([...previewUrls, svgUrl])];
    return {
      id: stringFrom(item.id) || `${library}-${name}`,
      name,
      displayName: formatIconTitle(stringFrom(item.displayName) || name),
      library,
      libraryName: stringFrom(item.libraryName) || formatIconTitle(library),
      license: stringFrom(item.license) || "license unknown",
      legalSafe: item.legalSafe === true,
      svgUrl: urls[0],
      previewUrls: urls
    };
  }
  function renderLoading() {
    elements.resultsGrid.setAttribute("aria-busy", "true");
    elements.resultCount.textContent = "Searching...";
    const loading = document.createElement("div");
    loading.className = "loading-state";
    loading.textContent = "Loading high-quality SVG icons...";
    elements.resultsGrid.replaceChildren(loading);
  }
  function appendLoadingMoreIndicator() {
    const existing = elements.resultsGrid.querySelector(".load-more-indicator");
    if (existing) return;
    const indicator = document.createElement("div");
    indicator.className = "load-more-indicator";
    indicator.textContent = "Loading more icons...";
    elements.resultsGrid.appendChild(indicator);
  }
  function renderSelection() {
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
    elements.selectedDetails.textContent = `${icon.libraryName} \u2022 ${icon.license}`;
    applyMask(elements.selectedPreview, icon.svgUrl);
    void hydrateStyledPreview(elements.selectedPreview, icon, previewSize);
  }
  function renderResults() {
    state.previewObserver?.disconnect();
    state.previewObserver = null;
    elements.resultsGrid.setAttribute("aria-busy", state.loading ? "true" : "false");
    elements.resultCount.textContent = state.loading ? "Searching..." : `${state.total.toLocaleString()} icon${state.total === 1 ? "" : "s"}`;
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
      card.title = `${icon.displayName} (${icon.libraryName})
Click to preview \u2022 Double-click to insert`;
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
  function observeStyledPreview(element, icon) {
    if (!("IntersectionObserver" in window)) {
      void hydrateStyledPreview(element, icon, 44);
      return;
    }
    state.previewObserver ??= new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const target = entry.target;
          const matchingIcon = state.icons.find((item) => item.id === target.dataset.iconId);
          if (matchingIcon) void hydrateStyledPreview(target, matchingIcon, 44);
        });
      },
      { rootMargin: "120px 0px" }
    );
    element.dataset.iconId = icon.id;
    state.previewObserver.observe(element);
  }
  async function hydrateStyledPreview(element, icon, size) {
    const previewKey = `${icon.id}|${state.color.toLowerCase()}|${size}`;
    element.dataset.previewKey = previewKey;
    try {
      const rawSvg = await fetchSvgMarkup(icon);
      const styledSvg = styleSvg(rawSvg, { size, color: state.color, title: icon.displayName });
      if (!element.isConnected || element.dataset.previewKey !== previewKey) return;
      applyMask(element, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(styledSvg)}`);
    } catch {
    }
  }
  async function updateSelectionContext(elementOverride) {
    const wf = getWebflowApi();
    if (!wf) return;
    try {
      const selected = elementOverride !== void 0 ? elementOverride : await wf.getSelectedElement();
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
  async function insertIcon(icon) {
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
          selected = allElements.find((el) => el.type?.toLowerCase() === "body") || allElements[0];
          console.log("[IconSearch] Picked element:", selected ? `type=${selected.type}` : "null");
        } catch (e) {
          console.log("[IconSearch] getAllElements failed:", e);
        }
      }
      if (!selected) {
        throw new Error("No canvas element found. Click Body in the Navigator panel first.");
      }
      console.log("[IconSearch] Step 2: Creating styled SVG...");
      const svg = await createStyledSvg(icon);
      console.log("[IconSearch] SVG created, length:", svg.length);
      console.log("[IconSearch] Step 3: Creating asset...");
      const asset = await getOrCreateAsset(icon, svg);
      console.log("[IconSearch] Asset created:", asset?.id || "unknown");
      console.log("[IconSearch] Step 4: Inserting Image element...");
      console.log("[IconSearch] selected.type:", selected.type);
      console.log("[IconSearch] has append:", typeof selected.append === "function");
      console.log("[IconSearch] has after:", typeof selected.after === "function");
      console.log("[IconSearch] has before:", typeof selected.before === "function");
      console.log("[IconSearch] placement:", state.placement);
      let imageElement;
      if (typeof selected.append === "function") {
        console.log("[IconSearch] Using append...");
        try {
          imageElement = await selected.append(wf.elementPresets.Image);
          console.log("[IconSearch] append succeeded, type:", imageElement?.type);
        } catch (e) {
          console.log("[IconSearch] append failed:", e);
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
      console.log("[IconSearch] \u2705 Insert complete!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not insert icon.";
      console.error("[IconSearch] \u274C Insert failed:", error);
      setStatus(message, "error");
      try {
        await wf.notify({ type: "Error", message });
      } catch {
      }
    } finally {
      state.inserting = false;
      elements.insertButton.textContent = "Insert selected icon";
      renderSelection();
      await updateSelectionContext();
    }
  }
  async function getOrCreateAsset(icon, svg) {
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
  async function getOrCreateSizeStyle(size) {
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
      "vertical-align": "middle"
    });
    return style;
  }
  async function createStyledSvg(icon) {
    const svg = await fetchSvgMarkup(icon);
    return styleSvg(svg, {
      size: clamp(state.size, 16, 256),
      color: isSafeHex(state.color) ? state.color : "#111827",
      title: icon.displayName
    });
  }
  async function fetchSvgMarkup(icon) {
    const cached = state.svgCache.get(icon.id);
    if (cached) return cached;
    let lastError = "";
    for (const url of icon.previewUrls) {
      try {
        const response = await fetch(url, {
          headers: { accept: "image/svg+xml,text/plain,*/*" }
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
  function sanitizeSvg(svg) {
    const document2 = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = document2.documentElement;
    if (root.localName !== "svg" || document2.querySelector("parsererror")) {
      throw new Error("The selected asset is not valid SVG markup.");
    }
    document2.querySelectorAll("script, foreignObject, iframe, object, embed, style, image, audio, video, base").forEach((element) => element.remove());
    document2.querySelectorAll("*").forEach((element) => {
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
  function styleSvg(svg, options) {
    const document2 = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = document2.documentElement;
    if (root.localName !== "svg" || document2.querySelector("parsererror")) {
      throw new Error("The selected asset could not be styled as SVG.");
    }
    let hasPaint = false;
    document2.querySelectorAll("*").forEach((element) => {
      for (const attributeName of ["fill", "stroke"]) {
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
  function applyMask(element, url) {
    const safeUrl = url.replace(/"/g, "%22");
    element.style.webkitMask = `url("${safeUrl}") no-repeat center / contain`;
    element.style.mask = `url("${safeUrl}") no-repeat center / contain`;
  }
  function getSelectedIcon() {
    return state.icons.find((icon) => icon.id === state.selectedId) || state.icons[0] || null;
  }
  function updateSwatches() {
    document.querySelectorAll(".swatch").forEach((swatch) => {
      swatch.classList.toggle("is-active", swatch.dataset.color?.toLowerCase() === state.color.toLowerCase());
    });
  }
  function setStatus(message, tone = "") {
    elements.statusBar.textContent = message;
    elements.statusBar.classList.toggle("is-success", tone === "success");
    elements.statusBar.classList.toggle("is-error", tone === "error");
  }
  function loadAssetCache() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(ASSET_CACHE_KEY) || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return Object.fromEntries(
        Object.entries(parsed).filter((entry) => typeof entry[1] === "string")
      );
    } catch {
      return {};
    }
  }
  function saveAssetCache(cache) {
    const recentEntries = Object.entries(cache).slice(-250);
    window.localStorage.setItem(ASSET_CACHE_KEY, JSON.stringify(Object.fromEntries(recentEntries)));
  }
  function normalizeUrl(value) {
    const url = stringFrom(value).trim();
    if (!url) return "";
    if (url.startsWith("//")) return `https:${url}`;
    if (url.startsWith("/")) return `${API_BASE}${url}`;
    return /^https?:\/\//i.test(url) ? url : "";
  }
  function formatIconTitle(value) {
    return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").split(/[-_\s]+/).filter(Boolean).map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`).join(" ");
  }
  function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "icon";
  }
  function requiredElement(id) {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing required element #${id}`);
    return element;
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
    return /^#[0-9a-f]{6}$/i.test(value);
  }
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vc3JjL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLyBXZWJmbG93IFNESyBpbnRlZ3JhdGlvbiBhc3NlcnRpb25zOlxuLy8gd2ViZmxvdy5jcmVhdGVBc3NldCwgd2ViZmxvdy5lbGVtZW50UHJlc2V0cy5JbWFnZSwgd2ViZmxvdy5nZXRTZWxlY3RlZEVsZW1lbnQsIHdlYmZsb3cuY2FuRm9yQXBwTW9kZVxuXG5jb25zdCBBUElfQkFTRSA9IFwiaHR0cHM6Ly9pY29uc2VhcmNoLmluZm9cIjtcbmNvbnN0IFNFQVJDSF9FTkRQT0lOVCA9IGAke0FQSV9CQVNFfS9hcGkvaWNvbnNgO1xuY29uc3QgREVGQVVMVF9RVUVSWSA9IFwiYXJyb3dcIjtcbmNvbnN0IEFTU0VUX0NBQ0hFX0tFWSA9IFwiaWNvbnNlYXJjaC53ZWJmbG93LmFzc2V0cy52MVwiO1xuXG5jb25zdCBMSUJSQVJJRVMgPSBbXG4gIFtcImFsbFwiLCBcIkFsbCBsaWJyYXJpZXNcIl0sXG4gIFtcImx1Y2lkZS1pY29uc1wiLCBcIkx1Y2lkZVwiXSxcbiAgW1wiaGVyb2ljb25zXCIsIFwiSGVyb2ljb25zXCJdLFxuICBbXCJ0YWJsZXItaWNvbnNcIiwgXCJUYWJsZXJcIl0sXG4gIFtcInBob3NwaG9yLWljb25zXCIsIFwiUGhvc3Bob3JcIl0sXG4gIFtcInJlbWl4LWljb25cIiwgXCJSZW1peFwiXSxcbiAgW1wiYm9vdHN0cmFwLWljb25zXCIsIFwiQm9vdHN0cmFwXCJdLFxuICBbXCJpY29ub2lyXCIsIFwiSWNvbm9pclwiXSxcbiAgW1wiaWNvbmlmeVwiLCBcIkljb25pZnkgY29sbGVjdGlvbnNcIl0sXG5dIGFzIGNvbnN0O1xuXG5jb25zdCBTVFlMRVMgPSBbXG4gIFtcImFsbFwiLCBcIkFsbCBzdHlsZXNcIl0sXG4gIFtcInN0cm9rZVwiLCBcIk91dGxpbmVcIl0sXG4gIFtcInNvbGlkXCIsIFwiU29saWRcIl0sXG4gIFtcImR1b3RvbmVcIiwgXCJEdW90b25lXCJdLFxuICBbXCJ0d290b25lXCIsIFwiVHdvLXRvbmVcIl0sXG4gIFtcInNoYXJwXCIsIFwiU2hhcnBcIl0sXG5dIGFzIGNvbnN0O1xuXG50eXBlIFBsYWNlbWVudCA9IFwiYWZ0ZXJcIiB8IFwiaW5zaWRlXCIgfCBcImJlZm9yZVwiO1xuXG50eXBlIEljb25TZWFyY2hJY29uID0ge1xuICBpZDogc3RyaW5nO1xuICBuYW1lOiBzdHJpbmc7XG4gIGRpc3BsYXlOYW1lOiBzdHJpbmc7XG4gIGxpYnJhcnk6IHN0cmluZztcbiAgbGlicmFyeU5hbWU6IHN0cmluZztcbiAgbGljZW5zZTogc3RyaW5nO1xuICBsZWdhbFNhZmU6IGJvb2xlYW47XG4gIHN2Z1VybDogc3RyaW5nO1xuICBwcmV2aWV3VXJsczogc3RyaW5nW107XG59O1xuXG50eXBlIFNlYXJjaFBheWxvYWQgPSB7XG4gIGljb25zPzogdW5rbm93bjtcbiAgdG90YWw/OiB1bmtub3duO1xuICB0b3RhbFBhZ2VzPzogdW5rbm93bjtcbn07XG5cbi8vIENhY2hlZCByZWZlcmVuY2UgXHUyMDE0IG9uY2Ugd2UgZmluZCB0aGUgcmVhbCB3ZWJmbG93IEFQSSB3ZSBrZWVwIGl0LlxubGV0IF9jYWNoZWRXZjogYW55ID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0V2ViZmxvd0FwaSgpOiBhbnkge1xuICBpZiAoX2NhY2hlZFdmKSByZXR1cm4gX2NhY2hlZFdmO1xuXG4gIC8vIDEuIFRyeSB3aW5kb3cud2ViZmxvd1xuICB0cnkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmICh3aW5kb3cgYXMgYW55KS53ZWJmbG93KSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBGb3VuZCB3ZWJmbG93IG9uIHdpbmRvd1wiKTtcbiAgICAgIF9jYWNoZWRXZiA9ICh3aW5kb3cgYXMgYW55KS53ZWJmbG93O1xuICAgICAgcmV0dXJuIF9jYWNoZWRXZjtcbiAgICB9XG4gIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuXG4gIC8vIDIuIFRyeSBnbG9iYWxUaGlzLndlYmZsb3dcbiAgdHJ5IHtcbiAgICBjb25zdCBnID0gZ2xvYmFsVGhpcyBhcyBhbnk7XG4gICAgaWYgKGcud2ViZmxvdykge1xuICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gRm91bmQgd2ViZmxvdyBvbiBnbG9iYWxUaGlzXCIpO1xuICAgICAgX2NhY2hlZFdmID0gZy53ZWJmbG93O1xuICAgICAgcmV0dXJuIF9jYWNoZWRXZjtcbiAgICB9XG4gIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxuXG4gIC8vIDMuIFRyeSB3aW5kb3cucGFyZW50LndlYmZsb3cgKGhvc3Qgd2luZG93KVxuICB0cnkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5wYXJlbnQgJiYgKHdpbmRvdy5wYXJlbnQgYXMgYW55KS53ZWJmbG93KSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBGb3VuZCB3ZWJmbG93IG9uIHdpbmRvdy5wYXJlbnRcIik7XG4gICAgICBfY2FjaGVkV2YgPSAod2luZG93LnBhcmVudCBhcyBhbnkpLndlYmZsb3c7XG4gICAgICByZXR1cm4gX2NhY2hlZFdmO1xuICAgIH1cbiAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgLy8gNC4gVHJ5IHdpbmRvdy50b3Aud2ViZmxvd1xuICB0cnkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy50b3AgJiYgKHdpbmRvdy50b3AgYXMgYW55KS53ZWJmbG93KSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBGb3VuZCB3ZWJmbG93IG9uIHdpbmRvdy50b3BcIik7XG4gICAgICBfY2FjaGVkV2YgPSAod2luZG93LnRvcCBhcyBhbnkpLndlYmZsb3c7XG4gICAgICByZXR1cm4gX2NhY2hlZFdmO1xuICAgIH1cbiAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgLy8gNS4gVHJ5IGJhcmUgYHdlYmZsb3dgIHJlZmVyZW5jZVxuICB0cnkge1xuICAgIGlmICh0eXBlb2Ygd2ViZmxvdyAhPT0gXCJ1bmRlZmluZWRcIiAmJiB3ZWJmbG93KSB7XG4gICAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBGb3VuZCB3ZWJmbG93IHZpYSBiYXJlIHJlZmVyZW5jZVwiKTtcbiAgICAgIF9jYWNoZWRXZiA9IHdlYmZsb3c7XG4gICAgICByZXR1cm4gX2NhY2hlZFdmO1xuICAgIH1cbiAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzV2ViZmxvd0F2YWlsYWJsZSgpOiBib29sZWFuIHtcbiAgcmV0dXJuIGdldFdlYmZsb3dBcGkoKSAhPT0gbnVsbDtcbn1cblxuY29uc3Qgc3RhdGUgPSB7XG4gIHdlYmZsb3dSZWFkeTogZmFsc2UsXG4gIGljb25zOiBbXSBhcyBJY29uU2VhcmNoSWNvbltdLFxuICBzZWxlY3RlZElkOiBcIlwiLFxuICBsb2FkaW5nOiBmYWxzZSxcbiAgbG9hZGluZ01vcmU6IGZhbHNlLFxuICBpbnNlcnRpbmc6IGZhbHNlLFxuICBwYWdlOiAxLFxuICB0b3RhbFBhZ2VzOiAxLFxuICB0b3RhbDogMCxcbiAgaGFzTW9yZTogdHJ1ZSxcbiAgcXVlcnk6IERFRkFVTFRfUVVFUlksXG4gIGxpYnJhcnk6IFwiYWxsXCIsXG4gIHN0eWxlOiBcImFsbFwiLFxuICBsZWdhbE9ubHk6IHRydWUsXG4gIHNpemU6IDY0LFxuICBjb2xvcjogXCIjMTExODI3XCIsXG4gIHBsYWNlbWVudDogXCJpbnNpZGVcIiBhcyBQbGFjZW1lbnQsXG4gIHNlYXJjaENvbnRyb2xsZXI6IG51bGwgYXMgQWJvcnRDb250cm9sbGVyIHwgbnVsbCxcbiAgc2VhcmNoVGltZXI6IDAsXG4gIHN2Z0NhY2hlOiBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpLFxuICBwcmV2aWV3T2JzZXJ2ZXI6IG51bGwgYXMgSW50ZXJzZWN0aW9uT2JzZXJ2ZXIgfCBudWxsLFxufTtcblxuY29uc3QgZWxlbWVudHMgPSB7XG4gIHJ1bnRpbWVCYWRnZTogcmVxdWlyZWRFbGVtZW50PEhUTUxTcGFuRWxlbWVudD4oXCJydW50aW1lQmFkZ2VcIiksXG4gIHNlYXJjaElucHV0OiByZXF1aXJlZEVsZW1lbnQ8SFRNTElucHV0RWxlbWVudD4oXCJzZWFyY2hJbnB1dFwiKSxcbiAgbGlicmFyeVNlbGVjdDogcmVxdWlyZWRFbGVtZW50PEhUTUxTZWxlY3RFbGVtZW50PihcImxpYnJhcnlTZWxlY3RcIiksXG4gIHN0eWxlU2VsZWN0OiByZXF1aXJlZEVsZW1lbnQ8SFRNTFNlbGVjdEVsZW1lbnQ+KFwic3R5bGVTZWxlY3RcIiksXG4gIGxlZ2FsT25seUlucHV0OiByZXF1aXJlZEVsZW1lbnQ8SFRNTElucHV0RWxlbWVudD4oXCJsZWdhbE9ubHlJbnB1dFwiKSxcbiAgcmVzdWx0Q291bnQ6IHJlcXVpcmVkRWxlbWVudDxIVE1MU3BhbkVsZW1lbnQ+KFwicmVzdWx0Q291bnRcIiksXG4gIHNlbGVjdGVkUHJldmlldzogcmVxdWlyZWRFbGVtZW50PEhUTUxTcGFuRWxlbWVudD4oXCJzZWxlY3RlZFByZXZpZXdcIiksXG4gIHNlbGVjdGVkTmFtZTogcmVxdWlyZWRFbGVtZW50PEhUTUxFbGVtZW50PihcInNlbGVjdGVkTmFtZVwiKSxcbiAgc2VsZWN0ZWREZXRhaWxzOiByZXF1aXJlZEVsZW1lbnQ8SFRNTFNwYW5FbGVtZW50PihcInNlbGVjdGVkRGV0YWlsc1wiKSxcbiAgc2VsZWN0aW9uQ29udGV4dDogcmVxdWlyZWRFbGVtZW50PEhUTUxTcGFuRWxlbWVudD4oXCJzZWxlY3Rpb25Db250ZXh0XCIpLFxuICBzaXplSW5wdXQ6IHJlcXVpcmVkRWxlbWVudDxIVE1MSW5wdXRFbGVtZW50PihcInNpemVJbnB1dFwiKSxcbiAgc2l6ZVZhbHVlOiByZXF1aXJlZEVsZW1lbnQ8SFRNTEVsZW1lbnQ+KFwic2l6ZVZhbHVlXCIpLFxuICBjb2xvcklucHV0OiByZXF1aXJlZEVsZW1lbnQ8SFRNTElucHV0RWxlbWVudD4oXCJjb2xvcklucHV0XCIpLFxuICBwbGFjZW1lbnRTZWxlY3Q6IHJlcXVpcmVkRWxlbWVudDxIVE1MU2VsZWN0RWxlbWVudD4oXCJwbGFjZW1lbnRTZWxlY3RcIiksXG4gIGluc2VydEJ1dHRvbjogcmVxdWlyZWRFbGVtZW50PEhUTUxCdXR0b25FbGVtZW50PihcImluc2VydEJ1dHRvblwiKSxcbiAgcmVzdWx0c0dyaWQ6IHJlcXVpcmVkRWxlbWVudDxIVE1MRWxlbWVudD4oXCJyZXN1bHRzR3JpZFwiKSxcbiAgc3RhdHVzQmFyOiByZXF1aXJlZEVsZW1lbnQ8SFRNTEVsZW1lbnQ+KFwic3RhdHVzQmFyXCIpLFxufTtcblxudm9pZCBib290KCk7XG5cbmFzeW5jIGZ1bmN0aW9uIGJvb3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gIGh5ZHJhdGVDb250cm9scygpO1xuICBiaW5kRXZlbnRzKCk7XG4gIHJlbmRlckxvYWRpbmcoKTtcbiAgYXdhaXQgaW5pdGlhbGl6ZVdlYmZsb3coKTtcbiAgYXdhaXQgc2VhcmNoSWNvbnMoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZVdlYmZsb3coKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIEluaXRpYWxpemluZyBXZWJmbG93IEFQSSBkZXRlY3Rpb24uLi5cIik7XG5cbiAgLy8gUG9sbCBmb3IgdXAgdG8gMTAgc2Vjb25kcyAoMTAwIFx1MDBENyAxMDBtcylcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgIGlmIChpc1dlYmZsb3dBdmFpbGFibGUoKSkge1xuICAgICAgc3RhdGUud2ViZmxvd1JlYWR5ID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUubG9nKGBbSWNvblNlYXJjaF0gV2ViZmxvdyBBUEkgZm91bmQgYWZ0ZXIgJHtpICogMTAwfW1zYCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgMTAwKSk7XG4gIH1cblxuICBjb25zdCB3ZiA9IGdldFdlYmZsb3dBcGkoKTtcbiAgaWYgKHdmKSB7XG4gICAgYXdhaXQgYWN0aXZhdGVEZXNpZ25lck1vZGUod2YpO1xuICB9IGVsc2Uge1xuICAgIC8vIFNob3cgaG9uZXN0IHN0YXRlIFx1MjAxNCBBUEkgbm90IGZvdW5kIHlldFxuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIFdlYmZsb3cgQVBJIE5PVCBmb3VuZCBhZnRlciAxMHMuIFN0YXJ0aW5nIGJhY2tncm91bmQgcmV0cnkuLi5cIik7XG4gICAgZWxlbWVudHMucnVudGltZUJhZGdlLnRleHRDb250ZW50ID0gXCJDb25uZWN0aW5nLi4uXCI7XG4gICAgc2V0U3RhdHVzKFwiTG9va2luZyBmb3IgV2ViZmxvdyBEZXNpZ25lciBBUEkuLi4gRXh0ZW5zaW9uIHdpbGwgd29yayBvbmNlIGNvbm5lY3RlZC5cIiwgXCJcIik7XG5cbiAgICAvLyBCYWNrZ3JvdW5kIHJldHJ5IFx1MjAxNCBrZWVwIHRyeWluZyBldmVyeSAyIHNlY29uZHMgZm9yIGFub3RoZXIgNjAgc2Vjb25kc1xuICAgIHN0YXJ0QmFja2dyb3VuZFJldHJ5KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RhcnRCYWNrZ3JvdW5kUmV0cnkoKTogdm9pZCB7XG4gIGxldCBhdHRlbXB0cyA9IDA7XG4gIGNvbnN0IG1heEF0dGVtcHRzID0gMzA7IC8vIDMwIFx1MDBENyAycyA9IDYwIHNlY29uZHNcbiAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChhc3luYyAoKSA9PiB7XG4gICAgYXR0ZW1wdHMrKztcbiAgICBjb25zdCB3ZiA9IGdldFdlYmZsb3dBcGkoKTtcbiAgICBpZiAod2YpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgY29uc29sZS5sb2coYFtJY29uU2VhcmNoXSBXZWJmbG93IEFQSSBmb3VuZCBvbiBiYWNrZ3JvdW5kIHJldHJ5ICMke2F0dGVtcHRzfWApO1xuICAgICAgYXdhaXQgYWN0aXZhdGVEZXNpZ25lck1vZGUod2YpO1xuICAgIH0gZWxzZSBpZiAoYXR0ZW1wdHMgPj0gbWF4QXR0ZW1wdHMpIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gR2F2ZSB1cCBsb29raW5nIGZvciBXZWJmbG93IEFQSSBhZnRlciA3MCBzZWNvbmRzIHRvdGFsXCIpO1xuICAgICAgZWxlbWVudHMucnVudGltZUJhZGdlLnRleHRDb250ZW50ID0gXCJTdGFuZGFsb25lXCI7XG4gICAgICBzZXRTdGF0dXMoXCJSdW5uaW5nIHN0YW5kYWxvbmUgXHUyMDE0IGljb25zIGNhbiBiZSBicm93c2VkIGJ1dCBub3QgaW5zZXJ0ZWQgaW50byBXZWJmbG93LlwiLCBcIlwiKTtcbiAgICB9XG4gIH0sIDIwMDApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhY3RpdmF0ZURlc2lnbmVyTW9kZSh3ZjogYW55KTogUHJvbWlzZTx2b2lkPiB7XG4gIHN0YXRlLndlYmZsb3dSZWFkeSA9IHRydWU7XG4gIGVsZW1lbnRzLnJ1bnRpbWVCYWRnZS50ZXh0Q29udGVudCA9IFwiRGVzaWduZXIgbGl2ZVwiO1xuICBlbGVtZW50cy5ydW50aW1lQmFkZ2UuY2xhc3NMaXN0LmFkZChcImlzLWxpdmVcIik7XG4gIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIERlc2lnbmVyIG1vZGUgYWN0aXZhdGVkXCIpO1xuXG4gIC8vIFJlc2l6ZSBleHRlbnNpb24gd2luZG93IHRvIGEgZGVjZW50LCBiYWxhbmNlZCBzaXplXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiB3Zi5zZXRFeHRlbnNpb25TaXplID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGF3YWl0IHdmLnNldEV4dGVuc2lvblNpemUoeyB3aWR0aDogNDgwLCBoZWlnaHQ6IDYyMCB9KTtcbiAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIEV4dGVuc2lvbiByZXNpemVkIHRvIDQ4MHg2MjBcIik7XG4gICAgfVxuICB9IGNhdGNoIChlKSB7XG4gICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gc2V0RXh0ZW5zaW9uU2l6ZSBmYWlsZWQ6XCIsIGUpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIHdmLnN1YnNjcmliZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB3Zi5zdWJzY3JpYmUoXCJzZWxlY3RlZGVsZW1lbnRcIiwgKGVsZW1lbnQ6IGFueSkgPT4ge1xuICAgICAgICB2b2lkIHVwZGF0ZVNlbGVjdGlvbkNvbnRleHQoZWxlbWVudCk7XG4gICAgICAgIHJlbmRlclNlbGVjdGlvbigpO1xuICAgICAgfSk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBPcHRpb25hbCBzdWJzY3JpcHRpb25cbiAgfVxuXG4gIGF3YWl0IHVwZGF0ZVNlbGVjdGlvbkNvbnRleHQoKTtcbiAgc2V0U3RhdHVzKFwiUmVhZHkuIFNlbGVjdCBhbiBlbGVtZW50IG9uIGNhbnZhcyBhbmQgY2xpY2sgSW5zZXJ0LlwiLCBcInN1Y2Nlc3NcIik7XG59XG5cbmZ1bmN0aW9uIGh5ZHJhdGVDb250cm9scygpOiB2b2lkIHtcbiAgZWxlbWVudHMuc2VhcmNoSW5wdXQudmFsdWUgPSBzdGF0ZS5xdWVyeTtcbiAgZWxlbWVudHMuc2l6ZUlucHV0LnZhbHVlID0gU3RyaW5nKHN0YXRlLnNpemUpO1xuICBlbGVtZW50cy5zaXplVmFsdWUudGV4dENvbnRlbnQgPSBgJHtzdGF0ZS5zaXplfXB4YDtcbiAgZWxlbWVudHMuY29sb3JJbnB1dC52YWx1ZSA9IHN0YXRlLmNvbG9yO1xuICBlbGVtZW50cy5wbGFjZW1lbnRTZWxlY3QudmFsdWUgPSBzdGF0ZS5wbGFjZW1lbnQ7XG4gIGZpbGxTZWxlY3QoZWxlbWVudHMubGlicmFyeVNlbGVjdCwgTElCUkFSSUVTLCBzdGF0ZS5saWJyYXJ5KTtcbiAgZmlsbFNlbGVjdChlbGVtZW50cy5zdHlsZVNlbGVjdCwgU1RZTEVTLCBzdGF0ZS5zdHlsZSk7XG4gIHVwZGF0ZVN3YXRjaGVzKCk7XG59XG5cbmZ1bmN0aW9uIGZpbGxTZWxlY3QoXG4gIHNlbGVjdDogSFRNTFNlbGVjdEVsZW1lbnQsXG4gIG9wdGlvbnM6IFJlYWRvbmx5QXJyYXk8cmVhZG9ubHkgW3N0cmluZywgc3RyaW5nXT4sXG4gIHNlbGVjdGVkVmFsdWU6IHN0cmluZyxcbik6IHZvaWQge1xuICBzZWxlY3QucmVwbGFjZUNoaWxkcmVuKCk7XG4gIG9wdGlvbnMuZm9yRWFjaCgoW3ZhbHVlLCBsYWJlbF0pID0+IHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgIG9wdGlvbi52YWx1ZSA9IHZhbHVlO1xuICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGxhYmVsO1xuICAgIG9wdGlvbi5zZWxlY3RlZCA9IHZhbHVlID09PSBzZWxlY3RlZFZhbHVlO1xuICAgIHNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYmluZEV2ZW50cygpOiB2b2lkIHtcbiAgZWxlbWVudHMuc2VhcmNoSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICBzdGF0ZS5xdWVyeSA9IGVsZW1lbnRzLnNlYXJjaElucHV0LnZhbHVlLnRyaW0oKTtcbiAgICBzY2hlZHVsZVNlYXJjaCgpO1xuICB9KTtcblxuICBlbGVtZW50cy5saWJyYXJ5U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIHN0YXRlLmxpYnJhcnkgPSBlbGVtZW50cy5saWJyYXJ5U2VsZWN0LnZhbHVlO1xuICAgIHNjaGVkdWxlU2VhcmNoKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLnN0eWxlU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIHN0YXRlLnN0eWxlID0gZWxlbWVudHMuc3R5bGVTZWxlY3QudmFsdWU7XG4gICAgc2NoZWR1bGVTZWFyY2goKTtcbiAgfSk7XG5cbiAgZWxlbWVudHMubGVnYWxPbmx5SW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgc3RhdGUubGVnYWxPbmx5ID0gZWxlbWVudHMubGVnYWxPbmx5SW5wdXQuY2hlY2tlZDtcbiAgICBzY2hlZHVsZVNlYXJjaCgpO1xuICB9KTtcblxuICBlbGVtZW50cy5zaXplSW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICBzdGF0ZS5zaXplID0gY2xhbXAoTnVtYmVyKGVsZW1lbnRzLnNpemVJbnB1dC52YWx1ZSkgfHwgNjQsIDE2LCAyNTYpO1xuICAgIGVsZW1lbnRzLnNpemVWYWx1ZS50ZXh0Q29udGVudCA9IGAke3N0YXRlLnNpemV9cHhgO1xuICAgIHJlbmRlclNlbGVjdGlvbigpO1xuICB9KTtcblxuICBlbGVtZW50cy5jb2xvcklucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgc3RhdGUuY29sb3IgPSBpc1NhZmVIZXgoZWxlbWVudHMuY29sb3JJbnB1dC52YWx1ZSkgPyBlbGVtZW50cy5jb2xvcklucHV0LnZhbHVlIDogXCIjMTExODI3XCI7XG4gICAgdXBkYXRlU3dhdGNoZXMoKTtcbiAgICByZW5kZXJTZWxlY3Rpb24oKTtcbiAgICByZW5kZXJSZXN1bHRzKCk7XG4gIH0pO1xuXG4gIGVsZW1lbnRzLnBsYWNlbWVudFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjb25zdCBuZXh0UGxhY2VtZW50ID0gZWxlbWVudHMucGxhY2VtZW50U2VsZWN0LnZhbHVlO1xuICAgIGlmIChuZXh0UGxhY2VtZW50ID09PSBcImFmdGVyXCIgfHwgbmV4dFBsYWNlbWVudCA9PT0gXCJpbnNpZGVcIiB8fCBuZXh0UGxhY2VtZW50ID09PSBcImJlZm9yZVwiKSB7XG4gICAgICBzdGF0ZS5wbGFjZW1lbnQgPSBuZXh0UGxhY2VtZW50O1xuICAgIH1cbiAgfSk7XG5cbiAgZWxlbWVudHMuaW5zZXJ0QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgY29uc3QgaWNvbiA9IGdldFNlbGVjdGVkSWNvbigpO1xuICAgIGlmIChpY29uKSB2b2lkIGluc2VydEljb24oaWNvbik7XG4gIH0pO1xuXG4gIC8vIFNtb290aCBJbmZpbml0ZSBTY3JvbGxcbiAgZWxlbWVudHMucmVzdWx0c0dyaWQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLCAoKSA9PiB7XG4gICAgaWYgKHN0YXRlLmxvYWRpbmcgfHwgc3RhdGUubG9hZGluZ01vcmUgfHwgIXN0YXRlLmhhc01vcmUpIHJldHVybjtcbiAgICBjb25zdCB7IHNjcm9sbFRvcCwgY2xpZW50SGVpZ2h0LCBzY3JvbGxIZWlnaHQgfSA9IGVsZW1lbnRzLnJlc3VsdHNHcmlkO1xuICAgIGlmIChzY3JvbGxUb3AgKyBjbGllbnRIZWlnaHQgPj0gc2Nyb2xsSGVpZ2h0IC0gMTQwKSB7XG4gICAgICB2b2lkIGxvYWRNb3JlSWNvbnMoKTtcbiAgICB9XG4gIH0pO1xuXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KFwiLnN3YXRjaFwiKS5mb3JFYWNoKChzd2F0Y2gpID0+IHtcbiAgICBzd2F0Y2guYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IGNvbG9yID0gc3dhdGNoLmRhdGFzZXQuY29sb3IgfHwgXCIjMTExODI3XCI7XG4gICAgICBpZiAoIWlzU2FmZUhleChjb2xvcikpIHJldHVybjtcbiAgICAgIHN0YXRlLmNvbG9yID0gY29sb3I7XG4gICAgICBlbGVtZW50cy5jb2xvcklucHV0LnZhbHVlID0gY29sb3I7XG4gICAgICB1cGRhdGVTd2F0Y2hlcygpO1xuICAgICAgcmVuZGVyU2VsZWN0aW9uKCk7XG4gICAgICByZW5kZXJSZXN1bHRzKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChldmVudCkgPT4ge1xuICAgIGlmIChldmVudC5rZXkgPT09IFwiL1wiICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGVsZW1lbnRzLnNlYXJjaElucHV0KSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgZWxlbWVudHMuc2VhcmNoSW5wdXQuZm9jdXMoKTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzY2hlZHVsZVNlYXJjaCgpOiB2b2lkIHtcbiAgd2luZG93LmNsZWFyVGltZW91dChzdGF0ZS5zZWFyY2hUaW1lcik7XG4gIHN0YXRlLnNlYXJjaFRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoKCkgPT4gdm9pZCBzZWFyY2hJY29ucygpLCAxODApO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZWFyY2hJY29ucygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgc3RhdGUuc2VhcmNoQ29udHJvbGxlcj8uYWJvcnQoKTtcbiAgY29uc3QgY29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcbiAgc3RhdGUuc2VhcmNoQ29udHJvbGxlciA9IGNvbnRyb2xsZXI7XG4gIHN0YXRlLmxvYWRpbmcgPSB0cnVlO1xuICBzdGF0ZS5wYWdlID0gMTtcbiAgc3RhdGUuaGFzTW9yZSA9IHRydWU7XG4gIHN0YXRlLmljb25zID0gW107XG4gIHJlbmRlckxvYWRpbmcoKTtcblxuICBjb25zdCB1cmwgPSBuZXcgVVJMKFNFQVJDSF9FTkRQT0lOVCk7XG4gIGlmIChzdGF0ZS5xdWVyeSkgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJxXCIsIHN0YXRlLnF1ZXJ5KTtcbiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJsaWJcIiwgc3RhdGUubGlicmFyeSk7XG4gIHVybC5zZWFyY2hQYXJhbXMuc2V0KFwic3R5bGVcIiwgc3RhdGUuc3R5bGUpO1xuICB1cmwuc2VhcmNoUGFyYW1zLnNldChcImxlZ2FsT25seVwiLCBzdGF0ZS5sZWdhbE9ubHkgPyBcIjFcIiA6IFwiMFwiKTtcbiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJwYWdlXCIsIFwiMVwiKTtcbiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJsaW1pdFwiLCBcIjYwXCIpO1xuICB1cmwuc2VhcmNoUGFyYW1zLnNldChcInNvcnRcIiwgc3RhdGUucXVlcnkgPyBcInJlbGV2YW5jZVwiIDogXCJwb3B1bGFyXCIpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwudG9TdHJpbmcoKSwge1xuICAgICAgaGVhZGVyczogeyBhY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgIH0pO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgSWNvblNlYXJjaCByZXR1cm5lZCAke3Jlc3BvbnNlLnN0YXR1c30uYCk7XG5cbiAgICBjb25zdCBwYXlsb2FkID0gKGF3YWl0IHJlc3BvbnNlLmpzb24oKSkgYXMgU2VhcmNoUGF5bG9hZDtcbiAgICBjb25zdCByYXdJY29ucyA9IEFycmF5LmlzQXJyYXkocGF5bG9hZC5pY29ucykgPyBwYXlsb2FkLmljb25zIDogW107XG4gICAgc3RhdGUuaWNvbnMgPSByYXdJY29ucy5tYXAobm9ybWFsaXplSWNvbikuZmlsdGVyKChpY29uKTogaWNvbiBpcyBJY29uU2VhcmNoSWNvbiA9PiBCb29sZWFuKGljb24pKTtcbiAgICBzdGF0ZS50b3RhbCA9IG51bWJlckZyb20ocGF5bG9hZC50b3RhbCwgc3RhdGUuaWNvbnMubGVuZ3RoKTtcbiAgICBzdGF0ZS50b3RhbFBhZ2VzID0gbnVtYmVyRnJvbShwYXlsb2FkLnRvdGFsUGFnZXMsIDEpO1xuICAgIHN0YXRlLmhhc01vcmUgPSBzdGF0ZS5wYWdlIDwgc3RhdGUudG90YWxQYWdlcyAmJiBzdGF0ZS5pY29ucy5sZW5ndGggPiAwO1xuICAgIHN0YXRlLnNlbGVjdGVkSWQgPSBzdGF0ZS5pY29ucy5zb21lKChpY29uKSA9PiBpY29uLmlkID09PSBzdGF0ZS5zZWxlY3RlZElkKVxuICAgICAgPyBzdGF0ZS5zZWxlY3RlZElkXG4gICAgICA6IHN0YXRlLmljb25zWzBdPy5pZCB8fCBcIlwiO1xuXG4gICAgc2V0U3RhdHVzKFwiUmVhZHkuIENsaWNrIEluc2VydCB0byBwbGFjZSBpY29uLlwiLCBcInN1Y2Nlc3NcIik7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGNvbnRyb2xsZXIuc2lnbmFsLmFib3J0ZWQpIHJldHVybjtcbiAgICBzdGF0ZS5pY29ucyA9IFtdO1xuICAgIHN0YXRlLnRvdGFsID0gMDtcbiAgICBzdGF0ZS5oYXNNb3JlID0gZmFsc2U7XG4gICAgc2V0U3RhdHVzKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogXCJDb3VsZCBub3Qgc2VhcmNoIEljb25TZWFyY2guXCIsIFwiZXJyb3JcIik7XG4gIH0gZmluYWxseSB7XG4gICAgaWYgKCFjb250cm9sbGVyLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICBzdGF0ZS5sb2FkaW5nID0gZmFsc2U7XG4gICAgICByZW5kZXJTZWxlY3Rpb24oKTtcbiAgICAgIHJlbmRlclJlc3VsdHMoKTtcbiAgICB9XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9hZE1vcmVJY29ucygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgaWYgKHN0YXRlLmxvYWRpbmcgfHwgc3RhdGUubG9hZGluZ01vcmUgfHwgIXN0YXRlLmhhc01vcmUpIHJldHVybjtcbiAgc3RhdGUubG9hZGluZ01vcmUgPSB0cnVlO1xuICBhcHBlbmRMb2FkaW5nTW9yZUluZGljYXRvcigpO1xuXG4gIGNvbnN0IG5leHRQYWdlID0gc3RhdGUucGFnZSArIDE7XG4gIGNvbnN0IHVybCA9IG5ldyBVUkwoU0VBUkNIX0VORFBPSU5UKTtcbiAgaWYgKHN0YXRlLnF1ZXJ5KSB1cmwuc2VhcmNoUGFyYW1zLnNldChcInFcIiwgc3RhdGUucXVlcnkpO1xuICB1cmwuc2VhcmNoUGFyYW1zLnNldChcImxpYlwiLCBzdGF0ZS5saWJyYXJ5KTtcbiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJzdHlsZVwiLCBzdGF0ZS5zdHlsZSk7XG4gIHVybC5zZWFyY2hQYXJhbXMuc2V0KFwibGVnYWxPbmx5XCIsIHN0YXRlLmxlZ2FsT25seSA/IFwiMVwiIDogXCIwXCIpO1xuICB1cmwuc2VhcmNoUGFyYW1zLnNldChcInBhZ2VcIiwgU3RyaW5nKG5leHRQYWdlKSk7XG4gIHVybC5zZWFyY2hQYXJhbXMuc2V0KFwibGltaXRcIiwgXCI2MFwiKTtcbiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJzb3J0XCIsIHN0YXRlLnF1ZXJ5ID8gXCJyZWxldmFuY2VcIiA6IFwicG9wdWxhclwiKTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLnRvU3RyaW5nKCksIHtcbiAgICAgIGhlYWRlcnM6IHsgYWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgIH0pO1xuICAgIGlmICghcmVzcG9uc2Uub2spIHJldHVybjtcblxuICAgIGNvbnN0IHBheWxvYWQgPSAoYXdhaXQgcmVzcG9uc2UuanNvbigpKSBhcyBTZWFyY2hQYXlsb2FkO1xuICAgIGNvbnN0IHJhd0ljb25zID0gQXJyYXkuaXNBcnJheShwYXlsb2FkLmljb25zKSA/IHBheWxvYWQuaWNvbnMgOiBbXTtcbiAgICBjb25zdCBuZXdJY29ucyA9IHJhd0ljb25zLm1hcChub3JtYWxpemVJY29uKS5maWx0ZXIoKGljb24pOiBpY29uIGlzIEljb25TZWFyY2hJY29uID0+IEJvb2xlYW4oaWNvbikpO1xuXG4gICAgaWYgKG5ld0ljb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc3RhdGUuaGFzTW9yZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdGF0ZS5wYWdlID0gbmV4dFBhZ2U7XG4gICAgICBzdGF0ZS50b3RhbFBhZ2VzID0gbnVtYmVyRnJvbShwYXlsb2FkLnRvdGFsUGFnZXMsIHN0YXRlLnRvdGFsUGFnZXMpO1xuICAgICAgc3RhdGUuaGFzTW9yZSA9IHN0YXRlLnBhZ2UgPCBzdGF0ZS50b3RhbFBhZ2VzO1xuICAgICAgc3RhdGUuaWNvbnMucHVzaCguLi5uZXdJY29ucyk7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICAvLyBTaWxlbnQgcmVjb3ZlcnlcbiAgfSBmaW5hbGx5IHtcbiAgICBzdGF0ZS5sb2FkaW5nTW9yZSA9IGZhbHNlO1xuICAgIHJlbmRlclJlc3VsdHMoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVJY29uKHZhbHVlOiB1bmtub3duKTogSWNvblNlYXJjaEljb24gfCBudWxsIHtcbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09IFwib2JqZWN0XCIpIHJldHVybiBudWxsO1xuICBjb25zdCBpdGVtID0gdmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIGNvbnN0IG5hbWUgPSBzdHJpbmdGcm9tKGl0ZW0ubmFtZSk7XG4gIGNvbnN0IGxpYnJhcnkgPSBzdHJpbmdGcm9tKGl0ZW0ubGlicmFyeSk7XG4gIGNvbnN0IHN2Z1VybCA9IG5vcm1hbGl6ZVVybChpdGVtLnN2Z1VybCk7XG4gIGlmICghbmFtZSB8fCAhbGlicmFyeSB8fCAhc3ZnVXJsKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBwcmV2aWV3VXJscyA9IEFycmF5LmlzQXJyYXkoaXRlbS5wcmV2aWV3VXJscylcbiAgICA/IGl0ZW0ucHJldmlld1VybHMubWFwKG5vcm1hbGl6ZVVybCkuZmlsdGVyKEJvb2xlYW4pXG4gICAgOiBbXTtcbiAgY29uc3QgdXJscyA9IFsuLi5uZXcgU2V0KFsuLi5wcmV2aWV3VXJscywgc3ZnVXJsXSldO1xuXG4gIHJldHVybiB7XG4gICAgaWQ6IHN0cmluZ0Zyb20oaXRlbS5pZCkgfHwgYCR7bGlicmFyeX0tJHtuYW1lfWAsXG4gICAgbmFtZSxcbiAgICBkaXNwbGF5TmFtZTogZm9ybWF0SWNvblRpdGxlKHN0cmluZ0Zyb20oaXRlbS5kaXNwbGF5TmFtZSkgfHwgbmFtZSksXG4gICAgbGlicmFyeSxcbiAgICBsaWJyYXJ5TmFtZTogc3RyaW5nRnJvbShpdGVtLmxpYnJhcnlOYW1lKSB8fCBmb3JtYXRJY29uVGl0bGUobGlicmFyeSksXG4gICAgbGljZW5zZTogc3RyaW5nRnJvbShpdGVtLmxpY2Vuc2UpIHx8IFwibGljZW5zZSB1bmtub3duXCIsXG4gICAgbGVnYWxTYWZlOiBpdGVtLmxlZ2FsU2FmZSA9PT0gdHJ1ZSxcbiAgICBzdmdVcmw6IHVybHNbMF0sXG4gICAgcHJldmlld1VybHM6IHVybHMsXG4gIH07XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxvYWRpbmcoKTogdm9pZCB7XG4gIGVsZW1lbnRzLnJlc3VsdHNHcmlkLnNldEF0dHJpYnV0ZShcImFyaWEtYnVzeVwiLCBcInRydWVcIik7XG4gIGVsZW1lbnRzLnJlc3VsdENvdW50LnRleHRDb250ZW50ID0gXCJTZWFyY2hpbmcuLi5cIjtcbiAgY29uc3QgbG9hZGluZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gIGxvYWRpbmcuY2xhc3NOYW1lID0gXCJsb2FkaW5nLXN0YXRlXCI7XG4gIGxvYWRpbmcudGV4dENvbnRlbnQgPSBcIkxvYWRpbmcgaGlnaC1xdWFsaXR5IFNWRyBpY29ucy4uLlwiO1xuICBlbGVtZW50cy5yZXN1bHRzR3JpZC5yZXBsYWNlQ2hpbGRyZW4obG9hZGluZyk7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZExvYWRpbmdNb3JlSW5kaWNhdG9yKCk6IHZvaWQge1xuICBjb25zdCBleGlzdGluZyA9IGVsZW1lbnRzLnJlc3VsdHNHcmlkLnF1ZXJ5U2VsZWN0b3IoXCIubG9hZC1tb3JlLWluZGljYXRvclwiKTtcbiAgaWYgKGV4aXN0aW5nKSByZXR1cm47XG5cbiAgY29uc3QgaW5kaWNhdG9yID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgaW5kaWNhdG9yLmNsYXNzTmFtZSA9IFwibG9hZC1tb3JlLWluZGljYXRvclwiO1xuICBpbmRpY2F0b3IudGV4dENvbnRlbnQgPSBcIkxvYWRpbmcgbW9yZSBpY29ucy4uLlwiO1xuICBlbGVtZW50cy5yZXN1bHRzR3JpZC5hcHBlbmRDaGlsZChpbmRpY2F0b3IpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJTZWxlY3Rpb24oKTogdm9pZCB7XG4gIGNvbnN0IGljb24gPSBnZXRTZWxlY3RlZEljb24oKTtcbiAgY29uc3QgcHJldmlld1NpemUgPSBjbGFtcChNYXRoLnJvdW5kKHN0YXRlLnNpemUgKiAwLjcyKSwgMzYsIDU0KTtcblxuICBlbGVtZW50cy5pbnNlcnRCdXR0b24uZGlzYWJsZWQgPSAhaWNvbiB8fCBzdGF0ZS5pbnNlcnRpbmc7XG4gIGVsZW1lbnRzLnNpemVWYWx1ZS50ZXh0Q29udGVudCA9IGAke3N0YXRlLnNpemV9cHhgO1xuICBlbGVtZW50cy5zZWxlY3RlZFByZXZpZXcuc3R5bGUud2lkdGggPSBgJHtwcmV2aWV3U2l6ZX1weGA7XG4gIGVsZW1lbnRzLnNlbGVjdGVkUHJldmlldy5zdHlsZS5oZWlnaHQgPSBgJHtwcmV2aWV3U2l6ZX1weGA7XG4gIGVsZW1lbnRzLnNlbGVjdGVkUHJldmlldy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBzdGF0ZS5jb2xvcjtcblxuICBpZiAoIWljb24pIHtcbiAgICBlbGVtZW50cy5zZWxlY3RlZE5hbWUudGV4dENvbnRlbnQgPSBcIk5vIGljb24gc2VsZWN0ZWRcIjtcbiAgICBlbGVtZW50cy5zZWxlY3RlZERldGFpbHMudGV4dENvbnRlbnQgPSBcIlRyeSBhIGJyb2FkZXIgc2VhcmNoIHRlcm0uXCI7XG4gICAgZWxlbWVudHMuc2VsZWN0ZWRQcmV2aWV3LnN0eWxlLndlYmtpdE1hc2sgPSBcIlwiO1xuICAgIGVsZW1lbnRzLnNlbGVjdGVkUHJldmlldy5zdHlsZS5tYXNrID0gXCJcIjtcbiAgICByZXR1cm47XG4gIH1cblxuICBlbGVtZW50cy5zZWxlY3RlZE5hbWUudGV4dENvbnRlbnQgPSBpY29uLmRpc3BsYXlOYW1lO1xuICBlbGVtZW50cy5zZWxlY3RlZERldGFpbHMudGV4dENvbnRlbnQgPSBgJHtpY29uLmxpYnJhcnlOYW1lfSBcdTIwMjIgJHtpY29uLmxpY2Vuc2V9YDtcbiAgYXBwbHlNYXNrKGVsZW1lbnRzLnNlbGVjdGVkUHJldmlldywgaWNvbi5zdmdVcmwpO1xuICB2b2lkIGh5ZHJhdGVTdHlsZWRQcmV2aWV3KGVsZW1lbnRzLnNlbGVjdGVkUHJldmlldywgaWNvbiwgcHJldmlld1NpemUpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJSZXN1bHRzKCk6IHZvaWQge1xuICBzdGF0ZS5wcmV2aWV3T2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKTtcbiAgc3RhdGUucHJldmlld09ic2VydmVyID0gbnVsbDtcbiAgZWxlbWVudHMucmVzdWx0c0dyaWQuc2V0QXR0cmlidXRlKFwiYXJpYS1idXN5XCIsIHN0YXRlLmxvYWRpbmcgPyBcInRydWVcIiA6IFwiZmFsc2VcIik7XG4gIGVsZW1lbnRzLnJlc3VsdENvdW50LnRleHRDb250ZW50ID0gc3RhdGUubG9hZGluZ1xuICAgID8gXCJTZWFyY2hpbmcuLi5cIlxuICAgIDogYCR7c3RhdGUudG90YWwudG9Mb2NhbGVTdHJpbmcoKX0gaWNvbiR7c3RhdGUudG90YWwgPT09IDEgPyBcIlwiIDogXCJzXCJ9YDtcblxuICBpZiAoc3RhdGUubG9hZGluZykge1xuICAgIHJlbmRlckxvYWRpbmcoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXN0YXRlLmljb25zLmxlbmd0aCkge1xuICAgIGNvbnN0IGVtcHR5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBlbXB0eS5jbGFzc05hbWUgPSBcImVtcHR5LXN0YXRlXCI7XG4gICAgZW1wdHkudGV4dENvbnRlbnQgPSBcIk5vIGljb25zIGZvdW5kLiBUcnkgYSBicm9hZGVyIHNlYXJjaCBvciBhIGRpZmZlcmVudCBsaWJyYXJ5LlwiO1xuICAgIGVsZW1lbnRzLnJlc3VsdHNHcmlkLnJlcGxhY2VDaGlsZHJlbihlbXB0eSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uc3QgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGNvbnN0IHNlbGVjdGVkSWQgPSBnZXRTZWxlY3RlZEljb24oKT8uaWQgfHwgXCJcIjtcblxuICBzdGF0ZS5pY29ucy5mb3JFYWNoKChpY29uKSA9PiB7XG4gICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7XG4gICAgY2FyZC50eXBlID0gXCJidXR0b25cIjtcbiAgICBjYXJkLmNsYXNzTmFtZSA9IGBpY29uLWNhcmQke2ljb24uaWQgPT09IHNlbGVjdGVkSWQgPyBcIiBpcy1zZWxlY3RlZFwiIDogXCJcIn1gO1xuICAgIGNhcmQudGl0bGUgPSBgJHtpY29uLmRpc3BsYXlOYW1lfSAoJHtpY29uLmxpYnJhcnlOYW1lfSlcXG5DbGljayB0byBwcmV2aWV3IFx1MjAyMiBEb3VibGUtY2xpY2sgdG8gaW5zZXJ0YDtcblxuICAgIGNvbnN0IHRodW1iID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgdGh1bWIuY2xhc3NOYW1lID0gXCJpY29uLXRodW1iXCI7XG4gICAgY29uc3Qgc2hhcGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBzaGFwZS5jbGFzc05hbWUgPSBcImljb24tc2hhcGVcIjtcbiAgICBzaGFwZS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBzdGF0ZS5jb2xvcjtcbiAgICBhcHBseU1hc2soc2hhcGUsIGljb24uc3ZnVXJsKTtcbiAgICB0aHVtYi5hcHBlbmRDaGlsZChzaGFwZSk7XG5cbiAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgIHRpdGxlLmNsYXNzTmFtZSA9IFwiaWNvbi10aXRsZVwiO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gaWNvbi5kaXNwbGF5TmFtZTtcblxuICAgIGNvbnN0IGxpYnJhcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICBsaWJyYXJ5LmNsYXNzTmFtZSA9IFwiaWNvbi1saWJyYXJ5XCI7XG4gICAgbGlicmFyeS50ZXh0Q29udGVudCA9IGljb24ubGlicmFyeU5hbWU7XG5cbiAgICBjYXJkLmFwcGVuZCh0aHVtYiwgdGl0bGUsIGxpYnJhcnkpO1xuICAgIGNhcmQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgIHN0YXRlLnNlbGVjdGVkSWQgPSBpY29uLmlkO1xuICAgICAgcmVuZGVyU2VsZWN0aW9uKCk7XG4gICAgICByZW5kZXJSZXN1bHRzKCk7XG4gICAgfSk7XG4gICAgY2FyZC5hZGRFdmVudExpc3RlbmVyKFwiZGJsY2xpY2tcIiwgKCkgPT4gdm9pZCBpbnNlcnRJY29uKGljb24pKTtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjYXJkKTtcbiAgICBvYnNlcnZlU3R5bGVkUHJldmlldyhzaGFwZSwgaWNvbik7XG4gIH0pO1xuXG4gIGlmIChzdGF0ZS5sb2FkaW5nTW9yZSkge1xuICAgIGNvbnN0IGluZGljYXRvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgaW5kaWNhdG9yLmNsYXNzTmFtZSA9IFwibG9hZC1tb3JlLWluZGljYXRvclwiO1xuICAgIGluZGljYXRvci50ZXh0Q29udGVudCA9IFwiTG9hZGluZyBtb3JlIGljb25zLi4uXCI7XG4gICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQoaW5kaWNhdG9yKTtcbiAgfVxuXG4gIGVsZW1lbnRzLnJlc3VsdHNHcmlkLnJlcGxhY2VDaGlsZHJlbihmcmFnbWVudCk7XG59XG5cbmZ1bmN0aW9uIG9ic2VydmVTdHlsZWRQcmV2aWV3KGVsZW1lbnQ6IEhUTUxFbGVtZW50LCBpY29uOiBJY29uU2VhcmNoSWNvbik6IHZvaWQge1xuICBpZiAoIShcIkludGVyc2VjdGlvbk9ic2VydmVyXCIgaW4gd2luZG93KSkge1xuICAgIHZvaWQgaHlkcmF0ZVN0eWxlZFByZXZpZXcoZWxlbWVudCwgaWNvbiwgNDQpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHN0YXRlLnByZXZpZXdPYnNlcnZlciA/Pz0gbmV3IEludGVyc2VjdGlvbk9ic2VydmVyKFxuICAgIChlbnRyaWVzLCBvYnNlcnZlcikgPT4ge1xuICAgICAgZW50cmllcy5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICBpZiAoIWVudHJ5LmlzSW50ZXJzZWN0aW5nKSByZXR1cm47XG4gICAgICAgIG9ic2VydmVyLnVub2JzZXJ2ZShlbnRyeS50YXJnZXQpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlbnRyeS50YXJnZXQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgIGNvbnN0IG1hdGNoaW5nSWNvbiA9IHN0YXRlLmljb25zLmZpbmQoKGl0ZW0pID0+IGl0ZW0uaWQgPT09IHRhcmdldC5kYXRhc2V0Lmljb25JZCk7XG4gICAgICAgIGlmIChtYXRjaGluZ0ljb24pIHZvaWQgaHlkcmF0ZVN0eWxlZFByZXZpZXcodGFyZ2V0LCBtYXRjaGluZ0ljb24sIDQ0KTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgeyByb290TWFyZ2luOiBcIjEyMHB4IDBweFwiIH0sXG4gICk7XG5cbiAgZWxlbWVudC5kYXRhc2V0Lmljb25JZCA9IGljb24uaWQ7XG4gIHN0YXRlLnByZXZpZXdPYnNlcnZlci5vYnNlcnZlKGVsZW1lbnQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBoeWRyYXRlU3R5bGVkUHJldmlldyhcbiAgZWxlbWVudDogSFRNTEVsZW1lbnQsXG4gIGljb246IEljb25TZWFyY2hJY29uLFxuICBzaXplOiBudW1iZXIsXG4pOiBQcm9taXNlPHZvaWQ+IHtcbiAgY29uc3QgcHJldmlld0tleSA9IGAke2ljb24uaWR9fCR7c3RhdGUuY29sb3IudG9Mb3dlckNhc2UoKX18JHtzaXplfWA7XG4gIGVsZW1lbnQuZGF0YXNldC5wcmV2aWV3S2V5ID0gcHJldmlld0tleTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJhd1N2ZyA9IGF3YWl0IGZldGNoU3ZnTWFya3VwKGljb24pO1xuICAgIGNvbnN0IHN0eWxlZFN2ZyA9IHN0eWxlU3ZnKHJhd1N2ZywgeyBzaXplLCBjb2xvcjogc3RhdGUuY29sb3IsIHRpdGxlOiBpY29uLmRpc3BsYXlOYW1lIH0pO1xuICAgIGlmICghZWxlbWVudC5pc0Nvbm5lY3RlZCB8fCBlbGVtZW50LmRhdGFzZXQucHJldmlld0tleSAhPT0gcHJldmlld0tleSkgcmV0dXJuO1xuICAgIGFwcGx5TWFzayhlbGVtZW50LCBgZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsJHtlbmNvZGVVUklDb21wb25lbnQoc3R5bGVkU3ZnKX1gKTtcbiAgfSBjYXRjaCB7XG4gICAgLy8gRmFsbGJhY2tcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVTZWxlY3Rpb25Db250ZXh0KGVsZW1lbnRPdmVycmlkZT86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB3ZiA9IGdldFdlYmZsb3dBcGkoKTtcbiAgaWYgKCF3ZikgcmV0dXJuO1xuXG4gIHRyeSB7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBlbGVtZW50T3ZlcnJpZGUgIT09IHVuZGVmaW5lZCA/IGVsZW1lbnRPdmVycmlkZSA6IGF3YWl0IHdmLmdldFNlbGVjdGVkRWxlbWVudCgpO1xuICAgIGlmIChzZWxlY3RlZCkge1xuICAgICAgY29uc3QgdHlwZU5hbWUgPSBzZWxlY3RlZC50eXBlID8gZm9ybWF0SWNvblRpdGxlKFN0cmluZyhzZWxlY3RlZC50eXBlKSkgOiBcIkNhbnZhcyBFbGVtZW50XCI7XG4gICAgICBlbGVtZW50cy5zZWxlY3Rpb25Db250ZXh0LnRleHRDb250ZW50ID0gYFRhcmdldDogJHt0eXBlTmFtZX1gO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtZW50cy5zZWxlY3Rpb25Db250ZXh0LnRleHRDb250ZW50ID0gXCJUYXJnZXQ6IEJvZHkgKGF1dG8tc2VsZWN0ZWQpXCI7XG4gICAgfVxuICB9IGNhdGNoIHtcbiAgICBlbGVtZW50cy5zZWxlY3Rpb25Db250ZXh0LnRleHRDb250ZW50ID0gXCJUYXJnZXQ6IEJvZHkgKGF1dG8tc2VsZWN0ZWQpXCI7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5zZXJ0SWNvbihpY29uOiBJY29uU2VhcmNoSWNvbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBpbnNlcnRJY29uIGNhbGxlZCBmb3I6XCIsIGljb24uZGlzcGxheU5hbWUpO1xuICBjb25zdCB3ZiA9IGdldFdlYmZsb3dBcGkoKTtcbiAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gd2ViZmxvdyBBUEk6XCIsIHdmID8gXCJGT1VORFwiIDogXCJOT1QgRk9VTkRcIik7XG4gIGlmICghd2YpIHtcbiAgICBzZXRTdGF0dXMoXCJXZWJmbG93IEFQSSBub3QgcmVhZHkuIFBsZWFzZSByZWZyZXNoIGV4dGVuc2lvbiB3aW5kb3cuXCIsIFwiZXJyb3JcIik7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKHN0YXRlLmluc2VydGluZykge1xuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIEFscmVhZHkgaW5zZXJ0aW5nLCBza2lwcGluZ1wiKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBzdGF0ZS5pbnNlcnRpbmcgPSB0cnVlO1xuICBlbGVtZW50cy5pbnNlcnRCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICBlbGVtZW50cy5pbnNlcnRCdXR0b24udGV4dENvbnRlbnQgPSBcIkluc2VydGluZyBpY29uLi4uXCI7XG4gIHNldFN0YXR1cyhgSW5zZXJ0aW5nICR7aWNvbi5kaXNwbGF5TmFtZX0uLi5gKTtcblxuICB0cnkge1xuICAgIC8vIFN0ZXAgMTogR2V0IHNlbGVjdGVkIGVsZW1lbnRcbiAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBTdGVwIDE6IEdldHRpbmcgc2VsZWN0ZWQgZWxlbWVudC4uLlwiKTtcbiAgICBsZXQgc2VsZWN0ZWQgPSBhd2FpdCB3Zi5nZXRTZWxlY3RlZEVsZW1lbnQoKTtcbiAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBnZXRTZWxlY3RlZEVsZW1lbnQgcmVzdWx0OlwiLCBzZWxlY3RlZCA/IGB0eXBlPSR7c2VsZWN0ZWQudHlwZX1gIDogXCJudWxsXCIpO1xuXG4gICAgaWYgKCFzZWxlY3RlZCkge1xuICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gTm8gc2VsZWN0aW9uLCB0cnlpbmcgZ2V0Um9vdEVsZW1lbnQuLi5cIik7XG4gICAgICB0cnkge1xuICAgICAgICBzZWxlY3RlZCA9IGF3YWl0IHdmLmdldFJvb3RFbGVtZW50KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIGdldFJvb3RFbGVtZW50IHJlc3VsdDpcIiwgc2VsZWN0ZWQgPyBgdHlwZT0ke3NlbGVjdGVkLnR5cGV9YCA6IFwibnVsbFwiKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gZ2V0Um9vdEVsZW1lbnQgZmFpbGVkOlwiLCBlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCFzZWxlY3RlZCkge1xuICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gU3RpbGwgbm8gc2VsZWN0aW9uLCB0cnlpbmcgZ2V0QWxsRWxlbWVudHMuLi5cIik7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBhbGxFbGVtZW50cyA9IGF3YWl0IHdmLmdldEFsbEVsZW1lbnRzKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIGdldEFsbEVsZW1lbnRzIHJldHVybmVkXCIsIGFsbEVsZW1lbnRzLmxlbmd0aCwgXCJlbGVtZW50c1wiKTtcbiAgICAgICAgc2VsZWN0ZWQgPSBhbGxFbGVtZW50cy5maW5kKChlbDogYW55KSA9PiBlbC50eXBlPy50b0xvd2VyQ2FzZSgpID09PSBcImJvZHlcIikgfHwgYWxsRWxlbWVudHNbMF07XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIFBpY2tlZCBlbGVtZW50OlwiLCBzZWxlY3RlZCA/IGB0eXBlPSR7c2VsZWN0ZWQudHlwZX1gIDogXCJudWxsXCIpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBnZXRBbGxFbGVtZW50cyBmYWlsZWQ6XCIsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICghc2VsZWN0ZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIGNhbnZhcyBlbGVtZW50IGZvdW5kLiBDbGljayBCb2R5IGluIHRoZSBOYXZpZ2F0b3IgcGFuZWwgZmlyc3QuXCIpO1xuICAgIH1cblxuICAgIC8vIFN0ZXAgMjogQ3JlYXRlIFNWR1xuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIFN0ZXAgMjogQ3JlYXRpbmcgc3R5bGVkIFNWRy4uLlwiKTtcbiAgICBjb25zdCBzdmcgPSBhd2FpdCBjcmVhdGVTdHlsZWRTdmcoaWNvbik7XG4gICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gU1ZHIGNyZWF0ZWQsIGxlbmd0aDpcIiwgc3ZnLmxlbmd0aCk7XG5cbiAgICAvLyBTdGVwIDM6IFVwbG9hZCBhcyBhc3NldFxuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIFN0ZXAgMzogQ3JlYXRpbmcgYXNzZXQuLi5cIik7XG4gICAgY29uc3QgYXNzZXQgPSBhd2FpdCBnZXRPckNyZWF0ZUFzc2V0KGljb24sIHN2Zyk7XG4gICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gQXNzZXQgY3JlYXRlZDpcIiwgYXNzZXQ/LmlkIHx8IFwidW5rbm93blwiKTtcblxuICAgIC8vIFN0ZXAgNDogSW5zZXJ0IGltYWdlIGVsZW1lbnRcbiAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBTdGVwIDQ6IEluc2VydGluZyBJbWFnZSBlbGVtZW50Li4uXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIHNlbGVjdGVkLnR5cGU6XCIsIHNlbGVjdGVkLnR5cGUpO1xuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIGhhcyBhcHBlbmQ6XCIsIHR5cGVvZiBzZWxlY3RlZC5hcHBlbmQgPT09IFwiZnVuY3Rpb25cIik7XG4gICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gaGFzIGFmdGVyOlwiLCB0eXBlb2Ygc2VsZWN0ZWQuYWZ0ZXIgPT09IFwiZnVuY3Rpb25cIik7XG4gICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gaGFzIGJlZm9yZTpcIiwgdHlwZW9mIHNlbGVjdGVkLmJlZm9yZSA9PT0gXCJmdW5jdGlvblwiKTtcbiAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBwbGFjZW1lbnQ6XCIsIHN0YXRlLnBsYWNlbWVudCk7XG5cbiAgICBsZXQgaW1hZ2VFbGVtZW50O1xuXG4gICAgLy8gQWx3YXlzIHRyeSBhcHBlbmQgZmlyc3QgKHNhZmVzdCBmb3IgQm9keSwgRGl2LCBTZWN0aW9uLCBldGMuKVxuICAgIGlmICh0eXBlb2Ygc2VsZWN0ZWQuYXBwZW5kID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIFVzaW5nIGFwcGVuZC4uLlwiKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGltYWdlRWxlbWVudCA9IGF3YWl0IHNlbGVjdGVkLmFwcGVuZCh3Zi5lbGVtZW50UHJlc2V0cy5JbWFnZSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIGFwcGVuZCBzdWNjZWVkZWQsIHR5cGU6XCIsIGltYWdlRWxlbWVudD8udHlwZSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIGFwcGVuZCBmYWlsZWQ6XCIsIGUpO1xuICAgICAgICAvLyBUcnkgYWZ0ZXIgYXMgZmFsbGJhY2tcbiAgICAgICAgaWYgKHR5cGVvZiBzZWxlY3RlZC5hZnRlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gRmFsbGluZyBiYWNrIHRvIGFmdGVyLi4uXCIpO1xuICAgICAgICAgIGltYWdlRWxlbWVudCA9IGF3YWl0IHNlbGVjdGVkLmFmdGVyKHdmLmVsZW1lbnRQcmVzZXRzLkltYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNlbGVjdGVkLmFmdGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIE5vIGFwcGVuZCwgdXNpbmcgYWZ0ZXIuLi5cIik7XG4gICAgICBpbWFnZUVsZW1lbnQgPSBhd2FpdCBzZWxlY3RlZC5hZnRlcih3Zi5lbGVtZW50UHJlc2V0cy5JbWFnZSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZWN0ZWQuYmVmb3JlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIE5vIGFwcGVuZC9hZnRlciwgdXNpbmcgYmVmb3JlLi4uXCIpO1xuICAgICAgaW1hZ2VFbGVtZW50ID0gYXdhaXQgc2VsZWN0ZWQuYmVmb3JlKHdmLmVsZW1lbnRQcmVzZXRzLkltYWdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gTm8gcGxhY2VtZW50IG1ldGhvZHMgYXZhaWxhYmxlIG9uIGVsZW1lbnQhXCIpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU2VsZWN0ZWQgZWxlbWVudCBkb2VzIG5vdCBzdXBwb3J0IGNoaWxkIHBsYWNlbWVudC5cIik7XG4gICAgfVxuXG4gICAgaWYgKCFpbWFnZUVsZW1lbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIldlYmZsb3cgcmV0dXJuZWQgbnVsbCBhZnRlciBpbnNlcnRpb24uXCIpO1xuICAgIH1cblxuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIGltYWdlRWxlbWVudC50eXBlOlwiLCBpbWFnZUVsZW1lbnQudHlwZSk7XG5cbiAgICBpZiAoaW1hZ2VFbGVtZW50LnR5cGUgIT09IFwiSW1hZ2VcIikge1xuICAgICAgY29uc29sZS5sb2coXCJbSWNvblNlYXJjaF0gV0FSTklORzogZXhwZWN0ZWQgSW1hZ2UgdHlwZSBidXQgZ290OlwiLCBpbWFnZUVsZW1lbnQudHlwZSk7XG4gICAgfVxuXG4gICAgLy8gU3RlcCA1OiBTZXQgYXNzZXQgb24gaW1hZ2VcbiAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBTdGVwIDU6IFNldHRpbmcgYXNzZXQgb24gaW1hZ2UuLi5cIik7XG4gICAgYXdhaXQgaW1hZ2VFbGVtZW50LnNldEFzc2V0KGFzc2V0KTtcbiAgICBjb25zb2xlLmxvZyhcIltJY29uU2VhcmNoXSBBc3NldCBzZXQgc3VjY2Vzc2Z1bGx5XCIpO1xuXG4gICAgYXdhaXQgaW1hZ2VFbGVtZW50LnNldEFsdFRleHQoYCR7aWNvbi5kaXNwbGF5TmFtZX0gaWNvbmApO1xuXG4gICAgaWYgKGltYWdlRWxlbWVudC5kaXNwbGF5TmFtZSkge1xuICAgICAgYXdhaXQgaW1hZ2VFbGVtZW50LnNldERpc3BsYXlOYW1lKGBJY29uIC0gJHtpY29uLmRpc3BsYXlOYW1lfWApO1xuICAgIH1cblxuICAgIGlmIChpbWFnZUVsZW1lbnQuc3R5bGVzKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IGF3YWl0IGdldE9yQ3JlYXRlU2l6ZVN0eWxlKHN0YXRlLnNpemUpO1xuICAgICAgaWYgKHN0eWxlKSBhd2FpdCBpbWFnZUVsZW1lbnQuc2V0U3R5bGVzKFtzdHlsZV0pO1xuICAgIH1cblxuICAgIGF3YWl0IHdmLnNldFNlbGVjdGVkRWxlbWVudChpbWFnZUVsZW1lbnQpO1xuICAgIGF3YWl0IHdmLm5vdGlmeSh7IHR5cGU6IFwiU3VjY2Vzc1wiLCBtZXNzYWdlOiBgSW5zZXJ0ZWQgJHtpY29uLmRpc3BsYXlOYW1lfSFgIH0pO1xuICAgIGVsZW1lbnRzLnNlbGVjdGlvbkNvbnRleHQudGV4dENvbnRlbnQgPSBgSW5zZXJ0ZWQ6ICR7aWNvbi5kaXNwbGF5TmFtZX1gO1xuICAgIHNldFN0YXR1cyhgU3VjY2Vzc2Z1bGx5IGluc2VydGVkICR7aWNvbi5kaXNwbGF5TmFtZX0hYCwgXCJzdWNjZXNzXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiW0ljb25TZWFyY2hdIFx1MjcwNSBJbnNlcnQgY29tcGxldGUhXCIpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFwiQ291bGQgbm90IGluc2VydCBpY29uLlwiO1xuICAgIGNvbnNvbGUuZXJyb3IoXCJbSWNvblNlYXJjaF0gXHUyNzRDIEluc2VydCBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICBzZXRTdGF0dXMobWVzc2FnZSwgXCJlcnJvclwiKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgd2Yubm90aWZ5KHsgdHlwZTogXCJFcnJvclwiLCBtZXNzYWdlIH0pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgLy8gRmFsbGJhY2tcbiAgICB9XG4gIH0gZmluYWxseSB7XG4gICAgc3RhdGUuaW5zZXJ0aW5nID0gZmFsc2U7XG4gICAgZWxlbWVudHMuaW5zZXJ0QnV0dG9uLnRleHRDb250ZW50ID0gXCJJbnNlcnQgc2VsZWN0ZWQgaWNvblwiO1xuICAgIHJlbmRlclNlbGVjdGlvbigpO1xuICAgIGF3YWl0IHVwZGF0ZVNlbGVjdGlvbkNvbnRleHQoKTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRPckNyZWF0ZUFzc2V0KGljb246IEljb25TZWFyY2hJY29uLCBzdmc6IHN0cmluZykge1xuICBjb25zdCB3ZiA9IGdldFdlYmZsb3dBcGkoKTtcbiAgY29uc3QgY2FjaGUgPSBsb2FkQXNzZXRDYWNoZSgpO1xuICBjb25zdCBzaWduYXR1cmUgPSBgJHtpY29uLmlkfXwke3N0YXRlLmNvbG9yLnRvTG93ZXJDYXNlKCl9fCR7c3RhdGUuc2l6ZX1gO1xuICBjb25zdCBjYWNoZWRBc3NldElkID0gY2FjaGVbc2lnbmF0dXJlXTtcblxuICBpZiAoY2FjaGVkQXNzZXRJZCAmJiB3Zikge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjYWNoZWRBc3NldCA9IGF3YWl0IHdmLmdldEFzc2V0QnlJZChjYWNoZWRBc3NldElkKTtcbiAgICAgIGlmIChjYWNoZWRBc3NldCkgcmV0dXJuIGNhY2hlZEFzc2V0O1xuICAgIH0gY2F0Y2gge1xuICAgICAgZGVsZXRlIGNhY2hlW3NpZ25hdHVyZV07XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY29sb3JOYW1lID0gc3RhdGUuY29sb3IucmVwbGFjZShcIiNcIiwgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgZmlsZU5hbWUgPSBgaWNvbnNlYXJjaC0ke3NsdWdpZnkoaWNvbi5saWJyYXJ5KX0tJHtzbHVnaWZ5KGljb24ubmFtZSl9LSR7Y29sb3JOYW1lfS0ke3N0YXRlLnNpemV9LnN2Z2A7XG4gIGNvbnN0IGZpbGUgPSBuZXcgRmlsZShbc3ZnXSwgZmlsZU5hbWUsIHsgdHlwZTogXCJpbWFnZS9zdmcreG1sXCIgfSk7XG4gIGNvbnN0IGFzc2V0ID0gYXdhaXQgd2YuY3JlYXRlQXNzZXQoZmlsZSk7XG4gIGF3YWl0IGFzc2V0LnNldEFsdFRleHQoYCR7aWNvbi5kaXNwbGF5TmFtZX0gaWNvbmApO1xuICBhd2FpdCBhc3NldC5zZXROYW1lKGZpbGVOYW1lKTtcbiAgY2FjaGVbc2lnbmF0dXJlXSA9IGFzc2V0LmlkO1xuICBzYXZlQXNzZXRDYWNoZShjYWNoZSk7XG4gIHJldHVybiBhc3NldDtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0T3JDcmVhdGVTaXplU3R5bGUoc2l6ZTogbnVtYmVyKSB7XG4gIGNvbnN0IHdmID0gZ2V0V2ViZmxvd0FwaSgpO1xuICBpZiAoIXdmKSByZXR1cm4gbnVsbDtcblxuICBjb25zdCBzdHlsZU5hbWUgPSBgaWNvbnNlYXJjaC1pY29uLSR7c2l6ZX1gO1xuICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHdmLmdldFN0eWxlQnlOYW1lKHN0eWxlTmFtZSk7XG4gIGlmIChleGlzdGluZykgcmV0dXJuIGV4aXN0aW5nO1xuXG4gIGNvbnN0IHN0eWxlID0gYXdhaXQgd2YuY3JlYXRlU3R5bGUoc3R5bGVOYW1lKTtcbiAgYXdhaXQgc3R5bGUuc2V0UHJvcGVydGllcyh7XG4gICAgd2lkdGg6IGAke3NpemV9cHhgLFxuICAgIGhlaWdodDogYCR7c2l6ZX1weGAsXG4gICAgXCJtYXgtd2lkdGhcIjogXCIxMDAlXCIsXG4gICAgXCJvYmplY3QtZml0XCI6IFwiY29udGFpblwiLFxuICAgIGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXG4gICAgXCJ2ZXJ0aWNhbC1hbGlnblwiOiBcIm1pZGRsZVwiLFxuICB9KTtcbiAgcmV0dXJuIHN0eWxlO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjcmVhdGVTdHlsZWRTdmcoaWNvbjogSWNvblNlYXJjaEljb24pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBzdmcgPSBhd2FpdCBmZXRjaFN2Z01hcmt1cChpY29uKTtcbiAgcmV0dXJuIHN0eWxlU3ZnKHN2Zywge1xuICAgIHNpemU6IGNsYW1wKHN0YXRlLnNpemUsIDE2LCAyNTYpLFxuICAgIGNvbG9yOiBpc1NhZmVIZXgoc3RhdGUuY29sb3IpID8gc3RhdGUuY29sb3IgOiBcIiMxMTE4MjdcIixcbiAgICB0aXRsZTogaWNvbi5kaXNwbGF5TmFtZSxcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGZldGNoU3ZnTWFya3VwKGljb246IEljb25TZWFyY2hJY29uKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgY2FjaGVkID0gc3RhdGUuc3ZnQ2FjaGUuZ2V0KGljb24uaWQpO1xuICBpZiAoY2FjaGVkKSByZXR1cm4gY2FjaGVkO1xuXG4gIGxldCBsYXN0RXJyb3IgPSBcIlwiO1xuICBmb3IgKGNvbnN0IHVybCBvZiBpY29uLnByZXZpZXdVcmxzKSB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIGhlYWRlcnM6IHsgYWNjZXB0OiBcImltYWdlL3N2Zyt4bWwsdGV4dC9wbGFpbiwqLypcIiB9LFxuICAgICAgfSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIGxhc3RFcnJvciA9IGBTVkcgcmVxdWVzdCByZXR1cm5lZCAke3Jlc3BvbnNlLnN0YXR1c31gO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdGV4dCA9IChhd2FpdCByZXNwb25zZS50ZXh0KCkpLnRyaW0oKTtcbiAgICAgIGlmICghLzxzdmdbXFxzPl0vaS50ZXN0KHRleHQpKSB7XG4gICAgICAgIGxhc3RFcnJvciA9IFwiUmVzcG9uc2Ugd2FzIG5vdCBTVkcgbWFya3VwXCI7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBjbGVhblN2ZyA9IHNhbml0aXplU3ZnKHRleHQpO1xuICAgICAgc3RhdGUuc3ZnQ2FjaGUuc2V0KGljb24uaWQsIGNsZWFuU3ZnKTtcbiAgICAgIHJldHVybiBjbGVhblN2ZztcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgbGFzdEVycm9yID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBcIlNWRyByZXF1ZXN0IGZhaWxlZFwiO1xuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZldGNoIFNWRyBmb3IgJHtpY29uLmRpc3BsYXlOYW1lfS4gJHtsYXN0RXJyb3J9YCk7XG59XG5cbmZ1bmN0aW9uIHNhbml0aXplU3ZnKHN2Zzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgZG9jdW1lbnQgPSBuZXcgRE9NUGFyc2VyKCkucGFyc2VGcm9tU3RyaW5nKHN2ZywgXCJpbWFnZS9zdmcreG1sXCIpO1xuICBjb25zdCByb290ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICBpZiAocm9vdC5sb2NhbE5hbWUgIT09IFwic3ZnXCIgfHwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInBhcnNlcmVycm9yXCIpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhlIHNlbGVjdGVkIGFzc2V0IGlzIG5vdCB2YWxpZCBTVkcgbWFya3VwLlwiKTtcbiAgfVxuXG4gIGRvY3VtZW50XG4gICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCJzY3JpcHQsIGZvcmVpZ25PYmplY3QsIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgc3R5bGUsIGltYWdlLCBhdWRpbywgdmlkZW8sIGJhc2VcIilcbiAgICAuZm9yRWFjaCgoZWxlbWVudCkgPT4gZWxlbWVudC5yZW1vdmUoKSk7XG5cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipcIikuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgIGZvciAoY29uc3QgYXR0cmlidXRlIG9mIFsuLi5lbGVtZW50LmF0dHJpYnV0ZXNdKSB7XG4gICAgICBjb25zdCBuYW1lID0gYXR0cmlidXRlLm5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlLnZhbHVlLnRyaW0oKTtcbiAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoXCJvblwiKSB8fCBuYW1lID09PSBcInN0eWxlXCIpIHtcbiAgICAgICAgZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoYXR0cmlidXRlLm5hbWUpO1xuICAgICAgfSBlbHNlIGlmICgobmFtZSA9PT0gXCJocmVmXCIgfHwgbmFtZSA9PT0gXCJ4bGluazpocmVmXCIpICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiI1wiKSkge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUubmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gbmV3IFhNTFNlcmlhbGl6ZXIoKS5zZXJpYWxpemVUb1N0cmluZyhyb290KTtcbn1cblxuZnVuY3Rpb24gc3R5bGVTdmcoc3ZnOiBzdHJpbmcsIG9wdGlvbnM6IHsgc2l6ZTogbnVtYmVyOyBjb2xvcjogc3RyaW5nOyB0aXRsZTogc3RyaW5nIH0pOiBzdHJpbmcge1xuICBjb25zdCBkb2N1bWVudCA9IG5ldyBET01QYXJzZXIoKS5wYXJzZUZyb21TdHJpbmcoc3ZnLCBcImltYWdlL3N2Zyt4bWxcIik7XG4gIGNvbnN0IHJvb3QgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIGlmIChyb290LmxvY2FsTmFtZSAhPT0gXCJzdmdcIiB8fCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwicGFyc2VyZXJyb3JcIikpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc2VsZWN0ZWQgYXNzZXQgY291bGQgbm90IGJlIHN0eWxlZCBhcyBTVkcuXCIpO1xuICB9XG5cbiAgbGV0IGhhc1BhaW50ID0gZmFsc2U7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgb2YgW1wiZmlsbFwiLCBcInN0cm9rZVwiXSBhcyBjb25zdCkge1xuICAgICAgY29uc3QgcGFpbnQgPSBlbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcbiAgICAgIGlmICghcGFpbnQpIGNvbnRpbnVlO1xuICAgICAgaGFzUGFpbnQgPSB0cnVlO1xuICAgICAgY29uc3QgcHJlc2VydmVkID0gcGFpbnQgPT09IFwibm9uZVwiIHx8IHBhaW50ID09PSBcInRyYW5zcGFyZW50XCIgfHwgcGFpbnQuc3RhcnRzV2l0aChcInVybChcIik7XG4gICAgICBpZiAoIXByZXNlcnZlZCkgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgb3B0aW9ucy5jb2xvcik7XG4gICAgfVxuICB9KTtcblxuICByb290LnNldEF0dHJpYnV0ZShcInhtbG5zXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIik7XG4gIHJvb3Quc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgU3RyaW5nKG9wdGlvbnMuc2l6ZSkpO1xuICByb290LnNldEF0dHJpYnV0ZShcImhlaWdodFwiLCBTdHJpbmcob3B0aW9ucy5zaXplKSk7XG4gIHJvb3Quc2V0QXR0cmlidXRlKFwiY29sb3JcIiwgb3B0aW9ucy5jb2xvcik7XG4gIHJvb3Quc2V0QXR0cmlidXRlKFwicm9sZVwiLCBcImltZ1wiKTtcbiAgcm9vdC5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsIG9wdGlvbnMudGl0bGUpO1xuICBpZiAoIWhhc1BhaW50KSByb290LnNldEF0dHJpYnV0ZShcImZpbGxcIiwgb3B0aW9ucy5jb2xvcik7XG5cbiAgcmV0dXJuIG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcocm9vdCk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5TWFzayhlbGVtZW50OiBIVE1MRWxlbWVudCwgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc3Qgc2FmZVVybCA9IHVybC5yZXBsYWNlKC9cIi9nLCBcIiUyMlwiKTtcbiAgZWxlbWVudC5zdHlsZS53ZWJraXRNYXNrID0gYHVybChcIiR7c2FmZVVybH1cIikgbm8tcmVwZWF0IGNlbnRlciAvIGNvbnRhaW5gO1xuICBlbGVtZW50LnN0eWxlLm1hc2sgPSBgdXJsKFwiJHtzYWZlVXJsfVwiKSBuby1yZXBlYXQgY2VudGVyIC8gY29udGFpbmA7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGVkSWNvbigpOiBJY29uU2VhcmNoSWNvbiB8IG51bGwge1xuICByZXR1cm4gc3RhdGUuaWNvbnMuZmluZCgoaWNvbikgPT4gaWNvbi5pZCA9PT0gc3RhdGUuc2VsZWN0ZWRJZCkgfHwgc3RhdGUuaWNvbnNbMF0gfHwgbnVsbDtcbn1cblxuZnVuY3Rpb24gdXBkYXRlU3dhdGNoZXMoKTogdm9pZCB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEJ1dHRvbkVsZW1lbnQ+KFwiLnN3YXRjaFwiKS5mb3JFYWNoKChzd2F0Y2gpID0+IHtcbiAgICBzd2F0Y2guY2xhc3NMaXN0LnRvZ2dsZShcImlzLWFjdGl2ZVwiLCBzd2F0Y2guZGF0YXNldC5jb2xvcj8udG9Mb3dlckNhc2UoKSA9PT0gc3RhdGUuY29sb3IudG9Mb3dlckNhc2UoKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRTdGF0dXMobWVzc2FnZTogc3RyaW5nLCB0b25lOiBcIlwiIHwgXCJzdWNjZXNzXCIgfCBcImVycm9yXCIgPSBcIlwiKTogdm9pZCB7XG4gIGVsZW1lbnRzLnN0YXR1c0Jhci50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gIGVsZW1lbnRzLnN0YXR1c0Jhci5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtc3VjY2Vzc1wiLCB0b25lID09PSBcInN1Y2Nlc3NcIik7XG4gIGVsZW1lbnRzLnN0YXR1c0Jhci5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtZXJyb3JcIiwgdG9uZSA9PT0gXCJlcnJvclwiKTtcbn1cblxuZnVuY3Rpb24gbG9hZEFzc2V0Q2FjaGUoKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oQVNTRVRfQ0FDSEVfS0VZKSB8fCBcInt9XCIpO1xuICAgIGlmICghcGFyc2VkIHx8IHR5cGVvZiBwYXJzZWQgIT09IFwib2JqZWN0XCIgfHwgQXJyYXkuaXNBcnJheShwYXJzZWQpKSByZXR1cm4ge307XG4gICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIE9iamVjdC5lbnRyaWVzKHBhcnNlZCkuZmlsdGVyKChlbnRyeSk6IGVudHJ5IGlzIFtzdHJpbmcsIHN0cmluZ10gPT4gdHlwZW9mIGVudHJ5WzFdID09PSBcInN0cmluZ1wiKSxcbiAgICApO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4ge307XG4gIH1cbn1cblxuZnVuY3Rpb24gc2F2ZUFzc2V0Q2FjaGUoY2FjaGU6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiB2b2lkIHtcbiAgY29uc3QgcmVjZW50RW50cmllcyA9IE9iamVjdC5lbnRyaWVzKGNhY2hlKS5zbGljZSgtMjUwKTtcbiAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKEFTU0VUX0NBQ0hFX0tFWSwgSlNPTi5zdHJpbmdpZnkoT2JqZWN0LmZyb21FbnRyaWVzKHJlY2VudEVudHJpZXMpKSk7XG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVVybCh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIGNvbnN0IHVybCA9IHN0cmluZ0Zyb20odmFsdWUpLnRyaW0oKTtcbiAgaWYgKCF1cmwpIHJldHVybiBcIlwiO1xuICBpZiAodXJsLnN0YXJ0c1dpdGgoXCIvL1wiKSkgcmV0dXJuIGBodHRwczoke3VybH1gO1xuICBpZiAodXJsLnN0YXJ0c1dpdGgoXCIvXCIpKSByZXR1cm4gYCR7QVBJX0JBU0V9JHt1cmx9YDtcbiAgcmV0dXJuIC9eaHR0cHM/OlxcL1xcLy9pLnRlc3QodXJsKSA/IHVybCA6IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEljb25UaXRsZSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlXG4gICAgLnJlcGxhY2UoLyhbYS16MC05XSkoW0EtWl0pL2csIFwiJDEgJDJcIilcbiAgICAucmVwbGFjZSgvKFtBLVpdKykoW0EtWl1bYS16XSkvZywgXCIkMSAkMlwiKVxuICAgIC5zcGxpdCgvWy1fXFxzXSsvKVxuICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAubWFwKChwYXJ0KSA9PiBgJHtwYXJ0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpfSR7cGFydC5zbGljZSgxKX1gKVxuICAgIC5qb2luKFwiIFwiKTtcbn1cblxuZnVuY3Rpb24gc2x1Z2lmeSh2YWx1ZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHZhbHVlXG4gICAgLnRvTG93ZXJDYXNlKClcbiAgICAucmVwbGFjZSgvW15hLXowLTldKy9nLCBcIi1cIilcbiAgICAucmVwbGFjZSgvXi0rfC0rJC9nLCBcIlwiKVxuICAgIC5zbGljZSgwLCA2MCkgfHwgXCJpY29uXCI7XG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVkRWxlbWVudDxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KGlkOiBzdHJpbmcpOiBUIHtcbiAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgaWYgKCFlbGVtZW50KSB0aHJvdyBuZXcgRXJyb3IoYE1pc3NpbmcgcmVxdWlyZWQgZWxlbWVudCAjJHtpZH1gKTtcbiAgcmV0dXJuIGVsZW1lbnQgYXMgVDtcbn1cblxuZnVuY3Rpb24gc3RyaW5nRnJvbSh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyB2YWx1ZSA6IFwiXCI7XG59XG5cbmZ1bmN0aW9uIG51bWJlckZyb20odmFsdWU6IHVua25vd24sIGZhbGxiYWNrOiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiICYmIE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgPyB2YWx1ZSA6IGZhbGxiYWNrO1xufVxuXG5mdW5jdGlvbiBjbGFtcCh2YWx1ZTogbnVtYmVyLCBtaW46IG51bWJlciwgbWF4OiBudW1iZXIpOiBudW1iZXIge1xuICByZXR1cm4gTWF0aC5tYXgobWluLCBNYXRoLm1pbihtYXgsIHZhbHVlKSk7XG59XG5cbmZ1bmN0aW9uIGlzU2FmZUhleCh2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAvXiNbMC05YS1mXXs2fSQvaS50ZXN0KHZhbHVlKTtcbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7OztBQUdBLE1BQU0sV0FBVztBQUNqQixNQUFNLGtCQUFrQixHQUFHLFFBQVE7QUFDbkMsTUFBTSxnQkFBZ0I7QUFDdEIsTUFBTSxrQkFBa0I7QUFFeEIsTUFBTSxZQUFZO0FBQUEsSUFDaEIsQ0FBQyxPQUFPLGVBQWU7QUFBQSxJQUN2QixDQUFDLGdCQUFnQixRQUFRO0FBQUEsSUFDekIsQ0FBQyxhQUFhLFdBQVc7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
