# IconSearch for WordPress

Search, customize, copy, drag, and insert inline SVG icons from a focused Gutenberg sidebar.

## What it does

- Requires a free IconSearch account before search or insertion is available.
- Connects through browser approval; the WordPress site never receives the user's password.
- Stores the IconSearch bearer token encrypted in the connected WordPress user's metadata.
- Proxies authenticated search and SVG requests through WordPress, keeping the token out of browser storage.
- Filters by library, style, and commercial-safe license status.
- Provides size presets, a size slider, numeric sizing, color presets, and a custom color picker.
- Inserts self-contained inline SVG inside a `core/html` block.
- Supports Insert, Copy SVG, double-click insertion, and drag-to-insert.

## Local testing

### Option A: Existing WordPress installation

1. Copy the `wordpress-plugin` folder to:

   ```text
   wp-content/plugins/iconsearch
   ```

2. Rename the copied folder to `iconsearch` if needed.
3. Activate **IconSearch** under **Plugins > Installed Plugins**.
4. Open a post or page in the block editor.
5. Open the IconSearch sidebar from the editor toolbar.

### Option B: WordPress Playground

1. Build `IconSearch.zip` using the packaging command in `PUBLISHING.md`.
2. Open [WordPress Playground](https://playground.wordpress.net/).
3. Open **Plugins > Add New Plugin > Upload Plugin**.
4. Upload `IconSearch.zip`, activate it, and open a post in the block editor.

## Account test

1. Confirm the sidebar initially shows only the connection screen.
2. Click **Sign in with IconSearch**.
3. Sign in or create an account on `iconsearch.info`.
4. Approve the WordPress plugin connection.
5. Return to WordPress and wait for the icon browser to appear.
6. Sign out and confirm search, copy, and insertion are unavailable again.

The WordPress product must exist in Supabase before this flow can complete. Apply:

```text
supabase/migrations/202607250001_wordpress_plugin_product.sql
```

Then deploy the matching website authentication changes.

## Manual feature test

1. Search for `arrow`, `home`, and `cart`.
2. Change library and style filters.
3. Toggle **Commercial-safe only**.
4. Select an icon and test size values `24`, `48`, `96`, and a custom value.
5. Test a preset color and a custom hex color.
6. Click **Insert SVG** and inspect the resulting Custom HTML block.
7. Preview the post and confirm the icon is visible without an external image element.
8. Click **Copy SVG** and paste into a text editor.
9. Double-click an icon card.
10. Drag an icon card into the editor canvas.
11. Sign out and verify the sidebar returns to the connection screen.

## Quick checks

```powershell
php -l .\iconsearch.php
php -l .\uninstall.php
node --check .\assets\editor.js
```

Run the official WordPress Plugin Check before submission.

## Security model

- REST routes require a logged-in WordPress user with `edit_posts`.
- WordPress REST nonces protect browser requests.
- The bearer token is encrypted with AES-256-GCM using the site's WordPress authentication salt.
- IconSearch requests use the WordPress HTTP API and `wp_safe_remote_*` functions.
- Search inputs and SVG path segments are allowlisted and sanitized.
- SVG markup is sanitized by IconSearch and again by the WordPress plugin before insertion.
- Deleting the plugin removes saved IconSearch sessions from WordPress user metadata.

## External service

The plugin depends on the IconSearch service at `https://iconsearch.info`. When a connected editor signs in or searches, the service receives the device sign-in request, account session token, search text, selected filters, and requested icon identifiers. No site visitor data or published post content is sent.

- [IconSearch Terms](https://iconsearch.info/terms)
- [IconSearch Privacy Policy](https://iconsearch.info/privacy-policy)

## Release contents

The release zip must contain one root folder:

```text
iconsearch/
  assets/
    editor.css
    editor.js
  iconsearch.php
  readme.txt
  uninstall.php
```
