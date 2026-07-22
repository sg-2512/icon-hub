# Sketch plugin release checklist

## Release assets

- Host `IconSearch.sketchplugin.zip` at a stable HTTPS URL.
- Create and host Sketch's current updating JSON document with a matching `versionID` and download URL.
- Add the real updating JSON URL as `appcast` in `src/manifest.json` only when that endpoint exists.
- Keep the manifest version, archive version, updating JSON version, release notes, and website copy aligned.
- Submit the public plugin to Sketch's official plugin directory after the hosted archive is final.

## Listing

- Name: `IconSearch`.
- Description: search and insert editable, styled open-source SVG icons in Sketch.
- Use screenshots from a real Sketch document in light and dark appearance.
- State that search calls `https://iconsearch.info/api/icons` and SVG asset URLs returned by that service.
- State that recently inserted icon metadata is stored locally in the plugin webview.
- Link `https://iconsearch.info/privacy-policy`, `https://iconsearch.info/terms`, and the support contact.
- Do not claim drag-and-drop to the Sketch canvas; use the supported native Insert action.

## Release gate

- `npm run verify` and `npm audit` pass from a clean checkout.
- Real-host tests pass on the oldest supported Sketch release and the current stable release.
- The ZIP contains only `command.js`, `manifest.json`, and `icon.png` inside the `.sketchplugin` bundle.
- No credentials, personal paths, source maps, native frameworks, analytics, or unnecessary dependencies are present.
- Search, filters, recents, color, size, all placements, nested-layer insertion, API outage, malformed SVG, keyboard navigation, and dark appearance are tested.
- Hosted ZIP, updating JSON, homepage, privacy policy, terms, support address, screenshots, and release notes are live before directory submission.

The plugin is pure JavaScript and contains no native framework or binary, so Apple notarization is not expected to be required. Reassess this if a native dependency is ever added.
