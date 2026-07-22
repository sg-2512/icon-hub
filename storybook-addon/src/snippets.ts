import { fetchSvgMarkup } from "./api";
import type { IconSearchIcon, OutputFormat } from "./types";

export async function createSnippet(icon: IconSearchIcon, format: OutputFormat): Promise<string> {
  if (format === "url") return icon.svgUrl;
  if (format === "svg") return await fetchSvgMarkup(icon);
  if (format === "react") return createReactSnippet(icon);
  if (format === "tailwind") {
    return `<span class="inline-block size-5 bg-current" style="mask: url('${escapeAttribute(icon.svgUrl)}') center / contain no-repeat; -webkit-mask: url('${escapeAttribute(icon.svgUrl)}') center / contain no-repeat;" role="img" aria-label="${escapeAttribute(icon.name)}"></span>`;
  }
  if (format === "vue") {
    return `<template>\n  <img src="${escapeAttribute(icon.svgUrl)}" alt="${escapeAttribute(icon.name)}" class="size-5" />\n</template>`;
  }
  return `<img src="${escapeAttribute(icon.svgUrl)}" alt="${escapeAttribute(icon.name)}" class="size-5" />`;
}

function createReactSnippet(icon: IconSearchIcon): string {
  const usage = icon.reactUsage || `<${toPascalCase(icon.name)} className="size-5" />`;
  const importText = normalizeReactImport(icon.reactImport);
  return importText ? `${importText}\n\n${usage}` : usage;
}

function normalizeReactImport(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim().replace(/;$/, "");
  const sideEffectMatch = /^import\s+['"]([^'"]+)['"]$/.exec(trimmed);
  if (sideEffectMatch) return `import '${sideEffectMatch[1]}';`;
  return `${trimmed};`;
}

function toPascalCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function escapeAttribute(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
