# 🎮 Morpion Ultimate

> Jeu de morpion complet, multiplateforme, avec IA Minimax, modes équipes, thèmes et historique persistant.

![Version](https://img.shields.io/badge/version-1.0.0-6366f1)
![Electron](https://img.shields.io/badge/Electron-30-47848F)
![License](https://img.shields.io/badge/license-MIT-22c55e)

---

## ✨ Fonctionnalités

### 🎮 Modes de jeu
| Mode       | Description                          |
|-----------|--------------------------------------|
| 1v1 Local  | Deux joueurs en local avec noms       |
| 1 vs IA    | Joueur contre l'intelligence artificielle |
| 2v2 Équipes | Deux équipes de 2 joueurs chacune     |
| 3v3 Équipes | Deux équipes de 3 joueurs chacune     |
| 4v4 Équipes | Deux équipes de 4 joueurs chacune     |

### 🤖 Intelligence Artificielle
- **Algorithme Minimax** pur avec **élagage Alpha-Bêta**
- 4 niveaux de difficulté :
  - 🟢 **Débutant** – coups aléatoires
  - 🟡 **Normal** – Minimax profondeur 2 + 25% aléatoire
  - 🟠 **Difficile** – Minimax + heuristique, profondeur 4
  - 🔴 **Pro** – Minimax profondeur maximale (résolution parfaite)

### 🏆 Données persistantes
- **Historique** des 100 dernières parties (localStorage)
- **Classement** avec victoires, défaites, nuls et ratio
- Effacement manuel possible

### 🎨 Interface
- **6 thèmes prédéfinis** : Sombre, Clair, Océan, Forêt, Coucher de soleil, Néon
- **Éditeur de thème** couleur personnalisé
- **Animations CSS** : apparition des cellules, victoire, confettis, shake erreur
- **Sons synthétisés** via Web Audio API (aucun fichier requis)
- Toggle son activé/désactivé

### 🪟 Multiplateforme
- **Windows** : installeur NSIS + Portable (`.exe`)
- **Linux** : AppImage + `.deb`
- **Android** : APK via Capacitor
- **macOS** : DMG (configuration incluse)

---

## 🚀 Démarrage rapide

```bash
# Cloner le dépôt
git clone https://github.com/votre-user/morpion-ultimate.git
cd morpion-ultimate

# Installer les dépendances
npm install

# Lancer en développement
npm start
```

---

## 📦 Build

### Windows
```bash
npm run build:win
# ou
node build/scripts/build-win.js
```
Génère `dist/MorpionUltimate-1.0.0-Setup.exe`

### Linux
```bash
npm run build:linux
# ou
node build/scripts/build-linux.js
```
Génère `dist/MorpionUltimate-1.0.0.AppImage` et `.deb`

### Android (APK)
```bash
# Prérequis : Android Studio, JDK 17, ANDROID_HOME configuré
npm run build:android
# ou
bash build/scripts/build-android.sh
```
Génère `dist/MorpionUltimate-debug.apk`

### Toutes les plateformes
```bash
npm run build
```

---

## 📁 Structure du projet

```
morpion-ultimate/
├─ package.json              # Config npm + scripts
├─ main.js                   # Processus principal Electron
├─ preload.js                # Bridge sécurisé main ↔ renderer
├─ index.html                # Interface principale
│
├─ styles/
│  ├─ main.css               # Styles fondamentaux + variables CSS
│  ├─ dark.css               # Thèmes (sombre, clair, océan, forêt, coucher, néon)
│  ├─ animations.css         # Keyframes et animations
│  └─ themes/
│     └─ custom.css          # Thème personnalisé utilisateur
│
├─ scripts/
│  ├─ sound.js               # Moteur audio Web Audio API
│  ├─ history.js             # Historique + classement (localStorage)
│  ├─ teams.js               # Gestion des modes équipes
│  ├─ game.js                # Logique principale du jeu
│  ├─ ui.js                  # Contrôleur UI complet
│  └─ ai/
│     ├─ evaluation.js       # Évaluation heuristique du plateau
│     ├─ minimax.js          # Algorithme Minimax + Alpha-Bêta
│     └─ difficulty.js       # Niveaux de difficulté
│
├─ assets/
│  ├─ icons/                 # icon.png / .ico / .icns
│  └─ sounds/                # Sons personnalisés (optionnel)
│
├─ build/
│  ├─ electron-builder.json  # Configuration du build
│  └─ scripts/
│     ├─ build-win.js        # Script build Windows
│     ├─ build-linux.js      # Script build Linux
│     └─ build-android.sh    # Script build Android
│
├─ android/
│  └─ capacitor/
│     └─ capacitor.config.json
│
├─ README.md
└─ .gitignore
```

---

## 🧠 Architecture de l'IA

L'IA implémente l'algorithme **Minimax** classique avec **élagage Alpha-Bêta** :

```
                 MAX (IA = O)
                /      |      \
              O·0     O·4     O·8
             / | \   / | \   / | \
           MIN MIN MIN ...
          (X) (X) (X)
```

- **Terminal states** : victoire (+100−depth), défaite (−100+depth), nul (0)
- **Élagage α-β** : élimine les branches inutiles, réduit la complexité de O(b^d) à O(b^(d/2))
- **Évaluation heuristique** : compte les alignements potentiels + bonus centre/coins
- **Profondeurs** : Débutant=0 (aléatoire), Normal=2, Difficile=4, Pro=9 (parfait)

---

## 🎨 Système de thèmes

Tous les thèmes sont basés sur des **variables CSS** (`--bg`, `--accent`, `--x-color`…).
L'éditeur de thème modifie ces variables à chaud via une balise `<style>` inline.

Pour créer un thème manuellement, ajoutez dans `styles/themes/custom.css` :
```css
body.theme-custom {
  --bg:       #1a0a2e;
  --accent:   #a855f7;
  --x-color:  #f0abfc;
  --o-color:  #67e8f9;
}
```

---

## 🔊 Système audio

Les sons sont synthétisés en temps réel via **Web Audio API** — aucun fichier audio nécessaire.
La fréquence, durée, type d'onde et enveloppe ADSR sont configurés dans `scripts/sound.js`.

---

## 📄 Licence

MIT © 2025 Morpion Ultimate
