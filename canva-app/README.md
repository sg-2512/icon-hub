# IconSearch Canva App

Search IconSearch inside Canva and insert SVG icons into the current design.

## Requirements

Canva's current starter-kit docs recommend Node 24 and npm 11. This app is configured to run on Node 22 or 24, matching the current starter kit engine range.

## Local Development

```bash
cd canva-app
npm install
npm start
```

The dev server serves the standalone app bundle at:

```text
http://localhost:8080/app.js
```

In Canva Developer Portal, set **App source > Development URL** to that URL and use **Preview**.

## Features

- Secure IconSearch browser device sign-in for the `canva` product.
- Live search against `https://iconsearch.info/api/extension/icon-search`.
- Library and commercial-safety filters.
- SVG asset upload with `aiDisclosure: "none"`.
- Insert selected icon into the current Canva design.

Before sign-in works in production, deploy the backend product migration for `canva`.
