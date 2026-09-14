param(
  [string]$Notes = "內容更新"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$versionPath = Join-Path $root "version.json"
$today = Get-Date -Format "yyyy.MM.dd"
$sequence = 1

if (Test-Path -LiteralPath $versionPath) {
  $current = [System.IO.File]::ReadAllText($versionPath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
  if ($current.version -match "^$([regex]::Escape($today))-(\d+)$") {
    $sequence = [int]$Matches[1] + 1
  }
}

$version = "$today-$sequence"
$versionJson = [ordered]@{
  version = $version
  notes = $Notes
} | ConvertTo-Json
[System.IO.File]::WriteAllText($versionPath, "$versionJson`r`n", $utf8NoBom)

function Replace-Utf8File([string]$Path, [string]$Pattern, [string]$Replacement) {
  $text = [System.IO.File]::ReadAllText($Path, [System.Text.Encoding]::UTF8)
  $updated = [regex]::Replace($text, $Pattern, $Replacement)
  [System.IO.File]::WriteAllText($Path, $updated, $utf8NoBom)
}

Replace-Utf8File (Join-Path $root "sw.js") 'const BUILD_VERSION = "[^"]+";' "const BUILD_VERSION = `"$version`";"
Replace-Utf8File (Join-Path $root "script.js") 'const APP_VERSION = "[^"]+";' "const APP_VERSION = `"$version`";"

$indexPath = Join-Path $root "index.html"
$index = [System.IO.File]::ReadAllText($indexPath, [System.Text.Encoding]::UTF8)
foreach ($asset in @(
  "assets/favicon.ico",
  "assets/favicon.svg",
  "assets/favicon-32.png",
  "assets/apple-touch-icon.png",
  "manifest.webmanifest",
  "styles.css",
  "script.js"
)) {
  $escaped = [regex]::Escape($asset)
  $pattern = "$escaped\?v=[^`"'\s>]+"
  $replacement = $asset + "?v=" + $version
  $index = [regex]::Replace($index, $pattern, $replacement)
}
[System.IO.File]::WriteAllText($indexPath, $index, $utf8NoBom)

Write-Host "版本已升級為 $version"
Write-Host "已同步 version.json、sw.js、script.js 與 index.html 的本地資源版本字串。"
Write-Host "OG 圖使用獨立 SHA-256 query；若重新產生 og-preview.png，請更新 index.html 的 og:image query。"
