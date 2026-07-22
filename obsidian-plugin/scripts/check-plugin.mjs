import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = ["manifest.json", "main.js", "styles.css", "README.md", "LICENSE", "versions.json"];
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
  assert(existsSync(join(root, file)), `Missing ${file}`);
}

const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
assert(manifest.id === "iconsearch", "manifest id must be iconsearch");
assert(/^[a-z-]+$/.test(manifest.id), "manifest id must contain lowercase letters and hyphens only");
assert(!manifest.id.includes("obsidian"), "manifest id must not contain obsidian");
assert(!manifest.id.endsWith("plugin"), "manifest id must not end with plugin");
assert(manifest.name === "IconSearch", "manifest name should be IconSearch");
assert(/^\d+\.\d+\.\d+$/.test(manifest.version), "manifest version must be semver-like");
assert(typeof manifest.minAppVersion === "string" && manifest.minAppVersion, "minAppVersion is required");
assert(typeof manifest.description === "string" && manifest.description.length > 20, "description is required");
assert(manifest.author === "iconsearch", "author should be iconsearch");
assert(manifest.isDesktopOnly === false, "plugin should not be desktop-only");

const versions = JSON.parse(readFileSync(join(root, "versions.json"), "utf8"));
assert(versions[manifest.version] === manifest.minAppVersion, "versions.json must map version to minAppVersion");

const main = readFileSync(join(root, "main.js"), "utf8");
assert(main.includes('require("obsidian")'), "main.js must import Obsidian API");
assert(main.includes("registerView"), "main.js must register a sidebar view");
assert(main.includes("addRibbonIcon"), "main.js must add a ribbon icon");
assert(main.includes("getActiveViewOfType(MarkdownView)"), "main.js must insert into the active Markdown editor");
assert(main.includes("IconSearch Icons"), "main.js must save SVGs into the vault");
assert(
  main.includes("https://iconsearch.info") && main.includes("/api/icons"),
  "main.js must use the IconSearch public API",
);
assert(main.includes("application/x-iconsearch-obsidian-icon"), "main.js must support drag-and-drop");
assert(!main.includes("localStorage"), "plugin should not persist tokens or user data in localStorage");

const css = readFileSync(join(root, "styles.css"), "utf8");
assert(css.includes(".iconsearch-obsidian-results"), "styles.css must style the results grid");
assert(css.includes("var(--background-primary)"), "styles.css should use Obsidian theme variables");

for (const file of requiredFiles) {
  const content = readFileSync(join(root, file), "utf8");
  forbiddenPatterns.forEach((pattern) => {
    assert(!pattern.test(content), `Potential secret pattern found in ${file}: ${pattern}`);
  });
}

console.log("IconSearch Obsidian plugin check passed.");

function assert(condition, message) {
  if (!condition) {
    console.error(`Check failed: ${message}`);
    process.exit(1);
  }
}
