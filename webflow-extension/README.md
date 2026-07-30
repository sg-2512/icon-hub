# IconSearch for Webflow

Search the live IconSearch catalog from a Webflow Designer Extension, style an SVG icon, and insert it as a native Webflow Image element.

## Features

- Live search across IconSearch named libraries and Iconify collections.
- Library, icon style, and commercial-safety filters.
- Explicit IconSearch account pairing and explicit Search action before catalog requests begin.
- Large selected preview plus clear two-column results.
- Size slider from 16px to 512px.
- Color picker and fast color presets.
- Double-click a result for fast insertion.
- Uploads a sanitized SVG to the Webflow Assets panel and inserts it inside the selected container.
- Adds accessible alt text, dimensions, and a readable Navigator name where the selected Webflow element supports them.
- Does not request or transmit a Webflow user ID token.

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

7. Select a canvas container, click **Sign in with IconSearch**, complete pairing, enter `home`, and press **Search**.

8. Set the size and color, then click the `+` control or double-click the result to insert it.

## Verification

```bash
npm run check
npm run typecheck
npm run build
```

`npm test` builds the production files, runs the SVG security tests, runs the
Webflow insertion regression test, and audits the generated extension.

Verify these cases inside Webflow:

1. Launching the extension makes no authentication or catalog network request.
2. **Sign in with IconSearch** starts pairing only after the button is pressed.
3. Completing pairing does not search until **Search** is pressed.
4. Insertion works inside a selected container and reports a useful error for elements that cannot contain an Image.
5. The sanitized SVG appears in Assets with an icon-derived filename.
6. The inserted element receives accessible alt text, the requested dimensions, and a readable Navigator name.
7. Signing out clears in-memory search results and aborts an active search.

## Build and Marketplace Bundle

```bash
npm run bundle
```

The Webflow CLI creates the extension bundle from the `public` directory. Upload that bundle from the registered app dashboard, test the uploaded Workspace version, then submit the app through Webflow Marketplace review.

Marketplace assets still need to be supplied in the Webflow dashboard: app icon, screenshots, short description, support URL, privacy URL, and terms URL.

## Insertion Model

Webflow Designer Extensions run in a secure iframe. Webflow documents
programmatic element insertion but does not document cross-iframe
drag-to-canvas insertion. IconSearch therefore uses explicit click insertion
inside the selected Webflow container.

## Safety

- Makes no IconSearch authentication or catalog request on extension load.
- Starts IconSearch device pairing only after the user selects **Sign in with IconSearch**.
- Builds the authorization URL locally as `https://iconsearch.info/connect?product=webflow&code=...`; server-supplied redirect URLs are not accepted.
- Searches only after the user submits the search form. The bearer value sent to IconSearch is an opaque IconSearch extension-session token, not a Webflow ID token.
- Accepts SVGs only from the HTTPS IconSearch host allowlist and enforces a 1 MB response limit.
- Removes scripts, external links, `image`, `feImage`, and `style` elements, inline style attributes, and non-fragment `url(...)` references before upload.
- Contains no Supabase keys, OAuth secrets, Webflow ID tokens, private API keys, or production source maps.
- All site mutations happen only after explicit user insertion and Webflow capability checks.
