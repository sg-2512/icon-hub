# IconSearch Framer Plugin Security Review

This plugin is a Framer canvas utility for searching icon metadata and inserting SVG icons. It does not read, upload, or transmit Framer project contents, canvas nodes, selected layers, editor data, screenshots, or user-created site content.

## Remote Endpoints

All authenticated IconSearch requests are scoped to `https://iconsearch.info`.

| Endpoint | Method | Data sent | Purpose |
| --- | --- | --- | --- |
| `https://iconsearch.info/api/device/start` | `POST` | `product: "framer"`, a short client name built from the browser user agent | Starts browser-based device sign-in |
| `https://iconsearch.info/api/device/status` | `POST` | `deviceCode` returned by the start endpoint | Polls for sign-in completion |
| `https://iconsearch.info/api/device/revoke` | `POST` | Bearer token in the `Authorization` header | Revokes the saved session on sign-out |
| `https://iconsearch.info/api/entitlements/me` | `GET` | Bearer token in the `Authorization` header | Refreshes account access metadata |
| `https://iconsearch.info/api/extension/icon-search` | `GET` | Search query, page, limit, sort, library/style/legal filters, `x-iconsearch-product: framer`, and bearer token | Searches icon metadata |

The plugin also retrieves SVG markup from trusted HTTPS SVG origins only:

| Origin | Data sent | Purpose |
| --- | --- | --- |
| `https://api.iconify.design` | SVG file path from an Iconify collection/name, no bearer token | Retrieves public Iconify SVG assets |
| `https://cdn.jsdelivr.net` | SVG file path for supported public icon packages, no bearer token | Retrieves public SVG assets when a named library uses its package CDN |
| `https://iconsearch.info` | SVG URL returned by the IconSearch API, no Framer project data | Retrieves IconSearch-hosted SVG assets |

Any SVG URL outside these trusted HTTPS origins is rejected before preview, drag, or insert.

## Token And Browser Storage

The device sign-in flow returns a bearer token from `https://iconsearch.info`. The plugin stores it in `sessionStorage` under `iconsearchFramerSession` together with account access metadata returned by the API. The token is used only in `Authorization` headers sent to `https://iconsearch.info` and can be revoked from the plugin by signing out. On launch and sign-in, the plugin removes any older `iconsearchFramerSession` value from `localStorage`.

The plugin stores icon metadata in `localStorage` for convenience:

- `iconsearchFramerRecent`: recently inserted icon metadata.
- `iconsearchFramerPinned`: user-pinned icon metadata.

These records contain icon names, libraries, and trusted SVG URLs. They do not contain Framer project contents or editor data.

## Framer Data Access

The plugin uses the Framer plugin SDK only to insert user-selected SVGs into the canvas and enable drag-and-drop:

- `framer.addSVG(...)`
- `framer.makeDraggable(...)`

The plugin does not call APIs that enumerate, export, inspect, or upload the user's Framer project.

## Dependency And Failure Behavior

IconSearch depends on the IconSearch API for authentication/search and trusted SVG origins for icon retrieval. If these services are unavailable, the plugin shows loading/error states and does not attempt alternate untrusted SVG hosts.
