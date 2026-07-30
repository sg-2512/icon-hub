# Webflow Marketplace submission

## Listing copy

**Name:** IconSearch

**Short description:** Search open-source icons, customize size and color, and insert sanitized SVG assets without leaving Webflow Designer.

**Category:** Design tools

**Primary action:** Insert selected icon

## Reviewer test flow

1. Open a Webflow test site in Design mode on the main branch and primary locale.
2. Launch IconSearch and confirm that it does not authenticate or load catalog data automatically.
3. Select a canvas container, choose **Sign in with IconSearch**, and complete the browser pairing flow.
4. Return to the extension, enter `arrow`, and press **Search**.
5. Choose an icon, set its size and color, then click **Insert selected icon** (the `+` control and double-click are also supported).
6. Confirm the sanitized SVG appears in Assets and an Image element is inserted inside the selected container with alt text and the requested dimensions.
7. Select an element that cannot contain children and confirm insertion returns an actionable error.

## Capabilities and data use

- Requires Designer capabilities to add elements and manage site assets.
- Reads the current canvas selection only to determine whether the selected element can receive an Image.
- Starts IconSearch account pairing only after the user selects **Sign in with IconSearch**.
- Requests icon metadata only after the user presses **Search**, and fetches a selected SVG only after an insert action.
- Uploads only the SVG selected by the user to the current Webflow site.
- Holds the opaque IconSearch extension-session token in memory for the current panel session.
- Does not call `webflow.getIdToken()` and never sends a Webflow ID token to IconSearch.
- Contains no API keys, analytics, advertising, or payment code.

## Security remediation for resubmission

- **SVG external resources:** DOMPurify now forbids `image`, `feImage`, and `style` elements and inline style attributes. A second DOM pass removes non-fragment `href` / `xlink:href` values and rejects every `url(...)` value except an exact internal `url(#id)` reference.
- **Activity on load:** The mount-time `webflow.getIdToken()` call and automatic default search were removed. Pairing starts after a Sign in click; catalog access starts after a Search submission.
- **ID-token handling:** The extension no longer requests a Webflow ID token. Search uses only the opaque IconSearch device-session token returned after account pairing.
- **Authorization URL:** The client ignores `verificationUriComplete`, validates the device code, and constructs the exact `https://iconsearch.info/connect` URL with only `product=webflow` and `code` parameters. Navigation requires a separate link click.
- **CSP:** All React `style` props were replaced with static CSS classes, including color swatches.
- **Production artifacts:** Production builds disable source maps, delete stale map files and duplicate stylesheets, minify output, and run regression checks against the generated public directory.
- **Simulator code:** Production source no longer reports a usable SDK simulator state when `webflow` is unavailable; insertion remains disabled outside Designer.
- **Sanitizer allowance:** `ADD_ATTR: ["target"]` was removed.

## Publication checklist

- Register the app in the Webflow App dashboard and enable a Designer Extension.
- Provide the review team with an active IconSearch reviewer account or another fully featured review-access method.
- Keep all IconSearch device-auth and search backend services live throughout review.
- Run `npm test` and complete the reviewer test flow in both the local extension and an uploaded Workspace version.
- Capture current listing images from the real Designer panel; do not use mock insertion results.
- Supply a 512×512 app avatar and 3–5 current screenshots at 1280×846.
- Add accurate IconSearch support, privacy policy, and terms URLs from the production site.
- Explain the account-pairing flow and explicit-search behavior in the submission review notes and demo.
- Run `npm run bundle` from a clean checkout and verify the zip contains no `.map` files or `sourceMappingURL` comments.
- Upload the generated bundle, complete the data disclosure, and submit for Marketplace review.

## Interaction note

Webflow's documented Designer API supports programmatic element placement relative to the selected element. It does not document dragging an item from the extension iframe onto the Designer canvas, so this extension uses explicit placement controls and click insertion.
