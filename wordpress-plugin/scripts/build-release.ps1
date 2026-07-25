$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$pluginRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$distRoot = Join-Path $pluginRoot 'dist'
$archivePath = Join-Path $distRoot 'iconsearch.zip'

$releaseFiles = @(
	@{ Source = 'iconsearch.php'; Entry = 'iconsearch/iconsearch.php' },
	@{ Source = 'readme.txt'; Entry = 'iconsearch/readme.txt' },
	@{ Source = 'uninstall.php'; Entry = 'iconsearch/uninstall.php' },
	@{ Source = 'assets/editor.css'; Entry = 'iconsearch/assets/editor.css' },
	@{ Source = 'assets/editor.js'; Entry = 'iconsearch/assets/editor.js' }
)

New-Item -ItemType Directory -Path $distRoot -Force | Out-Null

if (Test-Path -LiteralPath $archivePath) {
	Remove-Item -LiteralPath $archivePath -Force
}

$archive = [System.IO.Compression.ZipFile]::Open(
	$archivePath,
	[System.IO.Compression.ZipArchiveMode]::Create
)

try {
	foreach ($file in $releaseFiles) {
		$sourcePath = Join-Path $pluginRoot $file.Source
		if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
			throw "Missing release file: $sourcePath"
		}

		[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
			$archive,
			$sourcePath,
			$file.Entry,
			[System.IO.Compression.CompressionLevel]::Optimal
		) | Out-Null
	}
} finally {
	$archive.Dispose()
}

$verificationArchive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)

try {
	$actualEntries = @($verificationArchive.Entries | ForEach-Object { $_.FullName })
	$expectedEntries = @($releaseFiles | ForEach-Object { $_.Entry })
	$unexpectedEntries = @($actualEntries | Where-Object { $_ -notin $expectedEntries })
	$missingEntries = @($expectedEntries | Where-Object { $_ -notin $actualEntries })
	$invalidSeparators = @($actualEntries | Where-Object { $_.Contains('\') })

	if ($unexpectedEntries.Count -gt 0) {
		throw "Unexpected ZIP entries: $($unexpectedEntries -join ', ')"
	}

	if ($missingEntries.Count -gt 0) {
		throw "Missing ZIP entries: $($missingEntries -join ', ')"
	}

	if ($invalidSeparators.Count -gt 0) {
		throw "Non-portable ZIP paths: $($invalidSeparators -join ', ')"
	}
} finally {
	$verificationArchive.Dispose()
}

Get-Item -LiteralPath $archivePath |
	Select-Object FullName, Length, LastWriteTime
