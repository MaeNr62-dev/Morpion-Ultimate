# Sons – Morpion Ultimate

## Synthèse Web Audio (par défaut)

Morpion Ultimate génère **tous ses sons via l'API Web Audio** directement en JavaScript
(`scripts/sound.js`). Aucun fichier audio externe n'est nécessaire.

Sons synthétisés :
- `click()`  – clic sur une cellule (joueur humain)
- `win()`    – fanfare de victoire (4 notes ascendantes)
- `draw()`   – accord neutre descendant (match nul)
- `aiMove()` – son distinct pour le coup de l'IA
- `error()`  – buzzer court (case déjà jouée)
- `select()` – bip de navigation menu

## Sons personnalisés (optionnel)

Pour utiliser des fichiers audio MP3/WAV personnalisés :

1. Placez vos fichiers ici : `assets/sounds/`
   - `click.mp3`
   - `win.mp3`
   - `draw.mp3`
   - `error.mp3`

2. Modifiez `scripts/sound.js` pour charger les fichiers via `Audio()` :
   ```js
   const sndClick = new Audio('assets/sounds/click.mp3');
   function click() { sndClick.currentTime = 0; sndClick.play(); }
   ```

Les fichiers sont liés dans la CSP via `media-src 'self'`.
