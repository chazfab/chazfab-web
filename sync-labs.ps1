# CHAZFAB // Non-Destructive Project-to-/labs/ Sync Script
# Run this script anytime you update Number_Munchers (or add other builds) to refresh CHAZFAB_Web/labs/
$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$workspace = Split-Path -Parent $root

$nmSource = Join-Path $workspace "Number_Munchers"
$nmDest   = Join-Path $root "labs\number-munchers"

if (Test-Path $nmSource) {
  New-Item -ItemType Directory -Force -Path $nmDest | Out-Null
  Copy-Item -Path "$nmSource\*" -Destination $nmDest -Recurse -Force
  Write-Host "[OK] Synced Number_Munchers -> $nmDest" -ForegroundColor Green
} else {
  Write-Warning "Number_Munchers folder not found at $nmSource"
}
