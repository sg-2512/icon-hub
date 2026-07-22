# IconSearch Shopify Theme App Extension

Add a draggable, styled icon row to Shopify Online Store 2.0 themes.

## What It Includes

- Theme app block: `Icon row`.
- Storefront rendering for saved IconSearch icon IDs.
- Shopify theme editor helper with:
  - Icon search
  - Library and style filters
  - Legal-safe toggle
  - Size and color controls
  - Drag-and-drop selected tray
  - Reorder by dragging selected chips
  - Copy generated icon ID list for the block setting
- Merchant settings for heading, icon IDs, size, color, spacing, alignment, labels, and helper visibility.

## Local Checks

```bash
cd shopify-extension
npm run check
node --check assets/iconsearch-shopify.js
```

## Local Shopify Test

This folder is a theme app extension. In a real Shopify app workspace, place it under:

```text
extensions/iconsearch-theme
```

Then run:

```bash
shopify app dev
```

In the theme editor:

1. Open a theme that supports app blocks.
2. Add the **Icon row** app block.
3. Drag the app block to the desired position in the theme editor.
4. Use the helper panel to search icons.
5. Drag icons into the helper tray and reorder them.
6. Adjust size and color.
7. Click **Copy selected IDs**.
8. Paste the copied IDs into the block's **Icon IDs** setting.
9. Save the theme.

## Why Copy IDs?

Shopify theme app block settings are controlled by the theme editor. The helper can update the live preview, but it cannot silently write permanent merchant settings. Copying the ID list keeps the flow review-safe and transparent.

## Publish

After testing in a Shopify app workspace:

```bash
shopify app deploy
```

Shopify theme app extensions are exposed in the theme editor after the app is installed. Merchants can add and reorder app blocks without editing theme code.

