import * as vscode from 'vscode';

type ApiIcon = {
  id: string;
  name: string;
  displayName?: string;
  library: string;
  libraryName?: string;
  npmPackage?: string;
  license?: string;
  reactImport?: string;
  reactUsage?: string;
  svgUrl?: string;
  legalSafe?: boolean;
  licenseUrl?: string;
};

type WebviewIcon = ApiIcon & {
  displayName: string;
  libraryName: string;
  svgUrl: string;
  previewUrls: string[];
};

type ApiResponse = {
  icons?: unknown;
  total?: unknown;
  page?: unknown;
  limit?: unknown;
  totalPages?: unknown;
  facets?: unknown;
};

type IconActionFormat = 'react' | 'svg' | 'vue' | 'svelte' | 'tailwind';

type ReactImportInfo =
  | {
      kind: 'named';
      moduleSpecifier: string;
      importedName: string;
      importText: string;
    }
  | {
      kind: 'sideEffect';
      moduleSpecifier: string;
      importText: string;
    };

type SearchRequest = {
  query: string;
  library: string;
  style: string;
  legalOnly: boolean;
  page: number;
  append: boolean;
  prefetch: boolean;
  requestKey: string;
};

type ExtensionAccess = {
  email: string;
  product: 'vscode';
  tier: 'free' | 'founder';
  founderNumber: number | null;
  expiresAt: string;
};

