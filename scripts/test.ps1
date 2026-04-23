$bundledNode = "C:\Users\csjon\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if (Test-Path $bundledNode) {
  & $bundledNode src/tests/verify.ts
} else {
  node src/tests/verify.ts
}
