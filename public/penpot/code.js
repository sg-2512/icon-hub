// IconSearch Penpot plugin main process.
// The sync script creates code.local.js with a localhost UI URL for local QA.

const UI_URL = "https://iconsearch.info/penpot/index.html";
const MAX_SVG_LENGTH = 1_000_000;
const FORBIDDEN_SVG_MARKUP =
  /<!DOCTYPE|<\?xml-stylesheet|<(?:script|foreignObject|iframe|object|embed|image|feImage|style|audio|video|base|link|meta|animate|animateMotion|animateTransform|set)\b|(?:\s|^)(?:on[a-z]+|style|src)\s*=|(?:href|xlink:href)\s*=\s*["'](?!#)|url\(\s*["']?(?!#)/i;

try {
  penpot.ui.open("IconSearch - 355,000+ Icons", UI_URL, {
    width: 340,
    height: 580
  });
} catch (err) {
  console.error("IconSearch Penpot ui.open error:", err);
}

function handleMessage(msg) {
  if (!msg || typeof msg !== "object") return;
  try {
    if (msg.type === "insert-svg") {
      const { svg, name, library } = msg;
      if (!isSafeSvgPayload(svg)) {
        throw new Error("IconSearch rejected an unsafe or invalid SVG.");
      }

      // Create native Penpot vector shape group from SVG string
      const shape = penpot.createShapeFromSvg(svg);
      if (shape) {
        const safeName = safeLabel(name, "IconSearch Icon");
        const safeLibrary = safeLabel(library, "Icon");
        shape.name = `${safeName} (${safeLibrary})`;
        const center = penpot.viewport.center;
        shape.x = center.x - (shape.width || 24) / 2;
        shape.y = center.y - (shape.height || 24) / 2;
        penpot.selection = [shape];
        sendUiMessage({ type: "insert-success", name: safeName });
      } else {
        throw new Error("Penpot could not create a vector from this SVG.");
      }
    } else if (msg.type === "resize") {
      const width = clampInteger(msg.width, 280, 800);
      const height = clampInteger(msg.height, 300, 900);
      penpot.ui.resize(width, height);
    } else if (msg.type === "close") {
      penpot.closePlugin();
    }
  } catch (e) {
    console.error("Penpot shape creation error:", e);
    sendUiMessage({
      type: "insert-error",
      error: e instanceof Error ? e.message : "Failed to insert SVG into Penpot"
    });
  }
}

function isSafeSvgPayload(svg) {
  if (typeof svg !== "string" || svg.length === 0 || svg.length > MAX_SVG_LENGTH) return false;
  const trimmed = svg.trim();
  if (!/^<svg(?:\s|>)/i.test(trimmed)) return false;
  return !FORBIDDEN_SVG_MARKUP.test(trimmed);
}

function safeLabel(value, fallback) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 120);
  return cleaned || fallback;
}

function clampInteger(value, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.round(parsed)));
}

function sendUiMessage(message) {
  try {
    penpot.ui.sendMessage(message);
  } catch (_) {}
}

if (
  typeof penpot !== "undefined" &&
  penpot.ui &&
  typeof penpot.ui.onMessage === "function"
) {
  penpot.ui.onMessage((msg) => handleMessage(msg));
}
