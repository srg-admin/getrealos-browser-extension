# Builds the zip to upload to the Chrome Web Store: dist\realos-extension-<version>.zip.
#
#   .\build.ps1
#
# The store copy of manifest.json leaves out the localhost / 127.0.0.1 pages,
# which are only for testing against a local RealOS. Each upload needs a new
# version - bump "version" in manifest.json first; this refuses to rebuild a
# version that's already in dist\.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem

$root = $PSScriptRoot
$files = @('background.js', 'bridge.js', 'amazon.js', 'icons/icon-16.png', 'icons/icon-32.png', 'icons/icon-48.png', 'icons/icon-128.png')

$manifest = Get-Content (Join-Path $root 'manifest.json') -Raw | ConvertFrom-Json
$version = $manifest.version
$zipPath = Join-Path $root "dist\realos-extension-$version.zip"
if (Test-Path $zipPath) {
    throw "dist\realos-extension-$version.zip already exists - bump `"version`" in manifest.json for a new upload."
}

foreach ($script in $manifest.content_scripts) {
    $script.matches = @($script.matches | Where-Object { $_ -notmatch '^http://(localhost|127\.0\.0\.1)/' })
}
$storeManifest = $manifest | ConvertTo-Json -Depth 10

New-Item -ItemType Directory -Force (Join-Path $root 'dist') | Out-Null
# Written by hand rather than with Compress-Archive, which in Windows
# PowerShell names entries with backslashes (icons\icon-16.png) - the store
# then can't find the icons.
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
    $entry = $zip.CreateEntry('manifest.json')
    $writer = New-Object System.IO.StreamWriter($entry.Open(), (New-Object System.Text.UTF8Encoding($false)))
    $writer.Write($storeManifest)
    $writer.Dispose()
    foreach ($file in $files) {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, (Join-Path $root $file), $file) | Out-Null
    }
} finally {
    $zip.Dispose()
}

Write-Host "Built dist\realos-extension-$version.zip"
