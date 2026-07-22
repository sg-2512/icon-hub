#!/usr/bin/env node
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = (process.env.ICONSEARCH_API_BASE || "https://iconsearch.info").replace(/\/+$/, "");
const PRODUCT = "mcp";
const DEFAULT_LIMIT = 12;
const SESSION_PATH =
  process.env.ICONSEARCH_SESSION_FILE || join(homedir(), ".iconsearch", "mcp-session.json");

type OutputFormat = "react" | "svg" | "vue" | "svelte" | "tailwind" | "url";
type SearchStyle = "all" | "stroke" | "solid" | "duotone" | "twotone" | "sharp";

type StoredSession = {
  token: string;
  access?: Record<string, unknown>;
  savedAt: string;
};

type IconSearchIcon = {
  id: string;
  name: string;
  displayName: string;
  library: string;
  libraryName: string;
  npmPackage?: string;
  license?: string;
  licenseUrl?: string;
  legalSafe: boolean;
  sourceUrl?: string;
  svgUrl: string;
  previewUrls: string[];
  reactImport?: string;
  reactUsage?: string;
  tags: string[];
};

type SearchResult = {
  icons: IconSearchIcon[];
  total: number;
  page: number;
  totalPages: number;
};

const outputFormatSchema = z.enum(["react", "svg", "vue", "svelte", "tailwind", "url"]);
const searchStyleSchema = z.enum(["all", "stroke", "solid", "duotone", "twotone", "sharp"]);

const server = new McpServer({
  name: "iconsearch",
  version: "0.1.0",
});

server.registerTool(
  "iconsearch_start_sign_in",
  {
    title: "Start IconSearch Sign-In",
    description: "Start the IconSearch device sign-in flow for this MCP server.",
    inputSchema: {
      clientName: z.string().trim().min(1).max(80).default("MCP client"),
    },
  },
  async ({ clientName }) => {
    const response = await fetch(`${API_BASE}/api/device/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ product: PRODUCT, clientName }),
    });
    const payload = await readJsonObject(response);
    if (!response.ok) throw new Error(stringFrom(payload.error) || "Could not start IconSearch sign-in.");

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              verificationUrl: stringFrom(payload.verificationUriComplete),
              deviceCode: stringFrom(payload.deviceCode),
              expiresIn: numberFrom(payload.expiresIn, 1800),
              interval: numberFrom(payload.interval, 3),
              nextStep: "Open verificationUrl, approve access, then call iconsearch_finish_sign_in with deviceCode.",
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "iconsearch_finish_sign_in",
  {
    title: "Finish IconSearch Sign-In",
    description: "Poll IconSearch once for an approved device code and store the local MCP session.",
    inputSchema: {
      deviceCode: z.string().trim().min(20),
    },
  },
  async ({ deviceCode }) => {
    const response = await fetch(`${API_BASE}/api/device/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", accept: "application/json" },
      body: JSON.stringify({ deviceCode }),
    });
    const payload = await readJsonObject(response);
    if (!response.ok) throw new Error(stringFrom(payload.error) || "Could not finish IconSearch sign-in.");

    const status = stringFrom(payload.status);
    if (status !== "authorized") {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ status, message: "Approval is not complete yet. Try again after approving the browser link." }, null, 2),
          },
        ],
      };
    }

    const token = stringFrom(payload.token);
    if (!token) throw new Error("The approved IconSearch session did not include a token.");

    await saveSession({ token, access: asRecord(payload.access), savedAt: new Date().toISOString() });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ status: "connected", product: PRODUCT, access: asRecord(payload.access) }, null, 2),
        },
      ],
    };
  },
);

