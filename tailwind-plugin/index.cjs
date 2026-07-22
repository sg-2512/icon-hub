"use strict";

const plugin = require("tailwindcss/plugin");
const { assertConnected } = require("./auth.cjs");

const DEFAULT_PREFIX = "is-icon";
const DEFAULT_SOURCE = "iconsearch";
const DEFAULT_ICONIFY_BASE_URL = "https://iconsearch.info/api/svg";
const DEFAULT_ICONSEARCH_BASE_URL = "https://iconsearch.info/api/svg";
const DEFAULT_ICONSEARCH_CACHE_VERSION = "v1";


const DEFAULT_COLLECTIONS = Object.freeze({
  "ant-design": "ant-design",
  "ant-design-icons": "ant-design",
  antd: "ant-design",
  bi: "bi",
  bootstrap: "bi",
  "bootstrap-icons": "bi",
  feather: "feather",
  "feather-icons": "feather",
  heroicons: "heroicons",
  "heroicons-outline": "heroicons-outline",
  "heroicons-solid": "heroicons-solid",
  iconoir: "iconoir",
  ion: "ion",
  ionicons: "ion",
  lucide: "lucide",
  "lucide-icons": "lucide",
  octicon: "octicon",
  octicons: "octicon",
  patternfly: "patternfly",
  "patternfly-icons": "patternfly",
  ph: "ph",
  phosphor: "ph",
  "phosphor-icons": "ph",
  remix: "ri",
  "remix-icon": "ri",
  ri: "ri",
  tabler: "tabler",
  "tabler-icons": "tabler",
});

const iconSearchTailwind = plugin.withOptions(
  (options = {}) =>
    function iconSearchTailwindPlugin({ matchUtilities }) {
      assertConnected();
      const prefix = normalizeUtilityPrefix(options.prefix);
      const values = isPlainObject(options.icons) ? options.icons : {};

      matchUtilities(
        {
          [prefix]: (value) => createIconUtility(value, options),
        },
        { values },
      );
    },
);

function createIconUtility(value, options = {}) {
  const url = buildIconMaskUrl(value, options);
  const size = normalizeScale(options.scale);
  const verticalAlign = normalizeCssValue(options.verticalAlign, "-0.125em");
  const extraProperties = isPlainObject(options.extraProperties) ? options.extraProperties : {};

  return {
    display: "inline-block",
    width: size,
    height: size,
    "vertical-align": verticalAlign,
    "background-color": "currentColor",
    "mask": `url("${url}") no-repeat center / contain`,
    "-webkit-mask": `url("${url}") no-repeat center / contain`,
    ...extraProperties,
  };
}

function buildIconMaskUrl(value, options = {}) {
  const parsed = parseIconValue(value, options);
  if (parsed.url) return parsed.url;

  const source = normalizeSource(options.source);
  if (source === "iconsearch") {
    const baseUrl = normalizeBaseUrl(options.iconSearchBaseUrl, DEFAULT_ICONSEARCH_BASE_URL);
    const cacheVersion = normalizeCssValue(options.cacheVersion, DEFAULT_ICONSEARCH_CACHE_VERSION);
    const path = `${encodeURIComponent(parsed.collection)}/${encodeURIComponent(parsed.name)}`;
    return `${baseUrl}/${path}?v=${encodeURIComponent(cacheVersion)}`;
  }

  const baseUrl = normalizeBaseUrl(options.iconifyBaseUrl, DEFAULT_ICONIFY_BASE_URL);
  const collection = resolveIconifyCollection(parsed.collection, options.collections);
  return `${baseUrl}/${encodeURIComponent(collection)}/${encodeURIComponent(parsed.name)}.svg`;
}

function parseIconValue(value, options = {}) {
  const raw = unwrapQuotes(String(value || "").trim());
  if (!raw) {
    throw new Error("IconSearch Tailwind expected an icon value like lucide--home.");
  }

  if (isSafeUrl(raw)) {
    return { url: raw };
  }

  const normalized = raw.replace(/\.svg$/i, "");
  const defaultCollection = normalizeSegment(options.defaultCollection || "");
  const split = splitIconReference(normalized);

  if (split) {
    return {
      collection: normalizeSegment(split.collection),
      name: normalizeIconName(split.name),
    };
  }

  if (defaultCollection) {
    return {
      collection: defaultCollection,
      name: normalizeIconName(normalized),
    };
  }

  throw new Error(`IconSearch Tailwind could not parse "${raw}". Use collection--name, collection:name, or configure defaultCollection.`);
}

function splitIconReference(value) {
  const separators = ["--", ":", "/"];

  for (const separator of separators) {
    const index = value.indexOf(separator);
    if (index > 0 && index < value.length - separator.length) {
      return {
        collection: value.slice(0, index),
        name: value.slice(index + separator.length),
      };
    }
  }

  return null;
}

function resolveIconifyCollection(collection, customCollections) {
  const normalized = normalizeSegment(collection);
  const custom = isPlainObject(customCollections) ? customCollections : {};
  const customMatch = custom[collection] || custom[normalized];
  if (customMatch) return normalizeSegment(customMatch);
  if (normalized.startsWith("iconify-")) return normalizeSegment(normalized.replace(/^iconify-/, ""));
  return DEFAULT_COLLECTIONS[normalized] || normalized.replace(/-icons?$/, "");
}

function normalizeUtilityPrefix(prefix) {
  const normalized = String(prefix || DEFAULT_PREFIX).trim();
  return normalized || DEFAULT_PREFIX;
}

function normalizeSource(source) {
  return source === "iconsearch" ? "iconsearch" : DEFAULT_SOURCE;
}

function normalizeScale(scale) {
  if (scale === undefined || scale === null || scale === "") return "1em";
  const value = String(scale).trim();
  if (!value) return "1em";
  return /^-?\d*\.?\d+$/.test(value) ? `${value}em` : value;
}

function normalizeBaseUrl(value, fallback) {
  return String(value || fallback).replace(/\/+$/, "");
}

function normalizeCssValue(value, fallback) {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function normalizeSegment(value) {
  return String(value || "")
    .trim()
    .replace(/_/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function normalizeIconName(value) {
  const normalized = String(value || "")
    .trim()
    .replace(/_/g, "-")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalized) {
    throw new Error("IconSearch Tailwind expected a non-empty icon name.");
  }

  return normalized;
}

function unwrapQuotes(value) {
  return value.replace(/^["']|["']$/g, "");
}

function isSafeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch (_error) {
    return false;
  }
}

function isPlainObject(value) {
  return Boolean(value) && Object.prototype.toString.call(value) === "[object Object]";
}

iconSearchTailwind.buildIconMaskUrl = buildIconMaskUrl;
iconSearchTailwind.createIconUtility = createIconUtility;
iconSearchTailwind.parseIconValue = parseIconValue;

module.exports = iconSearchTailwind;
