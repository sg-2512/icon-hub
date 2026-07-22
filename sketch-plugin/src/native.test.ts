import { describe, expect, it } from "vitest";
import { calculatePlacement, parseInsertPayload, sanitizeSvgForSketch } from "./native";

describe("Sketch native insertion boundary", () => {
  it("accepts a local-reference SVG and rejects active or external content", () => {
    const safe = '<svg viewBox="0 0 24 24"><defs><linearGradient id="g"/></defs><path fill="url(#g)" d="M0 0h24v24z"/></svg>';
    expect(sanitizeSvgForSketch(safe)).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(() => sanitizeSvgForSketch('<svg><script>alert(1)</script></svg>')).toThrow("unsupported");
    expect(() => sanitizeSvgForSketch('<svg><use href="https://bad.example/icon.svg#x"/></svg>')).toThrow("external reference");
  });

  it("normalizes bounded metadata and rejects a missing payload", () => {
    const parsed = parseInsertPayload({
      color: "#059669",
      library: "Lucide Icons<script>",
      name: "Arrow Right",
      placement: "unknown",
      size: 9999,
      svg: '<svg viewBox="0 0 24 24"><path d="M0 0h24"/></svg>',
    });
    expect(parsed.color).toBe("#059669");
    expect(parsed.library).toBe("Lucide Icons script");
    expect(parsed.placement).toBe("right");
    expect(parsed.size).toBe(512);
    expect(() => parseInsertPayload(null)).toThrow("missing");
  });

  it("places icons predictably relative to the selected layer", () => {
    const anchor = { x: 20, y: 40, width: 120, height: 80 };
    expect(calculatePlacement("right", 64, anchor)).toEqual({ x: 156, y: 48 });
    expect(calculatePlacement("overlay", 64, anchor)).toEqual({ x: 48, y: 48 });
    expect(calculatePlacement("page-origin", 64, anchor)).toEqual({ x: 0, y: 0 });
  });
});
