/**
 * main.js – Processus principal Electron pour Morpion Ultimate
 * Gère la fenêtre principale, le menu natif et les événements IPC.
 */

const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');

// Empêche plusieurs instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 820,
    minWidth: 680,
    minHeight: 700,
    title: 'Morpion Ultimate',
    icon: path.join(__dirname, 'assets', 'icons', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    backgroundColor: '#0f172a',
    show: false // On attend le ready-to-show pour éviter le flash blanc
  });

  mainWindow.loadFile('index.html');

  // Affiche la fenêtre proprement une fois rendue
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Ouvre les liens externes dans le navigateur système
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Menu natif simplifié
  buildMenu();
}

function buildMenu() {
  const template = [
    {
      label: 'Jeu',
      submenu: [
        { label: 'Nouvelle partie', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('menu-new-game') },
        { label: 'Réinitialiser scores', click: () => mainWindow.webContents.send('menu-reset-scores') },
        { type: 'separator' },
        { label: 'Quitter', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
      ]
    },
    {
      label: 'Affichage',
      submenu: [
        { label: 'Plein écran', accelerator: 'F11', role: 'togglefullscreen' },
        { label: 'Zoom +', accelerator: 'CmdOrCtrl+=', role: 'zoomin' },
        { label: 'Zoom –', accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
        { label: 'Réinitialiser zoom', accelerator: 'CmdOrCtrl+0', role: 'resetzoom' },
        { type: 'separator' },
        { label: 'Outils de développement', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' }
      ]
    },
    {
      label: 'Aide',
      submenu: [
        {
          label: 'À propos de Morpion Ultimate',
          click: () => mainWindow.webContents.send('menu-about')
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// IPC : expose une API minimale au renderer via preload
ipcMain.handle('app-version', () => app.getVersion());
ipcMain.handle('platform', () => process.platform);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
