# IconSearch Plugin Portfolio Audit

Audit date: 2026-07-17  
Repository: `C:\Users\Sanchit Gupta\icon-hub`

## Publication Progress Update - 2026-07-18

- **Framer:** Submission succeeded under `@iconsearch`, but the listing media was marked as reported and the public canonical URL was unavailable while signed out. Publication follow-up is deferred pending a Framer creator-support appeal.
- **Raycast:** Release preparation resumed. The extension now uses the latest Raycast API, includes the official ESLint configuration and an initial changelog, and passes manifest, icon, ESLint, Prettier, TypeScript, and production-build checks without warnings.

## Executive Summary

The repository currently contains 18 IconSearch integrations. Two are confirmed publicly available:

1. **VS Code** is live in the Visual Studio Marketplace under the `IconSearch` publisher. The public page showed 2 installs during this audit.
2. **Figma** has a live Figma Community page at the ID stored in `figma-plugin/manifest.json`.

The other 16 integrations are not currently publicly discoverable. Several are close to release, but "builds locally" and "published" are different states:

- **Package-ready:** Chrome, Framer, Sketch, Raycast, and Tailwind.
- **Build-ready but still need marketplace packaging/review work:** Storybook, Canva, Adobe Express, Obsidian, Webflow, PowerPoint, and Google Slides.
- **Need structural release work:** MCP, JetBrains, WordPress, and Shopify.

The most important portfolio-wide findings are:

- The root `README.md` roadmap is stale. It says Figma and VS Code are not published, although both public listing URLs resolve.
- Fourteen newer integration directories are still untracked in Git. This blocks reliable releases, public review, version history, and provenance.
- Public icon-count copy has drifted. The VS Code Marketplace description shows `351,639 / 16 / 224`, while the local VS Code manifest says `355,702 / 18 / 227`, and Raycast says `354,523`.
- There are no `.env` files in the integration folders and no hard-coded credential values were found by the static scan. Two secret-pattern hits were the detector regexes inside Adobe and Obsidian check scripts, not credentials.
- Token storage is strongest in VS Code (`SecretStorage`) and JetBrains (`Password Safe`). Chrome, Figma, Raycast, Storybook, and Canva use platform or browser local storage for revocable tokens; those flows need explicit threat-model and expiry testing before release.
- There is no shared CI matrix covering all integrations. A regression in the API contract, auth product names, SVG sanitization, or catalog metadata can therefore affect several plugins unnoticed.

## Status Definitions

| Status | Meaning |
| --- | --- |
| Published | A public install/listing page was directly verified. |
| Not published | The exact registry/store lookup returned 404 or no results. |
| Not publicly found | No public listing was found; a private developer dashboard could still contain a draft or review submission. |
| Package-ready | A release artifact or dry-run package exists and local production validation passes. |
| Build-ready | Source builds, but marketplace-specific packaging, review, or metadata work remains. |
| Blocked | Required tooling, container project, or release structure is missing. |

## Portfolio Status Table

| Integration | Local version | Local validation on 2026-07-17 | Public status | Release state | Main next action |
| --- | ---: | --- | --- | --- | --- |
| Chrome | 1.1.0 | Smoke checker passed; ZIP exists | **Not published**; exact Web Store search returned no results | Package-ready | Complete Web Store listing, privacy disclosure, screenshots, and submit `dist/iconsearch-chrome-1.1.0.zip`. |
| VS Code | 1.0.1 | TypeScript compile passed; VSIX exists | **Published** | Public, update needed | Confirm live version is 1.0.1 and update stale listing counts/docs. |
| Figma | Manifest ID `1652731113142368438` | `node --check code.js` passed | **Published** | Public, QA needed | Align local name/listing name and add automated functional checks. |
| Framer | 0.1.0 | Production build passed; review ZIP exists | **Not publicly found** | Package-ready | Final clean-project smoke test, listing assets, then upload ZIP. |
| Webflow | 0.1.0 | Strict typecheck, safety checker, and production bundle passed | **Not publicly found** | Build-ready | Register the app, run an in-Designer capability test, create listing assets, and submit the bundle. |
| Sketch | 0.1.0 | Strict typecheck, six SVG/native tests, safety checker, `.sketchplugin` bundle/ZIP, and full dependency audit passed | **Not published**; no hosted appcast or directory submission exists | Package-ready | Test in real Sketch on macOS, host the ZIP and updating JSON, capture listing assets, and submit to the plugin directory. |
| PowerPoint | 0.1.0 | Typecheck, SVG tests, safety checker, production build, and Microsoft manifest validation passed | **Not publicly found** | Build-ready | Test SVG and PNG insertion in real PowerPoint hosts, deploy the task pane to HTTPS, prepare listing assets, and submit through Partner Center. |
| Google Slides | 0.1.0 | Typecheck, three SVG safety tests, least-privilege/safety checker, Apps Script build, and full dependency audit passed | **Not published**; no Marketplace submission has been created | Build-ready | Create an Apps Script project, push `dist`, run an Editor add-on test deployment, configure a standard Cloud project, and submit to Google Workspace Marketplace. |
| Raycast | 0.1.0 | Build passed; Raycast lint passed with tooling warnings | **Not published**; expected store URL is 404 | Package-ready | Fix lint-tool detection, add changelog/screenshots, run publish to open the Raycast PR. |
| Tailwind | 0.1.0 | Helper tests, Tailwind 4 smoke test, and package dry-run passed | **Not published**; npm returned 404 | Package-ready | Claim `@iconsearch` scope, add Tailwind 3 test, publish from CI with provenance. |
| MCP server | 0.1.0 | TypeScript build passed | **Not published**; npm returned 404 | Build-ready | Remove `private`, complete package metadata, add Inspector/CLI tests, then publish. |
| JetBrains | 0.1.0 | Not buildable here: no Gradle or wrapper | **Not publicly found** | Blocked | Add Gradle wrapper, standardize on Java 21, run plugin verifier, create ZIP. |
| Storybook | 0.1.0 | Build and typecheck passed | **Not published**; npm returned 404 | Build-ready | Fix catalog metadata and test in a real Storybook fixture before npm publish. |
| Canva | 0.1.0 | Production build and typecheck passed | **Not publicly found** | Build-ready | Preview through a Canva Developer Portal app, complete design/review checklist, submit. |
| WordPress | 0.1.0 | Editor JS syntax passed; PHP lint blocked because PHP is missing | **Not publicly found** | Needs platform QA | Test against current WordPress/PHP matrix, update readme metadata, add external-service disclosure. |
| Shopify | 0.1.0 | Custom extension checker passed; Shopify CLI missing | **Not publicly found** | Blocked | Put extension inside a real Shopify app, add extension UID, run Theme Check and dev-store QA. |
| Adobe Express | 0.1.0 | Add-on checker and JS syntax passed | **Not publicly found** | Build-ready | Move to a pinned Adobe CLI scaffold, sideload, package, and submit listing. |
| Obsidian | 0.1.0 | Plugin checker and JS syntax passed | **Not publicly found** | Build-ready | Create public GitHub repo/release, beta test, then submit to Community Plugins. |

