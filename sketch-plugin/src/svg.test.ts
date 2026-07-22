import { describe, expect, it } from "vitest";
import { isSafeHex, normalizeHttpsUrl, sanitizeSvg, styleSvg } from "./svg";

describe("Sketch panel SVG safety", () => {
  it("removes active elements and external references", () => {
    const safe = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><image href="https://bad.example/a.png"/><path style="fill:red" stroke="#000"/></svg>');
    expect(safe).not.toMatch(/script|onload|image|style=|bad\.example/i);
    expect(safe).toContain('stroke="#000"');
  });

  it("recolors editable paint while preserving none", () => {
    const styled = styleSvg('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="none" stroke="currentColor" d="M1 1h4"/></svg>', { color: "#2563EB", title: "Arrow" });
    expect(styled).toContain('stroke="#2563EB"');
    expect(styled).toContain('fill="none"');
    expect(styled).toContain('viewBox="0 0 24 24"');
    expect(styled).toContain("<title>Arrow</title>");
  });

  it("accepts only HTTPS assets and six-digit colors", () => {
    expect(normalizeHttpsUrl("//iconsearch.info/icon.svg")).toBe("https://iconsearch.info/icon.svg");
    expect(normalizeHttpsUrl("http://iconsearch.info/icon.svg")).toBe("");
    expect(isSafeHex("#0A84FF")).toBe(true);
    expect(isSafeHex("red")).toBe(false);
  });
});
