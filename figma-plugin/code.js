const AUTH_API_URL = 'https://iconsearch.info/api';
const EXTENSION_API_URL = 'https://iconsearch.info/api/extension/icon-search';
const SESSION_TOKEN_KEY = 'iconsearch.sessionToken';
const ACCESS_CACHE_KEY = 'iconsearch.accessCache';
const SVG_CACHE_LIMIT = 60;

let authAttempt = 0;
const svgMarkupCache = new Map();

figma.showUI(__html__, { width: 380, height: 540, themeColors: true });

function post(message) {
  figma.ui.postMessage(message);
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function normalizeAccess(value) {
  if (!value || value.product !== 'figma') return null;
  if (value.tier !== 'free' && value.tier !== 'founder') return null;
  if (!value.expiresAt) return null;
  return {
    email: typeof value.email === 'string' ? value.email : '',
    product: 'figma',
    tier: value.tier,
    founderNumber: typeof value.founderNumber === 'number' ? value.founderNumber : null,
    expiresAt: value.expiresAt
  };
}

async function postAccessState() {
  const token = await figma.clientStorage.getAsync(SESSION_TOKEN_KEY);
  let access = await figma.clientStorage.getAsync(ACCESS_CACHE_KEY);

  if (token) {
    try {
      const response = await fetch(`${AUTH_API_URL}/entitlements/me`, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
          'x-iconsearch-product': 'figma'
        }
      });

      if (response.ok) {
        const payload = await response.json();
        access = normalizeAccess(payload.access);
        if (access) await figma.clientStorage.setAsync(ACCESS_CACHE_KEY, access);
      } else if (response.status === 401) {
        await figma.clientStorage.deleteAsync(SESSION_TOKEN_KEY);
        await figma.clientStorage.deleteAsync(ACCESS_CACHE_KEY);
        access = null;
      }
    } catch (_error) {
      // Keep a previously verified session available during a temporary outage.
    }
  } else {
    access = null;
  }

  post({ type: 'access-state', unlocked: Boolean(token && access), access: access || null });
}

async function beginSignIn() {
  const attempt = ++authAttempt;
  post({ type: 'auth-pending', message: 'Opening secure sign-in in your browser...' });

  try {
    const startResponse = await fetch(`${AUTH_API_URL}/device/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ product: 'figma', clientName: 'Figma plugin' })
    });
    const startPayload = await startResponse.json();
    if (!startResponse.ok) throw new Error(startPayload.error || 'Could not start sign-in.');

    const deviceCode = startPayload.deviceCode;
    const verificationUrl = startPayload.verificationUriComplete;
    const expiresIn = Number(startPayload.expiresIn) || 600;
    const interval = Math.max(2, Number(startPayload.interval) || 3);
    if (!deviceCode || !verificationUrl) throw new Error('The sign-in response was incomplete.');

    post({ type: 'auth-url', url: verificationUrl });
    post({ type: 'auth-pending', message: 'Approve the connection in your browser. This panel will update automatically.' });
    const deadline = Date.now() + expiresIn * 1000;

    while (attempt === authAttempt && Date.now() < deadline) {
      await delay(interval * 1000);
      if (attempt !== authAttempt) return;

      const statusResponse = await fetch(`${AUTH_API_URL}/device/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ deviceCode })
      });
      const statusPayload = await statusResponse.json();

      if (statusPayload.status === 'pending') continue;
      if (statusPayload.status === 'authorized') {
        const access = normalizeAccess(statusPayload.access);
        if (!statusPayload.token || !access) throw new Error('The approved session was incomplete.');

        await figma.clientStorage.setAsync(SESSION_TOKEN_KEY, statusPayload.token);
        await figma.clientStorage.setAsync(ACCESS_CACHE_KEY, access);
        await postAccessState();
        const label = access.tier === 'founder' && access.founderNumber
          ? `Founder #${access.founderNumber}`
          : 'Free';
        figma.notify(`IconSearch connected. ${label} access is active.`);
        return;
      }

      throw new Error(statusPayload.error || 'The sign-in link expired. Please try again.');
    }

    throw new Error('The sign-in link expired. Please try again.');
  } catch (error) {
    if (attempt !== authAttempt) return;
    post({
      type: 'auth-error',
      message: error instanceof Error ? error.message : 'Could not connect your IconSearch account.'
    });
  }
}

