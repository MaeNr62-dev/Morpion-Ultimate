# Icônes – Morpion Ultimate

## Fichiers requis

Placez les icônes dans ce dossier avant de builder :

| Fichier        | Taille        | Usage                        |
|---------------|---------------|------------------------------|
| `icon.png`    | 512×512 px    | Linux, Capacitor (Android)   |
| `icon.ico`    | Multi-res ICO | Windows (NSIS installer)     |
| `icon.icns`   | macOS bundle  | macOS DMG                    |

## Génération automatique

Installez `electron-icon-builder` et lancez :

```bash
npm install --save-dev electron-icon-builder
npx electron-icon-builder --input=icon-source.png --output=assets/icons
```

L'outil génère automatiquement tous les formats à partir d'un PNG 1024×1024.

## Icône par défaut (développement)

Pour tester sans icône personnalisée, le projet démarre sans icône –
Electron utilise son icône par défaut. Aucune action requise.
