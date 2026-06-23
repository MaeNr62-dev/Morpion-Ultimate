# 🤖 Morpion Ultimate – Build Android via GitHub Actions

Ce dossier contient tout ce qu'il faut pour générer automatiquement
un APK Android via **GitHub Actions**, sans avoir Android Studio en local.

---

## 📁 Structure

```
.
├─ .github/
│  └─ workflows/
│     └─ build-android.yml   ← Le workflow GitHub Actions
├─ capacitor.config.json     ← Config Capacitor
├─ package.json              ← Dépendances Capacitor
└─ README.md
```

---

## 🚀 Utilisation

### Étape 1 — Copie ces fichiers dans ton dépôt Morpion Ultimate

Place le dossier `.github/` et les fichiers `capacitor.config.json`
et `package.json` **à la racine** de ton dépôt GitHub.

```
morpion-ultimate/          ← racine du dépôt
├─ .github/
│  └─ workflows/
│     └─ build-android.yml
├─ capacitor.config.json   ← nouveau
├─ package.json            ← mettre à jour (voir ci-dessous)
├─ main.js
├─ index.html
└─ ...
```

> ⚠️ Fusionne le `package.json` fourni avec celui de ton projet :
> ajoute les `devDependencies` Capacitor à ton `package.json` existant.

---

### Étape 2 — Push sur GitHub

```bash
git add .github/ capacitor.config.json
git commit -m "feat: add GitHub Actions Android build"
git push
```

Le workflow se déclenche **automatiquement** à chaque push sur `main` ou `master`.

---

### Étape 3 — Récupère l'APK

1. Va sur ton dépôt GitHub → onglet **Actions**
2. Clique sur le dernier workflow `Build Android APK`
3. En bas de la page → **Artifacts** → télécharge `MorpionUltimate-APK`

---

## 🏷️ Créer une Release avec l'APK

Pour publier automatiquement l'APK sur une Release GitHub,
crée un tag de version :

```bash
git tag v1.0.0
git push origin v1.0.0
```

Le workflow détecte le tag et crée une Release avec l'APK en pièce jointe.

---

## ⏱️ Durée du build

| Étape              | Durée estimée |
|-------------------|---------------|
| Setup environnement | ~1 min       |
| npm install         | ~1 min       |
| Capacitor sync      | ~30 sec      |
| Gradle build        | ~3–5 min     |
| **Total**           | **~6–7 min** |

Le cache Gradle (étape 11) réduit les builds suivants à ~2–3 min.

---

## 🔧 Personnalisation

### Changer l'ID de l'app
Dans `capacitor.config.json` :
```json
"appId": "com.tonnom.morpion"
```

### Build release (signé) au lieu de debug
Ajoute tes secrets dans GitHub → Settings → Secrets :
- `KEYSTORE_FILE` (base64 du .jks)
- `KEY_ALIAS`
- `KEY_PASSWORD`
- `STORE_PASSWORD`

Puis remplace dans le workflow :
```yaml
run: ./gradlew assembleRelease
```

### Désactiver le déclenchement sur PR
Retire le bloc `pull_request` du workflow.
