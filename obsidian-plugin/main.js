/* eslint-disable @typescript-eslint/no-require-imports */
/* global module, require, fetch, window, document, navigator, URL */

const {
  ItemView,
  MarkdownView,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  normalizePath,
} = require("obsidian");

const VIEW_TYPE = "iconsearch-view";
const DRAG_TYPE = "application/x-iconsearch-obsidian-icon";
const API_BASE = "https://iconsearch.info";
const DEFAULT_SETTINGS = {
  apiEndpoint: `${API_BASE}/api/icons`,
  iconFolder: "IconSearch Icons",
  defaultQuery: "arrow",
  defaultSize: 96,
  defaultColor: "#111827",
  legalOnly: true,
};
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
const COLOR_PRESETS = ["#111827", "#2563eb", "#0f766e", "#7c3aed", "#db2777", "#ea580c"];

module.exports = class IconSearchPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.svgCache = new Map();
    this.lastMarkdownView = null;

    this.registerView(VIEW_TYPE, (leaf) => new IconSearchView(leaf, this));

    this.addRibbonIcon("search", "Open IconSearch", () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open-iconsearch",
      name: "Open IconSearch",
      callback: () => {
        void this.activateView();
      },
    });

    this.addCommand({
      id: "insert-selected-icon",
      name: "Insert selected IconSearch icon",
      callback: () => {
        const view = this.getIconSearchView();
        if (!view || !view.getSelectedIcon()) {
          new Notice("Open IconSearch and select an icon first.");
          return;
        }
        void this.insertIcon(view.getSelectedIcon(), view.getCurrentStyle());
      },
    });

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (view && view.editor) this.lastMarkdownView = view;
      }),
    );

    this.registerDomEvent(document, "dragover", (event) => {
      if (hasDragType(event, DRAG_TYPE)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
      }
    });

    this.registerDomEvent(document, "drop", (event) => {
      if (!hasDragType(event, DRAG_TYPE)) return;
      event.preventDefault();
      const rawPayload = event.dataTransfer.getData(DRAG_TYPE);
      try {
        const payload = JSON.parse(rawPayload);
        if (payload && payload.icon && payload.style) {
          void this.insertIcon(payload.icon, payload.style);
        }
      } catch {
        new Notice("Could not read the dragged IconSearch icon.");
      }
    });

    this.addSettingTab(new IconSearchSettingTab(this.app, this));
  }

  onunload() {}

  async activateView() {
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];

    if (!leaf) {
      leaf = workspace.getRightLeaf(false);
      await leaf.setViewState({ type: VIEW_TYPE, active: true });
    }

    workspace.revealLeaf(leaf);
  }

  getIconSearchView() {
    const leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];
    return leaf && leaf.view instanceof IconSearchView ? leaf.view : null;
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.settings.defaultSize = clamp(Number(this.settings.defaultSize) || DEFAULT_SETTINGS.defaultSize, 24, 256);
    this.settings.defaultColor = isSafeHex(this.settings.defaultColor)
      ? this.settings.defaultColor
      : DEFAULT_SETTINGS.defaultColor;
    this.settings.iconFolder = sanitizeFolder(this.settings.iconFolder || DEFAULT_SETTINGS.iconFolder);
    this.settings.apiEndpoint = normalizeApiEndpoint(this.settings.apiEndpoint);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async searchIcons({ query, library, style, legalOnly, signal }) {
    const url = new URL(this.settings.apiEndpoint);
    const cleanQuery = String(query || "").trim();
    if (cleanQuery) url.searchParams.set("q", cleanQuery);
    url.searchParams.set("lib", library || "all");
    url.searchParams.set("style", style || "all");
    url.searchParams.set("legalOnly", legalOnly ? "1" : "0");
    url.searchParams.set("limit", "60");
    url.searchParams.set("sort", cleanQuery ? "relevance" : "popular");

    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
      signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(stringFrom(payload.error) || `IconSearch returned ${response.status}.`);
    }

    const icons = Array.isArray(payload.icons) ? payload.icons.map(normalizeIcon).filter(Boolean) : [];
    return {
      icons,
      total: numberFrom(payload.total, icons.length),
    };
  }

  async insertIcon(icon, style) {
    if (!icon) return;

    const markdownView = this.getMarkdownView();
    const safeStyle = normalizeStyle(style);
    const filePath = await this.writeIconFile(icon, safeStyle);
    const embed = `![[${filePath}|${safeStyle.size}]]`;

    if (markdownView && markdownView.editor) {
      markdownView.editor.replaceSelection(embed);
      new Notice(`Inserted ${icon.displayName}.`);
      return;
    }

    await copyToClipboard(embed);
    new Notice("Icon file created. Markdown embed copied because no note editor was active.");
  }

  getMarkdownView() {
    const active = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (active && active.editor) {
      this.lastMarkdownView = active;
      return active;
    }

    if (this.lastMarkdownView && this.lastMarkdownView.editor) {
      return this.lastMarkdownView;
    }

    const leaf = this.app.workspace.getLeavesOfType("markdown").find((candidate) => {
      return candidate.view instanceof MarkdownView && candidate.view.editor;
    });
    return leaf ? leaf.view : null;
  }

  async writeIconFile(icon, style) {
    const folder = normalizePath(sanitizeFolder(this.settings.iconFolder));
    const exists = await this.app.vault.adapter.exists(folder);
    if (!exists) {
      await this.app.vault.createFolder(folder);
    }

    const svg = await this.fetchSvgMarkup(icon);
    const styledSvg = styleSvg(svg, {
      color: style.color,
      size: style.size,
      title: icon.displayName,
    });
    const fileName = `${slugify(icon.library)}-${slugify(icon.name)}-${style.color.replace("#", "")}-${style.size}.svg`;
    const filePath = normalizePath(`${folder}/${fileName}`);

    if (await this.app.vault.adapter.exists(filePath)) {
      await this.app.vault.adapter.write(filePath, styledSvg);
    } else {
      await this.app.vault.create(filePath, styledSvg);
    }

    return filePath;
  }

  async fetchSvgMarkup(icon) {
    if (this.svgCache.has(icon.id)) return this.svgCache.get(icon.id);

    let lastError = "";
    for (const url of icon.previewUrls.length ? icon.previewUrls : [icon.svgUrl]) {
      try {
        const response = await fetch(url, { headers: { accept: "image/svg+xml,text/plain,*/*" } });
        if (!response.ok) {
          lastError = `SVG request returned ${response.status}`;
          continue;
        }

        const text = (await response.text()).trim();
        if (/<svg[\s>]/i.test(text)) {
          const cleanSvg = sanitizeSvg(text);
          this.svgCache.set(icon.id, cleanSvg);
          return cleanSvg;
        }
        lastError = "Response was not SVG markup";
      } catch (error) {
        lastError = error instanceof Error ? error.message : "SVG request failed";
      }
    }

    throw new Error(`Could not fetch SVG for ${icon.displayName}. ${lastError}`);
  }
};

