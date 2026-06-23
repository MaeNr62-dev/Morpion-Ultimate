@echo off
echo === Verification Node.js ===

node -v >nul 2>&1
IF ERRORLEVEL 1 (
    echo Node.js non installe
    echo Installation des dependances via npm...
    npm install
) ELSE (
    echo Node.js OK
)

echo.
echo Choisis la plateforme :
echo 1 - Windows
echo 2 - Linux
echo 3 - Quitter

set /p choice=Ton choix :

IF "%choice%"=="1" (
    npm run build:win
) ELSE IF "%choice%"=="2" (
    npm run build:linux
) ELSE (
    exit
)

pause