const EXTENSION_API_URL = 'https://iconsearch.info/api/extension/icon-search';
const AUTH_API_URL = 'https://iconsearch.info/api';
const SESSION_TOKEN_KEY = 'iconsearch.sessionToken';
const ACCESS_CACHE_KEY = 'iconsearch.accessCache';
const RECENT_KEY = 'iconsearch.recentIcons';
const MAX_RECENT_ICONS = 12;
const SEARCHABLE_ICON_COUNT = 355_702;
const NAMED_LIBRARIES = [
  'lucide-icons',
  'heroicons',
  'tabler-icons',
  'patternfly-icons',
  'untitled-ui-icons',
  'phosphor-icons',
  'remix-icon',
  'feather-icons',
  'bootstrap-icons',
  'radix-icons',
  'iconoir',
  'ionicons',
  'octicons',
  'ant-design-icons',
  'devicons',
  'teenyicons',
  'circum-icons',
  'elusive-icons',
] as const;

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private authAttempt = 0;

  constructor(private readonly context: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data: unknown) => {
      if (!isRecord(data)) return;

      switch (data.type) {
        case 'ready':
          await this.postAccessState();
          void this.loadCatalog();
          break;
        case 'signIn':
          void this.beginSignIn();
          break;
        case 'signOut':
          await this.signOut();
          break;
        case 'search':
          await this.handleSearch(parseSearchRequest(data.value));
          break;
        case 'insertIcon':
          await this.handleIconAction(data.value, 'insert');
          break;
        case 'copyIcon':
          await this.handleIconAction(data.value, 'copy');
          break;
        case 'openIcon':
          await this.openIcon(data.value);
          break;
        case 'onInfo':
          vscode.window.showInformationMessage(stringFrom(data.value));
          break;
        case 'onError':
          vscode.window.showErrorMessage(stringFrom(data.value));
          break;
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private async postAccessState() {
    const token = await this.context.secrets.get(SESSION_TOKEN_KEY);
    let access = this.context.globalState.get<ExtensionAccess>(ACCESS_CACHE_KEY);

    if (token) {
      try {
        const response = await fetch(`${AUTH_API_URL}/entitlements/me`, {
          headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const payload = await response.json() as { access?: unknown };
          access = normalizeExtensionAccess(payload.access);
          if (access) await this.context.globalState.update(ACCESS_CACHE_KEY, access);
        } else if (response.status === 401) {
          await this.context.secrets.delete(SESSION_TOKEN_KEY);
          await this.context.globalState.update(ACCESS_CACHE_KEY, undefined);
          access = undefined;
        }
      } catch {
        // A previously verified token remains usable during a temporary outage.
      }
    } else {
      access = undefined;
    }

    const config = vscode.workspace.getConfiguration('iconSearch');
    const defaultFormat = config.get<string>('defaultFormat') || 'react';
    this.post({
      type: 'accessState',
      unlocked: Boolean(token && access),
      email: access?.email || '',
      tier: access?.tier || '',
      founderNumber: access?.founderNumber ?? null,
      recentIcons: this.getRecentIcons(),
      defaultFormat,
    });
  }

  private async beginSignIn() {
    const attempt = ++this.authAttempt;
    this.post({ type: 'authPending', value: 'Opening secure sign-in in your browser...' });

    try {
      const startResponse = await fetch(`${AUTH_API_URL}/device/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          product: 'vscode',
          clientName: `VS Code ${vscode.version}`,
        }),
      });
      const startPayload = await startResponse.json() as Record<string, unknown>;
      if (!startResponse.ok) {
        throw new Error(stringFrom(startPayload.error) || 'Could not start sign-in.');
      }

      const deviceCode = stringFrom(startPayload.deviceCode);
      const verificationUrl = stringFrom(startPayload.verificationUriComplete);
      const expiresIn = numberFrom(startPayload.expiresIn, 600);
      const interval = Math.max(2, numberFrom(startPayload.interval, 3));
      if (!deviceCode || !verificationUrl) throw new Error('The sign-in response was incomplete.');

      const opened = await vscode.env.openExternal(vscode.Uri.parse(verificationUrl));
      if (!opened) throw new Error('Could not open the browser sign-in page.');

      this.post({ type: 'authPending', value: 'Approve the connection in your browser. This window will update automatically.' });
      const deadline = Date.now() + expiresIn * 1000;

      while (attempt === this.authAttempt && Date.now() < deadline) {
        await delay(interval * 1000);
        if (attempt !== this.authAttempt) return;

        const statusResponse = await fetch(`${AUTH_API_URL}/device/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ deviceCode }),
        });
        const statusPayload = await statusResponse.json() as Record<string, unknown>;
        const status = stringFrom(statusPayload.status);

        if (status === 'pending') continue;
        if (status === 'authorized') {
          const token = stringFrom(statusPayload.token);
          const access = normalizeExtensionAccess(statusPayload.access);
          if (!token || !access) throw new Error('The approved session was incomplete.');

          await this.context.secrets.store(SESSION_TOKEN_KEY, token);
          await this.context.globalState.update(ACCESS_CACHE_KEY, access);
          await this.postAccessState();
          void this.loadCatalog();

          const label = access.tier === 'founder' && access.founderNumber
            ? `Founder #${access.founderNumber}`
            : 'Free';
          vscode.window.showInformationMessage(`IconSearch connected. ${label} access is active.`);
          return;
        }

        throw new Error(stringFrom(statusPayload.error) || 'The sign-in link expired. Please try again.');
      }

      throw new Error('The sign-in link expired. Please try again.');
    } catch (error) {
      if (attempt !== this.authAttempt) return;
      const message = error instanceof Error ? error.message : 'Could not connect your IconSearch account.';
      this.post({ type: 'authError', value: message });
    }
  }

  private async signOut() {
    this.authAttempt += 1;
    const token = await this.context.secrets.get(SESSION_TOKEN_KEY);
    if (token) {
      try {
        await fetch(`${AUTH_API_URL}/device/revoke`, {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
        });
      } catch {
        // Local sign-out still removes the token if the network is unavailable.
      }
    }
    await this.context.secrets.delete(SESSION_TOKEN_KEY);
    await this.context.globalState.update(ACCESS_CACHE_KEY, undefined);
    await this.postAccessState();
  }

  private async loadCatalog() {
    try {
      const token = await this.context.secrets.get(SESSION_TOKEN_KEY);
      if (!token) return;

      const url = new URL(EXTENSION_API_URL);
      url.searchParams.set('limit', '1');
      url.searchParams.set('legalOnly', '0');

      const response = await fetch(url.toString(), {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
          'x-iconsearch-product': 'vscode',
        },
      });
      if (!response.ok) throw new Error(`IconSearch catalog returned ${response.status}`);

      const payload = (await response.json()) as ApiResponse;
      const facets = isRecord(payload.facets) ? payload.facets : {};
      const iconifySets = stringArrayFrom(facets.iconifySets);

      this.post({
        type: 'catalog',
        namedLibraries: NAMED_LIBRARIES,
        iconifySets,
        total: typeof payload.total === 'number'
          ? Math.max(SEARCHABLE_ICON_COUNT, payload.total)
          : SEARCHABLE_ICON_COUNT,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not load library catalog.';
      this.post({ type: 'catalogError', value: message });
    }
  }

  private async handleSearch(request: SearchRequest) {
    const token = await this.context.secrets.get(SESSION_TOKEN_KEY);
    if (!token) {
      this.post({ type: 'accessRequired' });
      return;
    }

    const query = request.query.trim();
    const limit = 60;
    const page = Math.max(1, Math.floor(request.page));
    const hasActiveFilter = request.library !== 'all' || request.style !== 'all';
    if (query.length === 1 || (!query && !hasActiveFilter)) {
      this.post({
        type: 'searchResults',
        value: [],
        total: 0,
        query,
        page: 1,
        limit,
        totalPages: 0,
        append: false,
        prefetch: false,
        requestKey: request.requestKey,
      });
      return;
    }

    try {
      const url = new URL(EXTENSION_API_URL);
      if (query) url.searchParams.set('q', query);
      url.searchParams.set('limit', String(limit));
      url.searchParams.set('page', String(page));
      url.searchParams.set('sort', 'relevance');
      url.searchParams.set('legalOnly', request.legalOnly ? '1' : '0');

      if (request.library.startsWith('iconify:')) {
        url.searchParams.set('lib', 'iconify');
        url.searchParams.set('iconifySet', request.library.replace(/^iconify:/, ''));
      } else if (request.library !== 'all') {
        url.searchParams.set('lib', request.library);
      }
      if (request.style !== 'all') url.searchParams.set('style', request.style);

      const response = await fetch(url.toString(), {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
          'x-iconsearch-product': 'vscode',
        },
      });

      if (!response.ok) {
        throw new Error(`IconSearch API returned ${response.status}`);
      }

      const payload = (await response.json()) as ApiResponse;
      const icons = Array.isArray(payload.icons) ? payload.icons : [];
      const onlineIcons = icons
        .map((icon) => normalizeIcon(icon))
        .filter((icon): icon is WebviewIcon => Boolean(icon));
      const total = typeof payload.total === 'number' ? payload.total : onlineIcons.length;
      const totalPages = typeof payload.totalPages === 'number'
        ? payload.totalPages
        : total > 0
          ? Math.ceil(total / limit)
          : 0;

      this.post({
        type: 'searchResults',
        value: onlineIcons,
        total,
        query,
        page: typeof payload.page === 'number' ? payload.page : page,
        limit: typeof payload.limit === 'number' ? payload.limit : limit,
        totalPages,
        append: request.append,
        prefetch: request.prefetch,
        requestKey: request.requestKey,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown API error';
      this.post({
        type: 'searchError',
        value: message,
        query,
        append: request.append,
        prefetch: request.prefetch,
        requestKey: request.requestKey,
      });
    }
  }

  private async handleIconAction(value: unknown, action: 'insert' | 'copy') {
    if (!isRecord(value)) return;

    const format = parseFormat(value.format);
    const icon = normalizeIcon(value.icon);
    if (!icon) {
      vscode.window.showErrorMessage('This result does not include an online SVG preview URL.');
      return;
    }

    try {
      if (action === 'copy') {
        const snippet = await this.createCopySnippet(icon, format);
        await vscode.env.clipboard.writeText(snippet);
        await this.rememberIcon(icon);
        vscode.window.showInformationMessage(format === 'svg' ? 'Copied live SVG markup.' : 'Copied icon snippet.');
        return;
      }

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        const snippet = await this.createCopySnippet(icon, format);
        await vscode.env.clipboard.writeText(snippet);
        await this.rememberIcon(icon);
        vscode.window.showInformationMessage('No active editor. Copied snippet instead.');
        return;
      }

      if (format === 'react') {
        await insertReactIcon(editor, icon, this.createReactUsage(icon));
      } else {
        const snippet = await this.createSnippet(icon, format);
        await editor.edit((editBuilder) => {
          editBuilder.replace(editor.selection, snippet);
        });
      }

      await this.rememberIcon(icon);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not complete icon action.';
      vscode.window.showErrorMessage(message);
    }
  }

  private async openIcon(value: unknown) {
    const icon = normalizeIcon(value);
    if (!icon) return;

    await vscode.env.openExternal(vscode.Uri.parse(icon.svgUrl));
  }

  private async rememberIcon(icon: WebviewIcon) {
    const current = this.getRecentIcons();
    const next = [icon, ...current.filter((item) => item.id !== icon.id)].slice(0, MAX_RECENT_ICONS);
    await this.context.globalState.update(RECENT_KEY, next);
    this.post({ type: 'recentIcons', value: next });
  }

  private getRecentIcons(): WebviewIcon[] {
    const saved = this.context.globalState.get<unknown>(RECENT_KEY);
    if (!Array.isArray(saved)) return [];

    return saved
      .map((icon) => normalizeIcon(icon))
      .filter((icon): icon is WebviewIcon => Boolean(icon))
      .slice(0, MAX_RECENT_ICONS);
  }

  private async createSnippet(icon: WebviewIcon, format: IconActionFormat): Promise<string> {
    if (format === 'svg') {
      const svg = await fetchSvgMarkup(icon);
      return applySvgClass(svg);
    }

    if (format === 'react') return this.createReactUsage(icon);

    const config = vscode.workspace.getConfiguration('iconSearch');
    const classes = config.get<string>('tailwindClasses') || 'w-5 h-5';
    return createUrlSnippet(icon, format, classes);
  }

  private async createCopySnippet(icon: WebviewIcon, format: IconActionFormat): Promise<string> {
    if (format !== 'react') return this.createSnippet(icon, format);

    const reactUsage = this.createReactUsage(icon);
    const importInfo = parseReactImport(icon.reactImport);
    return importInfo ? `${importInfo.importText}\n\n${reactUsage}` : reactUsage;
  }

  private createReactUsage(icon: WebviewIcon): string {
    const usage = icon.reactUsage || `<${icon.displayName || toPascalCase(icon.name)} />`;
    const config = vscode.workspace.getConfiguration('iconSearch');
    const classes = config.get<string>('tailwindClasses') || 'w-5 h-5';

    return applyJsxClassName(usage, classes);
  }

  private post(message: unknown) {
    this._view?.webview.postMessage(message);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const nonce = getNonce();
    const csp = [
      "default-src 'none'",
      "img-src https: http: data:",
      `style-src ${webview.cspSource} 'unsafe-inline'`,
      `script-src 'nonce-${nonce}'`,
    ].join('; ');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="${csp}">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IconSearch</title>
        <style>
          :root { color-scheme: light dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: var(--vscode-foreground);
            background: var(--vscode-sideBar-background);
            font-family: var(--vscode-font-family);
          }
          button, input, select { font: inherit; }
          .hidden { display: none !important; }
          .shell { min-height: 100vh; padding: 12px; }
          .hero { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
          .eyebrow { margin-bottom: 3px; color: var(--vscode-descriptionForeground); font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
          .title { font-size: 17px; font-weight: 800; letter-spacing: -0.02em; }
          .online-pill { border: 1px solid rgba(52, 211, 153, 0.5); border-radius: 999px; padding: 3px 7px; color: #34d399; background: rgba(52, 211, 153, 0.1); font-size: 10px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
          .unlock-card, .empty { margin-top: 14px; padding: 14px; border: 1px solid var(--vscode-widget-border, transparent); border-radius: 14px; background: color-mix(in srgb, var(--vscode-editor-background) 82%, transparent); }
          .unlock-title { margin-bottom: 6px; font-size: 15px; font-weight: 800; }
          .unlock-copy, .small-copy { color: var(--vscode-descriptionForeground); font-size: 12px; line-height: 1.5; }
          .unlock-row { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
          .input, .select {
            width: 100%;
            min-height: 34px;
            border: 1px solid var(--vscode-input-border, transparent);
            border-radius: 9px;
            outline: none;
            color: var(--vscode-input-foreground);
            background: var(--vscode-input-background);
            padding: 0 9px;
          }
          .input:focus, .select:focus { border-color: var(--vscode-focusBorder); box-shadow: 0 0 0 1px var(--vscode-focusBorder); }
          .primary-btn, .secondary-btn, .mode-btn, .action-btn {
            border: 1px solid var(--vscode-button-border, transparent);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
          }
          .primary-btn { min-height: 34px; color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
          .secondary-btn { min-height: 28px; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); }
          .unlock-error { min-height: 16px; color: var(--vscode-errorForeground); font-size: 11px; }
          .search-panel {
            position: sticky;
            top: 0;
            z-index: 2;
            margin: 0 -12px 10px;
            padding: 0 12px 10px;
            background: var(--vscode-sideBar-background);
            border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, transparent);
          }
          .search-row { display: flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 10px; border: 1px solid var(--vscode-input-border, transparent); border-radius: 10px; background: var(--vscode-input-background); }
          .search-row:focus-within { border-color: var(--vscode-focusBorder); box-shadow: 0 0 0 1px var(--vscode-focusBorder); }
          .search-icon { color: var(--vscode-descriptionForeground); font-size: 13px; }
          .search-box { width: 100%; min-width: 0; border: none; outline: none; color: var(--vscode-input-foreground); background: transparent; }
          .meta-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 10px; }
          .status { min-width: 0; color: var(--vscode-descriptionForeground); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .account-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 10px; color: var(--vscode-descriptionForeground); font-size: 11px; }
          .filter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
          .legal-toggle { display: flex; align-items: center; gap: 6px; grid-column: 1 / -1; color: var(--vscode-descriptionForeground); font-size: 11px; }
          .mode-switch { display: grid; grid-template-columns: repeat(5, 1fr); gap: 3px; margin-top: 8px; padding: 3px; border-radius: 999px; background: var(--vscode-editor-background); border: 1px solid var(--vscode-widget-border, transparent); }
          .mode-btn { border-radius: 999px; padding: 5px 0; color: var(--vscode-button-secondaryForeground); background: transparent; font-size: 10px; }
          .mode-btn.active { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
          .results { display: flex; flex-direction: column; gap: 8px; }
          .icon-card { display: grid; grid-template-columns: 42px minmax(0, 1fr); gap: 10px; width: 100%; padding: 9px; border: 1px solid var(--vscode-widget-border, transparent); border-radius: 12px; color: var(--vscode-foreground); background: color-mix(in srgb, var(--vscode-editor-background) 82%, transparent); cursor: grab; user-select: none; outline: none; }
          .icon-card:hover, .icon-card.selected, .icon-card:focus { border-color: var(--vscode-focusBorder); background: var(--vscode-list-hoverBackground); }
          .icon-card:active { cursor: grabbing; }
          .preview { display: grid; place-items: center; width: 42px; height: 42px; border: 1px solid var(--vscode-widget-border, transparent); border-radius: 11px; background: var(--vscode-sideBar-background); overflow: hidden; }
          .preview img { width: 24px; height: 24px; object-fit: contain; opacity: 0.92; }
          body.vscode-dark .preview img, body.vscode-high-contrast .preview img { filter: invert(1) brightness(0.96); }
          .preview.failed { color: var(--vscode-descriptionForeground); font-size: 9px; line-height: 1.2; padding: 4px; text-align: center; }
          .card-main { min-width: 0; }
          .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
          .icon-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 800; }
          .icon-lib, .icon-package { color: var(--vscode-descriptionForeground); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .icon-package { margin-top: 2px; font-size: 10px; }
          .chip { flex: 0 0 auto; border: 1px solid var(--vscode-widget-border, transparent); border-radius: 999px; padding: 2px 6px; color: var(--vscode-descriptionForeground); font-size: 9px; font-weight: 700; text-transform: uppercase; }
          .chip.safe { color: #34d399; border-color: rgba(52, 211, 153, 0.45); background: rgba(52, 211, 153, 0.08); }
          .actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-top: 8px; }
          .action-btn { padding: 5px 6px; color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground); font-size: 11px; }
          .action-btn.primary { color: var(--vscode-button-foreground); background: var(--vscode-button-background); }
          .empty { color: var(--vscode-descriptionForeground); text-align: center; font-size: 12px; line-height: 1.5; }
          .load-more-sentinel { height: 1px; }
        </style>
      </head>
      <body>
        <main class="shell">
          <header class="hero">
            <div>
              <div class="eyebrow">Live icon search</div>
              <div class="title">IconSearch</div>
            </div>
            <div class="online-pill">Free</div>
          </header>

          <section id="unlockPanel" class="unlock-card hidden">
            <div class="unlock-title">Connect your IconSearch account</div>
            <div class="unlock-copy">Sign in securely in your browser. The first 500 verified VS Code users receive lifetime Founder access.</div>
            <div class="unlock-row">
              <button id="signInBtn" class="primary-btn" type="button">Sign in with IconSearch</button>
              <div id="unlockError" class="unlock-error"></div>
            </div>
            <div class="small-copy">Your password stays in the browser. VS Code stores only a revocable app token in SecretStorage.</div>
          </section>

          <section id="appPanel" class="hidden">
            <div class="account-row">
              <span id="accountLabel">Unlocked</span>
              <button id="signOutBtn" class="secondary-btn" type="button">Sign out</button>
            </div>

            <section class="search-panel">
              <div class="search-row">
                <span class="search-icon">Search</span>
                <input type="text" id="searchInput" class="search-box" placeholder="home, arrow, chart..." autocomplete="off" />
              </div>
              <div class="filter-grid">
                <select id="libraryFilter" class="select" aria-label="Library filter">
                  <option value="all">All libraries</option>
                  <option value="lucide-icons">Lucide</option>
                  <option value="heroicons">Heroicons</option>
                  <option value="tabler-icons">Tabler</option>
                  <option value="phosphor-icons">Phosphor</option>
                  <option value="bootstrap-icons">Bootstrap</option>
                  <option value="remix-icon">Remix</option>
                  <option value="feather-icons">Feather</option>
                  <option value="iconoir">Iconoir</option>
                  <option value="radix-icons">Radix Icons</option>
                  <option value="ionicons">Ionicons</option>
                  <option value="octicons">Octicons</option>
                  <option value="ant-design-icons">Ant Design Icons</option>
                  <option value="devicons">Devicons</option>
                  <option value="teenyicons">Teenyicons</option>
                  <option value="circum-icons">Circum Icons</option>
                  <option value="elusive-icons">Elusive Icons</option>
                  <option value="iconify">All Iconify collections</option>
                </select>
                <select id="styleFilter" class="select" aria-label="Style filter">
                  <option value="all">All styles</option>
                  <option value="stroke">Outline</option>
                  <option value="solid">Solid</option>
                  <option value="duotone">Duotone</option>
                  <option value="twotone">Two tone</option>
                  <option value="sharp">Sharp</option>
                </select>
                <label class="legal-toggle">
                  <input id="legalOnly" type="checkbox" checked />
                  Legal-safe only
                </label>
              </div>
              <div class="mode-switch" aria-label="Insert format">
                <button class="mode-btn active" data-format="react" type="button">React</button>
                <button class="mode-btn" data-format="svg" type="button">SVG</button>
                <button class="mode-btn" data-format="vue" type="button">Vue</button>
                <button class="mode-btn" data-format="svelte" type="button">Svelte</button>
                <button class="mode-btn" data-format="tailwind" type="button">TW</button>
              </div>
              <div class="meta-row">
                <div id="status" class="status">Type 2+ characters to search the live API.</div>
              </div>
            </section>

            <div class="results" id="iconsGrid"></div>
            <div id="loadMoreSentinel" class="load-more-sentinel" aria-hidden="true"></div>
            <div class="empty" id="emptyState">No offline icons are bundled. Results appear only from the live IconSearch API.</div>
          </section>
        </main>

        <script nonce="${nonce}">
          const vscode = acquireVsCodeApi();
          const unlockPanel = document.getElementById('unlockPanel');
          const appPanel = document.getElementById('appPanel');
          const signInBtn = document.getElementById('signInBtn');
          const unlockError = document.getElementById('unlockError');
          const signOutBtn = document.getElementById('signOutBtn');
          const accountLabel = document.getElementById('accountLabel');
          const searchInput = document.getElementById('searchInput');
          const libraryFilter = document.getElementById('libraryFilter');
          const styleFilter = document.getElementById('styleFilter');
          const legalOnly = document.getElementById('legalOnly');
          const iconsGrid = document.getElementById('iconsGrid');
          const loadMoreSentinel = document.getElementById('loadMoreSentinel');
          const statusEl = document.getElementById('status');
          const emptyState = document.getElementById('emptyState');

          let currentFormat = 'react';
          let debounceTimer;
          let currentIcons = [];
          let recentIcons = [];
          let selectedIndex = -1;
          let currentPage = 0;
          let totalResults = 0;
          let totalPages = 0;
          let loadingMore = false;
          let prefetching = false;
          let prefetchedPage = null;
          let pendingPrefetchPromotion = false;
          let activeRequestKey = '';

          function escapeHtml(value) {
            return String(value ?? '')
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
          }

          function escapeAttr(value) {
            return escapeHtml(value).replace(/\\n/g, ' ');
          }

          function formatCatalogName(value) {
            const names = {
              'lucide-icons': 'Lucide Icons',
              'heroicons': 'Heroicons',
              'tabler-icons': 'Tabler Icons',
              'untitled-ui-icons': 'Untitled UI Icons',
              'phosphor-icons': 'Phosphor Icons',
              'remix-icon': 'Remix Icon',
              'feather-icons': 'Feather Icons',
              'bootstrap-icons': 'Bootstrap Icons',
              'radix-icons': 'Radix Icons',
              'iconoir': 'Iconoir',
              'ionicons': 'Ionicons',
              'octicons': 'Octicons',
              'ant-design-icons': 'Ant Design Icons',
              'devicons': 'Devicons',
              'teenyicons': 'Teenyicons',
              'circum-icons': 'Circum Icons',
              'elusive-icons': 'Elusive Icons',
            };
            if (names[value]) return names[value];

            const acronyms = new Set(['ai', 'bi', 'fa', 'gis', 'ic', 'mdi', 'svg', 'ui']);
            return String(value)
              .replace(/^iconify-/, '')
              .split('-')
              .map((part) => acronyms.has(part) ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');
          }

          function appendCatalogOption(parent, value, label) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            parent.appendChild(option);
          }

          function renderCatalog(namedLibraries, iconifySets, total) {
            const selectedValue = libraryFilter.value;
            libraryFilter.innerHTML = '';
            appendCatalogOption(
              libraryFilter,
              'all',
              total ? 'All libraries - ' + Number(total).toLocaleString('en-US') + ' icons' : 'All libraries'
            );

            const namedGroup = document.createElement('optgroup');
            namedGroup.label = 'Named libraries (' + namedLibraries.length + ')';
            namedLibraries.forEach((library) => {
              appendCatalogOption(namedGroup, library, formatCatalogName(library));
            });
            libraryFilter.appendChild(namedGroup);

            const iconifyGroup = document.createElement('optgroup');
            iconifyGroup.label = 'Iconify collections (' + iconifySets.length + ')';
            appendCatalogOption(iconifyGroup, 'iconify', 'All Iconify collections');
            iconifySets.forEach((set) => {
              appendCatalogOption(iconifyGroup, 'iconify:' + set, formatCatalogName(set));
            });
            libraryFilter.appendChild(iconifyGroup);

            if (Array.from(libraryFilter.options).some((option) => option.value === selectedValue)) {
              libraryFilter.value = selectedValue;
            }
          }

          function requestKey(request) {
            return JSON.stringify({
              query: request.query,
              library: request.library,
              style: request.style,
              legalOnly: request.legalOnly,
            });
          }

          function currentSearchRequest(page, append, prefetch) {
            const request = {
              query: searchInput.value.trim(),
              library: libraryFilter.value,
              style: styleFilter.value,
              legalOnly: legalOnly.checked,
              page: page || 1,
              append: Boolean(append),
              prefetch: Boolean(prefetch),
            };
            request.requestKey = requestKey(request);
            return request;
          }

          function searchNow() {
            const request = currentSearchRequest(1, false);
            const hasActiveFilter = request.library !== 'all' || request.style !== 'all';
            if (request.query.length === 1 || (!request.query && !hasActiveFilter)) {
              activeRequestKey = '';
              loadingMore = false;
              prefetching = false;
              prefetchedPage = null;
              pendingPrefetchPromotion = false;
              renderRecentOrEmpty();
              return;
            }

            activeRequestKey = request.requestKey;
            loadingMore = true;
            prefetching = false;
            prefetchedPage = null;
            pendingPrefetchPromotion = false;
            currentPage = 0;
            totalResults = 0;
            totalPages = 0;
            statusEl.textContent = 'Searching live IconSearch API...';
            vscode.postMessage({ type: 'search', value: request });
          }

          function scheduleSearch() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(searchNow, 250);
          }

          function setAccess(unlocked, email, tier, founderNumber) {
            unlockPanel.classList.toggle('hidden', unlocked);
            appPanel.classList.toggle('hidden', !unlocked);
            const plan = tier === 'founder' && founderNumber
              ? 'Founder #' + founderNumber
              : (tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : '');
            accountLabel.textContent = email
              ? 'Signed in: ' + email + (plan ? ' - ' + plan : '')
              : 'Connected';
            if (unlocked) renderRecentOrEmpty();
          }

          function setFormat(format) {
            currentFormat = format;
            document.querySelectorAll('[data-format]').forEach((button) => {
              button.classList.toggle('active', button.dataset.format === format);
            });
          }

          function dragSnippet(icon) {
            if (currentFormat === 'svg' || currentFormat === 'vue' || currentFormat === 'svelte') {
              return '<img src="' + escapeAttr(icon.svgUrl) + '" alt="' + escapeAttr(icon.name) + '" class="w-5 h-5" />';
            }
            if (currentFormat === 'tailwind') {
              return '<span class="inline-block w-5 h-5 bg-current" style="mask:url(' + escapeAttr(icon.svgUrl) + ') center / contain no-repeat; -webkit-mask:url(' + escapeAttr(icon.svgUrl) + ') center / contain no-repeat;"></span>';
            }
            return icon.reactUsage || ('<' + (icon.displayName || icon.name) + ' className="w-5 h-5" />');
          }

          function setPreviewImage(preview, img, urls, index) {
            if (!urls[index]) {
              preview.classList.add('failed');
              preview.textContent = 'No online preview';
              return;
            }
            img.src = urls[index];
            img.dataset.index = String(index);
          }

          function warmPreviewImages(icons) {
            icons.forEach((icon) => {
              const urls = Array.isArray(icon.previewUrls) ? icon.previewUrls : [icon.svgUrl].filter(Boolean);
              if (!urls[0]) return;
              const img = new Image();
              img.decoding = 'async';
              img.src = urls[0];
            });
          }

          function setSelectedIndex(index) {
            const cards = Array.from(document.querySelectorAll('.icon-card'));
            if (!cards.length) {
              selectedIndex = -1;
              return;
            }
            selectedIndex = Math.max(0, Math.min(index, cards.length - 1));
            cards.forEach((card, cardIndex) => card.classList.toggle('selected', cardIndex === selectedIndex));
            cards[selectedIndex].focus();
          }

          function insertSelected() {
            if (selectedIndex < 0 || !currentIcons[selectedIndex]) return;
            vscode.postMessage({ type: 'insertIcon', value: { icon: currentIcons[selectedIndex], format: currentFormat } });
          }

          function renderRecentOrEmpty() {
            if (recentIcons.length) {
              renderIcons(recentIcons, recentIcons.length, '', 'Recent online picks');
              return;
            }
            iconsGrid.innerHTML = '';
            currentIcons = [];
            selectedIndex = -1;
            currentPage = 0;
            totalResults = 0;
            totalPages = 0;
            loadingMore = false;
            prefetching = false;
            prefetchedPage = null;
            pendingPrefetchPromotion = false;
            emptyState.style.display = 'block';
            emptyState.textContent = 'Search the live API or pick from recent icons after your first insert.';
            statusEl.textContent = 'Type 2+ characters to search the live API.';
          }

          function hasMoreResults() {
            return Boolean(totalResults && currentIcons.length < totalResults && (!totalPages || currentPage < totalPages));
          }

          function isNearBottom(distance) {
            const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
            const fullHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            return scrollTop + viewportHeight >= fullHeight - distance;
          }

          function canRequestMore() {
            if (!currentIcons.length || !totalResults || !hasMoreResults()) return false;
            const request = currentSearchRequest(currentPage + 1, true, false);
            const hasActiveFilter = request.library !== 'all' || request.style !== 'all';
            return !(request.query.length === 1 || (!request.query && !hasActiveFilter) || request.requestKey !== activeRequestKey);
          }

          function prefetchNextPage() {
            if (loadingMore || prefetching || prefetchedPage || !canRequestMore()) return;
            const request = currentSearchRequest(currentPage + 1, true, true);
            prefetching = true;
            vscode.postMessage({ type: 'search', value: request });
          }

          function appendPrefetchedPage() {
            if (!prefetchedPage || prefetchedPage.requestKey !== activeRequestKey || prefetchedPage.page !== currentPage + 1) {
              prefetchedPage = null;
              return false;
            }

            const page = prefetchedPage;
            prefetchedPage = null;
            pendingPrefetchPromotion = false;
            renderIcons(page.icons, page.total, page.query, '', {
              append: true,
              page: page.page,
              totalPages: page.totalPages,
            });
            window.setTimeout(prefetchNextPage, 80);
            return true;
          }

          function loadNextPage() {
            if (loadingMore || !canRequestMore()) return;
            if (appendPrefetchedPage()) return;

            if (prefetching) {
              pendingPrefetchPromotion = true;
              statusEl.textContent = currentIcons.length + ' shown from ' + totalResults.toLocaleString('en-US') + ' online results - preparing more...';
              return;
            }

            const request = currentSearchRequest(currentPage + 1, true, false);
            loadingMore = true;
            statusEl.textContent = currentIcons.length + ' shown from ' + totalResults.toLocaleString('en-US') + ' online results - loading more...';
            vscode.postMessage({ type: 'search', value: request });
          }

          function maybeLoadMore() {
            prefetchNextPage();
            if (isNearBottom(900)) loadNextPage();
          }

          function renderIcons(icons, total, query, label, options) {
            const append = Boolean(options && options.append);
            const page = Number(options && options.page) || 1;
            const reportedTotalPages = Number(options && options.totalPages) || 0;
            totalResults = Number(total) || 0;
            totalPages = reportedTotalPages || (totalResults > 0 ? Math.ceil(totalResults / 60) : 0);
            currentPage = page;

            if (!append) {
              iconsGrid.innerHTML = '';
              currentIcons = [];
              selectedIndex = -1;
              prefetchedPage = null;
              prefetching = false;
              pendingPrefetchPromotion = false;
            }

            if (!icons.length && !append) {
              loadingMore = false;
              emptyState.style.display = 'block';
              emptyState.textContent = query ? 'No live online results for "' + query + '".' : 'No recent icons yet.';
              statusEl.textContent = query ? 'No results from live API.' : 'Type 2+ characters to search the live API.';
              return;
            }

            if (!icons.length && append) {
              loadingMore = false;
              statusEl.textContent = currentIcons.length + ' shown from ' + totalResults.toLocaleString('en-US') + ' online results';
              return;
            }

            emptyState.style.display = 'none';
            const startIndex = append ? currentIcons.length : 0;
            currentIcons = append ? currentIcons.concat(icons) : icons;
            loadingMore = false;

            const hasMore = totalResults && currentIcons.length < totalResults && (!totalPages || currentPage < totalPages);
            statusEl.textContent = label || (
              currentIcons.length + ' shown' +
              (totalResults ? ' from ' + totalResults.toLocaleString('en-US') + ' online results' : '') +
              (hasMore ? ' - scroll for more' : '')
            );

            icons.forEach((icon, offset) => {
              const index = startIndex + offset;
              const card = document.createElement('article');
              card.className = 'icon-card';
              card.draggable = true;
              card.tabIndex = 0;

              const preview = document.createElement('div');
              preview.className = 'preview';
              const img = document.createElement('img');
              img.alt = icon.name;
              img.loading = 'lazy';
              img.decoding = 'async';
              const urls = Array.isArray(icon.previewUrls) ? icon.previewUrls : [icon.svgUrl].filter(Boolean);
              img.addEventListener('error', () => setPreviewImage(preview, img, urls, Number(img.dataset.index || '0') + 1));
              setPreviewImage(preview, img, urls, 0);
              preview.appendChild(img);

              const main = document.createElement('div');
              main.className = 'card-main';
              main.innerHTML =
                '<div class="card-top">' +
                  '<div style="min-width:0">' +
                    '<div class="icon-name" title="' + escapeAttr(icon.name) + '">' + escapeHtml(icon.name) + '</div>' +
                    '<div class="icon-lib">' + escapeHtml(icon.libraryName || icon.library) + '</div>' +
                    '<div class="icon-package">' + escapeHtml(icon.npmPackage || icon.library || 'online svg') + '</div>' +
                  '</div>' +
                  '<span class="chip ' + (icon.legalSafe ? 'safe' : '') + '">' + escapeHtml(icon.license || 'live') + '</span>' +
                '</div>' +
                '<div class="actions">' +
                  '<button class="action-btn primary insert-btn" type="button">Insert</button>' +
                  '<button class="action-btn copy-btn" type="button">Copy</button>' +
                  '<button class="action-btn open-btn" type="button">Open</button>' +
                '</div>';

              card.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', dragSnippet(icon)));
              card.addEventListener('focus', () => setSelectedIndex(index));
              card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  vscode.postMessage({ type: 'insertIcon', value: { icon, format: currentFormat } });
                }
              });
              main.querySelector('.insert-btn').addEventListener('click', () => vscode.postMessage({ type: 'insertIcon', value: { icon, format: currentFormat } }));
              main.querySelector('.copy-btn').addEventListener('click', () => vscode.postMessage({ type: 'copyIcon', value: { icon, format: currentFormat } }));
              main.querySelector('.open-btn').addEventListener('click', () => vscode.postMessage({ type: 'openIcon', value: icon }));

              card.appendChild(preview);
              card.appendChild(main);
              iconsGrid.appendChild(card);
            });

            if (!label && hasMore) {
              window.setTimeout(prefetchNextPage, append ? 80 : 140);
            }
          }

          signInBtn.addEventListener('click', () => {
            unlockError.textContent = '';
            signInBtn.disabled = true;
            signInBtn.textContent = 'Opening browser...';
            vscode.postMessage({ type: 'signIn' });
          });
          signOutBtn.addEventListener('click', () => vscode.postMessage({ type: 'signOut' }));
          document.querySelectorAll('[data-format]').forEach((button) => button.addEventListener('click', () => setFormat(button.dataset.format)));
          searchInput.addEventListener('input', scheduleSearch);
          libraryFilter.addEventListener('change', searchNow);
          styleFilter.addEventListener('change', searchNow);
          legalOnly.addEventListener('change', searchNow);
          window.addEventListener('scroll', maybeLoadMore, { passive: true });
          if ('IntersectionObserver' in window && loadMoreSentinel) {
            const loadObserver = new IntersectionObserver((entries) => {
              if (entries.some((entry) => entry.isIntersecting)) loadNextPage();
            }, { rootMargin: '900px 0px' });
            loadObserver.observe(loadMoreSentinel);
          }
          searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              setSelectedIndex(selectedIndex < 0 ? 0 : selectedIndex + 1);
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault();
              setSelectedIndex(selectedIndex <= 0 ? currentIcons.length - 1 : selectedIndex - 1);
            }
            if (event.key === 'Enter' && selectedIndex >= 0) {
              event.preventDefault();
              insertSelected();
            }
          });

          window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.type === 'accessState') {
              recentIcons = Array.isArray(message.recentIcons) ? message.recentIcons : [];
              setAccess(
                Boolean(message.unlocked),
                message.email || '',
                message.tier || '',
                message.founderNumber || null
              );
              signInBtn.disabled = false;
              signInBtn.textContent = 'Sign in with IconSearch';
              if (message.defaultFormat && message.defaultFormat !== 'ask') {
                setFormat(message.defaultFormat);
              }
            }
            if (message.type === 'authPending') {
              unlockError.textContent = message.value || 'Waiting for browser approval...';
              signInBtn.disabled = true;
              signInBtn.textContent = 'Waiting for approval...';
            }
            if (message.type === 'authError') {
              unlockError.textContent = message.value || 'Could not connect your account.';
              signInBtn.disabled = false;
              signInBtn.textContent = 'Try sign in again';
            }
            if (message.type === 'accessRequired') {
              loadingMore = false;
              prefetching = false;
              prefetchedPage = null;
              pendingPrefetchPromotion = false;
              setAccess(false, '', '', null);
            }
            if (message.type === 'recentIcons') {
              recentIcons = Array.isArray(message.value) ? message.value : [];
              if (!searchInput.value.trim()) renderRecentOrEmpty();
            }
            if (message.type === 'searchResults') {
              if (message.requestKey && activeRequestKey && message.requestKey !== activeRequestKey) return;
              if (message.prefetch) {
                prefetching = false;
                const page = Number(message.page) || 0;
                if (page === currentPage + 1) {
                  prefetchedPage = {
                    icons: Array.isArray(message.value) ? message.value : [],
                    total: Number(message.total) || totalResults,
                    query: message.query || '',
                    page,
                    totalPages: Number(message.totalPages) || totalPages,
                    requestKey: message.requestKey || activeRequestKey,
                  };
                  warmPreviewImages(prefetchedPage.icons);
                  if (pendingPrefetchPromotion || isNearBottom(900)) appendPrefetchedPage();
                }
                return;
              }
              renderIcons(message.value || [], message.total || 0, message.query || '', '', {
                append: Boolean(message.append),
                page: message.page || 1,
                totalPages: message.totalPages || 0,
              });
            }
            if (message.type === 'searchError') {
              if (message.requestKey && activeRequestKey && message.requestKey !== activeRequestKey) return;
              if (message.prefetch) {
                prefetching = false;
                prefetchedPage = null;
                if (pendingPrefetchPromotion) {
                  pendingPrefetchPromotion = false;
                  loadNextPage();
                }
                return;
              }
              loadingMore = false;
              if (message.append) {
                statusEl.textContent = 'Could not load more icons. Scroll again to retry.';
              } else {
                iconsGrid.innerHTML = '';
                emptyState.style.display = 'block';
                emptyState.textContent = 'Live API error: ' + message.value;
                statusEl.textContent = 'Online search failed.';
              }
            }
            if (message.type === 'catalog') {
              renderCatalog(
                Array.isArray(message.namedLibraries) ? message.namedLibraries : [],
                Array.isArray(message.iconifySets) ? message.iconifySets : [],
                message.total || 0
              );
            }
            if (message.type === 'catalogError') {
              console.warn('Using fallback library list:', message.value);
            }
          });

          vscode.postMessage({ type: 'ready' });
        </script>
      </body>
      </html>
    `;
  }
}

function parseSearchRequest(value: unknown): SearchRequest {
  if (!isRecord(value)) {
    return {
      query: stringFrom(value),
      library: 'all',
      style: 'all',
      legalOnly: true,
      page: 1,
      append: false,
      prefetch: false,
      requestKey: '',
    };
  }

  return {
    query: stringFrom(value.query),
    library: stringFrom(value.library) || 'all',
    style: stringFrom(value.style) || 'all',
    legalOnly: value.legalOnly !== false,
    page: Math.max(1, Math.floor(numberFrom(value.page, 1))),
    append: value.append === true,
    prefetch: value.prefetch === true,
    requestKey: stringFrom(value.requestKey),
  };
}

function parseFormat(value: unknown): IconActionFormat {
  if (value === 'svg' || value === 'vue' || value === 'svelte' || value === 'tailwind') return value;
  return 'react';
}

function normalizeIcon(value: unknown): WebviewIcon | undefined {
  if (!isRecord(value)) return undefined;

  const name = stringFrom(value.name);
  const library = stringFrom(value.library);
  const previewUrls = getPreviewUrls(value);

  if (!name || !library || previewUrls.length === 0) return undefined;

  return {
    id: stringFrom(value.id) || `${library}-${name}`,
    name,
    displayName: stringFrom(value.displayName) || toPascalCase(name),
    library,
    libraryName: stringFrom(value.libraryName) || library,
    npmPackage: stringFrom(value.npmPackage) || undefined,
    license: stringFrom(value.license) || undefined,
    reactImport: stringFrom(value.reactImport) || undefined,
    reactUsage: stringFrom(value.reactUsage) || undefined,
    svgUrl: previewUrls[0],
    legalSafe: value.legalSafe === true,
    licenseUrl: stringFrom(value.licenseUrl) || undefined,
    previewUrls,
  };
}

function getPreviewUrls(icon: Record<string, unknown>): string[] {
  const urls = new Set<string>();
  const name = stringFrom(icon.name);
  const library = stringFrom(icon.library);
  const dashedName = name.replace(/_/g, '-');

  const add = (url: string) => {
    if (isHttpUrl(url)) urls.add(url);
  };

  const rawUrl = stringFrom(icon.svgUrl);
  if (rawUrl) {
    add(rawUrl.startsWith('/') ? `https://iconsearch.info${rawUrl}` : rawUrl);
  }

  if (library && dashedName) {
    add(`https://iconsearch.info/api/svg/${encodeURIComponent(library)}/${encodeURIComponent(dashedName)}`);
  }

  return Array.from(urls);
}


