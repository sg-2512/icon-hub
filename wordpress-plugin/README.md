# IconSearch WordPress Plugin

Search IconSearch from the WordPress block editor and insert styled SVG icons into posts and pages.

## Features

- Gutenberg plugin sidebar using the native editor sidebar pattern.
- Live search against `https://iconsearch.info/api/icons`.
- Large selected icon preview plus a visible two-column result grid.
- Library, style, and commercial-safe license filters.
- Size slider and color picker with quick swatches.
- Click **Insert selected** to insert an icon as a `core/html` block.
- Drag an icon card into the editor canvas to insert it.
- Inserted icons use inline CSS masks, so the selected color and size are preserved on the front end without extra assets.

## Local Development

1. Copy or symlink this `wordpress-plugin` folder into a local WordPress install:

   ```text
   wp-content/plugins/iconsearch
   ```

2. In WordPress Admin, open **Plugins** and activate **IconSearch**.
3. Open a post or page in the block editor.
4. Click the IconSearch magnifier/sidebar button in the top toolbar.
5. Search for `home`, `arrow`, or `cart`.
6. Adjust size/color, then click **Insert selected** or drag a card into the editor.

## Quick CLI Checks

```bash
php -l iconsearch.php
node --check assets/editor.js
```

## Release Packaging

Zip the folder contents with `iconsearch.php` at the plugin root:

```text
iconsearch/
  iconsearch.php
  assets/editor.js
  assets/editor.css
  README.md
  readme.txt
```

## Notes

This first version does not require an IconSearch account. It uses the public IconSearch search API and stores no WordPress user data.
