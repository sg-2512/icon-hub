import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(rootDirectory, "penpot-plugin");
const publicDirectory = path.join(rootDirectory, "public", "penpot");
const productionUiUrl = "https://iconsearch.info/penpot/index.html";
const localUiUrl = "http://localhost:3000/penpot/index.html";

const readText = (directory, fileName) =>
  readFile(path.join(directory, fileName), "utf8");
const readJson = async (directory, fileName) =>
  JSON.parse(await readText(directory, fileName));

const [manifest, localManifest, sourceCode, publicCode, localCode, sourceUi, publicUi] =
  await Promise.all([
    readJson(sourceDirectory, "manifest.json"),
    readJson(sourceDirectory, "manifest.local.json"),
    readText(sourceDirectory, "code.js"),
    readText(publicDirectory, "code.js"),
    readText(publicDirectory, "code.local.js"),
    readText(sourceDirectory, "index.html"),
    readText(publicDirectory, "index.html"),
  ]);

for (const candidate of [manifest, localManifest]) {
  assert.equal(candidate.version, 2, "Penpot manifests must use manifest version 2.");
  assert.equal("host" in candidate, false, "Manifest v2 must not use a host field.");
  assert.match(candidate.code, /^[A-Za-z0-9._-]+$/, "Manifest code must be relative.");
  assert.match(candidate.icon, /^[A-Za-z0-9._-]+$/, "Manifest icon must be relative.");
  assert.deepEqual(
    candidate.permissions,
    ["content:write", "allow:localstorage"],
    "Use only the permissions the plugin needs.",
  );
}

assert.equal(manifest.code, "code.js");
assert.equal(localManifest.code, "code.local.js");
assert.equal(sourceCode, publicCode, "public/penpot/code.js is out of sync.");
assert.equal(sourceUi, publicUi, "public/penpot/index.html is out of sync.");
assert.ok(sourceCode.includes(productionUiUrl), "Production code must open the HTTPS UI.");
assert.ok(!sourceCode.includes("http://localhost"), "Production code must not use localhost.");
assert.ok(localCode.includes(localUiUrl), "Local code must open the local UI.");
assert.ok(!localCode.includes(productionUiUrl), "Local code must not open the production UI.");

const expectedLocalCode = sourceCode.replace(productionUiUrl, localUiUrl);
assert.equal(localCode, expectedLocalCode, "code.local.js was not generated from code.js.");

for (const unsafeText of ["verificationUriComplete", "window.open(", ".innerHTML"]) {
  assert.ok(!sourceUi.includes(unsafeText), `UI must not contain ${unsafeText}.`);
}
for (const requiredText of [
  "event.source !== parent",
  "MAX_RESPONSE_LENGTH",
  "sanitizeSvg",
  "normalizeIconUrl",
  "insertionInProgress",
  "createAuthorizationUrl",
]) {
  assert.ok(sourceUi.includes(requiredText), `UI is missing ${requiredText}.`);
}

assert.equal(
  (sourceCode.match(/penpot\.ui\.onMessage\(/g) || []).length,
  1,
  "Main process must register exactly one message listener.",
);
assert.ok(sourceCode.includes("MAX_SVG_LENGTH"), "Main process must bound SVG payload size.");
assert.ok(sourceCode.includes("FORBIDDEN_SVG_MARKUP"), "Main process must validate SVG payloads.");

const scriptMatch = sourceUi.match(/<script>([\s\S]*)<\/script>\s*<\/body>/);
assert.ok(scriptMatch, "Could not locate the Penpot UI script.");
new Function(scriptMatch[1]);

const expectedPublicFiles = [
  "code.js",
  "code.local.js",
  "icon.png",
  "index.html",
  "manifest.json",
  "manifest.local.json",
];
const publicFiles = (await readdir(publicDirectory)).sort();
assert.deepEqual(publicFiles, expectedPublicFiles, "public/penpot contains stale or missing files.");

for (const fileName of ["manifest.json", "manifest.local.json", "icon.png"]) {
  const [sourceAsset, publicAsset] = await Promise.all([
    readFile(path.join(sourceDirectory, fileName)),
    readFile(path.join(publicDirectory, fileName)),
  ]);
  assert.ok(sourceAsset.equals(publicAsset), `${fileName} is out of sync.`);
}

const icon = await readFile(path.join(sourceDirectory, "icon.png"));
assert.equal(icon.toString("ascii", 1, 4), "PNG", "Plugin icon must be a PNG.");
const iconWidth = icon.readUInt32BE(16);
const iconHeight = icon.readUInt32BE(20);
assert.equal(iconWidth, iconHeight, "Plugin icon must be square.");
assert.ok(iconWidth >= 56, "Plugin icon must be at least 56x56 pixels.");

const nextConfig = await readFile(path.join(rootDirectory, "next.config.ts"), "utf8");
for (const requiredHeader of [
  'source: "/penpot/:path*"',
  '"Access-Control-Allow-Origin", value: "*"',
  '"Cross-Origin-Resource-Policy", value: "cross-origin"',
  '"Content-Security-Policy"',
]) {
  assert.ok(nextConfig.includes(requiredHeader), `next.config.ts is missing ${requiredHeader}.`);
}

console.log(
  `Penpot production checks passed (${iconWidth}x${iconHeight} icon, manifest v${manifest.version}).`,
);
