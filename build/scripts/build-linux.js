/**
 * build-linux.js – Script de build pour Linux (AppImage + .deb)
 *
 * Usage : node build/scripts/build-linux.js
 *
 * Prérequis :
 *   - Node.js ≥ 18
 *   - npm install effectué
 *   - Icône PNG : assets/icons/icon.png (recommandé : 512×512)
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const ROOT   = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(ROOT, 'build', 'electron-builder.json');
const DIST   = path.join(ROOT, 'dist');

console.log('🐧  Morpion Ultimate — Build Linux');
console.log('────────────────────────────────────');

if (!fs.existsSync(CONFIG)) {
  console.error('❌  electron-builder.json introuvable :', CONFIG);
  process.exit(1);
}

fs.mkdirSync(DIST, { recursive: true });

try {
  console.log('📦  Installation des dépendances…');
  execSync('npm install', { cwd: ROOT, stdio: 'inherit' });

  console.log('🔨  Build en cours (Linux x64 – AppImage + deb)…');
  execSync(
    `npx electron-builder --linux --config "${CONFIG}"`,
    { cwd: ROOT, stdio: 'inherit' }
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
    const files = fs.readdirSync(DIST).filter(f => /\.(AppImage|deb)$/.test(f));
    files.forEach(f => {
      const size = (fs.statSync(path.join(DIST, f)).size / 1024 / 1024).toFixed(1);
      console.log(`   📁 ${f} (${size} MB)`);
    });
  } catch {}
}