server.registerTool(
  "iconsearch_status",
  {
    title: "IconSearch Status",
    description: "Check whether this MCP server has an IconSearch token available.",
    inputSchema: {},
  },
  async () => {
    const session = await getSession();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              connected: Boolean(session?.token),
              source: process.env.ICONSEARCH_TOKEN ? "ICONSEARCH_TOKEN" : session?.token ? "local-session" : "none",
              access: session?.access || null,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "iconsearch_sign_out",
  {
    title: "Sign Out of IconSearch",
    description: "Remove the locally stored MCP session token. Does not remove ICONSEARCH_TOKEN from the environment.",
    inputSchema: {},
  },
  async () => {
    await unlink(SESSION_PATH).catch(() => undefined);
    return { content: [{ type: "text", text: "Removed the local IconSearch MCP session." }] };
  },
);

server.registerTool(
  "iconsearch_search",
  {
    title: "Search IconSearch",
    description: "Search live IconSearch icons by name, library, style, and commercial-safety filter.",
    inputSchema: {
      query: z.string().trim().default(""),
      library: z.string().trim().default("all"),
      style: searchStyleSchema.default("all"),
      legalOnly: z.boolean().default(true),
      limit: z.number().int().min(1).max(50).default(DEFAULT_LIMIT),
      page: z.number().int().min(1).default(1),
    },
  },
  async ({ query, library, style, legalOnly, limit, page }) => {
    const result = await searchIcons({ query, library, style, legalOnly, limit, page });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              total: result.total,
              page: result.page,
              totalPages: result.totalPages,
              icons: result.icons.map((icon) => ({
                id: icon.id,
                name: icon.name,
                displayName: icon.displayName,
                library: icon.library,
                libraryName: icon.libraryName,
                license: icon.license,
                legalSafe: icon.legalSafe,
                svgUrl: icon.svgUrl,
                tags: icon.tags.slice(0, 8),
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "iconsearch_snippet",
  {
    title: "Create Icon Snippet",
    description: "Search for one icon and return a React, SVG, Vue, Svelte, Tailwind, or URL snippet.",
    inputSchema: {
      name: z.string().trim().min(1),
      library: z.string().trim().default("all"),
      format: outputFormatSchema.default("react"),
      classes: z.string().trim().default("w-5 h-5"),
      legalOnly: z.boolean().default(true),
    },
  },
  async ({ name, library, format, classes, legalOnly }) => {
    const result = await searchIcons({
      query: name,
      library,
      style: "all",
      legalOnly,
      limit: 1,
      page: 1,
    });
    const icon = result.icons[0];
    if (!icon) throw new Error(`No IconSearch icon found for "${name}".`);

    const snippet = await createSnippet(icon, format, classes);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              icon: {
                id: icon.id,
                name: icon.name,
                displayName: icon.displayName,
                library: icon.library,
                libraryName: icon.libraryName,
                license: icon.license,
                legalSafe: icon.legalSafe,
                svgUrl: icon.svgUrl,
              },
              format,
              snippet,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`IconSearch MCP server failed: ${error instanceof Error ? error.stack || error.message : String(error)}\n`);
  process.exit(1);
});

async function searchIcons({
  query,
  library,
  style,
  legalOnly,
  limit,
  page,
}: {
  query: string;
  library: string;
  style: SearchStyle;
  legalOnly: boolean;
  limit: number;
  page: number;
}): Promise<SearchResult> {
  const token = await requireToken();
  const url = new URL(`${API_BASE}/api/extension/icon-search`);
  const cleanQuery = query.trim();
  if (cleanQuery) url.searchParams.set("q", cleanQuery);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("page", String(page));
  url.searchParams.set("sort", cleanQuery ? "relevance" : "popular");
  url.searchParams.set("legalOnly", legalOnly ? "1" : "0");
  if (style !== "all") url.searchParams.set("style", style);
  applyLibraryParams(url, library);

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "x-iconsearch-product": PRODUCT,
    },
  });
  const payload = await readJsonObject(response);
  if (!response.ok) throw new Error(stringFrom(payload.error) || `IconSearch search returned ${response.status}.`);

  const icons = Array.isArray(payload.icons)
    ? payload.icons.map(normalizeIcon).filter((icon): icon is IconSearchIcon => Boolean(icon))
    : [];
  const total = numberFrom(payload.total, icons.length);
  const totalPages = numberFrom(payload.totalPages, total > 0 ? Math.ceil(total / limit) : 0);

  return {
    icons,
    total,
    page: numberFrom(payload.page, page),
    totalPages,
  };
}

async function createSnippet(icon: IconSearchIcon, format: OutputFormat, classes: string): Promise<string> {
  if (format === "url") return icon.svgUrl;
  if (format === "react") return createReactSnippet(icon, classes);
  if (format === "svg") return applySvgClass(await fetchSvgMarkup(icon), classes);
  return createUrlSnippet(icon, format, classes);
}

async function fetchSvgMarkup(icon: IconSearchIcon): Promise<string> {
  let lastError = "";
  for (const url of icon.previewUrls.length ? icon.previewUrls : [icon.svgUrl]) {
    try {
      const response = await fetch(url, { headers: { accept: "image/svg+xml,text/plain,*/*" } });
      if (!response.ok) {
        lastError = `SVG request returned ${response.status}`;
        continue;
      }
      const text = await response.text();
      if (text.includes("<svg")) return sanitizeSvgForOutput(text.trim());
      lastError = "Response was not SVG markup";
    } catch (error) {
      lastError = error instanceof Error ? error.message : "SVG request failed";
    }
  }
  throw new Error(`Could not fetch live SVG for ${icon.name}. ${lastError}`);
}

function createReactSnippet(icon: IconSearchIcon, classes: string): string {
  const usage = applyJsxClassName(icon.reactUsage || `<${toPascalCase(icon.name)} />`, classes);
  const importText = normalizeReactImport(icon.reactImport);
  return importText ? `${importText}\n\n${usage}` : usage;
}

function createUrlSnippet(icon: IconSearchIcon, format: Exclude<OutputFormat, "react" | "svg" | "url">, classes: string): string {
  const safeClasses = escapeAttribute(classes.trim() || "w-5 h-5");
  const safeName = escapeAttribute(icon.name);
  const safeUrl = escapeAttribute(icon.svgUrl);

  if (format === "tailwind") {
    return `<span class="inline-block ${safeClasses} bg-current" style="mask: url('${safeUrl}') center / contain no-repeat; -webkit-mask: url('${safeUrl}') center / contain no-repeat;" role="img" aria-label="${safeName}"></span>`;
  }
  if (format === "vue") return `<template>\n  <img src="${safeUrl}" alt="${safeName}" class="${safeClasses}" />\n</template>`;
  return `<img src="${safeUrl}" alt="${safeName}" class="${safeClasses}" />`;
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
    libraryName: stringFrom(item.libraryName) || library,
    npmPackage: stringFrom(item.npmPackage) || undefined,
    license: stringFrom(item.license) || undefined,
    licenseUrl: stringFrom(item.licenseUrl) || undefined,
    legalSafe: item.legalSafe === true,
    sourceUrl: stringFrom(item.sourceUrl) || undefined,
    svgUrl: previewUrls[0] || svgUrl,
    previewUrls,
    reactImport: stringFrom(item.reactImport) || undefined,
    reactUsage: stringFrom(item.reactUsage) || undefined,
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [],
  };
}

