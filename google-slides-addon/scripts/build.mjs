import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "esbuild";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(root, "dist");

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

const bundle = await build({
  bundle: true,
  entryPoints: [resolve(root, "src/main.ts")],
  format: "iife",
  legalComments: "none",
  minify: true,
  outfile: resolve(outputDirectory, "Sidebar.js"),
  platform: "browser",
  target: ["es2020"],
  write: false,
});
const javascript = bundle.outputFiles.find((file) => file.path.endsWith(".js"));
if (!javascript) throw new Error("The browser bundle did not produce JavaScript.");

const [template, stylesheet, logo, serverCode, manifest] = await Promise.all([
  readFile(resolve(root, "index.html"), "utf8"),
  readFile(resolve(root, "src/styles.css"), "utf8"),
  readFile(resolve(root, "public/assets/iconsearch-logo-128.png")),
  readFile(resolve(root, "apps-script/Code.gs"), "utf8"),
  readFile(resolve(root, "apps-script/appsscript.json"), "utf8"),
]);

const escapedJavascript = javascript.text.replace(/<\/script/gi, "<\\/script");
const sidebar = template
  .replace('<link rel="stylesheet" href="/src/styles.css" />', `<style>${stylesheet}</style>`)
  .replace('/assets/iconsearch-logo-128.png', `data:image/png;base64,${logo.toString("base64")}`)
  .replace('<script type="module" src="/src/main.ts"></script>', `<script>${escapedJavascript}</script>`);

if (sidebar.includes('/src/') || sidebar.includes('/assets/')) {
  throw new Error("The Apps Script sidebar still contains local asset references.");
}

await Promise.all([
  writeFile(resolve(outputDirectory, "Sidebar.html"), sidebar, "utf8"),
  writeFile(resolve(outputDirectory, "Code.gs"), serverCode, "utf8"),
  writeFile(resolve(outputDirectory, "appsscript.json"), manifest, "utf8"),
]);

console.log("Built dist/ with Code.gs, Sidebar.html, and appsscript.json.");
