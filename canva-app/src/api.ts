import type { IconSearchIcon, SearchResult, StoredSession } from "./types";

export const API_BASE = "https://iconsearch.info";
export const PRODUCT = "canva";
export const SESSION_KEY = "iconsearch:canva:session";
export const PENDING_KEY = "iconsearch:canva:pending-device-code";

export const LIBRARIES = [
  ["all", "All libraries"],
  ["lucide-icons", "Lucide"],
  ["heroicons", "Heroicons"],
  ["tabler-icons", "Tabler"],
  ["bootstrap-icons", "Bootstrap"],
  ["phosphor-icons", "Phosphor"],
  ["remix-icon", "Remix"],
  ["iconify", "Iconify"],
] as const;

export function readSession(): StoredSession | null {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoredSession>;
    return typeof parsed.token === "string" && parsed.token ? (parsed as StoredSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(PENDING_KEY);
}

export function readPendingDeviceCode() {
  return window.localStorage.getItem(PENDING_KEY) || "";
}

export function savePendingDeviceCode(code: string) {
  window.localStorage.setItem(PENDING_KEY, code);
}

export function clearPendingDeviceCode() {
  window.localStorage.removeItem(PENDING_KEY);
}

export async function startSignIn() {
  const response = await fetch(`${API_BASE}/api/device/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ product: PRODUCT, clientName: "Canva" }),
  });
  const payload = await readJsonObject(response);
  if (!response.ok) throw new Error(stringFrom(payload.error) || "Could not start IconSearch sign-in.");

  return {
    deviceCode: stringFrom(payload.deviceCode),
    verificationUriComplete: stringFrom(payload.verificationUriComplete),
  };
}

export async function finishSignIn(deviceCode: string): Promise<StoredSession | "pending"> {
  const response = await fetch(`${API_BASE}/api/device/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ deviceCode }),
  });
  const payload = await readJsonObject(response);
  if (!response.ok) throw new Error(stringFrom(payload.error) || "Could not complete IconSearch sign-in.");
  if (stringFrom(payload.status) !== "authorized") return "pending";

  const token = stringFrom(payload.token);
  if (!token) throw new Error("The approved IconSearch session did not include a token.");

  return {
    token,
    access: asRecord(payload.access),
    savedAt: new Date().toISOString(),
  };
}

export async function searchIcons({
  token,
  query,
  library,
  legalOnly,
  signal,
}: {
  token: string;
  query: string;
  library: string;
  legalOnly: boolean;
  signal?: AbortSignal;
}): Promise<SearchResult> {
  const url = new URL(`${API_BASE}/api/extension/icon-search`);
  const cleanQuery = query.trim();
  if (cleanQuery) url.searchParams.set("q", cleanQuery);
  url.searchParams.set("limit", "36");
  url.searchParams.set("page", "1");
  url.searchParams.set("sort", cleanQuery ? "relevance" : "popular");
  url.searchParams.set("legalOnly", legalOnly ? "1" : "0");
  applyLibraryParams(url, library);

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "x-iconsearch-product": PRODUCT,
    },
    signal,
  });
  const payload = await readJsonObject(response);
  if (!response.ok) throw new Error(stringFrom(payload.error) || `IconSearch returned ${response.status}.`);

  const icons = Array.isArray(payload.icons)
    ? payload.icons.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon))
    : [];

  return {
    icons,
    total: numberFrom(payload.total, icons.length),
  };
}

export async function fetchSvgMarkup(icon: IconSearchIcon): Promise<string> {
  let lastError = "";
  for (const url of icon.previewUrls.length ? icon.previewUrls : [icon.svgUrl]) {
    try {
      const response = await fetch(url, { headers: { accept: "image/svg+xml,text/plain,*/*" } });
      if (!response.ok) {
        lastError = `SVG request returned ${response.status}`;
        continue;
      }
      const text = await response.text();
      if (text.includes("<svg")) return sanitizeSvgForCanva(text.trim());
      lastError = "Response was not SVG markup";
    } catch (error) {
      lastError = error instanceof Error ? error.message : "SVG request failed";
    }
  }
  throw new Error(`Could not fetch SVG for ${icon.name}. ${lastError}`);
}

function applyLibraryParams(url: URL, value: string) {
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

function normalizeIcon(value: unknown): IconSearchIcon | undefined {
  if (!value || typeof value !== "object") return undefined;
  const item = value as Record<string, unknown>;
  const name = stringFrom(item.name);
  const library = stringFrom(item.library);
  const rawSvgUrl = stringFrom(item.svgUrl);
  if (!name || !library || !rawSvgUrl) return undefined;

  const absoluteSvgUrl = rawSvgUrl.startsWith("/") ? `${API_BASE}${rawSvgUrl}` : rawSvgUrl;

  const previewUrls = Array.isArray(item.previewUrls)
    ? item.previewUrls
        .map((url) => (typeof url === "string" && url.startsWith("/") ? `${API_BASE}${url}` : url))
        .filter((url): url is string => typeof url === "string" && /^https?:\/\//.test(url))
    : [absoluteSvgUrl];

  return {
    id: stringFrom(item.id) || `${library}-${name}`,
    name,
    displayName: formatIconTitle(stringFrom(item.displayName) || name),
    library,
    libraryName: stringFrom(item.libraryName) || formatIconTitle(library),
    license: stringFrom(item.license) || undefined,
    legalSafe: item.legalSafe === true,
    svgUrl: previewUrls[0] || absoluteSvgUrl,
    previewUrls,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
  };
}

function sanitizeSvgForCanva(svg: string): string {
  let next = svg
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/<a\b[\s\S]*?<\/a\s*>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style\s*>/gi, "")
    .replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, "")
    .replace(/\s(vector-effect|tabindex|requiredExtensions|requiredFeatures|systemLanguage|transform-origin)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .trim();

  if (/^<svg\b/i.test(next) && !/\sxmlns=/.test(next.slice(0, 200))) {
    next = next.replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return next;
}

async function readJsonObject(response: Response): Promise<Record<string, unknown>> {
  const value = (await response.json().catch(() => ({}))) as unknown;
  return asRecord(value);
}

function formatIconTitle(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function stringFrom(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function numberFrom(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}
