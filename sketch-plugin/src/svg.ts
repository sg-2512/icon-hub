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
  if (!isSafeHex(options.color)) throw new Error("Icon color must be a six-digit hex value.");
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
      if (paint !== "none" && paint !== "transparent" && !paint.startsWith("url(")) {
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
  root.setAttribute("width", "512");
  root.setAttribute("height", "512");
  return new XMLSerializer().serializeToString(root);
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
    return parsed.protocol === "https:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}

export function isSafeHex(value: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(value);
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
