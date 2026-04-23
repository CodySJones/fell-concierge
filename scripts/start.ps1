$bundledNode = "C:\Users\csjon\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (Test-Path $bundledNode) {
  & $bundledNode src/server.ts
} else {
  node src/server.ts
}