function cleanSvgUrl(url: string, library: string): string {
  if (!url) return '';
  if (library === 'tabler-icons' && url.includes('@tabler/icons/icons/')) {
    return url.replace('@tabler/icons/icons/', '@tabler/icons@2.47.0/icons/');
  }
  if (library === 'phosphor-icons' && url.includes('@phosphor-icons/core/assets/')) {
    return url.replace('@phosphor-icons/core/assets/', '@phosphor-icons/core@2.1.1/assets/');
  }
  if (library === 'lucide-icons' && url.includes('lucide-static/icons/')) {
    return url.replace('lucide-static/icons/', 'lucide-static@0.415.0/icons/');
  }
  return url;
}

async function fetchSvgMarkup(icon: WebviewIcon): Promise<string> {
  let lastError = '';

  for (const url of icon.previewUrls) {
    try {
      const response = await fetch(url, {
        headers: { accept: 'image/svg+xml,text/plain,*/*' },
      });

      if (!response.ok) {
        lastError = `SVG request returned ${response.status}`;
        continue;
      }

      const text = await response.text();
      if (text.includes('<svg')) return text.trim();
      lastError = 'Response was not SVG markup';
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'SVG request failed';
    }
  }

  throw new Error(`Could not fetch live SVG for ${icon.name}. ${lastError}`);
}

