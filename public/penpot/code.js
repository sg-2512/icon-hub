// Penpot Plugin Main Process for IconSearch (Penpot 2.0+ Compliant)

const BASE_URL = "http://localhost:3000";

try {
  penpot.ui.open("IconSearch - 355,000+ Icons", BASE_URL + "/index.html", {
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
      if (!svg) return;

      // Create native Penpot vector shape group from SVG string
      const shape = penpot.createShapeFromSvg(svg);
      if (shape) {
        shape.name = name ? `${name} (${library || 'Icon'})` : "IconSearch Icon";
        const center = penpot.viewport.center;
        shape.x = center.x - (shape.width || 24) / 2;
        shape.y = center.y - (shape.height || 24) / 2;
        penpot.selection = [shape];
        try { penpot.ui.sendMessage({ type: "insert-success", name }); } catch(_) {}
      }
    } else if (msg.type === "resize" && msg.width && msg.height) {
      penpot.ui.resize(msg.width, msg.height);
    } else if (msg.type === "close") {
      penpot.ui.close();
    }
  } catch (e) {
    console.error("Penpot shape creation error:", e);
    try {
      penpot.ui.sendMessage({ type: "insert-error", error: e.message || "Failed to insert SVG into Penpot" });
    } catch (_) {}
  }
}

// Support both Penpot message listener API variants
if (typeof penpot !== "undefined" && penpot.ui) {
  if (typeof penpot.ui.onMessage === "function") {
    penpot.ui.onMessage((msg) => handleMessage(msg));
  }
  if (typeof penpot.ui.on === "function") {
    try { penpot.ui.on("message", (msg) => handleMessage(msg)); } catch(_) {}
  }
}
