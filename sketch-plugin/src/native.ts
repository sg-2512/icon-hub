export const MAX_SVG_LENGTH = 512 * 1024;
export type InsertPlacement = "right" | "overlay" | "page-origin";

export type InsertPayload = {
  color: string;
  library: string;
  name: string;
  placement: InsertPlacement;
  size: number;
  svg: string;
};

export type LayerFrame = {
  height: number;
  width: number;
  x: number;
  y: number;
};

export function parseInsertPayload(value: unknown): InsertPayload {
  if (!value || typeof value !== "object") throw new Error("Icon data is missing or invalid.");
  const payload = value as Record<string, unknown>;
  const placement = isPlacement(payload.placement) ? payload.placement : "right";
  const numericSize = Number(payload.size);
  return {
    color: safeColor(payload.color),
    library: safeText(payload.library, "IconSearch", 100),
    name: safeText(payload.name, "Icon", 100),
    placement,
    size: Math.max(16, Math.min(512, Number.isFinite(numericSize) ? Math.round(numericSize) : 64)),
    svg: sanitizeSvgForSketch(payload.svg),
  };
}

export function sanitizeSvgForSketch(value: unknown): string {
  if (typeof value !== "string") throw new Error("The SVG payload is missing.");
  let svg = value.trim();
  if (!svg || svg.length > MAX_SVG_LENGTH) throw new Error("The SVG payload is empty or too large.");
  svg = svg.replace(/<\?[\s\S]*?\?>/g, "").trim();
  if (!/^<svg[\s>]/i.test(svg) || !/<\/svg>\s*$/i.test(svg)) throw new Error("The icon is not valid SVG markup.");

  const forbiddenMarkup = /<!doctype|<!entity|<!\[cdata|<(?:script|foreignObject|iframe|object|embed|style|image|audio|video|base)\b/i;
  const activeAttribute = /\s(?:on[a-z]+|style|src)\s*=/i;
  const unsafeProtocol = /(?:javascript|vbscript|data\s*:\s*text\/html)\s*:/i;
  const externalPaint = /url\(\s*["']?(?!#)/i;
  if (forbiddenMarkup.test(svg) || activeAttribute.test(svg) || unsafeProtocol.test(svg) || externalPaint.test(svg)) {
    throw new Error("The SVG contains unsupported active or external content.");
  }

  const references = svg.matchAll(/\s(?:href|xlink:href)\s*=\s*(["'])(.*?)\1/gi);
  for (const reference of references) {
    if (!String(reference[2] || "").trim().startsWith("#")) {
      throw new Error("The SVG contains an external reference.");
    }
  }
  if (!/\sxmlns\s*=/i.test(svg.slice(0, svg.indexOf(">") + 1))) {
    svg = svg.replace(/^<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return svg;
}

export function calculatePlacement(placement: InsertPlacement, size: number, anchor?: LayerFrame | null): { x: number; y: number } {
  if (!anchor || placement === "page-origin") return { x: 0, y: 0 };
  if (placement === "overlay") {
    return {
      x: anchor.x + (anchor.width - size) / 2,
      y: anchor.y + (anchor.height - size) / 2,
    };
  }
  return {
    x: anchor.x + anchor.width + 16,
    y: anchor.y + (anchor.height - size) / 2,
  };
}

function isPlacement(value: unknown): value is InsertPlacement {
  return value === "right" || value === "overlay" || value === "page-origin";
}

function safeColor(value: unknown): string {
  const color = typeof value === "string" ? value.trim().toUpperCase() : "";
  return /^#[0-9A-F]{6}$/.test(color) ? color : "#2563EB";
}

function safeText(value: unknown, fallback: string, maximumLength: number): string {
  const text = typeof value === "string" ? value : "";
  const clean = text.replace(/[\u0000-\u001F\u007F<>]/g, " ").replace(/\s+/g, " ").trim();
  return (clean || fallback).slice(0, maximumLength);
}
