/**
 * build-win.js – Script de build pour Windows (NSIS + Portable)
 *
 * Usage : node build/scripts/build-win.js
 *
 * Prérequis :
 *   - wine (sur Linux/macOS pour cross-compilation)
 *   - npm install effectué
 *   - Icône : assets/icons/icon.ico
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const ROOT   = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(ROOT, 'build', 'electron-builder.json');
const DIST   = path.join(ROOT, 'dist');

console.log('🪟  Morpion Ultimate — Build Windows');
console.log('─────────────────────────────────────');

// Vérifie l'existence de la config
if (!fs.existsSync(CONFIG)) {
  console.error('❌  electron-builder.json introuvable :', CONFIG);
  process.exit(1);
}

// Crée le dossier dist si nécessaire
fs.mkdirSync(DIST, { recursive: true });

try {
  console.log('📦  Installation des dépendances…');
  execSync('npm install', { cwd: ROOT, stdio: 'inherit' });

  console.log('🔨  Build en cours (Windows x64 + ia32)…');
  execSync(
    `npx electron-builder --win --config "${CONFIG}"`,
    { cwd: ROOT, stdio: 'inherit', env: { ...process.env, CSC_IDENTITY_AUTO_DISCOVERY: 'false' } }
  );

  console.log('');
  console.log('✅  Build terminé ! Fichiers dans :', DIST);
  _listDist();
} catch (err) {
  console.error('❌  Erreur lors du build :', err.message);
  process.exit(1);
}

function _listDist() {
  try {
    const files = fs.readdirSync(DIST).filter(f => /\.(exe|msi|AppImage|deb|dmg)$/.test(f));
    files.forEach(f => {
      const size = (fs.statSync(path.join(DIST, f)).size / 1024 / 1024).toFixed(1);
      console.log(`   📁 ${f} (${size} MB)`);
    });
  } catch {}
}
