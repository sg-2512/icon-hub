# IconSearch Adobe Express Add-on

Search IconSearch from an Adobe Express panel, preview SVG icons clearly, adjust size and color, then insert by click or drag into the canvas.

## What It Includes

- Adobe Express `manifestVersion: 2` add-on manifest.
- No-build HTML, CSS, and JavaScript source in `src/`.
- Public IconSearch API search with:
  - Search input
  - Library filter
  - Style filter
  - Commercial-safe toggle
  - Size slider
  - Color picker and swatches
- Large selected-icon preview and compact result cards.
- Click insertion through `addOnUISdk.app.document.addImage()`.
- Drag-to-document support through `addOnUISdk.app.enableDragToDocument()`.
- No local token storage and no embedded API keys.

## Local Checks

```bash
cd adobe-plugin
npm run check
node --check src/index.js
```

## Local Adobe Express Test

Adobe's current add-on flow supports both Code Playground and local CLI development.

### Option 1: Code Playground

1. Open Adobe Express.
2. Create or open a document.
3. Open **Add-ons**.
4. Enable add-on development mode if prompted.
5. Open **Code Playground** and switch to **Add-on Mode**.
6. Paste:
   - `src/index.html` into the HTML tab.
   - `src/styles.css` into the CSS tab.
   - `src/index.js` into the Iframe JS tab.
7. Run the add-on and test search, Insert, and drag-to-canvas.

### Option 2: Local CLI

```bash
cd adobe-plugin
npm run start
```

The script uses Adobe's `@adobe/ccweb-add-on-scripts` via `npx`. If you want a pinned local toolchain later, scaffold a project with:

```bash
npx @adobe/create-ccweb-add-on iconsearch-adobe --template javascript
```

Then copy this folder's `src/` files over the generated `src/` files.

## Publish Notes

When ready, package through Adobe's add-on tooling and submit through the Adobe Express add-on distribution flow. Keep the add-on free initially to reduce friction and use IconSearch branding, screenshots, and a short demo showing search, color, size, click insert, and drag-to-document.

## Safety

This add-on does not include Supabase keys, Vercel secrets, OAuth credentials, or IconSearch private tokens. It uses only:

- `https://iconsearch.info/api/icons`
- `https://express.adobe.com/static/add-on-sdk/sdk.js`
