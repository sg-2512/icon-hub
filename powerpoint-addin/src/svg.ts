const BLOCKED_ELEMENTS = "script, foreignObject, iframe, object, embed, style, image, audio, video, base";
const PAINT_ATTRIBUTES = ["fill", "stroke"] as const;

export type StyledSvgOptions = {
  color: string;
  title: string;
};

export function sanitizeSvg(markup: string): string {
  const documentNode = parseSvg(markup);
  const root = documentNode.documentElement;

  documentNode.querySelectorAll(BLOCKED_ELEMENTS).forEach((element) => element.remove());
  documentNode.querySelectorAll("*").forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();
      const hasExternalUrl = /url\(\s*["']?(?!#)/i.test(value);
      const unsafeReference = (name === "href" || name === "xlink:href") && !value.startsWith("#");

      if (name.startsWith("on") || name === "style" || name === "src" || unsafeReference || hasExternalUrl) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(root);
}

export function styleSvg(markup: string, options: StyledSvgOptions): string {
  const isCustomColor = isSafeHex(options.color);
  const documentNode = parseSvg(sanitizeSvg(markup));
  const root = documentNode.documentElement;
  let hasPaint = false;

  documentNode.querySelectorAll("title").forEach((title) => title.remove());
  const title = documentNode.createElementNS("http://www.w3.org/2000/svg", "title");
  title.textContent = options.title;
  root.prepend(title);

  documentNode.querySelectorAll("*").forEach((element) => {
    for (const attributeName of PAINT_ATTRIBUTES) {
      const paint = element.getAttribute(attributeName);
      if (!paint) continue;
      hasPaint = true;

      if (isCustomColor) {
        if (paint !== "none" && paint !== "transparent" && !paint.startsWith("url(")) {
          element.setAttribute(attributeName, options.color);
        }
      } else {
        if (paint.trim().toLowerCase() === "currentcolor") {
          element.setAttribute(attributeName, "#111827");
        }
      }
    }
  });

  if (isCustomColor) {
    root.setAttribute("color", options.color);
    if (!hasPaint) root.setAttribute("fill", options.color);
  } else {
    if (!hasPaint && !root.hasAttribute("fill") && !root.hasAttribute("stroke")) {
      root.setAttribute("fill", "#111827");
    }
  }

  root.setAttribute("role", "img");
  root.setAttribute("aria-label", options.title);
  if (!root.hasAttribute("viewBox")) {
    const width = numericDimension(root.getAttribute("width"));
    const height = numericDimension(root.getAttribute("height"));
    root.setAttribute("viewBox", `0 0 ${width || 24} ${height || 24}`);
  }
  root.setAttribute("width", "512");
  root.setAttribute("height", "512");

  return new XMLSerializer().serializeToString(root);
}



export function normalizeHttpsUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) {
    const origin = typeof location !== "undefined" ? location.origin : "https://iconsearch.info";
    return `${origin}${trimmed}`;
  }
  try {
    const parsed = new URL(trimmed);
    const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    return parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocal) ? parsed.toString() : "";
  } catch {
    return "";
  }
}





export function isSafeHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
}

export function encodeSvgBase64(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
  }
  return btoa(binary);
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
