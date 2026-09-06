@echo off
setlocal
cd /d "%~dp0"
title TrankiJamBot - install

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Download it from https://nodejs.org - version 18 or newer.
  goto :end
)

echo Node.js version:
node -v
echo.

set "ENV_CREATED=0"
if not exist ".env" (
  echo [INFO] .env not found. Creating it from .env.example...
  copy /y ".env.example" ".env" >nul
  set "ENV_CREATED=1"
  echo.
)

echo === Installing dependencies ===
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo.
  echo [ERROR] npm install failed. See the output above.
  goto :end
)
echo.

if "%ENV_CREATED%"=="1" (
  echo [INFO] Skipping command registration: fill in .env first, then run install.bat again.
  goto :end
)

echo === Registering slash commands with Discord ===
call npm run deploy
if errorlevel 1 (
  echo.
  echo [ERROR] Could not register commands. Check DISCORD_TOKEN and CLIENT_ID in .env.
  goto :end
)
echo.
echo Done. Run run.bat to start the bot.

:end
echo.
pause
