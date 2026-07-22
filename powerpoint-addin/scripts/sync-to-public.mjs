import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const distDir = resolve(root, "dist");
const targetDir = resolve(root, "..", "public", "powerpoint");

try {
  await mkdir(targetDir, { recursive: true });
  await cp(distDir, targetDir, { recursive: true });
  console.log(`Synced PowerPoint add-in dist to ${targetDir}`);
} catch (error) {
  console.error("Failed to sync PowerPoint add-in dist to public:", error);
  process.exitCode = 1;
}
