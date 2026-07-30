import DOMPurify from "dompurify";

const ALLOWED_HOSTNAMES = new Set([
  "iconsearch.info",
  "www.iconsearch.info",
  "cdn.iconsearch.info"
]);

const PAINT_ATTRIBUTES = ["fill", "stroke"] as const;
const FORBIDDEN_REFERENCE_ELEMENTS = new Set(["image", "feimage", "style"]);
const URL_REFERENCE_ATTRIBUTES = new Set([
  "clip-path",
  "cursor",
  "filter",
  "marker-end",
  "marker-mid",
  "marker-start",
  "mask",
]);
const INTERNAL_FRAGMENT = /^#[A-Za-z_][A-Za-z0-9_.:-]*$/;
const INTERNAL_FRAGMENT_URL = /^url\(\s*#[A-Za-z_][A-Za-z0-9_.:-]*\s*\)$/i;

export type StyledSvgOptions = {
  color: string;
  title: string;
  size: number;
};

export function isAllowedHost(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_HOSTNAMES.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function normalizeHttpsUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  const candidate = trimmed.startsWith("//")
    ? `https:${trimmed}`
    : trimmed.startsWith("/")
    ? `https://iconsearch.info${trimmed}`
    : trimmed;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:") return "";
    return isAllowedHost(parsed.toString()) ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export function isSafeHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function sanitizeSvg(markup: string): string {
  const cleanSvg = DOMPurify.sanitize(markup.trim(), {
    USE_PROFILES: { svg: true, svgFilters: true },
    RETURN_DOM: false,
    FORBID_TAGS: ["image", "feImage", "style"],
    FORBID_ATTR: ["style"]
  });

  const documentNode = parseSvg(cleanSvg);
  const root = documentNode.documentElement;
  stripUnsafeReferences(documentNode);
  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(root);
}

export function styleSvg(markup: string, options: StyledSvgOptions): string {
  if (!isSafeHex(options.color)) throw new Error("Icon color must be a six-digit hex value.");
  if (!Number.isInteger(options.size) || options.size < 16 || options.size > 512) {
    throw new Error("Icon size must be a whole number from 16 to 512 pixels.");
  }
  const sanitized = sanitizeSvg(markup);
  const documentNode = parseSvg(sanitized);
  const root = documentNode.documentElement;
  let hasPaint = false;

  documentNode.querySelectorAll("title").forEach((title) => title.remove());
  const titleNode = documentNode.createElementNS("http://www.w3.org/2000/svg", "title");
  titleNode.textContent = options.title;
  root.prepend(titleNode);

  documentNode.querySelectorAll("*").forEach((element) => {
    for (const attributeName of PAINT_ATTRIBUTES) {
      const paint = element.getAttribute(attributeName);
      if (!paint) continue;
      hasPaint = true;
      if (paint !== "none" && paint !== "transparent" && !isInternalFragmentUrl(paint)) {
        element.setAttribute(attributeName, options.color);
      }
    }
  });

  root.setAttribute("color", options.color);
  root.setAttribute("role", "img");
  root.setAttribute("aria-label", options.title);
  if (!hasPaint) root.setAttribute("fill", options.color);
  if (!root.hasAttribute("viewBox")) {
    const width = numericDimension(root.getAttribute("width"));
    const height = numericDimension(root.getAttribute("height"));
    root.setAttribute("viewBox", `0 0 ${width || 24} ${height || 24}`);
  }
  root.setAttribute("width", String(options.size));
  root.setAttribute("height", String(options.size));
  return new XMLSerializer().serializeToString(root);
}

function stripUnsafeReferences(documentNode: XMLDocument): void {
  documentNode.querySelectorAll("*").forEach((element) => {
    if (FORBIDDEN_REFERENCE_ELEMENTS.has(element.localName.toLowerCase())) {
      element.remove();
      return;
    }

    for (const attribute of Array.from(element.attributes)) {
      const attributeName = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (attributeName === "style") {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (attributeName === "href" || attributeName === "xlink:href") {
        if (!INTERNAL_FRAGMENT.test(value)) {
          element.removeAttribute(attribute.name);
        }
        continue;
      }

      if (URL_REFERENCE_ATTRIBUTES.has(attributeName)) {
        if (value.toLowerCase() !== "none" && !isInternalFragmentUrl(value)) {
          element.removeAttribute(attribute.name);
        }
        continue;
      }

      if (
        PAINT_ATTRIBUTES.includes(attributeName as (typeof PAINT_ATTRIBUTES)[number]) &&
        (value.includes("\\") || value.includes("(") || value.includes(")")) &&
        !isInternalFragmentUrl(value)
      ) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (/url\s*\(/i.test(value) && !isInternalFragmentUrl(value)) {
        element.removeAttribute(attribute.name);
      }
    }
  });
}

function isInternalFragmentUrl(value: string): boolean {
  return INTERNAL_FRAGMENT_URL.test(value.trim());
}

function parseSvg(markup: string): XMLDocument {
  const documentNode = new DOMParser().parseFromString(markup.trim(), "image/svg+xml");
  if (documentNode.documentElement.localName !== "svg" || documentNode.querySelector("parsererror")) {
    throw new Error("The selected icon is not valid SVG markup.");
  }
  return documentNode;
}

function numericDimension(value: string | null): number {
  const parsed = Number.parseFloat(value || "");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
