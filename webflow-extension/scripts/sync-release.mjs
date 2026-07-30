import { copyFile, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const extensionRoot = resolve(import.meta.dirname, "..");
const publishedRoot = resolve(extensionRoot, "..", "public", "webflow");

await mkdir(publishedRoot, { recursive: true });

const releaseFiles = [
  ["bundle.zip", "bundle.zip"],
  ["public/index.css", "index.css"],
  ["public/index.html", "index.html"],
  ["public/index.js", "index.js"],
  ["webflow.json", "webflow.json"],
];

await Promise.all(
  releaseFiles.map(([source, destination]) =>
    copyFile(resolve(extensionRoot, source), resolve(publishedRoot, destination))
  )
);

const obsoleteFiles = [
  "icon-512.png",
  "icon-512.svg",
  "icon-900.png",
  "index.css.map",
  "index.js.map",
  "screenshot-1.png",
  "screenshot-2.png",
  "screenshot-3.png",
  "screenshot-4.png",
  "screenshot-5.png",
  "style.css",
];

await Promise.all(
  obsoleteFiles.map((file) => rm(resolve(publishedRoot, file), { force: true }))
);

console.log("Synced the verified Webflow release to public/webflow.");
