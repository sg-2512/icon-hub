import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const sourceDirectory = path.join(rootDirectory, "penpot-plugin");
const publicDirectory = path.join(rootDirectory, "public", "penpot");
const productionUiUrl = "https://iconsearch.info/penpot/index.html";
const localUiUrl = "http://localhost:3000/penpot/index.html";

await mkdir(publicDirectory, { recursive: true });

for (const fileName of ["manifest.json", "manifest.local.json", "index.html", "icon.png"]) {
  await copyFile(path.join(sourceDirectory, fileName), path.join(publicDirectory, fileName));
}

const productionCode = await readFile(path.join(sourceDirectory, "code.js"), "utf8");
if (!productionCode.includes(productionUiUrl)) {
  throw new Error(`Expected production Penpot UI URL ${productionUiUrl} in code.js.`);
}
if (productionCode.includes("http://localhost")) {
  throw new Error("Production Penpot code.js must not contain a localhost URL.");
}

await writeFile(path.join(publicDirectory, "code.js"), productionCode, "utf8");
await writeFile(
  path.join(publicDirectory, "code.local.js"),
  productionCode.replace(productionUiUrl, localUiUrl),
  "utf8",
);

console.log("Synced production and local Penpot plugin assets to public/penpot.");
