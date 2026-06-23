/**
 * history.js – Gestion de l'historique des parties et du classement.
 *
 * Stockage : localStorage (clé 'morpion_history' et 'morpion_leaderboard')
 * Format d'une entrée d'historique :
 * {
 *   id:        string (timestamp unique),
 *   date:      ISO string,
 *   mode:      '1v1' | '1vAI' | '2v2' | '3v3' | '4v4',
 *   winner:    string (nom du gagnant) | null (match nul),
 *   loser:     string | null,
 *   winSymbol: 'X' | 'O' | null,
 *   players:   { X: string[], O: string[] },
 *   difficulty?: string (pour mode 1vAI),
 *   moves:     number (nombre de coups joués)
 * }
 */

'use strict';

const HISTORY_KEY     = 'morpion_history';
const LEADERBOARD_KEY = 'morpion_leaderboard';
const MAX_HISTORY     = 100; // Limite de conservation

/**
 * Récupère l'historique complet.
 * @returns {Array<Object>}
 */
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Sauvegarde l'historique complet.
 * @param {Array<Object>} history
 */
function saveHistory(history) {
  try {
    // On garde seulement les N dernières parties
    const trimmed = history.slice(-MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Impossible de sauvegarder l\'historique:', e);
  }
}

/**
 * Ajoute une partie à l'historique.
 * @param {Object} entry
 */
function addGameToHistory(entry) {
  const history = getHistory();
  history.push({
    id:   Date.now().toString(),
    date: new Date().toISOString(),
    ...entry
  });
  saveHistory(history);
  updateLeaderboard(entry);
}

/**
 * Efface tout l'historique.
 */
function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(LEADERBOARD_KEY);
}

// ═══════════════════════════════
// CLASSEMENT
// ═══════════════════════════════

/**
 * Récupère le classement.
 * @returns {Object<string, { wins: number, losses: number, draws: number, games: number }>}
 */
function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Met à jour le classement depuis une entrée de partie.
 * @param {Object} entry
 */
function updateLeaderboard(entry) {
  const lb = getLeaderboard();

  const allPlayers = [
    ...(entry.players?.X || []),
    ...(entry.players?.O || [])
  ].filter(Boolean);

  for (const name of allPlayers) {
    if (!lb[name]) lb[name] = { wins: 0, losses: 0, draws: 0, games: 0 };
    lb[name].games++;

    if (entry.winner === null) {
      // Match nul
      lb[name].draws++;
    } else if (entry.players?.X?.includes(name) && entry.winSymbol === 'X') {
      lb[name].wins++;
    } else if (entry.players?.O?.includes(name) && entry.winSymbol === 'O') {
      lb[name].wins++;
    } else {
      lb[name].losses++;
    }
  }

  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
  } catch (e) {
    console.warn('Impossible de sauvegarder le classement:', e);
  }
}

/**
 * Retourne le classement trié par victoires décroissantes.
 * @returns {Array<{ name: string, wins: number, losses: number, draws: number, games: number, ratio: number }>}
 */
function getSortedLeaderboard() {
  const lb = getLeaderboard();
  return Object.entries(lb)
    .map(([name, stats]) => ({
      name,
      ...stats,
      ratio: stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0
    }))
    .sort((a, b) => b.wins - a.wins || b.ratio - a.ratio);
}

/**
 * Formate une date ISO pour l'affichage.
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  const d = new Date(isoDate);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/**
 * Retourne un libellé lisible pour le mode de jeu.
 * @param {string} mode
 * @returns {string}
 */
function getModeLabel(mode) {
  const labels = {
    '1v1':  '1v1 Local',
    '1vAI': '1 vs IA',
    '2v2':  '2v2 Équipes',
    '3v3':  '3v3 Équipes',
    '4v4':  '4v4 Équipes'
  };
  return labels[mode] || mode;
}

window.History = {
  getHistory,
  addGameToHistory,
  clearHistory,
  getSortedLeaderboard,
  formatDate,
  getModeLabel
};
