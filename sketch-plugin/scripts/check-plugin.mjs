import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import JSZip from "jszip";

const root = resolve(import.meta.dirname, "..");
const bundleName = "IconSearch.sketchplugin";
const requiredFiles = [
  "dist/IconSearch.sketchplugin.zip",
  "dist/IconSearch.sketchplugin/Contents/Resources/icon.png",
  "dist/IconSearch.sketchplugin/Contents/Sketch/command.js",
  "dist/IconSearch.sketchplugin/Contents/Sketch/manifest.json",
  "dist/panel.html",
  "index.html",
  "package.json",
  "src/manifest.json",
  "src/native.ts",
  "src/panel.ts",
  "src/plugin.ts",
  "src/svg.ts"
];
const contents = new Map();
for (const filename of requiredFiles) {
  const binary = filename.endsWith(".png") || filename.endsWith(".zip");
  contents.set(filename, await readFile(resolve(root, filename), binary ? null : "utf8"));
}

const failures = [];
const expect = (condition, message) => {
  if (!condition) failures.push(message);
};
const manifest = JSON.parse(contents.get("src/manifest.json"));
const packageJson = JSON.parse(contents.get("package.json"));
const panelSource = contents.get("src/panel.ts");
const pluginSource = contents.get("src/plugin.ts");
const nativeSource = contents.get("src/native.ts");
const builtCommand = contents.get("dist/IconSearch.sketchplugin/Contents/Sketch/command.js");
const builtPanel = contents.get("dist/panel.html");
const icon = contents.get("dist/IconSearch.sketchplugin/Contents/Resources/icon.png");

expect(manifest.name === "IconSearch", "Manifest name must be IconSearch.");
expect(manifest.author === "IconSearch", "Manifest author must be IconSearch.");
expect(manifest.identifier === "info.iconsearch.sketch.plugin", "Manifest identifier is incorrect.");
expect(manifest.version === packageJson.version, "Manifest and package versions must match.");
expect(manifest.scope === "document", "Plugin must require an open Sketch document.");
expect(manifest.disableCocoaScriptPreprocessor === true, "Modern JavaScript plugins must disable the CocoaScript preprocessor.");
expect(manifest.commands?.length === 1 && manifest.commands[0]?.handler === "onRun", "Manifest must expose the onRun command.");
expect(!Object.hasOwn(manifest, "appcast"), "Do not ship a placeholder appcast URL.");
expect(!packageJson.dependencies?.skpm && !packageJson.devDependencies?.skpm, "The deprecated skpm package must not be required.");

expect(panelSource.includes("https://iconsearch.info/api/icons"), "Panel must use the public IconSearch API.");
expect(panelSource.includes("sanitizeSvg") && nativeSource.includes("sanitizeSvgForSketch"), "SVG must be validated in both panel and native contexts.");
expect(pluginSource.includes('createLayerFromData(payload.svg, "svg")'), "Plugin must import SVG as an editable Sketch layer.");
expect(pluginSource.includes("document.centerOnLayer(layer)"), "Plugin must reveal the inserted layer.");
expect(!/fetch\s*\(/.test(pluginSource), "Native command must not fetch external URLs.");
expect(!/authorization|bearer\s|api[_-]?key|access[_-]?token/i.test(`${panelSource}\n${pluginSource}`), "Plugin must not contain an account or token flow.");
expect(builtCommand.includes("data:text/html;charset=utf-8;base64,"), "Command bundle must contain the self-contained panel.");
expect(!builtCommand.includes("sourceMappingURL"), "Command bundle must not contain a source map.");
expect(!builtPanel.includes('/src/') && !builtPanel.includes('/assets/'), "Built panel contains local asset references.");
expect(icon.readUInt32BE(16) === 128 && icon.readUInt32BE(20) === 128, "Plugin icon must be a 128 by 128 PNG.");

const archive = await JSZip.loadAsync(contents.get("dist/IconSearch.sketchplugin.zip"));
const archiveFiles = Object.keys(archive.files).filter((filename) => !archive.files[filename].dir).sort();
const expectedArchiveFiles = [
  `${bundleName}/Contents/Resources/icon.png`,
  `${bundleName}/Contents/Sketch/command.js`,
  `${bundleName}/Contents/Sketch/manifest.json`,
].sort();
expect(JSON.stringify(archiveFiles) === JSON.stringify(expectedArchiveFiles), "Release ZIP contains unexpected files.");

const secretPattern = /(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk_(?:live|test)_[a-z0-9]{12,}|ghp_[a-z0-9]{20,}|service_role\s*[:=]\s*["'][^"']+|client_secret\s*[:=]\s*["'][^"']+|bearer\s+[a-z0-9._-]{20,})/i;
const scanned = requiredFiles.filter((filename) => !filename.endsWith(".png") && !filename.endsWith(".zip")).map((filename) => contents.get(filename)).join("\n");
expect(!secretPattern.test(scanned), "Potential secret or privileged credential found.");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Sketch plugin checks passed (${requiredFiles.length} required files, 3-file release ZIP, no embedded secrets).`);
}
