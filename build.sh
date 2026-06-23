#!/bin/bash

echo "=========================================="
echo "  Morpion Ultimate - Build Electron"
echo "=========================================="
echo

# Vérifier Node.js
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js n'est pas installé"
  echo "👉 https://nodejs.org"
  exit 1
fi

echo "✅ Node.js détecté : $(node -v)"

# Vérifier npm
if ! command -v npm >/dev/null 2>&1; then
  echo "❌ npm est introuvable"
  exit 1
fi

echo
echo "📦 Installation des dépendances..."
npm install || exit 1

echo
echo "=========================================="
echo " Choisir la plateforme de build"
echo "=========================================="
echo "1 - Linux (.AppImage)"
echo "2 - Windows (.exe)"
echo "3 - macOS (.dmg)"
echo

read -p "Votre choix (1-3): " choice

case $choice in
  1)
    echo "🐧 Build Linux..."
    npm run build:linux
    ;;
  2)
    echo "🪟 Build Windows..."
    npm run build:win
    ;;
  3)
    echo "🍎 Build macOS..."
    npm run build:mac
    ;;
  *)
    echo "❌ Choix invalide"
    exit 1
    ;;
esac

echo
echo "✅ Build terminé"