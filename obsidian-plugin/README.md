# IconSearch for Obsidian

Search IconSearch from an Obsidian sidebar, preview SVG icons clearly, adjust size and color, then insert styled SVG embeds into notes.

## What It Includes

- Community-plugin style root files:
  - `manifest.json`
  - `main.js`
  - `styles.css`
  - `versions.json`
- Ribbon icon and command palette command: **Open IconSearch**.
- Sidebar search UI with:
  - Search input
  - Library filter
  - Style filter
  - Commercial-safe toggle
  - Size slider
  - Color picker and swatches
- Clear selected-icon preview and compact icon cards.
- Click insertion, double-click insertion, and drag-to-note insertion.
- Settings for icon folder, default size, default color, legal-safe filtering, and API endpoint.
- No account required and no API keys.

## How It Inserts Icons

The plugin fetches the selected SVG, sanitizes it, applies the chosen color and size, saves it into your vault, then inserts a wiki embed such as:

```md
![[IconSearch Icons/lucide-icons-arrow-right-111827-96.svg|96]]
```

This keeps notes portable because the icon asset lives inside the vault.

## Local Checks

```bash
cd obsidian-plugin
npm run check
node --check main.js
```

## Local Obsidian Test

Use a separate development vault, not your main notes vault.

1. Open your test vault folder.
2. Create this folder:

```text
.obsidian/plugins/iconsearch
```

3. Copy these files into that folder:

```text
manifest.json
main.js
styles.css
```

4. Restart Obsidian or reload the app.
5. Open **Settings > Community plugins**.
6. Turn on community plugins if needed.
7. Enable **IconSearch**.
8. Click the ribbon search icon or run **Open IconSearch** from the command palette.
9. Search, adjust size/color, then click Insert or drag a card into an open Markdown note.

## Publish Notes

For community directory submission, create a GitHub repository and release whose tag matches `manifest.json` version. Attach these release assets:

```text
main.js
manifest.json
styles.css
```

The manifest id is `iconsearch`. The plugin folder in a local vault should also be named `iconsearch`.

## Safety

This plugin does not include Supabase keys, Vercel secrets, OAuth secrets, bearer tokens, or private API keys. It only calls:

```text
https://iconsearch.info/api/icons
```
