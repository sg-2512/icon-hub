# IconSearch for Penpot

Search 355,000+ icons and insert sanitized, editable SVG vectors directly into a Penpot canvas.

## Production files

- `manifest.json`: Penpot manifest v2 with relative production assets
- `code.js`: Penpot main process; opens the hosted HTTPS UI
- `index.html`: hosted plugin UI
- `icon.png`: square plugin icon

`npm run sync:penpot` copies these files to `public/penpot` and generates the local-only `code.local.js`.

## Confirm locally

1. From the repository root, run `npm run test:penpot`.
2. Run `npm run dev`.
3. Confirm `http://localhost:3000/penpot/manifest.local.json` opens and references `code.local.js`.
4. In a Penpot design file, open the Plugin Manager (`Ctrl+Alt+P`, or `Cmd+Option+P` on macOS).
5. Install a plugin from this manifest URL:

   `http://localhost:3000/penpot/manifest.local.json`

6. Run IconSearch, connect, search for an icon, and select **Insert into Penpot**.
7. Confirm one editable vector is created at the viewport center and selected in the Layers panel.

The local manifest is only for development. Do not submit it to Penpot.

## Production verification

After deploying the site, verify:

- `https://iconsearch.info/penpot/manifest.json`
- `https://iconsearch.info/penpot/code.js`
- `https://iconsearch.info/penpot/index.html`
- `https://iconsearch.info/penpot/icon.png`

The manifest is a URL-based Penpot installation; there is no plugin bundle to upload.
