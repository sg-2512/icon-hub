import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "manifest.xml",
  "index.html",
  "src/main.ts",
  "src/svg.ts",
  "src/styles.css",
  "public/assets/iconsearch-logo-128.png",
];

const contents = new Map();
for (const file of requiredFiles) {
  contents.set(file, await readFile(resolve(root, file), file.endsWith(".png") ? null : "utf8"));
}

const manifest = String(contents.get("manifest.xml"));
const source = `${contents.get("src/main.ts")}\n${contents.get("src/svg.ts")}`;
const html = String(contents.get("index.html"));
const failures = [];

const expectText = (condition, message) => {
  if (!condition) failures.push(message);
};

expectText(manifest.includes("<Host Name=\"Presentation\""), "Manifest must target PowerPoint presentations.");
expectText(manifest.includes("<Permissions>ReadWriteDocument</Permissions>"), "Manifest must request ReadWriteDocument.");
expectText(manifest.includes("https://localhost:3007/index.html"), "Manifest must use the HTTPS development URL.");
expectText(manifest.includes("ImageCoercion"), "Manifest must declare ImageCoercion support.");
expectText(source.includes("Office.CoercionType.XmlSvg"), "Source must implement native SVG insertion.");
expectText(source.includes("Office.CoercionType.Image"), "Source must implement the PNG image fallback.");
expectText(source.includes("sanitizeSvg"), "Source must sanitize remote SVG markup.");
expectText(source.includes("https://iconsearch.info/api/icons"), "Source must use the public IconSearch API.");
expectText(html.includes("Content-Security-Policy"), "Task pane must define a content security policy.");

const secretPattern = /(sk_live|sk_test|service_role|supabase_service|client_secret|private_key|bearer\s+[a-z0-9._-]{16,})/i;
expectText(!secretPattern.test(`${manifest}\n${source}\n${html}`), "Potential secret or privileged credential found.");

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PowerPoint add-in checks passed (${requiredFiles.length} required files, no embedded secrets).`);
}
