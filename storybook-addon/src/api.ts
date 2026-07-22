import { API_BASE, PRODUCT } from "./constants";
import type { DeviceStartResponse, IconSearchIcon, SearchResult, StoredSession } from "./types";

export async function startSignIn(): Promise<DeviceStartResponse> {
  const response = await fetch(`${API_BASE}/api/device/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ product: PRODUCT, clientName: "Storybook" }),
  });
  const payload = await readJsonObject(response);
  if (!response.ok) throw new Error(stringFrom(payload.error) || "Could not start IconSearch sign-in.");

  return {
    deviceCode: stringFrom(payload.deviceCode),
    verificationUriComplete: stringFrom(payload.verificationUriComplete),
    interval: numberFrom(payload.interval, 3),
    expiresIn: numberFrom(payload.expiresIn, 1800),
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
  limit = 32,
  signal,
}: {
  token: string;
  query: string;
  library: string;
  legalOnly: boolean;
  limit?: number;
  signal?: AbortSignal;
}): Promise<SearchResult> {
  const url = new URL(`${API_BASE}/api/extension/icon-search`);
  const cleanQuery = query.trim();
  if (cleanQuery) url.searchParams.set("q", cleanQuery);
  url.searchParams.set("limit", String(limit));
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
    page: numberFrom(payload.page, 1),
    totalPages: numberFrom(payload.totalPages, 1),
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
      if (text.includes("<svg")) return sanitizeSvg(text.trim());
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
  const svgUrl = stringFrom(item.svgUrl);
  if (!name || !library || !svgUrl) return undefined;
  const previewUrls = Array.isArray(item.previewUrls)
    ? item.previewUrls.filter((url): url is string => typeof url === "string" && /^https?:\/\//.test(url))
    : [svgUrl];

  return {
    id: stringFrom(item.id) || `${library}-${name}`,
    name,
    displayName: formatIconTitle(stringFrom(item.displayName) || name),
    library,
    libraryName: stringFrom(item.libraryName) || formatIconTitle(library),
    npmPackage: stringFrom(item.npmPackage) || undefined,
    license: stringFrom(item.license) || undefined,
    legalSafe: item.legalSafe === true,
    svgUrl: previewUrls[0] || svgUrl,
    previewUrls,
    reactImport: stringFrom(item.reactImport) || undefined,
    reactUsage: stringFrom(item.reactUsage) || undefined,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
  };
}

async function readJsonObject(response: Response): Promise<Record<string, unknown>> {
  const value = (await response.json().catch(() => ({}))) as unknown;
  return asRecord(value);
}

function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .trim();
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
