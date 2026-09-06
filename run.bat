@echo off
setlocal
cd /d "%~dp0"
title TrankiJamBot

if not exist "node_modules" (
  echo [ERROR] Dependencies are not installed. Run install.bat first.
  goto :end
)
if not exist ".env" (
  echo [ERROR] .env not found. Run install.bat and fill in .env.
  goto :end
)

echo Starting TrankiJamBot... press Ctrl+C to stop.
echo.
call npm start

:end
echo.
pause
