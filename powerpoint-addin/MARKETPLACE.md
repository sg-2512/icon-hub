# Microsoft Marketplace release checklist

## Listing assets

- Product name: `IconSearch for PowerPoint`
- Provider: `IconSearch`
- Category: Productivity / Content creation
- Support URL: `https://iconsearch.info/about`
- Privacy policy: `https://iconsearch.info/privacy-policy`
- Terms: `https://iconsearch.info/terms`
- Prepare a 32 px icon, 64 px icon, 128 px icon, and task-pane screenshots without test data.

## Host validation

- Test PowerPoint on Windows and PowerPoint on the web.
- Confirm native SVG insertion on an ImageCoercion 1.2 host.
- Confirm the PNG fallback by temporarily forcing the fallback branch.
- Test an empty presentation, a title slide, a standard content slide, and high-contrast mode.
- Verify search, filters, keyboard focus, error handling, and repeated insertion.

## Submission safety

- Deploy `dist/` to a public HTTPS origin and update all localhost manifest URLs.
- Run `npm run verify` against the final manifest.
- Run `npm audit --omit=dev` and review the full development audit separately.
- Confirm the production bundle contains no `.env` files, tokens, source maps, private endpoints, or customer data.
- Explain the `ReadWriteDocument` permission as necessary to insert the selected icon.

## Manual publication

Create the offer in Microsoft Partner Center, upload the validated XML manifest and listing assets, complete certification notes, and submit for Microsoft Marketplace review. Public publication cannot be automated from this repository.
