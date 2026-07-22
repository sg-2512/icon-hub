# IconSearch for Google Slides

A classic Google Slides Editor add-on that searches the public IconSearch catalog, styles an icon, converts the sanitized SVG to a transparent PNG in the sidebar, and inserts it into the current slide.

## Features

- Mixed-library search with library, style, and commercial-safety filters.
- Progressive two-column previews sized for Google Slides' 300 px sidebar.
- Point-size, exact color, quick swatch, and placement controls.
- Transparent PNG insertion with accessible title and description metadata.
- No IconSearch account, API key, analytics, advertising, or payment code.
- Least-privilege `presentations.currentonly` and `script.container.ui` scopes only.

Google Slides does not accept SVG blobs through `insertImage`, so the browser sidebar sanitizes and rasterizes the selected SVG. Apps Script receives a bounded PNG payload and never fetches an external URL.

## Local browser preview

```powershell
cd google-slides-addon
npm install
npm run dev-server
```

Open `http://localhost:3008`. Search and styling work in browser preview mode; insertion is enabled only inside Google Slides.

## Local Google Slides test

1. Create a standalone Apps Script project at `script.google.com` and copy its script ID from **Project Settings**.
2. Copy `.clasp.json.example` to `.clasp.json` and replace `YOUR_SCRIPT_ID`. This local file is ignored by Git.
3. Run `npm run login`, `npm run verify`, and `npm run push`.
4. In the Apps Script editor, choose **Deploy > Test deployments**.
5. Enable **Editor add-on**, select **Latest Code**, choose a Google Slides test presentation, and save the test.
6. Open that presentation, authorize the two requested scopes, then use **Extensions > IconSearch > Open IconSearch**.
7. Search, change filters, color, size, and placement, then insert onto several slide layouts and custom page sizes.

The `dist` directory contains the only three files sent to Apps Script: `Code.gs`, `Sidebar.html`, and `appsscript.json`.

## Verification

```powershell
npm run verify
npm audit --omit=dev
```

`verify` runs strict TypeScript, sanitizer tests, the production build, scope checks, package-content checks, and a static secret scan.

## Public release

Public distribution requires a standard Google Cloud project, configured OAuth consent screen, Workspace Marketplace SDK configuration, listing assets, reviewer instructions, and Google review. See [MARKETPLACE.md](./MARKETPLACE.md) for the release checklist.
