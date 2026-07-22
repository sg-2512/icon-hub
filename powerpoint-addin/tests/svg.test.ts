import { describe, expect, it } from "vitest";
import { isSafeHex, normalizeHttpsUrl, sanitizeSvg, styleSvg } from "../src/svg";

describe("SVG safety", () => {
  it("removes active content and external references", () => {
    const result = sanitizeSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)">
        <script>alert(1)</script>
        <a href="https://example.com"><path style="fill:red" d="M0 0h8v8z" /></a>
        <use href="#local-symbol" />
      </svg>
    `);

    expect(result).not.toContain("script");
    expect(result).not.toContain("onload");
    expect(result).not.toContain("https://example.com");
    expect(result).not.toContain("style=");
    expect(result).toContain('href="#local-symbol"');
  });

  it("applies a single color while preserving transparent paths", () => {
    const result = styleSvg(
      '<svg viewBox="0 0 24 24"><path fill="currentColor" stroke="#000" d="M1 1h8"/><path fill="none" d="M0 0h2v2z"/></svg>',
      { color: "#D24726", title: "Arrow right" },
    );

    expect(result).toContain('fill="#D24726"');
    expect(result).toContain('stroke="#D24726"');
    expect(result).toContain('fill="none"');
    expect(result).toContain("Arrow right");
    expect(result).toContain('width="512"');
  });

  it("accepts only HTTPS asset URLs and safe colors", () => {
    expect(normalizeHttpsUrl("//iconsearch.info/icon.svg")).toBe("https://iconsearch.info/icon.svg");
    expect(normalizeHttpsUrl("http://iconsearch.info/icon.svg")).toBe("");
    expect(normalizeHttpsUrl("javascript:alert(1)")).toBe("");
    expect(isSafeHex("#0F172A")).toBe(true);
    expect(isSafeHex("red")).toBe(false);
  });
});
