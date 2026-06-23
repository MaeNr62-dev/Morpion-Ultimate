/**
 * preload.js – Pont sécurisé entre le processus principal et le renderer.
 * Expose uniquement les API nécessaires via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Informations applicatives
  getVersion: () => ipcRenderer.invoke('app-version'),
  getPlatform: () => ipcRenderer.invoke('platform'),

  // Événements issus du menu natif
  onMenuNewGame: (cb) => ipcRenderer.on('menu-new-game', cb),
  onMenuResetScores: (cb) => ipcRenderer.on('menu-reset-scores', cb),
  onMenuAbout: (cb) => ipcRenderer.on('menu-about', cb),

  // Nettoyage des listeners (bonne pratique)
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
