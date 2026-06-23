/**
 * build-mac.js – Script de build pour macOS (DMG + zip)
 *
 * Usage : node build/scripts/build-mac.js
 *
 * Prérequis :
 *   - macOS uniquement (electron-builder ne peut pas cross-compiler .dmg)
 *   - Xcode Command Line Tools : xcode-select --install
 *   - npm install effectué
 *   - Icône : assets/icons/icon.icns (générable depuis un PNG 1024×1024)
 *
 * Signature (optionnel) :
 *   Définissez CSC_LINK et CSC_KEY_PASSWORD pour signer avec un certificat Apple.
 *   Sans certificat, le build fonctionne mais macOS affichera un avertissement Gatekeeper.
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs   = require('fs');

const ROOT   = path.resolve(__dirname, '..', '..');
const CONFIG = path.join(ROOT, 'build', 'electron-builder.json');
const DIST   = path.join(ROOT, 'dist');

console.log('🍎  Morpion Ultimate — Build macOS');
console.log('────────────────────────────────────');

// Vérifie qu'on tourne bien sur macOS
if (process.platform !== 'darwin') {
  console.error('❌  Ce script doit être exécuté sur macOS.');
  console.error('    Pour cross-compiler, utilisez un Mac ou un service CI comme GitHub Actions.');
  process.exit(1);
}

if (!fs.existsSync(CONFIG)) {
  console.error('❌  electron-builder.json introuvable :', CONFIG);
  process.exit(1);
}

fs.mkdirSync(DIST, { recursive: true });

// Génère une icône .icns depuis icon.png si elle est absente
const icnsPath = path.join(ROOT, 'assets', 'icons', 'icon.icns');
const pngPath  = path.join(ROOT, 'assets', 'icons', 'icon.png');

if (!fs.existsSync(icnsPath) && fs.existsSync(pngPath)) {
  console.log('🖼️   Génération de icon.icns depuis icon.png…');
  try {
    const iconsetDir = path.join(ROOT, 'assets', 'icons', 'icon.iconset');
    fs.mkdirSync(iconsetDir, { recursive: true });

    const sizes = [16, 32, 64, 128, 256, 512];
    for (const s of sizes) {
      execSync(`sips -z ${s} ${s} "${pngPath}" --out "${iconsetDir}/icon_${s}x${s}.png"`, { stdio: 'pipe' });
      execSync(`sips -z ${s * 2} ${s * 2} "${pngPath}" --out "${iconsetDir}/icon_${s}x${s}@2x.png"`, { stdio: 'pipe' });
    }

    execSync(`iconutil -c icns "${iconsetDir}" -o "${icnsPath}"`);
    fs.rmSync(iconsetDir, { recursive: true });
    console.log('✅  icon.icns généré.');
  } catch (e) {
    console.warn('⚠️   Impossible de générer icon.icns :', e.message);
    console.warn('    Le build continuera sans icône personnalisée.');
  }
}

try {
  console.log('📦  Installation des dépendances…');
  execSync('npm install', { cwd: ROOT, stdio: 'inherit' });

  console.log('🔨  Build en cours (macOS x64 + arm64 – DMG)…');
  execSync(
    `npx electron-builder --mac --config "${CONFIG}"`,
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: {
        ...process.env,
        // Désactive la signature automatique si aucun certificat n'est configuré
        CSC_IDENTITY_AUTO_DISCOVERY: process.env.CSC_LINK ? 'true' : 'false'
      }
    }
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
    const files = fs.readdirSync(DIST).filter(f => /\.(dmg|zip)$/.test(f));
    files.forEach(f => {
      const size = (fs.statSync(path.join(DIST, f)).size / 1024 / 1024).toFixed(1);
      console.log(`   📁 ${f} (${size} MB)`);
    });
  } catch {}
}
