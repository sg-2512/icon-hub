# IconSearch for PowerPoint

An Office task pane add-in for searching the public IconSearch catalog, recoloring SVG icons, choosing a point size, and inserting them into the current PowerPoint slide.

## Local development

Requirements:

- Node.js 22.13 or newer
- PowerPoint on Windows, macOS, or the web
- A Microsoft 365 account that permits add-in sideloading

Install dependencies and trust the local HTTPS certificate:

```powershell
cd powerpoint-addin
npm install
npx office-addin-dev-certs install
```

Start and sideload the add-in in desktop PowerPoint:

```powershell
npm start
```

To inspect only the task pane in a browser, run `npm run dev-server` and open `https://localhost:3007`. Browser preview supports search and styling; insertion is enabled only inside PowerPoint.

Stop the development session with `npm run stop`.

## Verification

```powershell
npm run typecheck
npm test
npm run build
npm run validate
npm audit --omit=dev
```

`npm run validate` checks the add-in-only XML manifest with Microsoft's validator. `npm test` covers SVG sanitization and runs a package safety check.

## Architecture and permissions

- The add-in uses the public `https://iconsearch.info/api/icons` endpoint and contains no API key or private credential.
- Remote SVG is parsed, stripped of active content and external references, and recolored before insertion.
- PowerPoint hosts supporting ImageCoercion 1.2 receive native SVG. Older supported hosts receive a transparent PNG fallback.
- The manifest requests `ReadWriteDocument` only so the selected icon can be inserted into the open presentation.

## Production hosting

Before Marketplace submission, host the contents of `dist/` on a stable HTTPS origin and replace every `https://localhost:3007` URL in `manifest.xml` with the production task-pane origin. Keep `iconsearch.info` in `AppDomains` and re-run `npm run validate`.
