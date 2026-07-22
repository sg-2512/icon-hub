# Webflow Marketplace submission

## Listing copy

**Name:** IconSearch

**Short description:** Search open-source icons, style them, and insert reusable SVG assets without leaving Webflow Designer.

**Category:** Design tools

**Primary action:** Insert selected icon

## Reviewer test flow

1. Open a Webflow test site in Design mode on the main branch and primary locale.
2. Launch IconSearch and select a canvas element.
3. Search for `arrow`, choose an icon, and set its size and color.
4. Choose Before, Inside, or After, then select **Insert selected icon**.
5. Confirm the SVG appears as an Image element, is selected, has alt text, and uses an `iconsearch-icon-{size}` class.
6. Insert the same icon variant again and confirm the existing site asset is reused.

## Capabilities and data use

- Requires Designer capabilities to add elements and manage site assets.
- Reads the current canvas selection only to determine insertion placement.
- Requests public icon metadata and SVG files from `https://iconsearch.info`.
- Uploads only the SVG selected by the user to the current Webflow site.
- Stores a local mapping of generated variants to Webflow asset IDs to avoid duplicate uploads.
- Does not request an IconSearch login and contains no API keys, private tokens, analytics, advertising, or payment code.

## Publication checklist

- Register the app in the Webflow App dashboard and enable a Designer Extension.
- Run `npm run dev` and complete the reviewer test flow in a development site.
- Capture current listing images from the real Designer panel; do not use mock insertion results.
- Add the IconSearch privacy policy and terms URLs from the production site.
- Run `npm test` and `npm run bundle` from a clean checkout.
- Upload the generated bundle, complete the data disclosure, and submit for Marketplace review.

## Interaction note

Webflow's documented Designer API supports programmatic element placement relative to the selected element. It does not document dragging an item from the extension iframe onto the Designer canvas, so this extension uses explicit placement controls and click insertion.
