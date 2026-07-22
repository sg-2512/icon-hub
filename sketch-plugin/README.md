# IconSearch for Sketch

A native Sketch document plugin for searching the public IconSearch catalog and inserting styled SVG icons as editable Sketch layers.

## Features

- Mixed-library search with library, style, and commercial-safety filters.
- Progressive three-column previews with a selected-icon inspector.
- Exact color, quick swatches, 16-512 px sizing, and selection-relative placement.
- Native editable SVG group insertion through Sketch's supported JavaScript API.
- Recently inserted icons stored only in the local plugin webview.
- No IconSearch account, API key, analytics, advertising, or payment code.
- Browser and native SVG validation, bounded metadata, secret checks, and package-content checks.

## Browser preview

```powershell
cd sketch-plugin
npm install
npm run dev-server
```

Open `http://localhost:3009`. Search, filters, previews, recents layout, size, color, and placement controls work in browser preview mode. Native insertion is enabled only inside Sketch.

## Build and verify

```powershell
npm run verify
npm audit
```

The build creates:

- `dist/IconSearch.sketchplugin`
- `dist/IconSearch.sketchplugin.zip`
- `dist/panel.html` for build inspection

The release ZIP contains only the plugin manifest, compiled command, and 128 px icon.

## Test in Sketch on macOS

1. Run `npm install` and `npm run verify` on macOS.
2. Double-click `dist/IconSearch.sketchplugin` to install it, or move it into `~/Library/Application Support/com.bohemiancoding.sketch3/Plugins`.
3. Open a test Sketch document and run **Plugins > IconSearch > Open IconSearch**.
4. Search `arrow`, `calendar`, and `brand`; test every filter and verify visible previews.
5. Select a layer and test **Right of selection** and **Center on selection**. Test **Page origin** with no selection.
6. Verify the new layer is an editable SVG group, has the selected name and size, becomes selected, and is centered in the document view.
7. Test an empty page, nested groups, Frames, Graphics, Symbols, locked layers, malformed SVG, API outage, slow network, dark appearance, keyboard-only use, zoom, and repeated insertion.

Sketch is available only on macOS, so the native host test cannot run on this Windows workspace. The browser panel, TypeScript, unit tests, bundle structure, ZIP contents, and dependency safety are verified here.

## Release

See [PUBLISHING.md](./PUBLISHING.md) for the manual appcast, archive hosting, directory submission, and review checklist. The project intentionally does not depend on deprecated `skpm` publishing.
