# Publishing IconSearch for WordPress

## Prerequisites

1. Create a WordPress.org account and confirm the exact username for `Contributors:` in `readme.txt`.
2. Apply `supabase/migrations/202607250001_wordpress_plugin_product.sql`.
3. Deploy the corresponding website changes.
4. Complete the local account and feature test in `README.md`.
5. Run WordPress Plugin Check with no blocking errors.

## Build the release zip

Run this from the repository root:

```powershell
$source = Resolve-Path ".\wordpress-plugin"
$staging = Join-Path $source ".release"
$packageRoot = Join-Path $staging "iconsearch"
$dist = Join-Path $source "dist"
$zip = Join-Path $dist "IconSearch.zip"

if (Test-Path $staging) {
    Remove-Item -LiteralPath $staging -Recurse -Force
}

New-Item -ItemType Directory -Path (Join-Path $packageRoot "assets") -Force | Out-Null
New-Item -ItemType Directory -Path $dist -Force | Out-Null

Copy-Item -LiteralPath (Join-Path $source "iconsearch.php") -Destination $packageRoot
Copy-Item -LiteralPath (Join-Path $source "readme.txt") -Destination $packageRoot
Copy-Item -LiteralPath (Join-Path $source "uninstall.php") -Destination $packageRoot
Copy-Item -LiteralPath (Join-Path $source "assets\editor.js") -Destination (Join-Path $packageRoot "assets")
Copy-Item -LiteralPath (Join-Path $source "assets\editor.css") -Destination (Join-Path $packageRoot "assets")

if (Test-Path $zip) {
    Remove-Item -LiteralPath $zip -Force
}

Compress-Archive -Path $packageRoot -DestinationPath $zip -CompressionLevel Optimal
Remove-Item -LiteralPath $staging -Recurse -Force
```

The result is:

```text
wordpress-plugin/dist/IconSearch.zip
```

## Pre-submission inspection

```powershell
tar -tf .\wordpress-plugin\dist\IconSearch.zip
```

The archive must contain only:

```text
iconsearch/assets/editor.css
iconsearch/assets/editor.js
iconsearch/iconsearch.php
iconsearch/readme.txt
iconsearch/uninstall.php
```

Do not include local logs, `.env` files, API keys, `node_modules`, repository metadata, screenshots, or development-only documents.

## Submit

1. Sign in to WordPress.org.
2. Open the Add Your Plugin page.
3. Upload `IconSearch.zip`.
4. Use a slug beginning with the IconSearch brand, such as `iconsearch`, if available.
5. Wait for the Plugin Review Team email.
6. Address review feedback in the repository before uploading a corrected package.

After approval, WordPress.org provides an SVN repository. Put release files directly inside `trunk/`, then copy the same release to `tags/0.2.0/`. Keep the PHP `Version:` and readme `Stable tag:` identical.
