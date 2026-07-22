import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const requiredFiles = [
  "shopify.extension.toml",
  "blocks/icon-row.liquid",
  "assets/iconsearch-shopify.js",
  "assets/iconsearch-shopify.css",
  "locales/en.default.json",
  "locales/en.default.schema.json",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
}

const toml = readFileSync(join(root, "shopify.extension.toml"), "utf8");
if (!/type\s*=\s*"theme"/.test(toml)) {
  throw new Error('shopify.extension.toml must contain type = "theme"');
}

const liquid = readFileSync(join(root, "blocks/icon-row.liquid"), "utf8");
for (const token of ['"target": "section"', '"stylesheet": "iconsearch-shopify.css"', '"javascript": "iconsearch-shopify.js"']) {
  if (!liquid.includes(token)) {
    throw new Error(`Block schema is missing ${token}`);
  }
}

const blockNameMatch = liquid.match(/"name":\s*"([^"]+)"/);
if (!blockNameMatch) {
  throw new Error("Block schema is missing a name.");
}
if (blockNameMatch[1].length > 25) {
  throw new Error("Shopify recommends app block names under 25 characters.");
}

JSON.parse(readFileSync(join(root, "locales/en.default.json"), "utf8"));
JSON.parse(readFileSync(join(root, "locales/en.default.schema.json"), "utf8"));

console.log("IconSearch Shopify extension check passed.");
