# IconSearch Tailwind Plugin

Use IconSearch-compatible icon names as Tailwind CSS utilities. A free IconSearch account is required so the same account can carry free, Founder, and future paid-plan entitlements across every integration.

```html
<span class="is-icon-[lucide--home] text-xl text-sky-600"></span>
<span class="is-icon-[tabler--brand-github] text-2xl text-zinc-900"></span>
```

The generated icon uses `currentColor`, so color it with Tailwind text utilities and scale it with font-size utilities like `text-xl`.

## Requirements

- Node.js 18.18 or newer
- Tailwind CSS 3.4 or newer, including Tailwind CSS 4
- Free IconSearch account

## Install

```bash
npm install -D @iconsearch/tailwind
```

## Connect Your Free Account

```bash
npx @iconsearch/tailwind login
```

The command opens `iconsearch.info` in your browser. Create an account or sign in, approve Tailwind access, and return to the terminal. Verify the connected account with:

```bash
npx @iconsearch/tailwind whoami
```

The revocable product session is stored in your operating-system user profile, outside the project. It is never added to generated CSS or browser JavaScript.

## Tailwind CSS 4

Add the plugin in your CSS:

```css
@import "tailwindcss";
@plugin "@iconsearch/tailwind";
```

Then use dynamic icon selectors:

```html
<span class="is-icon-[lucide--search] text-lg text-slate-700"></span>
```

## Tailwind CSS 3

Add the plugin to `tailwind.config.js`:

```js
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx,vue,svelte}"],
  plugins: [require("@iconsearch/tailwind")],
};
```

## Options

Tailwind CSS 4:

```css
@plugin "@iconsearch/tailwind" {
  prefix: "iconsearch";
  scale: 1.2;
}
```

Tailwind CSS 3:

```js
module.exports = {
  plugins: [
    require("@iconsearch/tailwind")({
      prefix: "iconsearch",
      scale: 1.2,
      defaultCollection: "lucide",
      icons: {
        home: "lucide--home",
        search: "lucide--search",
      },
    }),
  ],
};
```

Supported icon references:

- `lucide--home`
- `lucide:home`
- `lucide/home`
- `home` when `defaultCollection` is configured
- Full `https://...svg` URLs

By default, the plugin emits Iconify-compatible SVG URLs because that gives broad coverage across IconSearch libraries. Use `source: "iconsearch"` if you want URLs pointed at IconSearch preview paths:

```js
require("@iconsearch/tailwind")({
  source: "iconsearch",
  iconSearchBaseUrl: "https://iconsearch.info/api/icon-preview",
});
```

## Output

`is-icon-[lucide--home]` generates CSS like:

```css
.is-icon-\[lucide--home\] {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: -0.125em;
  background-color: currentColor;
  mask: url("https://api.iconify.design/lucide/home.svg") no-repeat center / contain;
  -webkit-mask: url("https://api.iconify.design/lucide/home.svg") no-repeat center / contain;
}
```

## Development

```bash
npm test
npm run pack:dry
```

## CI Builds

Create a revocable Tailwind product token from an approved IconSearch account and store it in the CI provider's secret manager:

```bash
ICONSEARCH_TOKEN=your-revocable-product-token
```

Never commit the token or an `.npmrc` file containing npm credentials.

## Disconnect

```bash
npx @iconsearch/tailwind logout
```
