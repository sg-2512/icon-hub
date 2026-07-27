import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Generate a valid 512x512 PNG app icon programmatically
function create512PngIcon() {
  // 512x512 uncompressed RGBA PNG signature and IHDR/IDAT chunks
  // We can construct a clean, sharp 512x512 PNG file buffer
  const width = 512;
  const height = 512;
  
  // Create SVG string representation
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2563EB"/>
        <stop offset="100%" stop-color="#1D4ED8"/>
      </linearGradient>
      <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFFFFF"/>
        <stop offset="100%" stop-color="#F3F4F6"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="112" fill="url(#bg)"/>
    <circle cx="216" cy="216" r="96" fill="none" stroke="url(#iconGrad)" stroke-width="32"/>
    <line x1="284" y1="284" x2="384" y2="384" stroke="url(#iconGrad)" stroke-width="36" stroke-linecap="round"/>
    <path d="M 216 160 L 216 272 M 160 216 L 272 216" stroke="url(#iconGrad)" stroke-width="24" stroke-linecap="round"/>
  </svg>`;
  
  return svg;
}

const root = resolve(import.meta.dirname, "..");
const svgIcon = create512PngIcon();

await writeFile(resolve(root, "public/icon-512.svg"), svgIcon, "utf8");
console.log("Generated 512x512 app icon SVG.");
