# IconSearch Framer Plugin

Search the live IconSearch catalog from inside Framer and insert online SVG icons into the canvas.

## Development

```bash
npm install
npm run dev
```

Open Framer, go to Plugins, choose development plugins, and load this plugin.

## Build

```bash
npm run build
npm run pack
npm run pack:review
```

The plugin uses the production IconSearch API at `https://iconsearch.info` and does not bundle an offline icon database.

## Security And Remote Data

The plugin only sends authentication and icon search requests to `https://iconsearch.info`. SVG retrieval is restricted to trusted HTTPS origins: `https://iconsearch.info`, `https://api.iconify.design`, and `https://cdn.jsdelivr.net`. It does not read or upload Framer project contents, canvas nodes, editor data, or screenshots.

See `SECURITY_REVIEW.md` for the full endpoint and local storage review notes.

## Publish

1. Run `npm run pack -- --output IconSearch-SVG-Icons.zip` from this folder.
2. Upload `IconSearch-SVG-Icons.zip` from this folder in the Framer Marketplace plugin dashboard:
   `https://www.framer.com/marketplace/dashboard/plugins/`
3. Use the local development plugin in Framer for a final smoke test before submitting the Marketplace listing.

`IconSearch-SVG-Icons.zip` is generated directly by Framer's official packaging tool. `npm run pack:review` remains available to create `IconSearch-review.zip`, which includes the built plugin and unminified source for an internal security review.
