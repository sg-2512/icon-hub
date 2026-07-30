(function () {
  'use strict';

  var API_BASE = 'https://iconsearch.info';
  var SEARCH_ENDPOINT = API_BASE + '/api/icons';
  var ICON_DRAG_TYPE = 'application/x-iconsearch-shopify-icon';
  var blocks = Array.prototype.slice.call(document.querySelectorAll('.iconsearch-shopify'));

  if (!blocks.length) return;

  var iconCache = new Map();

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function normalizeIdList(value) {
    return String(value || '')
      .split(/[\n,]+/)
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean)
      .slice(0, 24);
  }

  function isSafeHex(value) {
    return /^#[0-9a-f]{3,8}$/i.test(String(value || ''));
  }

  function getSettings(block) {
    return {
      ids: normalizeIdList(block.dataset.iconIds),
      size: Math.max(18, Math.min(128, Number(block.dataset.iconSize) || 40)),
      color: isSafeHex(block.dataset.iconColor) ? block.dataset.iconColor : '#111827',
      gap: Math.max(4, Math.min(64, Number(block.dataset.iconGap) || 18)),
      alignment: block.dataset.iconAlignment || 'center',
      showLabels: block.dataset.showLabels === 'true',
      designMode: block.dataset.designMode === 'true',
      helperEnabled: block.dataset.helperEnabled === 'true',
    };
  }

  function getIconTitle(icon) {
    return icon.displayName || icon.name || icon.id || 'Icon';
  }

  function normalizeUrl(value) {
    var url = String(value || '').trim();
    if (!url) return '';
    if (url.indexOf('//') === 0) return 'https:' + url;
    if (/^https:\/\//i.test(url)) return url;
    return '';
  }

  function urlForIcon(icon) {
    return normalizeUrl(icon.svgUrl);
  }

  function setBlockVars(block, settings) {
    var justify = 'center';
    if (settings.alignment === 'left') justify = 'flex-start';
    if (settings.alignment === 'right') justify = 'flex-end';
    block.style.setProperty('--is-shopify-icon-size', settings.size + 'px');
    block.style.setProperty('--is-shopify-icon-color', settings.color);
    block.style.setProperty('--is-shopify-icon-gap', settings.gap + 'px');
    block.style.setProperty('--is-shopify-justify', justify);
  }

  async function fetchIconsByIds(ids) {
    var missing = ids.filter(function (id) {
      return !iconCache.has(id);
    });

    if (missing.length) {
      var url = new URL(SEARCH_ENDPOINT);
      url.searchParams.set('ids', missing.join(','));
      url.searchParams.set('limit', String(Math.max(24, missing.length)));
      url.searchParams.set('legalOnly', '0');

      var response = await fetch(url.toString());
      if (!response.ok) throw new Error('IconSearch returned ' + response.status);
      var payload = await response.json();
      var icons = Array.isArray(payload.icons) ? payload.icons : [];
      icons.forEach(function (icon) {
        if (icon.id) iconCache.set(icon.id, icon);
      });
    }

    return ids
      .map(function (id) {
        return iconCache.get(id);
      })
      .filter(Boolean);
  }

  function renderIconShell(icon, settings) {
    var url = urlForIcon(icon);
    var label = getIconTitle(icon);
    var item = document.createElement('span');
    item.className = 'iconsearch-shopify__icon';
    item.setAttribute('role', 'listitem');
    item.setAttribute('aria-label', label);
    item.dataset.iconId = icon.id || '';

    var shape = document.createElement('span');
    shape.className = 'iconsearch-shopify__shape';
    shape.style.webkitMask = 'url("' + url + '") no-repeat center / contain';
    shape.style.mask = 'url("' + url + '") no-repeat center / contain';
    item.appendChild(shape);

    if (settings.showLabels) {
      var text = document.createElement('span');
      text.className = 'iconsearch-shopify__label';
      text.textContent = label;
      item.appendChild(text);
    }

    return item;
  }

  function renderError(container, message) {
    container.innerHTML = '';
    var error = document.createElement('div');
    error.className = 'iconsearch-shopify__error';
    error.textContent = message;
    container.appendChild(error);
  }

  async function hydrateBlock(block, explicitSettings) {
    var settings = explicitSettings || getSettings(block);
    var container = block.querySelector('.iconsearch-shopify__icons');
    if (!container) return;

    setBlockVars(block, settings);

    if (!settings.ids.length) {
      container.innerHTML = '<div class="iconsearch-shopify__empty">Add icon IDs in the theme editor.</div>';
      return;
    }

    try {
      var icons = await fetchIconsByIds(settings.ids);
      container.innerHTML = '';
      if (!icons.length) {
        renderError(container, 'No matching icons found for the saved IDs.');
        return;
      }
      icons.forEach(function (icon) {
        container.appendChild(renderIconShell(icon, settings));
      });
    } catch (error) {
      renderError(container, error.message || 'Unable to load IconSearch icons.');
    }
  }

  function createOption(value, label) {
    var option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    return option;
  }

  function createEl(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function createPreview(icon, color, size) {
    var preview = createEl('span', 'iconsearch-shopify-picker__preview');
    var shape = createEl('span', 'iconsearch-shopify-picker__shape');
    shape.style.backgroundColor = color;
    shape.style.width = size + 'px';
    shape.style.height = size + 'px';
    shape.style.webkitMask = 'url("' + urlForIcon(icon) + '") no-repeat center / contain';
    shape.style.mask = 'url("' + urlForIcon(icon) + '") no-repeat center / contain';
    preview.appendChild(shape);
    return preview;
  }

  function buildDesigner(block) {
    var mount = block.querySelector('[data-iconsearch-designer]');
    if (!mount) return;

    var settings = getSettings(block);
    var selectedIcons = [];
    var state = {
      query: 'cart',
      library: 'all',
      style: 'all',
      legalOnly: true,
      size: settings.size,
      color: settings.color,
      loading: false,
      resultIcons: [],
      notice: '',
    };

    mount.innerHTML = '';

    var panel = createEl('div', 'iconsearch-shopify-picker');
    var header = createEl('div', 'iconsearch-shopify-picker__header');
    header.innerHTML =
      '<div><strong>IconSearch picker</strong><span>Search, drag into the tray, then copy IDs into the Shopify setting.</span></div>' +
      '<span class="iconsearch-shopify-picker__badge">Theme editor</span>';

    var controls = createEl('div', 'iconsearch-shopify-picker__controls');
    var searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = 'Search icons, e.g. cart, trust, shipping...';
    searchInput.value = state.query;

    var librarySelect = document.createElement('select');
    [
      ['all', 'All libraries'],
      ['lucide-icons', 'Lucide'],
      ['heroicons', 'Heroicons'],
      ['tabler-icons', 'Tabler'],
      ['phosphor-icons', 'Phosphor'],
      ['bootstrap-icons', 'Bootstrap'],
      ['iconify', 'Iconify collections'],
    ].forEach(function (item) {
      librarySelect.appendChild(createOption(item[0], item[1]));
    });

    var styleSelect = document.createElement('select');
    [
      ['all', 'All styles'],
      ['stroke', 'Outline'],
      ['solid', 'Solid'],
      ['duotone', 'Duotone'],
      ['twotone', 'Two-tone'],
      ['sharp', 'Sharp'],
    ].forEach(function (item) {
      styleSelect.appendChild(createOption(item[0], item[1]));
    });

    var colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = state.color;

    var sizeInput = document.createElement('input');
    sizeInput.type = 'range';
    sizeInput.min = '18';
    sizeInput.max = '128';
    sizeInput.step = '2';
    sizeInput.value = String(state.size);

    var legalLabel = createEl('label', 'iconsearch-shopify-picker__check');
    var legalInput = document.createElement('input');
    legalInput.type = 'checkbox';
    legalInput.checked = state.legalOnly;
    legalLabel.appendChild(legalInput);
    legalLabel.appendChild(document.createTextNode(' Legal-safe only'));

    controls.appendChild(searchInput);
    controls.appendChild(librarySelect);
    controls.appendChild(styleSelect);
    controls.appendChild(colorInput);
    controls.appendChild(sizeInput);
    controls.appendChild(legalLabel);

    var livePreview = createEl('div', 'iconsearch-shopify-picker__live');
    var tray = createEl('div', 'iconsearch-shopify-picker__tray');
    var results = createEl('div', 'iconsearch-shopify-picker__results');
    var actions = createEl('div', 'iconsearch-shopify-picker__actions');
    var copyButton = createEl('button', 'iconsearch-shopify-picker__primary', 'Copy selected IDs');
    var applyButton = createEl('button', 'iconsearch-shopify-picker__secondary', 'Apply live preview');
    var clearButton = createEl('button', 'iconsearch-shopify-picker__ghost', 'Clear tray');
    var notice = createEl('div', 'iconsearch-shopify-picker__notice');

    copyButton.type = 'button';
    applyButton.type = 'button';
    clearButton.type = 'button';
    actions.appendChild(copyButton);
    actions.appendChild(applyButton);
    actions.appendChild(clearButton);

    panel.appendChild(header);
    panel.appendChild(controls);
    panel.appendChild(livePreview);
    panel.appendChild(tray);
    panel.appendChild(results);
    panel.appendChild(actions);
    panel.appendChild(notice);
    mount.appendChild(panel);

    function currentDesignerSettings() {
      return {
        ids: selectedIcons.map(function (icon) {
          return icon.id;
        }),
        size: Number(sizeInput.value) || state.size,
        color: colorInput.value,
        gap: settings.gap,
        alignment: settings.alignment,
        showLabels: settings.showLabels,
        designMode: settings.designMode,
        helperEnabled: settings.helperEnabled,
      };
    }

    function updateNotice(text) {
      notice.textContent = text || '';
      notice.hidden = !text;
    }

    function renderTray() {
      tray.innerHTML = '';

      if (!selectedIcons.length) {
        var empty = createEl('div', 'iconsearch-shopify-picker__dropzone', 'Drag icons here to build your Shopify icon row.');
        tray.appendChild(empty);
      } else {
        selectedIcons.forEach(function (icon, index) {
          var chip = createEl('button', 'iconsearch-shopify-picker__chip');
          chip.type = 'button';
          chip.draggable = true;
          chip.dataset.index = String(index);
          chip.appendChild(createPreview(icon, colorInput.value, 22));
          chip.appendChild(createEl('span', '', getIconTitle(icon)));
          chip.title = 'Drag to reorder. Click to remove.';
          chip.addEventListener('click', function () {
            selectedIcons.splice(index, 1);
            renderTray();
            renderLivePreview();
          });
          chip.addEventListener('dragstart', function (event) {
            event.dataTransfer.setData('text/plain', String(index));
            event.dataTransfer.effectAllowed = 'move';
          });
          chip.addEventListener('dragover', function (event) {
            event.preventDefault();
          });
          chip.addEventListener('drop', function (event) {
            event.preventDefault();
            var from = Number(event.dataTransfer.getData('text/plain'));
            if (Number.isNaN(from) || from === index) return;
            var moved = selectedIcons.splice(from, 1)[0];
            selectedIcons.splice(index, 0, moved);
            renderTray();
            renderLivePreview();
          });
          tray.appendChild(chip);
        });
      }
    }

    function renderLivePreview() {
      livePreview.innerHTML = '';
      var previewSettings = currentDesignerSettings();
      var heading = createEl('div', 'iconsearch-shopify-picker__live-title', 'Live preview');
      var row = createEl('div', 'iconsearch-shopify-picker__live-row');
      row.style.gap = settings.gap + 'px';
      row.style.justifyContent = settings.alignment === 'left' ? 'flex-start' : settings.alignment === 'right' ? 'flex-end' : 'center';

      selectedIcons.forEach(function (icon) {
        row.appendChild(renderIconShell(icon, previewSettings));
      });

      if (!selectedIcons.length) {
        row.appendChild(createEl('div', 'iconsearch-shopify-picker__dropzone', 'Selected icons preview appears here.'));
      }

      livePreview.appendChild(heading);
      livePreview.appendChild(row);
    }

    function addIcon(icon) {
      if (!icon || !icon.id) return;
      if (selectedIcons.some(function (item) { return item.id === icon.id; })) {
        updateNotice('Already in the tray.');
        return;
      }
      selectedIcons.push(icon);
      renderTray();
      renderLivePreview();
      updateNotice('Added ' + getIconTitle(icon) + '.');
    }

    function renderResults() {
      results.innerHTML = '';

      if (state.loading) {
        results.appendChild(createEl('div', 'iconsearch-shopify-picker__status', 'Searching IconSearch...'));
        return;
      }

      if (!state.resultIcons.length) {
        results.appendChild(createEl('div', 'iconsearch-shopify-picker__status', 'No icons found. Try a broader term.'));
        return;
      }

      state.resultIcons.forEach(function (icon) {
        var card = createEl('button', 'iconsearch-shopify-picker__card');
        card.type = 'button';
        card.draggable = true;
        card.title = 'Click to add, or drag into the tray.';
        card.appendChild(createPreview(icon, colorInput.value, 40));
        card.appendChild(createEl('strong', '', getIconTitle(icon)));
        card.appendChild(createEl('span', '', icon.libraryName || icon.library || 'IconSearch'));
        card.addEventListener('click', function () {
          addIcon(icon);
        });
        card.addEventListener('dragstart', function (event) {
          event.dataTransfer.effectAllowed = 'copy';
          event.dataTransfer.setData(ICON_DRAG_TYPE, JSON.stringify(icon));
          event.dataTransfer.setData('text/plain', icon.id || getIconTitle(icon));
        });
        results.appendChild(card);
      });
    }

    async function searchIcons() {
      var url = new URL(SEARCH_ENDPOINT);
      url.searchParams.set('q', searchInput.value.trim());
      url.searchParams.set('lib', librarySelect.value);
      url.searchParams.set('style', styleSelect.value);
      url.searchParams.set('legalOnly', legalInput.checked ? '1' : '0');
      url.searchParams.set('limit', '36');
      url.searchParams.set('sort', searchInput.value.trim() ? 'relevance' : 'popular');

      state.loading = true;
      renderResults();

      try {
        var response = await fetch(url.toString());
        if (!response.ok) throw new Error('IconSearch returned ' + response.status);
        var payload = await response.json();
        state.resultIcons = Array.isArray(payload.icons) ? payload.icons : [];
      } catch (error) {
        state.resultIcons = [];
        updateNotice(error.message || 'Search failed.');
      } finally {
        state.loading = false;
        renderResults();
      }
    }

    var searchTimer = null;
    function scheduleSearch() {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(searchIcons, 220);
    }

    [searchInput, librarySelect, styleSelect, legalInput].forEach(function (control) {
      control.addEventListener('input', scheduleSearch);
      control.addEventListener('change', scheduleSearch);
    });

    [colorInput, sizeInput].forEach(function (control) {
      control.addEventListener('input', function () {
        renderTray();
        renderLivePreview();
      });
    });

    tray.addEventListener('dragover', function (event) {
      if (toArray(event.dataTransfer.types).indexOf(ICON_DRAG_TYPE) !== -1) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }
    });

    tray.addEventListener('drop', function (event) {
      if (toArray(event.dataTransfer.types).indexOf(ICON_DRAG_TYPE) === -1) return;
      event.preventDefault();
      try {
        addIcon(JSON.parse(event.dataTransfer.getData(ICON_DRAG_TYPE)));
      } catch {}
    });

    copyButton.addEventListener('click', async function () {
      var ids = selectedIcons.map(function (icon) { return icon.id; }).join(',');
      if (!ids) {
        updateNotice('Add at least one icon first.');
        return;
      }
      try {
        await navigator.clipboard.writeText(ids);
        updateNotice('Copied. Paste into the Icon IDs setting in the Shopify sidebar.');
      } catch {
        updateNotice('Copy failed. Select this ID list manually: ' + ids);
      }
    });

    applyButton.addEventListener('click', function () {
      var previewSettings = currentDesignerSettings();
      block.dataset.iconIds = previewSettings.ids.join(',');
      block.dataset.iconSize = String(previewSettings.size);
      block.dataset.iconColor = previewSettings.color;
      hydrateBlock(block, previewSettings);
      updateNotice('Preview updated. Copy IDs to save this row in Shopify settings.');
    });

    clearButton.addEventListener('click', function () {
      selectedIcons = [];
      renderTray();
      renderLivePreview();
      updateNotice('');
    });

    renderTray();
    renderLivePreview();
    searchIcons();
  }

  blocks.forEach(function (block) {
    hydrateBlock(block);
    var settings = getSettings(block);
    if (settings.designMode && settings.helperEnabled) {
      buildDesigner(block);
    }
  });
})();
