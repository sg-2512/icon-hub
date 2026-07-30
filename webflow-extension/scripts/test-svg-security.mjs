import assert from "node:assert/strict";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

const browserDom = new JSDOM("<!doctype html><html><body></body></html>");
globalThis.window = browserDom.window;
globalThis.document = browserDom.window.document;
globalThis.DOMParser = browserDom.window.DOMParser;
globalThis.XMLSerializer = browserDom.window.XMLSerializer;
globalThis.Node = browserDom.window.Node;
globalThis.Element = browserDom.window.Element;

const buildResult = await build({
  entryPoints: ["src/svg.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  target: ["node22"],
  write: false,
  logLevel: "silent",
});
const moduleUrl = `data:text/javascript;base64,${Buffer.from(buildResult.outputFiles[0].text).toString("base64")}`;
const { sanitizeSvg, styleSvg } = await import(moduleUrl);

const hostileMarkup = `
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
    <style>.remote { fill: url(https://evil.example/paint); }</style>
    <image href="https://evil.example/pixel.png" width="24" height="24" />
    <filter id="safe-filter">
      <feImage xlink:href="https://evil.example/filter.svg" />
      <feGaussianBlur stdDeviation="1" />
    </filter>
    <linearGradient id="safe-gradient"><stop offset="0" stop-color="#000000" /></linearGradient>
    <path id="safe-path" style="fill:url(https://evil.example/style.svg)" fill="url(https://evil.example/fill.svg)" d="M0 0h24v24H0z" />
    <path id="safe-fragment-paint" fill="url(#safe-gradient)" filter="url(#safe-filter)" d="M1 1h22v22H1z" />
    <path id="escaped-url" filter="u\\72l(https://evil.example/escaped.svg)" d="M1 1h2v2H1z" />
    <use id="unsafe-use" href="https://evil.example/sprite.svg#icon" />
    <use id="unsafe-data-use" xlink:href="data:image/svg+xml;base64,PHN2Zy8+" />
    <a id="safe-link" href="#safe-path"><path d="M2 2h2v2H2z" /></a>
  </svg>
`;

const sanitized = sanitizeSvg(hostileMarkup);
const sanitizedDocument = parseSvg(sanitized);

assert.equal(sanitizedDocument.querySelectorAll("image, feImage, style").length, 0);
assert.equal(sanitizedDocument.querySelector("[style]"), null);
assert.equal(sanitizedDocument.querySelector("#unsafe-use")?.getAttribute("href") ?? null, null);
assert.equal(sanitizedDocument.querySelector("#unsafe-data-use")?.getAttribute("xlink:href") ?? null, null);
assert.equal(sanitizedDocument.querySelector("#safe-link")?.getAttribute("href"), "#safe-path");
assert.equal(sanitizedDocument.querySelector("#safe-path")?.hasAttribute("fill"), false);
assert.equal(sanitizedDocument.querySelector("#safe-fragment-paint")?.getAttribute("fill"), "url(#safe-gradient)");
assert.equal(sanitizedDocument.querySelector("#safe-fragment-paint")?.getAttribute("filter"), "url(#safe-filter)");
assert.equal(sanitizedDocument.querySelector("#escaped-url")?.getAttribute("filter") ?? null, null);
assert(!sanitized.includes("evil.example"));
assert(!sanitized.toLowerCase().includes("data:image"));

const styled = styleSvg(hostileMarkup, {
  color: "#2563EB",
  title: `Arrow <unsafe> & "quoted"`,
  size: 64,
});
const styledDocument = parseSvg(styled);
const styledRoot = styledDocument.documentElement;

assert.equal(styledRoot.getAttribute("width"), "64");
assert.equal(styledRoot.getAttribute("height"), "64");
assert.equal(styledRoot.getAttribute("role"), "img");
assert.equal(styledRoot.getAttribute("aria-label"), `Arrow <unsafe> & "quoted"`);
assert.equal(styledDocument.querySelector("title")?.textContent, `Arrow <unsafe> & "quoted"`);
assert(!styled.includes("evil.example"));

assert.throws(
  () => styleSvg("<svg />", { color: "red", title: "Invalid color", size: 64 }),
  /six-digit hex/,
);
assert.throws(
  () => styleSvg("<svg />", { color: "#2563EB", title: "Invalid size", size: 513 }),
  /16 to 512/,
);

console.log("SVG security tests passed.");

function parseSvg(markup) {
  return new browserDom.window.DOMParser().parseFromString(markup, "image/svg+xml");
}
