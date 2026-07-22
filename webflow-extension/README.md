# IconSearch for Webflow

Search the live IconSearch catalog from a Webflow Designer Extension, style an SVG icon, and insert it as a native Webflow Image element.

## Features

- Live search across IconSearch named libraries and Iconify collections.
- Library, icon style, and commercial-safety filters.
- Large selected preview plus clear two-column results.
- Size slider from 16px to 256px.
- Color picker and fast color presets.
- Insert before, inside, or after the selected Webflow element.
- Double-click a result for fast insertion.
- Uploads a sanitized SVG to the Webflow Assets panel and reuses cached assets.
- Applies reusable `iconsearch-icon-{size}` Webflow classes for predictable dimensions.
- Checks Designer mode and asset permissions before changing the site.
- No IconSearch account, API key, or private credential required.

## Requirements

- Node.js 22.13 or newer, matching the current Webflow CLI requirement.
- A free Webflow Developer Workspace or another Workspace where you can register apps.
- A Webflow test site.
- Workspace permission to register and install a Designer Extension.

## Local Development

1. Install dependencies:

   ```bash
   cd webflow-extension
   npm install
   ```

2. In Webflow Workspace settings, open **Apps & Integrations > Develop** and register an app named **IconSearch**.

3. Add a Designer Extension to that app.

4. Start the local extension:

   ```bash
   npm run dev
   ```

   Webflow serves Designer Extensions locally on `http://localhost:1337`.

5. Install the development app on a test site.

6. Open the site in Webflow Designer, press `E` to open Apps, and choose **Launch development app**.

7. Select a canvas element. Search for `home`, set size/color/placement, and click **Insert selected icon**. Double-clicking a result performs the same insertion.

## Verification

```bash
npm run check
npm run typecheck
npm run build
```

`npm test` runs all three checks.

Verify these cases inside Webflow:

1. **After selection** inserts an Image element after the selected element.
2. **Before selection** inserts before it.
3. **Inside selection** works for containers and reports a useful error for elements without children.
4. The SVG appears in Assets with an `iconsearch-` filename.
5. Repeating the same icon, color, and size reuses the existing asset.
6. The inserted element receives accessible alt text and a readable Navigator name.
7. Switching out of Design mode prevents insertion without uploading an asset.

## Build and Marketplace Bundle

```bash
npm run bundle
```

The Webflow CLI creates the extension bundle from the `public` directory. Upload that bundle from the registered app dashboard, test the uploaded Workspace version, then submit the app through Webflow Marketplace review.

Marketplace assets still need to be supplied in the Webflow dashboard: app icon, screenshots, short description, support URL, privacy URL, and terms URL.

## Insertion Model

Webflow Designer Extensions run in a secure iframe. Webflow documents programmatic element insertion but does not document cross-iframe drag-to-canvas insertion. This extension therefore uses reliable click and double-click insertion with an explicit Before/Inside/After control.

## Safety

- Calls only `https://iconsearch.info/api/icons` and HTTPS SVG sources returned by that endpoint.
- Removes scripts, foreign objects, embedded frames, event handlers, inline styles, and unsafe external references from SVG markup before upload.
- Does not contain Supabase keys, OAuth secrets, bearer tokens, or private API keys.
- Stores only a small local mapping between an icon/color/size signature and the Webflow asset ID, capped at 250 entries.
- All site mutations happen only after explicit user insertion and Webflow capability checks.
