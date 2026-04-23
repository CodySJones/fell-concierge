@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-local.ps1"
echo Fell Concierge local server stopped.
