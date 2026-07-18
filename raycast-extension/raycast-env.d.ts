/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Output - The output format used by the primary copy and paste actions. */
  "defaultFormat": "react" | "svg" | "vue" | "svelte" | "tailwind" | "url",
  /** Classes - Classes added to generated React, SVG, Vue, Svelte, and Tailwind snippets. */
  "tailwindClasses": string,
  /** Legal-Safe Results - Only show icons marked legal-safe by IconSearch. */
  "legalOnly": boolean,
  /** Default Style - Style filter applied when the command opens. */
  "defaultStyle": "all" | "stroke" | "solid" | "duotone" | "twotone" | "sharp"
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `search-icons` command */
  export type SearchIcons = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `search-icons` command */
  export type SearchIcons = {}
}

