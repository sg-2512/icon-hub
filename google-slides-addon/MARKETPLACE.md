# Google Workspace Marketplace release checklist

## Cloud and Apps Script

- Link the Apps Script project to a standard Google Cloud project owned by the IconSearch organization.
- Keep only `presentations.currentonly` and `script.container.ui` in `appsscript.json`.
- Configure the OAuth consent screen with IconSearch name, logo, support email, privacy policy, and terms URLs.
- Create a numbered Apps Script version after the real-host test passes.
- Enable and configure the Google Workspace Marketplace SDK with the Apps Script ID and version.

## Listing

- App name: `IconSearch for Google Slides`.
- Category and host: productivity/design; Google Slides.
- Use accurate screenshots captured from the 300 px sidebar in a real presentation.
- State that icon search calls `https://iconsearch.info/api/icons` and SVG asset URLs returned by that service.
- State that icons are converted locally in the sidebar and only the final PNG is sent to Apps Script for insertion.
- Link `https://iconsearch.info/privacy-policy`, `https://iconsearch.info/terms`, and the support contact.
- Do not claim drag-and-drop; use the documented Insert action in screenshots and copy.

## Reviewer test

1. Open the supplied test presentation and launch IconSearch from Extensions.
2. Search `arrow` and confirm multiple icon libraries appear.
3. Toggle commercial-safe filtering and select a library/style.
4. Change the color, size, and each placement option.
5. Insert an icon and verify its title, description, transparency, dimensions, and placement.
6. Confirm the add-on cannot access other presentations or Drive files.

## Release gate

- `npm run verify` passes from a clean checkout.
- Production dependency audit reports zero vulnerabilities.
- No `.clasp.json`, credentials, access tokens, script IDs, source maps, or local paths are committed or uploaded.
- Authorization, revocation, API outage, malformed SVG, keyboard use, and slow-network behavior are tested.
- The Marketplace scopes and disclosures exactly match the shipped manifest and network behavior.