## Publication Evidence

### Confirmed public

- **VS Code:** [IconSearch Integration on Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=IconSearch.iconsearch-integration). The page had a working Install link, `IconSearch` publisher, and 2 installs during this audit.
- **Figma:** [IconSearch - Free SVG Icons on Figma Community](https://www.figma.com/community/plugin/1652731113142368438/iconsearch-free-svg-icons). The URL resolves to a plugin page whose ID matches the local manifest.

### Confirmed absent from public distribution

- **Chrome:** [exact Chrome Web Store search](https://chromewebstore.google.com/search/IconSearch%20Free%20SVG%20Icons) returned "No search results."
- **Raycast:** the expected public route `https://www.raycast.com/iconsearch/iconsearch` returned Raycast's 404 page. Raycast states that all published extensions are discoverable in its Store.
- **Tailwind:** `npm view @iconsearch/tailwind version --json` returned npm `E404`.
- **MCP:** `npm view @iconsearch/mcp-server version --json` returned npm `E404`.
- **Storybook:** `npm view storybook-addon-iconsearch version --json` returned npm `E404`.

### No public listing found

No matching public listing was found for Framer, Webflow, PowerPoint, JetBrains, Canva, WordPress, Shopify, Adobe Express, or Obsidian. The new Sketch plugin and Google Slides add-on have not been submitted. This report treats them as unpublished. A draft or in-review entry can only be confirmed from the owner dashboard for each platform.

## Local Environment Gaps

| Requirement | Current audit result | Impact |
| --- | --- | --- |
| Node/npm | Available | Node integrations can build. |
| Chrome | Available from prior local testing | Chrome unpacked testing is possible. |
| VS Code | Available | Extension Development Host and VSIX tests are possible. |
| Raycast | Installed | `npm run dev` can work while Raycast is running. |
| PHP CLI | Missing | `php -l` and PHP compatibility checks could not run. |
| Gradle | Missing | JetBrains cannot run or package. |
| Gradle wrapper | Missing from project | JetBrains builds are not reproducible on another machine. |
| Shopify CLI | Missing | No dev-store preview, Theme Check, or deployment validation. |
| Platform GUI/account access | Not audited | Figma, Framer, Sketch, Canva, Adobe Express, WordPress, Shopify, Obsidian, PowerPoint, and Google Slides still need real-host interaction tests. |

## Detailed Integration Reports

### 1. Chrome Extension

**Current state**

- Manifest V3 side-panel extension at version 1.1.0.
- Uses `clipboardWrite`, `downloads`, `sidePanel`, and `storage` permissions.
- Supports authenticated search, filters, pinning, copy, download, size/color adjustment, and drag as PNG/SVG.
- `dist/iconsearch-chrome-1.1.0.zip` exists and the custom checker passes.
- Not public in the Chrome Web Store.

**How to verify locally**

1. Run from the repository root:

   ```powershell
   npm run check:chrome-extension
   npm run package:chrome
   ```

2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select `chrome-extension`.
5. Open IconSearch from the toolbar and verify:
   - account connect, browser approval, and sign-out;
   - search for `home`, `arrow`, and `brand` terms;
   - library/style/legal filters;
   - size and color output;
   - copy SVG and PNG into Google Docs, Figma, and a plain text editor;
   - drag into Google Docs;
   - download SVG;
   - pin/unpin and restart persistence;
   - keyboard flow: `/`, arrows, Enter, `p`, Escape;
   - offline/API-error behavior and revoked-token behavior.

Official reference: [Chrome extension distribution](https://developer.chrome.com/docs/extensions/how-to/distribute).

**Improvements**

1. Add automated service-worker and popup tests using a browser-extension test harness.
2. Reduce host permissions where possible. Every CDN/domain should have a documented feature justification.
3. Add a formal external-service/privacy disclosure describing query text, account token, icon URLs, storage, and retention.
4. Add token expiry/revocation tests. `chrome.storage.local` is extension-isolated but not a credential vault.
5. Add listing screenshots for empty, search, filtered, preview, color, and drag/copy states.
6. Replace hard-coded catalog counts with runtime metadata or wording such as "350k+ icons."
7. Add Firefox/Edge compatibility assessment after the Chrome listing is stable.

### 2. VS Code Extension

**Current state**

- Public Marketplace listing confirmed under `IconSearch.iconsearch-integration`.
- Local version is 1.0.1 and packaged VSIX files for 1.0.0 and 1.0.1 exist.
- TypeScript compile passes.
- Uses VS Code `SecretStorage` for the revocable session token, which is the strongest token-storage implementation in the web/editor integrations.
- Public listing copy is stale compared with local catalog counts.

**How to verify locally**

1. Run:

   ```powershell
   cd vscode-extension
   npm install
   npm run compile
   ```

2. Open `vscode-extension` in VS Code and press `F5` to launch an Extension Development Host.
3. Open the IconSearch activity-bar view.
4. Verify connect, search, filters, recent icons, and sign-out.
5. Insert each output into suitable files: React/TSX, raw SVG/HTML, Vue, Svelte, and Tailwind.
6. Confirm React imports are added once, merged with existing named imports, and not duplicated.
7. Test the `iconSearch.defaultFormat` and `iconSearch.tailwindClasses` settings.
8. Install the packaged release separately:

   ```powershell
   code --install-extension .\iconsearch-integration-1.0.1.vsix --force
   ```

9. Test in an empty workspace, multi-root workspace, remote workspace, and restricted workspace.

Official references: [VS Code extension publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) and [Marketplace listing](https://marketplace.visualstudio.com/items?itemName=IconSearch.iconsearch-integration).

**Improvements**

1. Confirm the live Marketplace binary is version 1.0.1; publish an update if it is still 1.0.0.
2. Replace stale icon counts in the listing, `package.json`, and website with one generated source of truth.
3. Rename README section "Publish Later" now that the extension is public.
4. Add `@vscode/test-electron` integration tests for activation, webview messages, insert edits, and SecretStorage logout.
5. Add a changelog and release notes to improve Marketplace trust.
6. Test web extension compatibility or explicitly mark desktop-only behavior if Node APIs prevent web support.
7. Add telemetry only if it is opt-in or clearly disclosed; basic privacy-safe events would help measure search-to-insert conversion.

### 3. Figma Plugin

**Current state**

- Public Community URL confirmed.
- Local manifest name is `IconSearch Integration`, while the public listing title is `IconSearch - Free SVG Icons`.
- Uses device auth, Figma `clientStorage`, a bounded in-memory SVG cache, search/filter controls, size/color styling, drag, and insertion.
- `code.js` syntax passes, but there is no build system or automated test suite.
- `ui.html` is a single file of roughly 64 KB, which will become difficult to maintain.

**How to verify locally**

1. Open the Figma desktop app.
2. Open a development file.
3. Go to **Plugins > Development > Import plugin from manifest**.
4. Select `figma-plugin/manifest.json`.
5. Run the development plugin and verify:
   - connect/sign-out and token revocation;
   - query debounce and catalog loading;
   - every library/style/legal filter combination;
   - size/color updates on monochrome and multicolor SVGs;
   - click insert and drag insert;
   - insertion into an empty page and a deeply nested frame;
   - large-file behavior under `dynamic-page` document access;
   - relaunch after closing Figma;
   - denied network/CORS and malformed SVG behavior.

Official references: [Figma plugin manifest](https://developers.figma.com/docs/plugins/manifest/) and [publishing to Community](https://help.figma.com/hc/en-us/articles/360042293394-Publish-plugins-to-the-Figma-Community).

**Improvements**

1. Align the manifest name, website name, and public listing title.
2. Split `ui.html` into source modules and add a reproducible bundler/build step.
3. Add unit tests for SVG sanitization, recoloring, URL allowlisting, and message contracts.
4. Reduce broad CDN/font network domains; prefer system fonts and one controlled SVG origin.
5. Document that `clientStorage` contains a revocable token and define token expiry.
6. Add accessible focus states, keyboard result navigation, screen-reader labels, and contrast tests.
7. Add Community screenshots and a short demo for search, filter, recolor, and drag.

### 4. Framer Plugin

**Current state**

- Vite production build passes.
- `IconSearch.zip` exists and a detailed `SECURITY_REVIEW.md` documents endpoints and storage.
- Supports Framer SVG insertion and `makeDraggable`.
- Uses session storage for the token and local storage for non-sensitive recent/pinned metadata.
- No public IconSearch listing was found.

**How to verify locally**

1. Run:

   ```powershell
   cd framer-plugin
   npm install
   npm run dev
   ```

2. Open the development plugin from Framer and use a fresh test project.
3. Verify connect/sign-out, search, all filters, pinning, recent items, pagination, size/color, click insertion, and drag insertion.
4. Test blank, complex, and large Framer projects in both light and dark modes.
5. Run release checks:

   ```powershell
   npm run build
   npm run pack
   npm run pack:review
   ```

6. Open the final ZIP in a fresh project before upload.

Official reference: [Framer plugin publishing](https://www.framer.com/developers/publishing).

**Improvements**

1. Add `typecheck`, lint, and test scripts; currently the package exposes only build/dev/pack flows.
2. Add component tests for session recovery, filters, pagination, and URL allowlisting.
3. Test and document dark mode; the current CSS is strongly light-themed.
4. Reduce the approximately 226 KB built JavaScript payload and lazy-load noncritical UI.
5. Add listing icon, cover, screenshots, tags, concise byline, and reviewer instructions.
6. Ensure the packaged ZIP is always generated from a clean build and add a checksum/release manifest.

### 5. Raycast Extension

**Current state**

- `author: iconsearch` now validates against the real Raycast account.
- Production build passes and Raycast lint validates the manifest and extension icon.
- Lint warns that ESLint and Prettier checks are being skipped, even though Prettier is declared in `devDependencies`.
- Expected public store URL returns 404, so it is not published.
- Uses a native Raycast list/detail UI, pagination, recents, favorites, output formats, and SVG file clipboard actions.

**How to verify locally**

1. Start the Raycast desktop app first.
2. Run:

   ```powershell
   cd raycast-extension
   npm install
   npm run dev
   ```

3. Open **Search Icons** in Raycast.
4. Verify connect/sign-out, default results across libraries, fast typing, all filters, pagination, recents, favorites, and preview rendering.
5. Verify copy and paste for React, SVG, Vue, Svelte, Tailwind, URL, and SVG-file output.
6. Test scrolling through at least 10 pages while watching CPU/memory and image loading.
7. Run release validation:

   ```powershell
   npm run lint
   npm run build
   ```

Official references: [Raycast CLI](https://developers.raycast.com/information/developer-tools/cli) and [publishing an extension](https://developers.raycast.com/basics/publish-an-extension).

**Improvements**

1. Add the lint dependencies/configuration Raycast expects so formatting and ESLint are not skipped.
2. Add `CHANGELOG.md`, listing screenshots, and reviewer test instructions before opening the Raycast PR.
3. Keep result rows text-first and load only selected/visible previews to preserve smooth scrolling.
4. Cache catalog metadata and first-page results with a short TTL to remove the initial pause.
5. Add tests for pagination deduplication, aborting stale searches, and storage migration.
6. Review whether the token can use a platform credential API rather than general `LocalStorage`; otherwise document expiry and revocation clearly.
7. Add offline/timeout empty states and a retry action that does not clear the current results.

### 6. Tailwind Plugin

**Current state**

- Helper tests and Tailwind 4 CSS generation smoke test pass.
- `npm pack --dry-run` succeeds with a clean five-file, 4.7 KB package.
- Supports Tailwind 3.4 and 4 by peer dependency declaration, but only Tailwind 4 has an integration smoke test.
- npm confirms `@iconsearch/tailwind` is not published.

**How to verify locally**

1. Run:

   ```powershell
   cd tailwind-plugin
   npm test
   npm run pack:dry
   ```

2. Create separate Tailwind 3.4 and Tailwind 4 fixture projects.
3. Install the local package directory or generated tarball.
4. Generate CSS for:
   - `is-icon-[lucide--home]`;
   - aliases and custom collection mapping;
   - invalid/malicious icon names;
   - size scale and arbitrary size values;
   - text color/currentColor behavior;
   - custom base URL and cache version.
5. Inspect the output for escaped selectors, valid mask URLs, and no unexpected CSS.

Official reference: [publishing a scoped public npm package](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/).

**Improvements**

1. Add an actual Tailwind 3.4 integration test to match the declared peer range.
2. Add ESM output alongside CJS and test both import styles.
3. Add negative tests for path traversal, CSS injection, malformed names, and oversized aliases.
4. Add a small example app for Tailwind 3 and 4.
5. Publish from GitHub Actions with npm trusted publishing/provenance instead of a long-lived local token.
6. Confirm ownership of the `@iconsearch` npm scope before release.
7. Document runtime network/CSP implications of remote SVG mask URLs.

### 7. MCP Server

**Current state**

- TypeScript build passes and produces a stdio MCP server.
- Implements status, sign-in, sign-out, search, and snippet tools.
- Stores the session file with mode `0600` and supports `ICONSEARCH_TOKEN` from the client environment.
- `package.json` is marked `private: true`, has incomplete public-package metadata, and npm returns 404.
- No automated protocol test or MCP Inspector script is present.

**How to verify locally**

1. Run:

   ```powershell
   cd mcp-server
   npm install
   npm run build
   npm run start
   ```

2. Start the official MCP Inspector:

   ```powershell
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

3. Verify `tools/list` exposes exactly the documented tools and schemas.
4. Call status without a token, run start/finish sign-in, then search and generate every snippet format.
5. Test invalid schema values, empty queries, timeouts, revoked tokens, concurrent calls, and API error responses.
6. Restart the server and confirm the local token file is readable only by the current user.
7. Confirm stdout contains only MCP protocol frames and diagnostics go to stderr.

Official reference: [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector).

**Improvements**

1. Remove `private: true` only when ready to publish.
2. Add `license`, `repository`, `homepage`, `bugs`, `keywords`, `engines`, and `publishConfig`.
3. Add a shebang/executable check for `dist/index.js` so the npm `bin` works cross-platform.
4. Add CLI Inspector tests for `tools/list` and representative `tools/call` requests.
5. Add explicit maximum response sizes and sanitize remote metadata returned to model clients.
6. Document session-file location, permissions, sign-out, and environment-variable precedence.
7. Consider registry discovery after npm release, but publish a simple, auditable npm package first.

### 8. JetBrains Plugin

**Current state**

- Kotlin/IntelliJ Platform project targeting IntelliJ IDEA 2025.1 and `sinceBuild = 251`.
- Uses Java toolchain 21 in Gradle, but the README says Java 17+, which is inconsistent.
- Source implements a tool window and Password Safe token storage.
- No Gradle wrapper exists and Gradle is not installed, so no build, IDE run, verifier, or ZIP was produced.
- No public Marketplace listing was found.

**How to verify locally**

1. Install a Java 21 JDK.
2. Add and commit the Gradle wrapper, then use `gradlew`, not a machine-global Gradle.
3. Run:

   ```powershell
   .\gradlew.bat runIde
   ```

4. In the sandbox IDE, open **View > Tool Windows > IconSearch**.
5. Verify account connect/sign-out, Password Safe persistence, search, filters, copy, and insertion into Kotlin, Java, TSX, Vue, and Svelte editors.
6. Test no-editor, read-only, multi-caret, and selection-replacement behavior.
7. Run release checks:

   ```powershell
   .\gradlew.bat test
   .\gradlew.bat verifyPlugin
   .\gradlew.bat runPluginVerifier
   .\gradlew.bat buildPlugin
   ```

Official references: [publishing an IntelliJ plugin](https://plugins.jetbrains.com/docs/intellij/publishing-plugin.html) and [JetBrains Marketplace listing guidance](https://plugins.jetbrains.com/docs/marketplace/publishing-and-listing-your-plugin.html).

**Improvements**

1. Add the Gradle wrapper and make Java 21 the single documented requirement.
2. Add unit tests for API normalization, insertion, escaping, and auth-state transitions.
3. Configure a supported `untilBuild` or test a matrix of supported IDE releases.
4. Run Plugin Verifier against IntelliJ IDEA, WebStorm, PhpStorm, and other claimed IDEs.
5. Add plugin signing and publishing secrets only in CI, never in the repository.
6. Add change notes, vendor support URL, icon variants, screenshots, and privacy documentation.
7. Split the large Kotlin implementation into API, auth, UI, storage, and insertion modules.

### 9. Storybook Addon

**Current state**

- Production bundle and TypeScript declaration build pass; typecheck passes.
- npm returns 404, so the addon is not published and cannot appear in the Storybook catalog.
- The first keyword is `storybook-addon`, but Storybook's catalog guide requires `storybook-addons` as the first keyword.
- No fixture Storybook, component tests, or interaction tests exist.
- Session token is stored in browser `localStorage`.

**How to verify locally**

1. Run:

   ```powershell
   cd storybook-addon
   npm install
   npm run typecheck
   npm run build
   ```

2. Create or use a Storybook 9/10 fixture project.
3. Install the local addon with a file dependency or `npm link`.
4. Add `storybook-addon-iconsearch` to `.storybook/main.ts`.
5. Start Storybook and verify the panel appears in manager UI.
6. Test connect, filters, selection, preview, every copy format, theme switching, narrow panel width, and Storybook reload.
7. Test at least React/Vite and one non-React framework because the package claims broad framework support.

Official references: [Storybook addons](https://storybook.js.org/docs/addons) and [integration catalog requirements](https://storybook.js.org/docs/8/addons/integration-catalog).

**Improvements**

1. Change the first keyword to the catalog-required `storybook-addons` and validate all catalog metadata.
2. Confirm the root `preset.js` module format against Storybook 9 and 10 packaging requirements.
3. Add an `exports` map and test Node/ESM package resolution from a clean consumer project.
4. Add a fixture Storybook and interaction tests for the panel.
5. Avoid long-lived browser-local tokens where possible; add expiry and explicit clear-session behavior.
6. Add pagination, style filter, recent icons, and a larger selected preview to reach feature parity.
7. Publish with provenance, then verify automatic catalog discovery.

### 10. Canva App

**Current state**

- Production webpack build and TypeScript typecheck pass.
- Uses Canva asset/design APIs to upload and insert an SVG.
- Supports authentication, search, library/legal filters, and insertion.
- Uses a fixed 192 px inserted size and browser `localStorage` for the revocable session.
- No public app listing was found; a Developer Portal app record is not represented in this repository.

**How to verify locally**

1. Run:

   ```powershell
   cd canva-app
   npm install
   npm start
   ```

2. In Canva Developer Portal, set **App source > Development URL** to `http://localhost:8080/app.js`.
3. Click **Preview**, install the draft app, and open it in the web editor.
4. Verify connect/sign-out, search, filters, preview, upload, insertion, and error states.
5. Test presentation, social, document, video, and whiteboard design types.
6. Upload a production bundle and test mobile because localhost preview is not available on mobile.
7. Remove the Development URL before submission; Canva does not allow review submission while it is set.

Official references: [previewing Canva apps](https://www.canva.dev/docs/apps/previewing-apps/) and [submission checklist](https://www.canva.dev/docs/apps/submission-checklist/).

**Improvements**

1. Add user-facing size and color controls; current insertion is fixed at 192 px.
2. Add drag-to-design if the current Canva SDK supports the required interaction for this app type.
3. Adopt Canva App UI Kit components and validate all light/dark/theme behavior with Canva's Dev Toolkit.
4. Add style and collection filters, recents, favorites, and pagination.
5. Review localStorage token persistence, expiry, and logout across shared/browser devices.
6. Add a clean production bundle/upload script and document the exact Developer Portal settings.
7. Prepare reviewer credentials, testing instructions, privacy policy, app icon, screenshots, and listing copy.

### 11. WordPress Plugin

**Current state**

- Gutenberg sidebar plugin with public API search, filters, large preview, size/color controls, click insertion, and drag insertion.
- JavaScript syntax passes.
- PHP syntax was not checked because PHP CLI is not installed.
- `readme.txt` says `Tested up to: 6.6`, which is stale and must be updated only after real testing.
- No public WordPress.org listing was found.

**How to verify locally**

1. Install a local WordPress environment and PHP versions representative of supported hosting.
2. Copy/symlink `wordpress-plugin` to `wp-content/plugins/iconsearch`.
3. Run:

   ```powershell
   php -l iconsearch.php
   node --check assets\editor.js
   ```

4. Activate IconSearch in WordPress Admin.
5. Test in the block editor with the default theme and at least two common third-party themes.
6. Verify filters, selected preview, size/color, click insertion, drag insertion, save, preview, front-end render, duplicate, undo/redo, reusable blocks, and post revisions.
7. Test users without upload/admin privileges, multisite, RTL, keyboard navigation, and screen-reader labels.
8. Enable `WP_DEBUG` and inspect PHP/browser logs.

Official references: [WordPress plugin submission](https://developer.wordpress.org/plugins/wordpress-org/planning-submitting-and-maintaining-plugins/) and [plugin directory guidelines](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/).

**Improvements**

1. Install PHP locally and test the declared PHP 7.4 minimum plus current PHP releases.
2. Update `Tested up to` only after testing the current WordPress stable version.
3. Add an explicit External Services section to `readme.txt` with IconSearch API purpose, data sent, terms, and privacy links.
4. Add WordPress Coding Standards/PHPCS, ESLint, and automated block-editor end-to-end tests.
5. Add `wp_set_script_translations` and replace hard-coded UI copy with translation functions.
6. Add WordPress.org assets: icon, banner, and screenshots.
7. Consider a dedicated dynamic block instead of raw `core/html` so users can edit size/color after insertion without editing HTML.

### 12. Shopify Theme App Extension

**Current state**

- Theme app extension contains Liquid, assets, snippets, locales, and a custom checker.
- Supports icon rows, merchant settings, search helper, size/color, drag selection, and reorder.
- The helper cannot persist settings directly, so users copy icon IDs into the block setting.
- It is not a complete Shopify app: there is no parent `shopify.app.toml`, app runtime, deployment record, or extension UID.
- Shopify CLI is not installed, so Theme Check and dev-store behavior were not verified.

**How to verify locally**

1. Install Shopify CLI and create/link a Partner dev store.
2. Create a real Shopify app project.
3. Place this folder under `extensions/iconsearch-theme`.
4. Let Shopify generate/register the extension and add its UID.
5. Run from the app root:

   ```powershell
   shopify app dev
   ```

6. In an Online Store 2.0 test theme, add the Icon row app block.
7. Verify helper search, filters, selected tray, reorder, copied IDs, saved settings, theme reload, responsive layout, labels, and multiple block instances.
8. Test storefront performance with cold API/cache, API outage, and several icon rows.
9. Run `shopify app build` before `shopify app deploy`.

Official reference: [building theme app extensions](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/build).

**Improvements**

1. Build the parent Shopify app and register an extension UID; the current folder cannot be independently deployed.
2. Install Shopify CLI and use Shopify Theme Check/build validation, not only the custom script.
3. Remove the copy/paste ID workflow by adding an authenticated app admin/editor flow that stores selections in app-owned metafields or metaobjects where policy allows.
4. Avoid storefront dependence on live icon search metadata. Resolve stable icon assets during configuration or cache through the app/CDN.
5. Measure compressed JavaScript against Shopify's suggested 10 KB asset target.
6. Add onboarding/deep links that take merchants directly to the block in the theme editor.
7. Test Horizon/Dawn and several commercial themes, multiple locales, and section rendering events.

### 13. Adobe Express Add-on

**Current state**

- Manifest v2 desktop panel with public API search, filters, large preview, size/color controls, click insertion, and drag-to-document.
- Add-on checker and JavaScript syntax pass.
- No account/token is required and no secrets are embedded.
- Tooling is invoked through unpinned `npx`; the folder is not yet a fully scaffolded Adobe CLI project.
- No public listing was found.

**How to verify locally**

1. Run:

   ```powershell
   cd adobe-plugin
   npm run check
   node --check src\index.js
   npm run start
   ```

2. Enable Add-on Development in Adobe Express.
3. Use **Add-ons > Add-on Testing > Test your local add-on** and connect to the CLI development server.
4. Verify search, filters, selected preview, color/size, click insertion, drag insertion, and repeated inserts.
5. Test monochrome and multicolor SVGs, empty documents, multiple page types, network failure, and malformed SVG.
6. Test supported desktop browsers and accessibility/keyboard use.
7. Package through Adobe's CLI, create a public listing, and submit for review.

Official references: [Adobe Express local development tools](https://developer.adobe.com/express/add-ons/docs/guides/getting-started/local-development/dev-tooling) and [public add-on distribution](https://developer.adobe.com/express/add-ons/docs/guides/build/distribute/public-dist).

**Improvements**

1. Scaffold with Adobe's current CLI template and pin `@adobe/ccweb-add-on-scripts` in `devDependencies`.
2. Add proper build, clean, package, and test scripts rather than relying on an unpinned `npx` call.
3. Adopt Adobe Spectrum components/design tokens for review consistency and accessibility.
4. Add automated SVG sanitizer/recolor tests and enforce SVG byte/complexity limits.
5. Add caching, pagination, and graceful retry without clearing current results.
6. Prepare the 144 px icon, listing assets, support/privacy URLs, release notes, and reviewer instructions.
7. Verify trader profile requirements if distributing in the EU.

### 14. Obsidian Plugin

**Current state**

- Community-plugin file layout is present: `manifest.json`, `main.js`, `styles.css`, and `versions.json`.
- Custom checker and JavaScript syntax pass.
- Supports native-themed sidebar UI, filters, size/color, click/double-click/drag insertion, settings, SVG sanitization, and vault-local icon assets.
- `isDesktopOnly` is false, but mobile behavior has not been verified.
- No public GitHub release or Community Plugins entry was found.

**How to verify locally**

1. Use a separate test vault.
2. Create `.obsidian/plugins/iconsearch` in that vault.
3. Copy `manifest.json`, `main.js`, and `styles.css` into that directory.
4. Restart/reload Obsidian and enable IconSearch under **Settings > Community plugins**.
5. Verify ribbon and command-palette opening, search, filters, size/color, click, double-click, and drag insertion.
6. Confirm the SVG file is created under the configured folder and the wiki embed remains valid after vault restart, rename, move, and sync.
7. Test missing/nested icon folders, duplicate icon names, read-only vaults, API outage, and SVG sanitization failures.
8. Test desktop and mobile before keeping `isDesktopOnly: false`.

Official references: [Obsidian plugin submission](https://docs.obsidian.md/Plugins/Releasing/Submit%20your%20plugin) and [community release repository](https://github.com/obsidianmd/obsidian-releases).

**Improvements**

1. Move the plugin to a public repository or a release-ready subdirectory and create GitHub tag/release `0.1.0` with required assets.
2. Add TypeScript source and a reproducible build instead of maintaining a 27 KB hand-built `main.js` artifact.
3. Add unit tests for SVG sanitization, recursive folder creation, filename collision handling, and wiki-link generation.
4. Improve drag insertion so it targets the actual dropped editor/cursor, not only the last active Markdown editor.
5. Create nested folders recursively and handle sync/file conflicts safely.
6. Test mobile or set `isDesktopOnly: true` until mobile behavior is proven.
7. Run a public beta through BRAT before Community directory submission.

### 15. Webflow Designer Extension

**Current state**

- Designer Extension API v2 package at version 0.1.0 using Webflow's `comfortable` panel size.
- Searches the public IconSearch API with live library, style, and commercial-safety filters.
- Provides visible SVG previews, size and color controls, and Before, Inside, or After insertion relative to the selected element.
- Sanitizes SVG markup with DOM parsing, creates a Webflow site asset, adds an Image element and alt text, and reuses matching generated assets.
- Contains no IconSearch token, API key, analytics, advertising, or payment code; Webflow CLI telemetry is disabled in the project manifest.
- The official Webflow CLI generated `bundle.zip`; it is not publicly listed because app registration and Marketplace review have not been completed.

**How to verify locally**

1. Run:

   ```powershell
   cd webflow-extension
   npm install
   npm test
   npm run dev
   ```

2. Register an app in the Webflow App dashboard and add a Designer Extension using the local development URL shown by the CLI.
3. Open a development site in Design mode on the main branch and primary locale.
4. Select a canvas element, search for `arrow`, adjust size and color, and test Before, Inside, and After placement.
5. Confirm the new Image element is selected, has alt text, uses an `iconsearch-icon-{size}` class, and appears in Assets as an SVG.
6. Insert the same icon/color/size variant again and confirm the existing site asset is reused.
7. Run `npm run bundle` and inspect `bundle.zip`; it should contain only `webflow.json`, `index.html`, `index.js`, and `styles.css`.

Official references: [Designer Extensions](https://developers.webflow.com/designer/docs/designer-extensions), [Designer API elements](https://developers.webflow.com/designer/reference/elements-overview), and [Designer API assets](https://developers.webflow.com/designer/reference/asset-overview).

**Improvements**

1. Complete a real in-Designer capability test for roles that can design but cannot manage assets.
2. Add mocked tests for malformed SVG, blocked external links, asset-cache misses, API errors, and placement failures.
3. Capture Marketplace screenshots from the real Designer panel after the host test passes.
4. Monitor Webflow's Designer API for an official cross-iframe drag-to-canvas API; keep explicit placement controls until one is documented.
5. Add favorites and recent icons only after deciding whether their storage belongs in the site, app, or local extension context.
6. Recheck the official Webflow CLI dependency audit on each update; current overrides remove high-severity advisories while six low-severity upstream findings remain outside the upload bundle.

### 16. PowerPoint Add-in

**Current state**

- Add-in-only XML task-pane manifest at version 0.1.0 targeting PowerPoint presentations with the `ReadWriteDocument` permission.
- Searches the public IconSearch API without an IconSearch account, API key, private token, analytics, advertising, or payment code.
- Provides mixed-library search, library/style/legal filters, progressive SVG previews, point-size and color controls, and automatic, top-left, or content-area placement.
- Sanitizes remote SVG with DOM parsing and removes scripts, active elements, inline event handlers, inline styles, external references, and unsafe URL paint values.
- Uses `Office.CoercionType.XmlSvg` on ImageCoercion 1.2 hosts and a transparent high-resolution PNG through `Office.CoercionType.Image` as the compatibility fallback.
- Typecheck, three SVG safety tests, static no-secrets check, Vite production build, and Microsoft's manifest validator pass. The production dependency audit reports zero vulnerabilities.
- Eight moderate advisories remain only in the local Microsoft `office-addin-debugging` tool chain and are not included in the browser bundle or Marketplace package.
- No Microsoft Marketplace listing has been created or verified.

**How to verify locally**

1. Run:

   ```powershell
   cd powerpoint-addin
   npm install
   npx office-addin-dev-certs install
   npm run verify
   npm start
   ```

2. If PowerPoint does not open automatically, keep `npm run dev-server` running and sideload `powerpoint-addin/manifest.xml` through **Home > Add-ins > More Add-ins > My Add-ins > Upload My Add-in** in a host that exposes XML upload.
3. Open a blank presentation and confirm the **IconSearch > Search Icons** ribbon command opens the task pane.
4. Search `arrow`, `calendar`, and `brand`; verify mixed initial libraries, each library/style filter, the commercial-safety toggle, and stable scrolling.
5. Change point size, color swatches, exact hex value, and all three placement options. Confirm exactly one selected card and a readable large preview.
6. Insert on a host supporting ImageCoercion 1.2 and confirm the object is an SVG. Temporarily force the fallback branch and confirm a transparent PNG is inserted at the requested point size.
7. Test an empty slide, title slide, content slide, custom slide size, dark Office theme, high contrast, keyboard-only use, API outage, invalid SVG, and repeated insertions.
8. Build `dist/`, inspect it for source maps, local files, secrets, and unexpected domains, then replace all localhost manifest URLs with the production HTTPS origin before Partner Center submission.

Official references: [PowerPoint add-in quickstart](https://learn.microsoft.com/en-us/office/dev/add-ins/quickstarts/powerpoint-quickstart-yo), [add-in-only XML manifest](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/xml-manifest-overview), [ImageCoercion requirement sets](https://learn.microsoft.com/en-us/javascript/api/requirement-sets/common/image-coercion-requirement-sets), and [sideloading Office add-ins](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-office-add-ins-for-testing).

**Improvements**

1. Complete real-host QA on PowerPoint for Windows, Mac, and web, including both the native SVG and PNG fallback branches.
2. Deploy the static task pane to a stable HTTPS origin and maintain separate development and production manifests.
3. Add an optional PowerPointApi 1.10 path that reads the actual slide dimensions for richer right, bottom, and centered placement while retaining the broad ImageCoercion fallback.
4. Add mocked Office callback tests covering success, rejected SVG, automatic PNG fallback, and user-facing insertion errors.
5. Add a bounded recent-icons list only after deciding whether storage belongs in Office roaming settings or local browser storage.
6. Prepare Marketplace screenshots, privacy and support disclosures, reviewer instructions, and a permission rationale for `ReadWriteDocument`.
7. Recheck Microsoft's debugging packages regularly and remove the current development-only advisory chain when an upstream clean version is available.

### 17. Google Slides Add-on

**Current state**

- Classic Google Slides Editor add-on at version 0.1.0 with a clasp-ready Apps Script deployment directory.
- Uses only `presentations.currentonly` and `script.container.ui`; it does not request broad Slides, Drive, external-request, identity, or profile scopes.
- Searches the public IconSearch API without an IconSearch account, API key, private token, analytics, advertising, or payment code.
- Provides a compact 300 px sidebar with mixed-library search, library/style/legal filters, progressive SVG previews, point-size and color controls, and center, corner, or content placement.
- Sanitizes remote SVG in the browser, converts it to a transparent PNG, and sends only bounded PNG bytes plus validated metadata to Apps Script.
- Apps Script checks base64 syntax, payload size, PNG signature, text/color/size/position metadata, the current page type, and actual presentation dimensions before insertion.
- Strict typecheck, three sanitizer tests, production build, exact-scope checker, deployment-content checker, and static secret scan pass.
- Both the deployable dependency audit and the full development dependency audit report zero vulnerabilities after pinning the patched `uuid` used by Google's `clasp` CLI.
- No Google Workspace Marketplace submission has been created.

**How to verify locally**

1. Run:

   ```powershell
   cd google-slides-addon
   npm install
   npm run verify
   npm run dev-server
   ```

2. Open `http://localhost:3008` and verify the 300 px browser preview: mixed default results, search debounce, filters, selection, exact color, swatches, point size, placement, keyboard focus, and stable scrolling. Insertion is intentionally disabled in browser preview mode.
3. Create a standalone Apps Script project, copy `.clasp.json.example` to the Git-ignored `.clasp.json`, and replace `YOUR_SCRIPT_ID` with the project script ID.
4. Run `npm run login` and `npm run push`; inspect Apps Script and confirm it contains only `Code.gs`, `Sidebar.html`, and `appsscript.json`.
5. In Apps Script choose **Deploy > Test deployments**, enable **Editor add-on**, select **Latest Code**, choose a Google Slides test presentation, and save.
6. Open the presentation and launch **Extensions > IconSearch > Open IconSearch**. Confirm authorization requests only current-presentation and container-UI access.
7. Insert icons at 24, 72, and 240 pt in all four placements on standard and custom-size slides. Verify transparency, title/description metadata, active selection, and page-bound clamping.
8. Test malformed SVG, non-PNG payloads, oversized payloads, API outage, slow network, no selected slide, keyboard-only navigation, zoom, and authorization revocation.

Official references: [Editor add-on HTML interfaces](https://developers.google.com/workspace/add-ons/concepts/html-interfaces), [Slides image insertion](https://developers.google.com/apps-script/reference/slides/page), [least-privilege Editor scopes](https://developers.google.com/workspace/add-ons/concepts/editor-scopes), [Editor add-on test deployments](https://developers.google.com/workspace/add-ons/how-tos/testing-editor-addons), and [Workspace Marketplace publication overview](https://developers.google.com/workspace/add-ons/how-tos/publish-add-on-overview).

**Improvements**

1. Complete real-host QA in Google Slides with personal and Workspace-managed accounts, standard and custom page sizes, and revoked/re-authorized consent.
2. Link a standard Google Cloud project, configure the OAuth consent screen, and confirm whether Google requires additional OAuth verification for the final listing.
3. Add mocked browser tests for search races, API errors, malformed SVG, canvas failures, and Apps Script bridge failures.
4. Capture accurate Marketplace screenshots from the real 300 px sidebar and write reviewer instructions around the two narrow scopes.
5. Add bounded recent icons only after choosing an approved storage location and documenting retention behavior.
6. Monitor Google Slides for an official sidebar-to-canvas drag API; keep explicit insertion controls until a supported contract exists.

### 18. Sketch Plugin

**Current state**

- Native JavaScript Sketch document plugin at version 0.1.0, built directly as a `.sketchplugin` bundle without deprecated `skpm` release tooling.
- Opens a compact WebKit plugin window with live mixed-library search, library/style/commercial-safety filters, progressive previews, recents, size, exact color, swatches, and three placement modes.
- Uses an explicit Insert action and double-click insertion. It does not claim unsupported drag-and-drop from a floating plugin window to the Sketch canvas.
- Sanitizes SVG in the browser and validates the payload again in the native command before importing it as an editable group with `createLayerFromData`.
- Places the group beside or centered on the current selection, or at the page origin, then selects it and centers the document view.
- Embeds no account credentials, API keys, tokens, analytics, advertising, payments, native frameworks, or source maps. Recents stay in local webview storage.
- Strict typecheck, six unit tests, exact three-file package inspection, secret scan, production bundle, release ZIP, and the full dependency audit pass.
- Not public: the ZIP, hosted updating JSON, real macOS host test, screenshots, and Sketch directory submission remain.

**How to verify locally**

1. On any development machine, run:

   ```powershell
   cd sketch-plugin
   npm install
   npm run verify
   npm audit
   npm run dev-server
   ```

2. Open `http://localhost:3009` and verify mixed initial results, search, filters, previews, recents, size, color, placement, keyboard focus, dark appearance, and stable scrolling. Native insertion is intentionally disabled in browser preview mode.
3. On macOS with Sketch installed, double-click `dist/IconSearch.sketchplugin`, or move it to `~/Library/Application Support/com.bohemiancoding.sketch3/Plugins`.
4. Open a disposable Sketch document and choose **Plugins > IconSearch > Open IconSearch**.
5. Insert icons at 16, 64, and 512 px using each placement mode with no selection, a layer, a nested group, a Frame, a Graphic, a Symbol, and locked content.
6. Verify every result is an editable SVG group with the chosen name, dimensions, and color; it should be selected and brought into view after insertion.
7. Test malformed SVG, oversized metadata, API outage, slow network, light/dark appearance, keyboard-only use, window resize, repeated insertion, and plugin restart with recents retained locally.
8. Inspect `dist/IconSearch.sketchplugin.zip` and confirm it contains only `Contents/Sketch/command.js`, `Contents/Sketch/manifest.json`, and `Contents/Resources/icon.png`.

Official references: [plugin manifests](https://developer.sketch.com/plugins/plugin-manifest), [plugin bundle structure](https://developer.sketch.com/plugins/plugin-bundle), [Sketch JavaScript API](https://developer.sketch.com/reference/api/), [installing plugins](https://developer.sketch.com/plugins/), and [publishing plugins](https://developer.sketch.com/plugins/publish-a-plugin).

**Improvements**

1. Complete host QA on the oldest supported and current stable Sketch versions before publishing.
2. Host the versioned ZIP and updating JSON on stable HTTPS URLs, then add the real `appcast` URL to the manifest.
3. Add automated bridge tests around the webview message handler and mocked document hierarchy tests around parent selection and placement.
4. Capture real Sketch screenshots in light and dark appearance and prepare directory copy, reviewer steps, support links, privacy disclosure, and release notes.
5. Measure first-result latency and preview hydration in Sketch's WebKit runtime; tune concurrency only from host measurements.
6. Reassess notarization and package inspection if any native framework or binary is introduced later.

## Cross-Plugin Improvement Plan

### Priority 0: release correctness

1. Commit/review the fourteen untracked integration directories before any public release.
2. Update the root roadmap and VS Code README to reflect that VS Code and Figma are already public.
3. Replace static catalog counts with a generated build value or durable "350k+" wording.
4. Add the JetBrains Gradle wrapper and Java 21 documentation.
5. Create the Shopify parent app and extension UID.
6. Fix Storybook catalog metadata.
7. Make the MCP package intentionally publishable only after metadata and protocol tests are complete.
8. Install PHP and Shopify CLI for platform validation.

### Priority 1: shared quality and safety

1. Extract a shared TypeScript package for API types, icon normalization, URL allowlisting, SVG sanitization, snippet generation, auth product IDs, and error mapping.
2. Add CI jobs for every integration's build/check command plus secret scanning and package-content inspection.
3. Add contract tests against a mocked IconSearch API so all integrations agree on fields, pagination, and error behavior.
4. Standardize privacy disclosures and token-storage/expiry behavior per platform.
5. Add accessibility checks for keyboard navigation, focus, labels, contrast, reduced motion, and zoom.
6. Add performance budgets for first result, search debounce, scroll smoothness, preview concurrency, and bundle size.

### Priority 2: growth and product quality

1. Create consistent listing assets and a 20-30 second demo for each marketplace.
2. Add privacy-safe activation, search, insert, copy, and error metrics where platform policy permits.
3. Add recents/favorites consistently and support cloud sync only when storage/privacy are clear.
4. Localize high-opportunity plugins after English UX is stable.
5. Publish in this order: update VS/Figma, Chrome, Framer, Sketch, Webflow, PowerPoint, Google Slides, Raycast, Tailwind, Obsidian, Storybook, WordPress, Adobe, Canva, JetBrains, MCP, then Shopify.

## Recommended Release Gates

No integration should be marked release-ready until all applicable gates pass:

- Source is committed and tagged.
- Production build and type/lint checks pass from a clean checkout.
- Package contents contain no source secrets, local paths, unnecessary dependencies, or stale artifacts.
- Local host application test passes on a clean account/project/vault/store.
- Auth connect, expiry, revoke, and sign-out are tested.
- Search, filters, preview, output, drag/copy/insert, persistence, and error states are tested.
- Privacy policy and external-service disclosures match actual network/storage behavior.
- Marketplace title, author, version, catalog count, screenshots, support link, and release notes are current.
- Accessibility and narrow-layout tests pass.
- API outage, rate limit, malformed payload, invalid SVG, and slow network behavior are acceptable.
- A rollback/unpublish/update procedure is documented.

## Commands Executed During This Audit

The following checks passed:

```text
root:                 npm run lint
Chrome:               npm run check:chrome-extension
VS Code:              npm run compile
Figma:                node --check code.js
Framer:               npm run build
Raycast:              npm run build
Raycast:              npm run lint (with skipped ESLint/Prettier warnings)
Tailwind:              npm test
Tailwind:              npm run pack:dry
MCP:                   npm run build
Storybook:             npm run build
Storybook:             npm run typecheck
Canva:                 npm run build
Canva:                 npm run typecheck
WordPress:             node --check assets/editor.js
Shopify:               npm run check
Adobe Express:         npm run check
Adobe Express:         node --check src/index.js
Obsidian:              npm run check
Obsidian:              node --check main.js
Webflow:               npm test
Webflow:               npm run bundle
Sketch:                npm run verify
Sketch:                npm audit
PowerPoint:             npm run typecheck
PowerPoint:             npm test
PowerPoint:             npm run build
PowerPoint:             npm run validate
PowerPoint:             npm audit --omit=dev
Google Slides:          npm run verify
Google Slides:          npm audit
Google Slides:          npm audit --omit=dev
```

Checks not completed:

```text
WordPress PHP lint:    PHP CLI is not installed
JetBrains build:       Gradle and Gradle wrapper are missing
Shopify host test:     Shopify CLI and parent app are missing
Host GUI tests:        Require manual testing in each signed-in platform
Sketch host test:      Requires Sketch on macOS
PowerPoint host test:  Requires sideloading in desktop/web PowerPoint
Google Slides host:    Requires an Apps Script Editor add-on test deployment
```

## Final Assessment

The portfolio has a solid functional base, and most integrations are more than placeholders. The release risk is currently operational rather than conceptual: inconsistent status documentation, untracked projects, missing platform containers/tooling, limited automated host tests, and marketplace metadata gaps.

The fastest credible path is to maintain the two public integrations first, submit the package-ready projects next, and avoid submitting the structurally blocked projects until their release environment is reproducible. That order will produce public traffic sooner without multiplying support problems across 18 marketplaces at once.
