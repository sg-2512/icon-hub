import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const requiredFiles = ["manifest.json", "index.html", "index.js", "styles.css"];
const forbiddenPatterns = [
  /sk_live_[a-z0-9]/i,
  /sk_test_[a-z0-9]/i,
  /supabase_service_role/i,
  /service_role/i,
  /private[_-]?key/i,
  /api[_-]?secret/i,
  /bearer\s+[a-z0-9._-]{20,}/i,
];

for (const file of requiredFiles) {
  assert(existsSync(join(src, file)), `Missing src/${file}`);
}

const manifest = JSON.parse(readFileSync(join(src, "manifest.json"), "utf8"));
assert(manifest.manifestVersion === 2, "manifestVersion must be 2");
assert(manifest.version && /^\d+\.\d+\.\d+$/.test(manifest.version), "version must be semver-like");
assert(Array.isArray(manifest.requirements?.apps), "requirements.apps must be present");
assert(
  manifest.requirements.apps.some((app) => app.name === "Express" && app.apiVersion === 1),
  "Manifest must target Adobe Express API version 1",
);
assert(Array.isArray(manifest.entryPoints) && manifest.entryPoints.length > 0, "At least one entry point is required");
assert(
  manifest.entryPoints.some((entry) => entry.type === "panel" && entry.main === "index.html"),
  "A panel entry point using index.html is required",
);

const html = readFileSync(join(src, "index.html"), "utf8");
assert(html.includes('href="styles.css"'), "index.html must load styles.css");
assert(html.includes('src="index.js"'), "index.html must load index.js");
assert(html.includes('type="module"'), "index.js should be loaded as a module");

const js = readFileSync(join(src, "index.js"), "utf8");
assert(js.includes("https://iconsearch.info"), "index.js must use the IconSearch API base");
assert(js.includes("https://express.adobe.com/static/add-on-sdk/sdk.js"), "index.js must import Adobe's hosted SDK");
assert(js.includes("enableDragToDocument"), "index.js must enable Adobe drag-to-document");
assert(js.includes("document.addImage"), "index.js must support click insertion with document.addImage");
assert(!js.includes("localStorage"), "Adobe add-on should not persist tokens or user data locally");

for (const file of requiredFiles) {
  const content = readFileSync(join(src, file), "utf8");
  forbiddenPatterns.forEach((pattern) => {
    assert(!pattern.test(content), `Potential secret pattern found in src/${file}: ${pattern}`);
  });
}

console.log("IconSearch Adobe Express add-on check passed.");

function assert(condition, message) {
  if (!condition) {
    console.error(`Check failed: ${message}`);
    process.exit(1);
  }
}
