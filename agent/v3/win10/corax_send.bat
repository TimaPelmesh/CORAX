@echo off
setlocal EnableExtensions
set "ERR=0"
set "CORAX_PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"
if not exist "%CORAX_PS%" set "CORAX_PS=%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe"

REM ASCII-only. Use System32 powershell, never PATH powershell.exe
REM (WindowsApps alias opens a new minimized window and this cmd vanishes).

cd /d "%~dp0"
title CORAX AGENT

echo.
echo   CORAX Agent
echo   folder: %CD%
echo.

if /i "%~1"=="nopause" set "INV_NOPAUSE=1"

if not exist "%CORAX_PS%" (
  echo [BAT] ERROR: PowerShell not found:
  echo        %CORAX_PS%
  set "ERR=1"
  goto :done
)

if not defined INV_NOPAUSE if exist "%~dp0corax_splash.ps1" (
  "%CORAX_PS%" -NoProfile -NoLogo -ExecutionPolicy Bypass -File "%~dp0corax_splash.ps1"
)

if exist "%~dp0agent_env.bat" (
  call "%~dp0agent_env.bat"
) else if exist "%~dp0..\agent_env.bat" (
  call "%~dp0..\agent_env.bat"
) else (
  echo [BAT] WARN: agent_env.bat not found. Set INVENTORY_SERVER and AGENT_TOKEN.
)

if not defined INVENTORY_SERVER (
  echo %~1 | findstr /I /R "^http:// ^https://">NUL
  if "%ERRORLEVEL%"=="0" set "INVENTORY_SERVER=%~1"
)
if not defined INVENTORY_SERVER (
  echo [BAT] ERROR: INVENTORY_SERVER is not set. Use the panel ZIP (agent_env.bat).
  set "ERR=2"
  goto :done
)

if not defined AGENT_TOKEN (
  echo [BAT] ERROR: AGENT_TOKEN is not set. Use agent_env.bat from admin bundle.
  set "ERR=2"
  goto :done
)

echo   TARGET  %INVENTORY_SERVER%
echo   START   %DATE% %TIME%
echo.

if not exist "%~dp0InventoryClient.ps1" (
  echo  [FAIL] InventoryClient.ps1 not found in %~dp0
  set "ERR=1"
  goto :done
)

"%CORAX_PS%" -NoProfile -NoLogo -ExecutionPolicy Bypass -File "%~dp0InventoryClient.ps1"
set "ERR=%ERRORLEVEL%"

echo.
if "%ERR%"=="0" (
  echo   STATUS  OK
) else (
  echo   STATUS  FAILED code %ERR%
  echo   See corax-agent.log in this folder and %%TEMP%%\corax-agent.log
)

:done
if not defined INV_NOPAUSE if not defined CORAX_INNER pause
endlocal & exit /b %ERR%
