#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════
# build-android.sh – Build APK Android via Capacitor
# Morpion Ultimate
#
# Usage : bash build/scripts/build-android.sh
#
# Prérequis :
#   - Node.js ≥ 18
#   - npm install effectué à la racine
#   - Android Studio + SDK (ANDROID_HOME configuré)
#   - Java JDK 17
#   - Capacitor CLI : npm install -g @capacitor/cli
# ════════════════════════════════════════════════════════════════

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ANDROID_DIR="$ROOT/android"
CAP_DIR="$ANDROID_DIR/capacitor"
DIST_DIR="$ROOT/dist"

echo "🤖  Morpion Ultimate — Build Android (APK)"
echo "────────────────────────────────────────────"

# ── Vérifications préalables ──
command -v node  >/dev/null 2>&1 || { echo "❌  Node.js non trouvé."; exit 1; }
command -v npm   >/dev/null 2>&1 || { echo "❌  npm non trouvé."; exit 1; }
command -v npx   >/dev/null 2>&1 || { echo "❌  npx non trouvé."; exit 1; }

if [ -z "$ANDROID_HOME" ]; then
  echo "⚠️   ANDROID_HOME n'est pas défini."
  echo "    Définissez-le, par exemple :"
  echo "    export ANDROID_HOME=\$HOME/Android/Sdk"
  echo "    export PATH=\$PATH:\$ANDROID_HOME/tools:\$ANDROID_HOME/platform-tools"
fi

# ── Installation des dépendances ──
echo "📦  Installation des dépendances npm…"
cd "$ROOT"
npm install

# ── Installation de Capacitor si besoin ──
if ! npx cap --version >/dev/null 2>&1; then
  echo "📦  Installation de Capacitor CLI…"
  npm install --save-dev @capacitor/cli @capacitor/core @capacitor/android
fi

# ── Création du projet Capacitor si absent ──
if [ ! -d "$CAP_DIR" ]; then
  echo "🏗️   Initialisation du projet Capacitor…"
  mkdir -p "$CAP_DIR"
  cd "$CAP_DIR"

  # Initialise Capacitor (les fichiers HTML/JS sont servis depuis la racine)
  npx cap init "Morpion Ultimate" "com.morpion.ultimate" --web-dir "$ROOT"

  # Ajout de la plateforme Android
  npx cap add android

  echo "✅  Projet Capacitor créé dans : $CAP_DIR"
  cd "$ROOT"
fi

# ── Sync des assets ──
echo "🔄  Synchronisation des assets Capacitor…"
cd "$CAP_DIR"
npx cap sync android

# ── Build Gradle ──
echo "🔨  Build APK (mode debug)…"
ANDROID_PROJ="$CAP_DIR/android"

if [ -d "$ANDROID_PROJ" ]; then
  cd "$ANDROID_PROJ"
  chmod +x gradlew
  ./gradlew assembleDebug --no-daemon 2>&1 | tail -30

  # Copie l'APK dans dist/
  mkdir -p "$DIST_DIR"
  APK_PATH=$(find . -name "*.apk" -not -path "*/intermediates/*" | head -1)

  if [ -n "$APK_PATH" ]; then
    cp "$APK_PATH" "$DIST_DIR/MorpionUltimate-debug.apk"
    echo ""
    echo "✅  APK généré : $DIST_DIR/MorpionUltimate-debug.apk"
    SIZE=$(du -h "$DIST_DIR/MorpionUltimate-debug.apk" | cut -f1)
    echo "   Taille : $SIZE"
  else
    echo "⚠️   APK introuvable après le build Gradle."
    exit 1
  fi
else
  echo "❌  Dossier Android introuvable : $ANDROID_PROJ"
  echo "    Relancez le script pour réinitialiser Capacitor."
  exit 1
fi

echo ""
echo "🎉  Build Android terminé !"
echo "    Installez l'APK sur votre appareil :"
echo "    adb install $DIST_DIR/MorpionUltimate-debug.apk"
