import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "package.json",
  "webflow.json",
  "tsconfig.json",
  "public/index.html",
  "public/index.js",
  "public/index.css",
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
const builtJavaScript = contents.get("public/index.js");
const builtCss = contents.get("public/index.css");
const allText = [...contents.values()].join("\n");
const publicFiles = await readdir(resolve(root, "public"), { recursive: true });
const expectedPublicFiles = new Set(["index.css", "index.html", "index.js"]);

assert(manifest.name === "IconSearch", "webflow.json must use the IconSearch product name");
assert(manifest.apiVersion === "2", "webflow.json must target Designer API version 2");
assert(manifest.size === "comfortable", "extension must use Webflow's comfortable panel size");
assert(manifest.publicDir === "public", "extension must publish the public directory");
assert(packageJson.private === true, "extension package must remain private");
assert(
  packageJson.scripts?.serve === "webflow extension serve",
  "local development must use Webflow CLI so the Designer API bridge is available"
);

assert(html.includes('src="./index.js"'), "index.html must use a relative script path");
assert(html.includes('href="./index.css"'), "index.html must use the generated relative stylesheet");
assert(!html.includes("style.css"), "index.html must not load a stale duplicate stylesheet");
assert(!/<\/?(?:html|head|body)\b/i.test(html), "index.html must contain body contents only");

assert(webflowApiSource.includes(".createAsset"), "webflow-api.ts must create assets via Webflow SDK");
assert(webflowApiSource.includes("new File([options.svgMarkup]"), "Webflow assets must be uploaded as File objects");
assert(webflowApiSource.includes("webflow.createAsset(svgFile)"), "createAsset must receive the SVG File object");
assert(!webflowApiSource.includes("createAsset(dataUrl"), "createAsset must not receive an SVG data URL");
assert(webflowApiSource.includes("webflow.elementPresets.Image"), "webflow-api.ts must use Webflow image presets");
assert(webflowApiSource.includes("webflow.getSelectedElement"), "webflow-api.ts must require canvas element selection");
assert(svgSource.includes("isAllowedHost"), "svg.ts must enforce strict domain allowlist");
assert(svgSource.includes('FORBID_TAGS: ["image", "feImage", "style"]'), "SVG sanitizer must forbid resource-bearing elements");
assert(svgSource.includes('FORBID_ATTR: ["style"]'), "SVG sanitizer must forbid inline style attributes");
assert(svgSource.includes('attributeName === "href" || attributeName === "xlink:href"'), "SVG sanitizer must inspect link attributes");
assert(svgSource.includes("INTERNAL_FRAGMENT_URL"), "SVG sanitizer must restrict url() references to internal fragments");
assert(!svgSource.includes("ADD_ATTR"), "SVG sanitizer must not widen DOMPurify's attribute allowlist");

assert(!appSource.includes("getIdToken"), "extension must not request a Webflow ID token");
assert(!webflowApiSource.includes("getIdToken"), "Webflow API wrapper must not request a Webflow ID token");
assert(!appSource.includes("verificationUriComplete"), "extension must not trust a server-supplied redirect URL");
assert(!appSource.includes("window.open"), "authorization navigation must require an explicit link click");
assert(!/\bstyle\s*=\s*\{\{/.test(appSource), "React inline style props are not CSP compatible");
assert(appSource.includes('type="submit"'), "icon searches must be gated by an explicit form submission");
assert(!webflowApiSource.includes("SDK simulator"), "production source must not include SDK simulator fallbacks");

assert(!publicFiles.some((file) => file.toLowerCase().endsWith(".map")), "production public directory must not contain source maps");
assert(
  publicFiles.every((file) => expectedPublicFiles.has(file.replaceAll("\\", "/"))),
  `production public directory contains unexpected files: ${publicFiles.filter((file) => !expectedPublicFiles.has(file.replaceAll("\\", "/"))).join(", ")}`
);
assert(!builtJavaScript.includes("sourceMappingURL"), "production JavaScript must not reference a source map");
assert(!builtCss.includes("sourceMappingURL"), "production CSS must not reference a source map");
assert(!builtJavaScript.includes("getIdToken"), "production bundle must not request a Webflow ID token");
assert(!builtJavaScript.includes("SDK simulator"), "production bundle must not contain simulator messaging");

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
