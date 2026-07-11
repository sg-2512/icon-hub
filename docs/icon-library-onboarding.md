# Adding a Named Icon Library

Named libraries are indexed into the local JSON database and previewed through the shared preview resolver.

## Required Steps

1. Add the library metadata to `data/library-catalog.ts`.
2. Add or update the extraction block in `scripts/build-icon-db.mjs`.
   - Read source data from `node_modules` when possible.
   - Write each icon with `id`, `name`, `displayName`, `library`, `libraryName`, `npmPackage`, `license`, `tags`, `reactImport`, `reactUsage`, and `svgUrl`.
   - Do not copy a library-specific SVG folder into `public/`.
3. Add preview URL patterns to `lib/icon-preview.ts`.
   - This is the shared resolver used by search cards, cart previews, exports, and icon detail pages.
   - If the library ships SVG files in `node_modules`, add it to `app/api/icon-preview/[library]/[name]/route.ts` so previews use the local installed package first.
   - Keep fallback candidates in the same order users should try them.
4. Regenerate the local databases:
   - `npm run build:icons`
   - `node scripts/merge-and-canonicalize.js`
5. Verify:
   - `npm run lint`
   - `npm run build`
   - Check `/api/icons?lib=<library-id>&limit=1&legalOnly=1`
   - Check `/icon-search?lib=<library-id>` in the browser.

## Preview Rules

All named libraries should use `lib/icon-preview.ts` for preview candidates. Avoid one-off client components, special API routes, or library-specific folders in `public/` unless the whole preview system is intentionally changed.

If a library has historical or stale URLs, normalize them in `getCleanSvgUrl()` so saved carts and old database records continue to render.
