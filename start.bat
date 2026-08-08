@echo off
title Square Cube - Dev Server
echo.
echo  ==========================================
echo   Square Cube - Starting Development Server
echo  ==========================================
echo.

cd /d "%~dp0apps\web"

echo  Checking dependencies...
if not exist "node_modules" (
    echo  node_modules not found. Running npm install...
    cd /d "%~dp0"
    call npm install
    cd /d "%~dp0apps\web"
)

echo  Starting Next.js on http://localhost:3000
echo  Press Ctrl+C to stop.
echo.

npx next dev
