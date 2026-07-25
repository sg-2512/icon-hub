=== IconSearch ===
Contributors: iconsearch
Tags: icons, svg, block editor, design, gutenberg
Requires at least: 6.3
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 0.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Search, customize, and insert inline SVG icons in the block editor with a free IconSearch account.

== Description ==

IconSearch adds a focused icon sidebar to the WordPress block editor. Connect a free IconSearch account, search the live icon catalog, adjust size and color, and insert a self-contained inline SVG without leaving WordPress.

= Features =

* Search the live IconSearch catalog.
* Filter by library, icon style, and commercial-safe license status.
* Preview icons clearly in a compact two-column grid.
* Set icon size with presets, a slider, or an exact pixel value.
* Choose a preset color, color picker value, or custom hex color.
* Insert icons as self-contained inline SVG in Custom HTML blocks.
* Copy customized SVG markup.
* Double-click or drag an icon to insert it.
* Keep each WordPress editor's IconSearch connection separate.

= IconSearch account =

A free IconSearch account is required. Click "Sign in with IconSearch" in the editor sidebar, complete sign-in on iconsearch.info, approve the connection, and return to WordPress.

The plugin never receives your IconSearch password. It stores an encrypted, revocable session token in your WordPress user metadata.

= External service =

This plugin relies on IconSearch at https://iconsearch.info to provide account authentication, icon search results, and SVG files.

When a connected editor signs in or uses icon search, the plugin sends the device sign-in request, IconSearch session token, search text, selected filters, and requested icon identifiers to iconsearch.info. This happens only for logged-in WordPress editors who intentionally connect an IconSearch account and use the sidebar. The plugin does not send visitor data or published post content.

IconSearch Terms: https://iconsearch.info/terms

IconSearch Privacy Policy: https://iconsearch.info/privacy-policy

== Installation ==

1. Upload the `iconsearch` folder to `/wp-content/plugins/` or install the zip from **Plugins > Add New Plugin**.
2. Activate **IconSearch**.
3. Open a post or page in the block editor.
4. Open the IconSearch sidebar from the editor toolbar.
5. Connect a free IconSearch account.

== Frequently Asked Questions ==

= Is an IconSearch account required? =

Yes. A free account is required before icon search and insertion become available.

= Does the plugin store my IconSearch password? =

No. Authentication happens on iconsearch.info. WordPress stores only an encrypted, revocable session token for the connected editor.

= Are inserted icons loaded from an external CDN? =

No. The selected SVG markup is sanitized and stored directly in the post's Custom HTML block. The saved post does not need an external image URL to render the inserted icon.

= Can I change icon color and size? =

Yes. Select an icon and use the size and color controls before inserting or copying it.

= What does drag and drop do? =

Drag an icon card from the sidebar into the editor canvas. The plugin inserts the customized SVG at the current block editor insertion point. Double-click and the Insert SVG button provide the same result.

= What data is sent to IconSearch? =

For connected editors, the plugin sends authentication requests, the IconSearch session token, search text, selected filters, and requested icon identifiers. No visitor data or published post content is sent.

== Privacy ==

IconSearch connections are saved separately for each WordPress user. The session token is encrypted with the site's WordPress authentication salt before storage in user metadata. Deleting the plugin removes these saved sessions.

Site owners can review suggested privacy-policy wording under **Settings > Privacy**.

== Changelog ==

= 0.2.0 =

* Added required IconSearch account connection and browser approval.
* Added encrypted per-user session storage and authenticated WordPress REST proxies.
* Rebuilt the Gutenberg sidebar with faster loading states and aligned controls.
* Added exact sizing, presets, custom colors, copy, double-click, and drag insertion.
* Changed insertion to sanitized, self-contained inline SVG.
* Added external-service and privacy disclosures.

= 0.1.0 =

* Initial local prototype.
