$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeExe = "C:\Users\csjon\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$runtimeDir = Join-Path $projectRoot "runtime"
$pidFile = Join-Path $runtimeDir "server.pid"

if (-not (Test-Path $runtimeDir)) {
  New-Item -ItemType Directory -Path $runtimeDir | Out-Null
}

$existingConnection = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" } | Select-Object -First 1
if ($existingConnection) {
  Start-Process "http://localhost:3000"
  exit 0
}

if (-not (Test-Path $nodeExe)) {
  throw "Bundled Node runtime not found at $nodeExe"
}

$process = Start-Process -FilePath $nodeExe -ArgumentList "src/server.ts" -WorkingDirectory $projectRoot -PassThru -WindowStyle Hidden
$process.Id | Set-Content -LiteralPath $pidFile

$started = $false
for ($i = 0; $i -lt 10; $i++) {
  Start-Sleep -Seconds 1
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      $started = $true
      break
    }
  } catch {
  }
  if ($started) {
    break
  }
}

if (-not $started) {
  throw "Fell Concierge did not start on localhost:3000"
}
