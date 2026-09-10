@echo off
setlocal EnableExtensions
title CORAX FULL AUDIT

REM Тонкий лаунчер для ручного расширенного аудита Windows.
REM Двойной клик -> запускает Corax-FullAudit.ps1 (он сам поднимет права через UAC).
REM
REM Адрес сервера и токен можно:
REM   1) задать здесь (раскомментировать строки ниже),
REM   2) передать первым аргументом URL,
REM   3) ввести в консоли при запросе.

REM set "INVENTORY_SERVER=http://192.168.1.10:3001"
REM set "AGENT_TOKEN=<TOKEN>"

cd /d "%~dp0"
set "PS=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

REM Первый аргумент вида http(s):// трактуем как адрес сервера.
echo %~1 | findstr /I /R "^http:// ^https://">NUL
if "%ERRORLEVEL%"=="0" set "INVENTORY_SERVER=%~1"

if not exist "%~dp0Corax-FullAudit.ps1" (
  echo [FAIL] Corax-FullAudit.ps1 not found next to this .bat
  pause
  exit /b 1
)

"%PS%" -NoProfile -ExecutionPolicy Bypass -File "%~dp0Corax-FullAudit.ps1"
set "ERR=%ERRORLEVEL%"

endlocal & exit /b %ERR%
