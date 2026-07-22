import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "dist/**",
    "scratch/**",
    "chrome-extension/**",
    "figma-plugin/**",
    "framer-plugin/**",
    "raycast-extension/dist/**",
    "raycast-extension/node_modules/**",
    "raycast-extension/raycast-env.d.ts",
    "storybook-addon/dist/**",
    "storybook-addon/node_modules/**",
    "canva-app/dist/**",
    "canva-app/node_modules/**",
    "tailwind-plugin/**",
    "webflow-extension/public/index.js",
    "webflow-extension/node_modules/**",
    "powerpoint-addin/dist/**",
    "powerpoint-addin/node_modules/**",
    "google-slides-addon/dist/**",
    "google-slides-addon/node_modules/**",
    "sketch-plugin/dist/**",
    "sketch-plugin/node_modules/**",
    "vscode-extension/**",
    "vscode-extension/out/**",
    "eslint-report*.json",
  ]),
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "warn",
      "react/jsx-no-comment-textnodes": "off",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    files: ["**/*.config.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
