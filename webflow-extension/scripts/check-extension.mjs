import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "package.json",
  "webflow.json",
  "tsconfig.json",
  "public/index.html",
  "public/style.css",
  "src/index.tsx",
  "src/App.tsx",
  "src/webflow-api.ts",
  "src/svg.ts",
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
const appSource = contents.get("src/App.tsx");
const webflowApiSource = contents.get("src/webflow-api.ts");
const svgSource = contents.get("src/svg.ts");
const allText = [...contents.values()].join("\n");

assert(manifest.name === "IconSearch", "webflow.json must use the IconSearch product name");
assert(manifest.apiVersion === "2", "webflow.json must target Designer API version 2");
assert(manifest.size === "comfortable", "extension must use Webflow's comfortable panel size");
assert(manifest.publicDir === "public", "extension must publish the public directory");
assert(packageJson.private === true, "extension package must remain private");

assert(html.includes('src="./index.js"'), "index.html must use a relative script path");

assert(webflowApiSource.includes("webflow.createAsset"), "webflow-api.ts must create assets via Webflow SDK");
assert(webflowApiSource.includes("webflow.elementPresets.Image"), "webflow-api.ts must use Webflow image presets");
assert(webflowApiSource.includes("webflow.getSelectedElement"), "webflow-api.ts must require canvas element selection");
assert(svgSource.includes("isAllowedHost"), "svg.ts must enforce strict domain allowlist");

const secretPatterns = [
  /SUPABASE_SERVICE_ROLE/i,
  /PRIVATE[_-]?KEY/i,
  /CLIENT[_-]?SECRET/i,
  /sk_live_[a-z0-9]+/i,
];

for (const pattern of secretPatterns) {
  assert(!pattern.test(allText), `possible confidential value matched ${pattern}`);
}

assert(
  appSource.includes("https://iconsearch.info/api/extension/icon-search"),
  "extension must use production IconSearch endpoint"
);

console.log("Webflow extension checks passed.");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
