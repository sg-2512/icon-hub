# Publish IconSearch to the Penpot Hub

Penpot plugins are hosted externally and submitted with a public manifest URL. No ZIP or bundle is uploaded.

## Before submission

1. Run `npm run test:penpot`.
2. Run `npm run build`.
3. Deploy the current site.
4. Verify the production manifest and referenced files return HTTP 200:
   - `https://iconsearch.info/penpot/manifest.json`
   - `https://iconsearch.info/penpot/code.js`
   - `https://iconsearch.info/penpot/index.html`
   - `https://iconsearch.info/penpot/icon.png`
5. Install the production manifest in Penpot and complete a sign-in, search, preview, color/size change, insert, and sign-out test.

## Submission form

Use Penpot's current submission form:

`https://penpot.app/penpothub/plugins/create-plugin`

Use this manifest URL:

`https://iconsearch.info/penpot/manifest.json`

Upload the requested marketplace icon, cover image, and optional plugin screenshots separately in the form. These listing images are not part of the plugin manifest.
