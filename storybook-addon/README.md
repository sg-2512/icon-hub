# IconSearch Storybook Addon

Search IconSearch inside Storybook and copy production-ready icon snippets without leaving your component workspace.

## Install

```bash
npm install --save-dev storybook-addon-iconsearch
```

Add the addon to `.storybook/main.ts`:

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  addons: ["storybook-addon-iconsearch"],
};

export default config;
```

## Local Development

```bash
cd storybook-addon
npm install
npm run build
```

Use `npm link` or a workspace reference from a local Storybook app while testing.

## Features

- Secure IconSearch browser device sign-in for the `storybook` product.
- Fast panel search against `https://iconsearch.info/api/extension/icon-search`.
- Library, commercial-safety, and snippet-format controls.
- Copy React, SVG, Tailwind, Vue, Svelte, or URL output.

Before sign-in works in production, deploy the backend product migration for `storybook`.
