param(
  [string]$OutputPath
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$PluginDir = Resolve-Path (Join-Path $RepoRoot "framer-plugin")

if (-not $OutputPath) {
  $OutputPath = Join-Path $PluginDir "IconSearch-review.zip"
}

$TempDir = Join-Path $PluginDir ".review-package"

function Assert-InPluginDir([string]$Path) {
  $full = [System.IO.Path]::GetFullPath($Path)
  $root = [System.IO.Path]::GetFullPath($PluginDir)
  if (-not $full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "Refusing to operate outside the Framer plugin directory: $full"
  }
}

Assert-InPluginDir $TempDir
Assert-InPluginDir $OutputPath

if (-not (Test-Path (Join-Path $PluginDir "dist"))) {
  throw "Missing framer-plugin/dist. Run npm run build before packaging."
}

if (Test-Path $TempDir) {
  Remove-Item -LiteralPath $TempDir -Recurse -Force
}

New-Item -ItemType Directory -Path $TempDir | Out-Null

$DistDir = Join-Path $PluginDir "dist"
Get-ChildItem -LiteralPath $DistDir | ForEach-Object {
  Copy-Item -LiteralPath $_.FullName -Destination $TempDir -Recurse
}

$SourceDir = Join-Path $TempDir "_source"
New-Item -ItemType Directory -Path $SourceDir | Out-Null

$sourceItems = @(
  "public",
  "src",
  "framer.json",
  "index.html",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts",
  "README.md",
  "SECURITY_REVIEW.md"
)

foreach ($item in $sourceItems) {
  $source = Join-Path $PluginDir $item
  if (-not (Test-Path $source)) {
    throw "Missing required package item: $item"
  }

  $destination = Join-Path $SourceDir $item
  Copy-Item -LiteralPath $source -Destination $destination -Recurse
}

Copy-Item -LiteralPath (Join-Path $PluginDir "README.md") -Destination (Join-Path $TempDir "README.md")
Copy-Item -LiteralPath (Join-Path $PluginDir "SECURITY_REVIEW.md") -Destination (Join-Path $TempDir "SECURITY_REVIEW.md")

if (Test-Path $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

Compress-Archive -Path (Join-Path $TempDir "*") -DestinationPath $OutputPath -Force
Remove-Item -LiteralPath $TempDir -Recurse -Force

Write-Host "Created review package: $OutputPath"
