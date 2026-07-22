import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "package.json",
  "webflow.json",
  "tsconfig.json",
  "public/index.html",
  "public/styles.css",
  "src/index.ts",
  "README.md",
  "MARKETPLACE.md",
  "LICENSE",
];

const contents = new Map();
for (const file of requiredFiles) {
  contents.set(file, await readFile(resolve(root, file), "utf8"));
}

const manifest = JSON.parse(contents.get("webflow.json"));
const packageJson = JSON.parse(contents.get("package.json"));
const html = contents.get("public/index.html");
const source = contents.get("src/index.ts");
const allText = [...contents.values()].join("\n");

assert(manifest.name === "IconSearch", "webflow.json must use the IconSearch product name");
assert(manifest.apiVersion === "2", "webflow.json must target Designer API version 2");
assert(manifest.size === "comfortable", "extension must use Webflow's comfortable panel size");
assert(manifest.publicDir === "public", "extension must publish the public directory");
assert(manifest.telemetry?.global?.allowTelemetry === false, "Webflow CLI telemetry must be disabled for this project");
assert(packageJson.private === true, "extension package must remain private");
assert(packageJson.engines?.node === ">=22.13.0", "Node requirement must match the current Webflow CLI");
assert(packageJson.overrides?.["form-data"] === "4.0.6", "form-data security override must stay pinned");
assert(packageJson.overrides?.undici === "7.28.0", "undici security override must stay pinned");

assert(html.includes('href="./styles.css"'), "index.html must use a relative stylesheet path");
assert(html.includes('src="./index.js"'), "index.html must use a relative script path");
assert(!html.includes("<html") && !html.includes("<body"), "Webflow public/index.html must contain body content only");

for (const token of [
  "webflow.createAsset",
  "webflow.elementPresets.Image",
  "webflow.getSelectedElement",
  "webflow.canForAppMode",
  "setAsset",
  "setAltText",
  "styleSvg",
  "sanitizeSvg",
  "legalOnly",
  "placement",
]) {
  assert(source.includes(token), `src/index.ts is missing required behavior: ${token}`);
}

const secretPatterns = [
  /SUPABASE_SERVICE_ROLE/i,
  /PRIVATE[_-]?KEY/i,
  /CLIENT[_-]?SECRET/i,
  /sk_live_[a-z0-9]+/i,
  /sk-[a-z0-9]{20,}/i,
  /Bearer\s+[a-z0-9._-]{20,}/i,
];

for (const pattern of secretPatterns) {
  assert(!pattern.test(allText), `possible confidential value matched ${pattern}`);
}

assert(
  source.includes('const API_BASE = "https://iconsearch.info"') && source.includes('/api/icons'),
  "extension must use the production IconSearch endpoint",
);
assert(!source.includes("localStorage.setItem(\"token"), "extension must not store authentication tokens");

console.log("Webflow extension checks passed.");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
