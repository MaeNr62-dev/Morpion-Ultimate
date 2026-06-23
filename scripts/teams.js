/**
 * teams.js – Gestion des équipes pour les modes 2v2 / 3v3 / 4v4.
 *
 * En mode équipe, chaque symbole (X ou O) est associé à une liste de joueurs.
 * Le tour alterne entre les membres d'une même équipe à chaque coup joué.
 *
 * Exemple (2v2) :
 *   Équipe X : [Alice, Bob]    → Alice joue coup 1, Bob joue coup 3, Alice coup 5…
 *   Équipe O : [Charlie, Dana] → Charlie joue coup 2, Dana joue coup 4…
 */

'use strict';

/**
 * Génère les noms par défaut pour une équipe.
 * @param {string} symbol   – 'X' ou 'O'
 * @param {number} count    – nombre de joueurs
 * @returns {string[]}
 */
function defaultTeamNames(symbol, count) {
  return Array.from({ length: count }, (_, i) => `${symbol}${i + 1}`);
}

/**
 * Crée un objet "Teams" à partir de la configuration de la partie.
 *
 * @param {string}   mode    – '2v2' | '3v3' | '4v4'
 * @param {string[]} namesX  – noms des joueurs de l'équipe X
 * @param {string[]} namesO  – noms des joueurs de l'équipe O
 * @returns {{ playersX: string[], playersO: string[], indexX: number, indexO: number }}
 */
function createTeams(mode, namesX, namesO) {
  const sizeMap = { '2v2': 2, '3v3': 3, '4v4': 4 };
  const size = sizeMap[mode] || 2;

  // Complète / réduit les tableaux à la bonne taille
  const fillNames = (names, symbol) => {
    const def = defaultTeamNames(symbol, size);
    return Array.from({ length: size }, (_, i) => (names[i] || def[i]).trim() || def[i]);
  };

  return {
    playersX: fillNames(namesX, 'X'),
    playersO: fillNames(namesO, 'O'),
    indexX: 0, // index du joueur actif dans l'équipe X
    indexO: 0  // index du joueur actif dans l'équipe O
  };
}

/**
 * Retourne le nom du joueur actif pour le symbole donné.
 * @param {{ playersX, playersO, indexX, indexO }} teams
 * @param {string} symbol
 * @returns {string}
 */
function getActivePlayer(teams, symbol) {
  if (symbol === 'X') return teams.playersX[teams.indexX];
  return teams.playersO[teams.indexO];
}

/**
 * Avance le tour au prochain joueur dans l'équipe du symbole donné.
 * @param {{ playersX, playersO, indexX, indexO }} teams
 * @param {string} symbol
 * @returns {{ indexX: number, indexO: number }} – objet teams mis à jour (muté)
 */
function advanceTeamTurn(teams, symbol) {
  if (symbol === 'X') {
    teams.indexX = (teams.indexX + 1) % teams.playersX.length;
  } else {
    teams.indexO = (teams.indexO + 1) % teams.playersO.length;
  }
  return teams;
}

/**
 * Retourne une description des équipes pour l'affichage UI.
 * @param {{ playersX, playersO }} teams
 * @returns {{ x: string, o: string }}
 */
function getTeamBadgeText(teams) {
  return {
    x: '✕ ' + teams.playersX.join(', '),
    o: '○ ' + teams.playersO.join(', ')
  };
}

/**
 * Collecte les noms des joueurs depuis les inputs du DOM pour une équipe.
 * @param {string} symbol – 'X' ou 'O'
 * @returns {string[]}
 */
function collectTeamInputs(symbol) {
  const container = document.getElementById(`team-${symbol.toLowerCase()}-inputs`);
  if (!container) return [];
  return Array.from(container.querySelectorAll('input')).map(i => i.value.trim());
}

/**
 * Génère dynamiquement les inputs pour une équipe dans le DOM.
 * @param {string} symbol – 'X' ou 'O'
 * @param {number} count  – nombre de joueurs
 */
function renderTeamInputs(symbol, count) {
  const container = document.getElementById(`team-${symbol.toLowerCase()}-inputs`);
  if (!container) return;
  container.innerHTML = '';

  for (let i = 1; i <= count; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Joueur ${symbol}${i}`;
    input.maxLength = 20;
    container.appendChild(input);
  }
}

window.Teams = {
  createTeams,
  getActivePlayer,
  advanceTeamTurn,
  getTeamBadgeText,
  collectTeamInputs,
  renderTeamInputs
};
