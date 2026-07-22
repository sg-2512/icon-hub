import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  ".clasp.json.example",
  "apps-script/Code.gs",
  "apps-script/appsscript.json",
  "dist/Code.gs",
  "dist/Sidebar.html",
  "dist/appsscript.json",
  "index.html",
  "src/main.ts",
  "src/svg.ts",
];
const contents = new Map();
for (const filename of requiredFiles) {
  contents.set(filename, await readFile(resolve(root, filename), "utf8"));
}

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const manifest = JSON.parse(contents.get("apps-script/appsscript.json"));
const scopes = Array.isArray(manifest.oauthScopes) ? manifest.oauthScopes : [];
const source = `${contents.get("src/main.ts")}\n${contents.get("src/svg.ts")}`;
const server = contents.get("apps-script/Code.gs");
const sidebar = contents.get("dist/Sidebar.html");
const claspExample = JSON.parse(contents.get(".clasp.json.example"));

expect(scopes.length === 2, "Manifest must contain exactly two OAuth scopes.");
expect(scopes.includes("https://www.googleapis.com/auth/presentations.currentonly"), "Manifest must request presentations.currentonly.");
expect(scopes.includes("https://www.googleapis.com/auth/script.container.ui"), "Manifest must request script.container.ui.");
expect(!scopes.includes("https://www.googleapis.com/auth/presentations"), "Manifest must not request the broad presentations scope.");
expect(!scopes.some((scope) => /drive|external_request|userinfo|openid/i.test(scope)), "Manifest contains a broad or unrelated OAuth scope.");
expect(!Object.hasOwn(manifest, "urlFetchWhitelist"), "Manifest must not enable Apps Script URL fetching.");

expect(server.includes("MAX_BASE64_LENGTH"), "Server must enforce a bounded image payload.");
expect(server.includes("assertPngSignature"), "Server must verify the PNG signature.");
expect(server.includes("getCurrentPage"), "Server must target the current Slides page.");
expect(server.includes("getPageWidth") && server.includes("getPageHeight"), "Server must use real presentation dimensions.");
expect(server.includes("insertImage(blob"), "Server must insert a local PNG blob.");
expect(server.includes("setTitle") && server.includes("setDescription"), "Inserted images must receive accessible metadata.");
expect(!/UrlFetchApp|fetch\s*\(/.test(server), "Apps Script server must not fetch external URLs.");

expect(source.includes("https://iconsearch.info/api/icons"), "Client must use the public IconSearch API.");
expect(source.includes("sanitizeSvg"), "Client must sanitize remote SVG markup.");
expect(source.includes("google?.script?.run"), "Client must use the Apps Script bridge.");
expect(!/authorization|bearer\s|api[_-]?key|access[_-]?token/i.test(source), "Client must not contain account or token flows.");
expect(sidebar.includes("data:image/png;base64,"), "Built sidebar must inline the logo.");
expect(!sidebar.includes('type="module"'), "Built sidebar must not rely on module scripts.");
expect(!sidebar.includes('/src/') && !sidebar.includes('/assets/'), "Built sidebar contains local asset references.");

expect(claspExample.scriptId === "YOUR_SCRIPT_ID", "The committed clasp config must use a placeholder script ID.");
expect(claspExample.rootDir === "dist", "clasp must upload only the dist directory.");
const outputFiles = (await readdir(resolve(root, "dist"))).sort();
expect(JSON.stringify(outputFiles) === JSON.stringify(["Code.gs", "Sidebar.html", "appsscript.json"]), "dist must contain only Apps Script deployment files.");

const secretPattern = /(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk_(?:live|test)_[a-z0-9]{12,}|ghp_[a-z0-9]{20,}|service_role\s*[:=]\s*["'][^"']+|client_secret\s*[:=]\s*["'][^"']+|bearer\s+[a-z0-9._-]{20,})/i;
const scanned = requiredFiles.map((filename) => contents.get(filename)).join("\n");
expect(!secretPattern.test(scanned), "Potential secret or privileged credential found.");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Google Slides add-on checks passed (${requiredFiles.length} required files, least-privilege scopes, no embedded secrets).`);
}
