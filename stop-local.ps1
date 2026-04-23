$ErrorActionPreference = "SilentlyContinue"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pidFile = Join-Path (Join-Path $projectRoot "runtime") "server.pid"

if (Test-Path $pidFile) {
  $pidValue = Get-Content -LiteralPath $pidFile | Select-Object -First 1
  if ($pidValue) {
    Stop-Process -Id ([int]$pidValue) -Force
  }
  Remove-Item -LiteralPath $pidFile -Force
}

Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue |
  Where-Object { $_.State -eq "Listen" } |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