class IconSearchView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.icons = [];
    this.total = 0;
    this.selectedId = "";
    this.query = plugin.settings.defaultQuery;
    this.library = "all";
    this.style = "all";
    this.legalOnly = plugin.settings.legalOnly;
    this.size = plugin.settings.defaultSize;
    this.color = plugin.settings.defaultColor;
    this.abortController = null;
    this.searchTimer = 0;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "IconSearch";
  }

  getIcon() {
    return "search";
  }

  async onOpen() {
    this.render();
    await this.runSearch();
  }

  async onClose() {
    if (this.abortController) this.abortController.abort();
    window.clearTimeout(this.searchTimer);
  }

  getSelectedIcon() {
    return this.icons.find((icon) => icon.id === this.selectedId) || this.icons[0] || null;
  }

  getCurrentStyle() {
    return normalizeStyle({
      size: this.size,
      color: this.color,
    });
  }

  render() {
    this.contentEl.empty();
    this.contentEl.addClass("iconsearch-obsidian-view");

    const shell = createElement("div", "iconsearch-obsidian-shell");
    const header = createElement("header", "iconsearch-obsidian-header");
    const mark = createElement("div", "iconsearch-obsidian-mark", "IS");
    const brand = createElement("div", "iconsearch-obsidian-brand");
    const kicker = createElement("p", "", "IconSearch");
    const title = createElement("h2", "", "Search icons");
    brand.append(kicker, title);
    header.append(mark, brand);

    const preview = createElement("section", "iconsearch-obsidian-preview");
    this.previewStage = createElement("div", "iconsearch-obsidian-preview-stage");
    this.previewShape = createElement("span", "iconsearch-obsidian-preview-shape");
    this.previewStage.appendChild(this.previewShape);
    const selectedMeta = createElement("div", "iconsearch-obsidian-selected");
    this.selectedName = createElement("strong", "", "Loading icons...");
    this.selectedDetails = createElement("span", "", "Styled SVGs for your notes");
    selectedMeta.append(this.selectedName, this.selectedDetails);
    this.insertButton = createElement("button", "iconsearch-obsidian-primary", "Insert selected");
    this.insertButton.type = "button";
    this.insertButton.addEventListener("click", () => {
      const icon = this.getSelectedIcon();
      if (icon) void this.plugin.insertIcon(icon, this.getCurrentStyle());
    });
    preview.append(this.previewStage, selectedMeta, this.insertButton);

    const controls = createElement("section", "iconsearch-obsidian-controls");
    this.searchInput = createLabeledInput("Search", "search", "home, arrow, tag...");
    this.searchInput.input.value = this.query;
    this.searchInput.input.addEventListener("input", () => {
      this.query = this.searchInput.input.value;
      this.scheduleSearch();
    });

    this.librarySelect = createLabeledSelect("Library", LIBRARIES, this.library);
    this.librarySelect.input.addEventListener("change", () => {
      this.library = this.librarySelect.input.value;
      this.scheduleSearch();
    });

    this.styleSelect = createLabeledSelect("Style", STYLES, this.style);
    this.styleSelect.input.addEventListener("change", () => {
      this.style = this.styleSelect.input.value;
      this.scheduleSearch();
    });

    this.sizeInput = createLabeledInput("Size", "range");
    this.sizeInput.input.min = "24";
    this.sizeInput.input.max = "256";
    this.sizeInput.input.step = "4";
    this.sizeInput.input.value = String(this.size);
    this.sizeInput.input.addEventListener("input", () => {
      this.size = clamp(Number(this.sizeInput.input.value) || this.size, 24, 256);
      this.updateSelection();
      this.updateCards();
    });

    this.colorInput = createLabeledInput("Color", "color");
    this.colorInput.input.value = this.color;
    this.colorInput.input.addEventListener("input", () => {
      this.color = isSafeHex(this.colorInput.input.value) ? this.colorInput.input.value : DEFAULT_SETTINGS.defaultColor;
      this.updateSwatches();
      this.updateSelection();
      this.updateCards();
    });

    const legalLabel = createElement("label", "iconsearch-obsidian-check");
    this.legalOnlyInput = document.createElement("input");
    this.legalOnlyInput.type = "checkbox";
    this.legalOnlyInput.checked = this.legalOnly;
    this.legalOnlyInput.addEventListener("change", () => {
      this.legalOnly = this.legalOnlyInput.checked;
      this.scheduleSearch();
    });
    legalLabel.append(this.legalOnlyInput, createElement("span", "", "Commercial-safe only"));

    controls.append(
      this.searchInput.wrapper,
      this.librarySelect.wrapper,
      this.styleSelect.wrapper,
      this.sizeInput.wrapper,
      this.colorInput.wrapper,
      legalLabel,
    );

    const swatches = createElement("div", "iconsearch-obsidian-swatches");
    COLOR_PRESETS.forEach((preset) => {
      const swatch = createElement("button", "iconsearch-obsidian-swatch");
      swatch.type = "button";
      swatch.style.backgroundColor = preset;
      swatch.setAttribute("aria-label", `Use ${preset}`);
      swatch.dataset.color = preset;
      swatch.addEventListener("click", () => {
        this.color = preset;
        this.colorInput.input.value = preset;
        this.updateSwatches();
        this.updateSelection();
        this.updateCards();
      });
      swatches.appendChild(swatch);
    });

    const toolbar = createElement("div", "iconsearch-obsidian-toolbar");
    this.countLabel = createElement("span", "", "Searching...");
    this.sizeLabel = createElement("span", "", `${this.size}px`);
    toolbar.append(this.countLabel, this.sizeLabel);

    this.resultsEl = createElement("section", "iconsearch-obsidian-results");
    this.statusEl = createElement("footer", "iconsearch-obsidian-status", "Search for icons, then click or drag into a note.");

    shell.append(header, preview, controls, swatches, toolbar, this.resultsEl, this.statusEl);
    this.contentEl.appendChild(shell);
    this.updateSwatches();
    this.updateSelection();
  }

  scheduleSearch() {
    window.clearTimeout(this.searchTimer);
    this.searchTimer = window.setTimeout(() => {
      void this.runSearch();
    }, 180);
  }

  async runSearch() {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();
    this.setLoading();

    try {
      const result = await this.plugin.searchIcons({
        query: this.query,
        library: this.library,
        style: this.style,
        legalOnly: this.legalOnly,
        signal: this.abortController.signal,
      });
      this.icons = result.icons;
      this.total = result.total;
      this.selectedId = this.icons.some((icon) => icon.id === this.selectedId)
        ? this.selectedId
        : this.icons[0]?.id || "";
      this.setStatus("Click Insert, double-click a card, or drag a card into an open note.", "success");
      this.updateSelection();
      this.updateCards();
    } catch (error) {
      if (this.abortController.signal.aborted) return;
      this.icons = [];
      this.total = 0;
      this.setStatus(error instanceof Error ? error.message : "Icon search failed.", "error");
      this.updateSelection();
      this.updateCards();
    }
  }

  setLoading() {
    this.countLabel.textContent = "Searching...";
    this.resultsEl.empty();
    this.resultsEl.appendChild(createElement("div", "iconsearch-obsidian-state", "Loading icons from IconSearch..."));
  }

  updateSelection() {
    const icon = this.getSelectedIcon();
    const style = this.getCurrentStyle();
    this.sizeLabel.textContent = `${style.size}px`;
    this.previewShape.style.width = `${clamp(Math.round(style.size * 0.66), 38, 76)}px`;
    this.previewShape.style.height = `${clamp(Math.round(style.size * 0.66), 38, 76)}px`;
    this.previewShape.style.backgroundColor = style.color;
    this.insertButton.disabled = !icon;

    if (!icon) {
      this.selectedName.textContent = "No icon selected";
      this.selectedDetails.textContent = "Try another search or library.";
      this.previewShape.style.webkitMask = "";
      this.previewShape.style.mask = "";
      return;
    }

    this.selectedName.textContent = icon.displayName;
    this.selectedDetails.textContent = `${icon.libraryName} - ${icon.license}`;
    applyMask(this.previewShape, icon);
  }

  updateCards() {
    this.resultsEl.empty();
    this.countLabel.textContent = `${this.total.toLocaleString()} icons`;

    if (!this.icons.length) {
      this.resultsEl.appendChild(createElement("div", "iconsearch-obsidian-state", "No icons found. Try a broader term."));
      return;
    }

    const fragment = document.createDocumentFragment();
    const selectedId = this.getSelectedIcon()?.id || "";

    this.icons.forEach((icon) => {
      const card = createElement("button", `iconsearch-obsidian-card${icon.id === selectedId ? " is-selected" : ""}`);
      card.type = "button";
      card.draggable = true;
      card.title = "Click to preview. Double-click or drag into a note to insert.";

      const thumb = createElement("span", "iconsearch-obsidian-thumb");
      const shape = createElement("span", "iconsearch-obsidian-shape");
      shape.style.backgroundColor = this.color;
      applyMask(shape, icon);
      thumb.appendChild(shape);

      const name = createElement("span", "iconsearch-obsidian-card-name", icon.displayName);
      const library = createElement("span", "iconsearch-obsidian-card-library", icon.libraryName);
      const hint = createElement("span", "iconsearch-obsidian-card-hint", "Drag to note");

      card.append(thumb, name, library, hint);
      card.addEventListener("click", () => {
        this.selectedId = icon.id;
        this.updateSelection();
        this.updateCards();
      });
      card.addEventListener("dblclick", () => {
        void this.plugin.insertIcon(icon, this.getCurrentStyle());
      });
      card.addEventListener("dragstart", (event) => {
        const payload = JSON.stringify({
          icon,
          style: this.getCurrentStyle(),
        });
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData(DRAG_TYPE, payload);
        event.dataTransfer.setData("text/plain", `${icon.displayName} icon`);
      });

      fragment.appendChild(card);
    });

    this.resultsEl.appendChild(fragment);
  }

  updateSwatches() {
    this.contentEl.querySelectorAll(".iconsearch-obsidian-swatch").forEach((swatch) => {
      swatch.classList.toggle("is-active", swatch.dataset.color === this.color);
    });
  }

  setStatus(message, tone) {
    this.statusEl.textContent = message;
    this.statusEl.classList.toggle("is-error", tone === "error");
    this.statusEl.classList.toggle("is-success", tone === "success");
  }
}

class IconSearchSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "IconSearch" });

    new Setting(containerEl)
      .setName("Icon folder")
      .setDesc("Vault folder where styled SVG files are saved before they are embedded.")
      .addText((text) => {
        text
          .setPlaceholder("IconSearch Icons")
          .setValue(this.plugin.settings.iconFolder)
          .onChange(async (value) => {
            this.plugin.settings.iconFolder = sanitizeFolder(value || DEFAULT_SETTINGS.iconFolder);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Default size")
      .setDesc("Default inserted icon size in pixels.")
      .addSlider((slider) => {
        slider
          .setLimits(24, 256, 4)
          .setValue(this.plugin.settings.defaultSize)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.defaultSize = clamp(value, 24, 256);
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Default color")
      .setDesc("Default SVG color. Use a hex color.")
      .addColorPicker((picker) => {
        picker.setValue(this.plugin.settings.defaultColor).onChange(async (value) => {
          this.plugin.settings.defaultColor = isSafeHex(value) ? value : DEFAULT_SETTINGS.defaultColor;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Commercial-safe only")
      .setDesc("Filter search results to icons marked legal-safe by default.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.legalOnly).onChange(async (value) => {
          this.plugin.settings.legalOnly = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("API endpoint")
      .setDesc("IconSearch public API endpoint. Leave this as the default for public release.")
      .addText((text) => {
        text
          .setPlaceholder(DEFAULT_SETTINGS.apiEndpoint)
          .setValue(this.plugin.settings.apiEndpoint)
          .onChange(async (value) => {
            this.plugin.settings.apiEndpoint = normalizeApiEndpoint(value);
            await this.plugin.saveSettings();
          });
      });
  }
}

function createLabeledInput(labelText, type, placeholder) {
  const wrapper = createElement("label", `iconsearch-obsidian-field${type === "search" ? " is-wide" : ""}`);
  const label = createElement("span", "", labelText);
  const input = document.createElement("input");
  input.type = type;
  if (placeholder) input.placeholder = placeholder;
  wrapper.append(label, input);
  return { wrapper, input };
}

function createLabeledSelect(labelText, options, selected) {
  const wrapper = createElement("label", "iconsearch-obsidian-field");
  const label = createElement("span", "", labelText);
  const input = document.createElement("select");
  options.forEach(([value, text]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    option.selected = value === selected;
    input.appendChild(option);
  });
  wrapper.append(label, input);
  return { wrapper, input };
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function hasDragType(event, type) {
  return Boolean(event.dataTransfer && Array.from(event.dataTransfer.types || []).includes(type));
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

function normalizeStyle(style) {
  return {
    size: clamp(Number(style?.size) || DEFAULT_SETTINGS.defaultSize, 24, 256),
    color: isSafeHex(style?.color) ? style.color : DEFAULT_SETTINGS.defaultColor,
  };
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

function applyMask(element, icon) {
  const url = icon.svgUrl.replace(/"/g, "%22");
  element.style.webkitMask = `url("${url}") no-repeat center / contain`;
  element.style.mask = `url("${url}") no-repeat center / contain`;
}

async function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
  }
}

function normalizeApiEndpoint(value) {
  const endpoint = normalizeUrl(value) || DEFAULT_SETTINGS.apiEndpoint;
  return endpoint.startsWith(API_BASE) ? endpoint : DEFAULT_SETTINGS.apiEndpoint;
}

function normalizeUrl(value) {
  const url = stringFrom(value).trim();
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  return /^https:\/\//i.test(url) ? url : "";
}

function sanitizeFolder(value) {
  const folder = stringFrom(value)
    .replace(/[\\:*?"<>|]/g, "")
    .replace(/^\/+|\/+$/g, "")
    .trim();
  return folder || DEFAULT_SETTINGS.iconFolder;
}

function slugify(value) {
  return stringFrom(value)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "icon";
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
