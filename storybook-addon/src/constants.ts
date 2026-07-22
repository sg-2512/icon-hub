export const ADDON_ID = "iconsearch/storybook-addon";
export const PANEL_ID = `${ADDON_ID}/panel`;
export const PRODUCT = "storybook";
export const SESSION_KEY = "iconsearch:storybook:session";
export const PENDING_KEY = "iconsearch:storybook:pending-device-code";
export const API_BASE =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as { ICONSEARCH_API_BASE?: unknown }).ICONSEARCH_API_BASE === "string"
    ? String((globalThis as { ICONSEARCH_API_BASE?: unknown }).ICONSEARCH_API_BASE).replace(/\/+$/, "")
    : "https://iconsearch.info";

export const LIBRARIES = [
  ["all", "All libraries"],
  ["lucide-icons", "Lucide"],
  ["heroicons", "Heroicons"],
  ["tabler-icons", "Tabler"],
  ["bootstrap-icons", "Bootstrap"],
  ["phosphor-icons", "Phosphor"],
  ["remix-icon", "Remix"],
  ["iconify", "Iconify"],
] as const;
