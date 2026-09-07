@echo off
setlocal
cd /d "%~dp0"
call "%~dp0corax_run.cmd"
exit /b %errorlevel%
