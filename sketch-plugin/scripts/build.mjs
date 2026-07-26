import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";
import JSZip from "jszip";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, "dist");
const bundleName = "IconSearch.sketchplugin";
const bundleDirectory = resolve(outputDirectory, bundleName);
const sketchDirectory = resolve(bundleDirectory, "Contents/Sketch");
const resourcesDirectory = resolve(bundleDirectory, "Contents/Resources");

await rm(outputDirectory, { force: true, recursive: true });
await Promise.all([
  mkdir(sketchDirectory, { recursive: true }),
  mkdir(resourcesDirectory, { recursive: true }),
]);

const panelBundle = await build({
  bundle: true,
  entryPoints: [resolve(root, "src/panel.ts")],
  format: "iife",
  legalComments: "none",
  minify: true,
  outfile: resolve(outputDirectory, "panel.js"),
  platform: "browser",
  target: ["safari15"],
  write: false,
});
const panelJavaScript = panelBundle.outputFiles.find((file) => file.path.endsWith(".js"));
if (!panelJavaScript) throw new Error("The panel bundle did not produce JavaScript.");

const [template, stylesheet, logo, manifestSource] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "src/panel.css"), "utf8"),
  readFile(resolve(root, "public/assets/iconsearch-logo-128.png")),
  readFile(resolve(root, "src/manifest.json"), "utf8"),
]);
JSON.parse(manifestSource);

const escapedJavaScript = panelJavaScript.text.replace(/<\/script/gi, "<\\/script");
const panelHtml = template
  .replace('<link rel="stylesheet" href="/src/panel.css" />', `<style>${stylesheet}</style>`)
  .replaceAll('/assets/iconsearch-logo-128.png', `data:image/png;base64,${logo.toString("base64")}`)
  .replace('<script type="module" src="/src/panel.ts"></script>', `<script>${escapedJavaScript}</script>`);
if (panelHtml.includes('/src/') || panelHtml.includes('/assets/')) throw new Error("The built panel contains local asset references.");

const panelUrl = `data:text/html;charset=utf-8;base64,${Buffer.from(panelHtml, "utf8").toString("base64")}`;
const commandBundle = await build({
  bundle: true,
  define: { __ICONSEARCH_PANEL_URL__: JSON.stringify(panelUrl) },
  entryPoints: [resolve(root, "src/plugin.ts")],
  external: ["sketch", "sketch/*"],
  format: "cjs",
  legalComments: "none",
  minify: true,
  outfile: resolve(outputDirectory, "command.js"),
  platform: "node",
  target: ["node16"],
  write: false,
});
const commandJavaScript = commandBundle.outputFiles.find((file) => file.path.endsWith(".js"));
if (!commandJavaScript) throw new Error("The Sketch command bundle did not produce JavaScript.");

await Promise.all([
  writeFile(resolve(sketchDirectory, "command.js"), commandJavaScript.contents),
  writeFile(resolve(sketchDirectory, "manifest.json"), manifestSource, "utf8"),
  writeFile(resolve(resourcesDirectory, "icon.png"), logo),
  writeFile(resolve(outputDirectory, "panel.html"), panelHtml, "utf8"),
]);

const zip = new JSZip();
zip.file(`${bundleName}/Contents/Sketch/command.js`, commandJavaScript.contents);
zip.file(`${bundleName}/Contents/Sketch/manifest.json`, manifestSource);
zip.file(`${bundleName}/Contents/Resources/icon.png`, logo);
const archive = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE", compressionOptions: { level: 9 } });
await writeFile(resolve(outputDirectory, `${bundleName}.zip`), archive);

console.log(`Built ${bundleName} and ${bundleName}.zip (${archive.length.toLocaleString()} bytes).`);