function applySvgClass(svg: string): string {
  const config = vscode.workspace.getConfiguration('iconSearch');
  const classes = config.get<string>('tailwindClasses') || '';
  if (!classes.trim()) return svg;

  const escapedClasses = escapeAttribute(classes.trim());
  if (/\sclass=/.test(svg.slice(0, 300))) {
    return svg.replace(/\sclass=(["'])(.*?)\1/, ` class=$1$2 ${escapedClasses}$1`);
  }

  return svg.replace('<svg', `<svg class="${escapedClasses}"`);
}

function createUrlSnippet(icon: WebviewIcon, format: Exclude<IconActionFormat, 'react' | 'svg'>, classes: string): string {
  const safeClasses = escapeAttribute(classes.trim() || 'w-5 h-5');
  const safeName = escapeAttribute(icon.name);
  const safeUrl = escapeAttribute(icon.svgUrl);

  if (format === 'tailwind') {
    return `<span class="inline-block ${safeClasses} bg-current" style="mask: url('${safeUrl}') center / contain no-repeat; -webkit-mask: url('${safeUrl}') center / contain no-repeat;" role="img" aria-label="${safeName}"></span>`;
  }

  return `<img src="${safeUrl}" alt="${safeName}" class="${safeClasses}" />`;
}

async function insertReactIcon(editor: vscode.TextEditor, icon: WebviewIcon, reactUsage: string): Promise<void> {
  const document = editor.document;
  const text = document.getText();
  const importInfo = parseReactImport(icon.reactImport);
  const importEdit = importInfo ? getReactImportEdit(document, text, importInfo) : undefined;

  await editor.edit((editBuilder) => {
    if (importEdit) {
      if (importEdit.type === 'insert') {
        editBuilder.insert(importEdit.position, importEdit.text);
      } else {
        editBuilder.replace(importEdit.range, importEdit.text);
      }
    }

    editBuilder.replace(editor.selection, reactUsage);
  });
}

function parseReactImport(value: string | undefined): ReactImportInfo | undefined {
  if (!value) return undefined;

  const trimmed = value.trim().replace(/;$/, '');
  const sideEffectMatch = /^import\s+['"]([^'"]+)['"]$/.exec(trimmed);
  if (sideEffectMatch) {
    const moduleSpecifier = sideEffectMatch[1];
    return {
      kind: 'sideEffect',
      moduleSpecifier,
      importText: `import '${moduleSpecifier}';`,
    };
  }

  const namedMatch = /^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]$/.exec(trimmed);
  if (!namedMatch) return undefined;

  const importedName = normalizeNamedImport(namedMatch[1].split(',')[0]);
  const moduleSpecifier = namedMatch[2];
  if (!importedName || !moduleSpecifier) return undefined;

  return {
    kind: 'named',
    moduleSpecifier,
    importedName,
    importText: `import { ${importedName} } from '${moduleSpecifier}';`,
  };
}

function getReactImportEdit(
  document: vscode.TextDocument,
  text: string,
  importInfo: ReactImportInfo
):
  | { type: 'insert'; position: vscode.Position; text: string }
  | { type: 'replace'; range: vscode.Range; text: string }
  | undefined {
  if (importInfo.kind === 'sideEffect') {
    if (hasImportFromModule(text, importInfo.moduleSpecifier)) return undefined;
    const offset = getImportInsertOffset(text);
    return {
      type: 'insert',
      position: document.positionAt(offset),
      text: withImportSpacing(text, importInfo.importText, offset),
    };
  }

  const existingNamedImport = findNamedImportFromModule(document, text, importInfo.moduleSpecifier);
  if (existingNamedImport) {
    const names = splitNamedImports(existingNamedImport.importsText);
    if (names.some((name) => normalizeNamedImport(name) === importInfo.importedName)) return undefined;

    return {
      type: 'replace',
      range: existingNamedImport.range,
      text: [...names, importInfo.importedName].join(', '),
    };
  }

  const offset = getImportInsertOffset(text);
  return {
    type: 'insert',
    position: document.positionAt(offset),
    text: withImportSpacing(text, importInfo.importText, offset),
  };
}

function findNamedImportFromModule(document: vscode.TextDocument, text: string, moduleSpecifier: string) {
  const importPattern = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"];?/g;
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(text))) {
    if (match[2] !== moduleSpecifier) continue;

    const importsStart = match.index + match[0].indexOf(match[1]);
    const importsEnd = importsStart + match[1].length;
    return {
      importsText: match[1],
      range: new vscode.Range(document.positionAt(importsStart), document.positionAt(importsEnd)),
    };
  }

  return undefined;
}

