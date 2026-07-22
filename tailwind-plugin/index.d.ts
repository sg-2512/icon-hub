import type { PluginAPI } from "tailwindcss/types/config";

type IconSource = "iconify" | "iconsearch";

export type IconSearchTailwindOptions = {
  /**
   * Utility prefix. The default creates classes such as `is-icon-[lucide--home]`.
   */
  prefix?: string;
  /**
   * Default icon size. Numbers are treated as em values. Defaults to `1em`.
   */
  scale?: number | string;
  /**
   * Icon URL source. `iconify` gives broad coverage; `iconsearch` points at IconSearch preview paths.
   */
  source?: IconSource;
  /**
   * Base URL for Iconify-compatible SVG requests.
   */
  iconifyBaseUrl?: string;
  /**
   * Base URL for IconSearch-hosted SVG preview requests.
   */
  iconSearchBaseUrl?: string;
  /**
   * Cache version query for IconSearch preview URLs.
   */
  cacheVersion?: string;
  /**
   * Collection used when classes omit the collection name.
   */
  defaultCollection?: string;
  /**
   * Named icon shortcuts for clean classes such as `is-icon-home`.
   */
  icons?: Record<string, string>;
  /**
   * Library aliases mapped to Iconify collection prefixes.
   */
  collections?: Record<string, string>;
  /**
   * Vertical alignment for generated icons. Defaults to `-0.125em`.
   */
  verticalAlign?: string;
  /**
   * Extra CSS declarations merged into every generated icon utility.
   */
  extraProperties?: Record<string, string | number>;
};

declare const plugin: {
  (options?: IconSearchTailwindOptions): {
    handler: (api: PluginAPI) => void;
    config?: Record<string, unknown>;
  };
  __isOptionsFunction?: true;
  buildIconMaskUrl(value: string, options?: IconSearchTailwindOptions): string;
  createIconUtility(value: string, options?: IconSearchTailwindOptions): Record<string, string | number>;
  parseIconValue(value: string, options?: IconSearchTailwindOptions): { url: string } | { collection: string; name: string };
};

export = plugin;