async function requireToken(): Promise<string> {
  const token = process.env.ICONSEARCH_TOKEN || (await getSession())?.token || "";
  if (!token) {
    throw new Error("IconSearch is not connected. Set ICONSEARCH_TOKEN or run iconsearch_start_sign_in and iconsearch_finish_sign_in.");
  }
  return token;
}

async function getSession(): Promise<StoredSession | undefined> {
  if (process.env.ICONSEARCH_TOKEN) return { token: process.env.ICONSEARCH_TOKEN, savedAt: new Date().toISOString() };
  try {
    const text = await readFile(SESSION_PATH, "utf8");
    const value = JSON.parse(text) as Partial<StoredSession>;
    return typeof value.token === "string" && value.token ? (value as StoredSession) : undefined;
  } catch {
    return undefined;
  }
}

async function saveSession(session: StoredSession): Promise<void> {
  await mkdir(dirname(SESSION_PATH), { recursive: true });
  await writeFile(SESSION_PATH, JSON.stringify(session, null, 2), { encoding: "utf8", mode: 0o600 });
}

async function readJsonObject(response: Response): Promise<Record<string, unknown>> {
  const value = (await response.json().catch(() => ({}))) as unknown;
  return asRecord(value);
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

function normalizeReactImport(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim().replace(/;$/, "");
  const sideEffectMatch = /^import\s+['"]([^'"]+)['"]$/.exec(trimmed);
  if (sideEffectMatch) return `import '${sideEffectMatch[1]}';`;
  const namedMatch = /^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]$/.exec(trimmed);
  if (!namedMatch) return trimmed;
  const importedName = namedMatch[1].split(",")[0]?.trim();
  const moduleSpecifier = namedMatch[2];
  return importedName && moduleSpecifier ? `import { ${importedName} } from '${moduleSpecifier}';` : trimmed;
}

function applyJsxClassName(jsx: string, classes: string): string {
  const cleanClasses = classes.trim();
  if (!cleanClasses) return jsx;
  const escapedClasses = escapeAttribute(cleanClasses);
  if (/\sclassName=/.test(jsx.slice(0, 300))) return jsx.replace(/\sclassName=(["'])(.*?)\1/, ` className=$1$2 ${escapedClasses}$1`);
  if (/\sclass=/.test(jsx.slice(0, 300))) return jsx.replace(/\sclass=(["'])(.*?)\1/, ` className=$1$2 ${escapedClasses}$1`);
  return jsx.replace(/^<([A-Za-z][\w:.]*)(\s|\/?>)/, `<$1 className="${escapedClasses}"$2`);
}

function applySvgClass(svg: string, classes: string): string {
  const cleanClasses = classes.trim();
  if (!cleanClasses) return svg;
  const escapedClasses = escapeAttribute(cleanClasses);
  if (/\sclass=/.test(svg.slice(0, 300))) return svg.replace(/\sclass=(["'])(.*?)\1/, ` class=$1$2 ${escapedClasses}$1`);
  return svg.replace("<svg", `<svg class="${escapedClasses}"`);
}

function sanitizeSvgForOutput(svg: string): string {
  return String(svg)
    .replace(/<\?[\s\S]*?\?>/g, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<script\b[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<foreignObject\b[\s\S]*?<\/foreignObject\s*>/gi, "")
    .replace(/<link\b[\s\S]*?>/gi, "")
    .replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|xlink:href)\s*=\s*(["'])\s*javascript:[\s\S]*?\1/gi, "")
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

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
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

function escapeAttribute(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