function hasImportFromModule(text: string, moduleSpecifier: string): boolean {
  return new RegExp(`import\\s+(?:[^;]*?\\s+from\\s+)?['"]${escapeRegExp(moduleSpecifier)}['"]`).test(text);
}

function getImportInsertOffset(text: string): number {
  const importPattern = /import\s+(?:[\s\S]*?\s+from\s+['"][^'"]+['"]|['"][^'"]+['"]);?/g;
  let lastImportEnd = 0;
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(text))) {
    lastImportEnd = match.index + match[0].length;
  }

  if (!lastImportEnd) return 0;

  const lineBreakMatch = /^\r?\n/.exec(text.slice(lastImportEnd));
  return lineBreakMatch ? lastImportEnd + lineBreakMatch[0].length : lastImportEnd;
}

function withImportSpacing(text: string, importText: string, offset: number): string {
  const before = text.slice(0, offset);
  const after = text.slice(offset);
  const prefix = offset > 0 && !before.endsWith('\n') ? '\n' : '';
  const suffix = after.startsWith('\n') || after.length === 0 ? '\n' : '\n\n';
  return `${prefix}${importText}${suffix}`;
}

function splitNamedImports(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function normalizeNamedImport(value: string): string {
  return value.trim().replace(/\s+as\s+.+$/, '');
}

function applyJsxClassName(jsx: string, classes: string): string {
  const cleanClasses = classes.trim();
  if (!cleanClasses) return jsx;

  const escapedClasses = escapeAttribute(cleanClasses);
  if (/\sclassName=/.test(jsx.slice(0, 300))) {
    return jsx.replace(/\sclassName=(["'])(.*?)\1/, ` className=$1$2 ${escapedClasses}$1`);
  }

  if (/\sclass=/.test(jsx.slice(0, 300))) {
    return jsx.replace(/\sclass=(["'])(.*?)\1/, ` className=$1$2 ${escapedClasses}$1`);
  }

  return jsx.replace(/^<([A-Za-z][\w:.]*)(\s|\/?>)/, `<$1 className="${escapedClasses}"$2`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringFrom(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function numberFrom(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function stringArrayFrom(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function normalizeExtensionAccess(value: unknown): ExtensionAccess | undefined {
  if (!isRecord(value)) return undefined;

  const product = stringFrom(value.product);
  const tier = stringFrom(value.tier);
  const expiresAt = stringFrom(value.expiresAt);
  if (product !== 'vscode' || (tier !== 'free' && tier !== 'founder') || !expiresAt) return undefined;

  return {
    email: stringFrom(value.email),
    product,
    tier,
    founderNumber: typeof value.founderNumber === 'number' ? value.founderNumber : null,
    expiresAt,
  };
}

function delay(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function isHttpUrl(value: string): boolean {
  return value.startsWith('https://') || value.startsWith('http://');
}

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