async function signOut() {
  authAttempt += 1;
  const token = await figma.clientStorage.getAsync(SESSION_TOKEN_KEY);
  if (token) {
    try {
      await fetch(`${AUTH_API_URL}/device/revoke`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` }
      });
    } catch (_error) {
      // Local sign-out still removes the token if the network is unavailable.
    }
  }

  await figma.clientStorage.deleteAsync(SESSION_TOKEN_KEY);
  await figma.clientStorage.deleteAsync(ACCESS_CACHE_KEY);
  await postAccessState();
}

function trimMap(map, limit) {
  while (map.size > limit) {
    map.delete(map.keys().next().value);
  }
}

function normalizeIconSize(value) {
  const size = Number(value);
  if (!Number.isFinite(size)) return 24;
  return Math.min(512, Math.max(8, Math.round(size)));
}

function normalizeHexColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '';
}

function shouldReplacePaintValue(value) {
  const paint = String(value || '').trim().toLowerCase();
  if (!paint) return false;
  if (paint === 'none' || paint === 'transparent') return false;
  if (paint.startsWith('url(') || paint.startsWith('var(')) return false;
  if (paint.startsWith('context-')) return false;
  return true;
}

function sanitizeSvgMarkup(svg) {
  return String(svg || '')
    .replace(/<\?[\s\S]*?\?>/g, '')
    .replace(/<!doctype[\s\S]*?>/gi, '')
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, '')
    .replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, '')
    .trim();
}

function upsertSvgAttribute(svgTagStart, attributeName, value) {
  const pattern = new RegExp(`\\s${attributeName}\\s*=\\s*(".*?"|'.*?'|[^\\s>]+)`, 'i');
  if (pattern.test(svgTagStart)) {
    return svgTagStart.replace(pattern, ` ${attributeName}="${value}"`);
  }
  return `${svgTagStart} ${attributeName}="${value}"`;
}

function applySvgColor(svg, color) {
  const safeColor = normalizeHexColor(color);
  if (!safeColor) return svg;

  let output = svg.replace(/(<svg\b[^>]*)(>)/i, (_match, start, end) => {
    let tag = upsertSvgAttribute(start, 'color', safeColor);
    if (!/\sfill\s*=/i.test(tag)) tag = `${tag} fill="${safeColor}"`;
    return `${tag}${end}`;
  });

  output = output.replace(/\s(fill|stroke)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, (match, name, _raw, doubleValue, singleValue, bareValue) => {
    const value = doubleValue || singleValue || bareValue || '';
    return shouldReplacePaintValue(value) ? ` ${name}="${safeColor}"` : match;
  });

  output = output.replace(/\sstyle\s*=\s*(["'])(.*?)\1/gi, (match, quote, style) => {
    const updated = style.replace(/(^|;)\s*(fill|stroke)\s*:\s*([^;]+)/gi, (styleMatch, prefix, name, value) => {
      return shouldReplacePaintValue(value) ? `${prefix}${name}: ${safeColor}` : styleMatch;
    });
    return ` style=${quote}${updated}${quote}`;
  });

  return output;
}

function prepareSvgMarkup(svg, color) {
  const sanitized = sanitizeSvgMarkup(svg);
  return applySvgColor(sanitized, color);
}

function resizeNodeToIconSize(node, sizeValue) {
  const size = normalizeIconSize(sizeValue);
  if (!node || typeof node.resize !== 'function') return;
  if (!Number.isFinite(node.width) || !Number.isFinite(node.height) || node.width <= 0 || node.height <= 0) return;

  const scale = size / Math.max(node.width, node.height);
  node.resize(node.width * scale, node.height * scale);
}

function placeNode(node, x, y, scrollIntoView = true) {
  const center = figma.viewport.center;
  const targetX = Number.isFinite(x) ? x : center.x;
  const targetY = Number.isFinite(y) ? y : center.y;
  node.x = targetX - node.width / 2;
  node.y = targetY - node.height / 2;
  figma.currentPage.appendChild(node);
  figma.currentPage.selection = [node];
  if (scrollIntoView) figma.viewport.scrollAndZoomIntoView([node]);
}

function insertIconNode({ svg, name, size, color, x, y, notify = true, scrollIntoView = true }) {
  const preparedSvg = prepareSvgMarkup(svg, color);
  if (!preparedSvg.includes('<svg')) throw new Error('The source did not include SVG markup.');

  const node = figma.createNodeFromSvg(preparedSvg);
  node.name = name || 'Icon';
  resizeNodeToIconSize(node, size);
  placeNode(node, x, y, scrollIntoView);
  if (notify) figma.notify(`Inserted ${node.name} successfully!`);
  return node;
}

async function fetchSvgMarkup(url) {
  let normalizedUrl = String(url || '').trim();
  if (!normalizedUrl) throw new Error('No SVG source URL was provided.');
  if (normalizedUrl.startsWith('/')) {
    normalizedUrl = `https://iconsearch.info${normalizedUrl}`;
  }
  if (svgMarkupCache.has(normalizedUrl)) return svgMarkupCache.get(normalizedUrl);

  const token = await figma.clientStorage.getAsync(SESSION_TOKEN_KEY);
  const headers = {
    accept: 'image/svg+xml,text/plain,*/*',
    'x-iconsearch-product': PRODUCT,
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const request = fetch(normalizedUrl, { headers })
    .then(async response => {
      if (response.status === 401) throw new Error('Sign in to IconSearch to insert icons.');
      if (!response.ok) throw new Error('Failed to fetch SVG.');
      const text = await response.text();
      if (!text.includes('<svg')) throw new Error('The source did not return SVG markup.');
      return text.trim();
    })
    .catch(error => {
      svgMarkupCache.delete(normalizedUrl);
      throw error;
    });

  svgMarkupCache.set(normalizedUrl, request);
  trimMap(svgMarkupCache, SVG_CACHE_LIMIT);
  return request;
}

}

async function insertIconFromUrl(metadata, x, y) {
  const svg = await fetchSvgMarkup(metadata.url);
  return insertIconNode({
    svg,
    name: metadata.name,
    size: metadata.size,
    color: metadata.color,
    x,
    y,
    scrollIntoView: false
  });
}

figma.on('drop', (event) => {
  const metadata = event.dropMetadata;
  if (!metadata || metadata.type !== 'iconsearch-icon') return true;

  void insertIconFromUrl(metadata, event.absoluteX, event.absoluteY).catch(error => {
    console.error('Error dropping SVG into Figma:', error);
    figma.notify('Error dropping SVG: Please try Insert instead.', { error: true });
  });

  return false;
});

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'auth-ready') {
    await postAccessState();
    return;
  }

  if (msg.type === 'sign-in') {
    void beginSignIn();
    return;
  }

  if (msg.type === 'sign-out') {
    await signOut();
    return;
  }

  if (msg.type === 'api-request') {
    const token = await figma.clientStorage.getAsync(SESSION_TOKEN_KEY);
    if (!token) {
      post({
        type: 'api-response',
        requestId: msg.requestId,
        ok: false,
        status: 401,
        payload: { error: 'Sign in is required.' }
      });
      return;
    }

    try {
      const response = await fetch(`${EXTENSION_API_URL}${msg.queryParams || ''}`, {
        headers: {
          accept: 'application/json',
          authorization: `Bearer ${token}`,
          'x-iconsearch-product': 'figma'
        }
      });
      post({
        type: 'api-response',
        requestId: msg.requestId,
        ok: response.ok,
        status: response.status,
        payload: await response.json()
      });
    } catch (error) {
      post({
        type: 'api-response',
        requestId: msg.requestId,
        ok: false,
        status: 0,
        payload: {
          error: error instanceof Error ? error.message : 'Could not reach IconSearch.'
        }
      });
    }
    return;
  }

  if (msg.type === 'insert-icon') {
    try {
      insertIconNode({
        svg: msg.svg,
        name: msg.name,
        size: msg.size,
        color: msg.color
      });
    } catch (err) {
      console.error('Error inserting SVG into Figma:', err);
      figma.notify('Error inserting SVG: Please check the console.', { error: true });
    }
  }
};
