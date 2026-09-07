@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0Install-HelpdeskShortcut.ps1"
if /I "%~1"=="--silent" (
  "CORAX-Agent.exe" --silent
  exit /b %errorlevel%
)
if /I "%~1"=="--provision-only" (
  "CORAX-Agent.exe" --provision-only
  exit /b %errorlevel%
)
start "" /wait "CORAX-Agent.exe" %*
exit /b %errorlevel%
