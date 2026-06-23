/**
 * evaluation.js – Fonctions d'évaluation heuristique du plateau
 * pour l'IA Minimax de Morpion Ultimate.
 *
 * L'évaluateur attribue un score statique au plateau courant
 * en comptant les alignements potentiels et en pondérant le centre.
 */

'use strict';

// Toutes les combinaisons gagnantes sur une grille 3×3
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
  [0, 4, 8], [2, 4, 6]              // diagonales
];

/**
 * Vérifie si un joueur a gagné.
 * @param {Array<string|null>} board – grille 9 cases
 * @param {string} player – 'X' ou 'O'
 * @returns {boolean}
 */
function checkWin(board, player) {
  return WIN_LINES.some(line => line.every(i => board[i] === player));
}

/**
 * Retourne la ligne gagnante si elle existe, sinon null.
 * @param {Array<string|null>} board
 * @param {string} player
 * @returns {number[]|null}
 */
function getWinLine(board, player) {
  return WIN_LINES.find(line => line.every(i => board[i] === player)) || null;
}

/**
 * Vérifie si le plateau est complet (match nul potentiel).
 * @param {Array<string|null>} board
 * @returns {boolean}
 */
function isBoardFull(board) {
  return board.every(cell => cell !== null);
}

/**
 * Évalue heuristiquement le plateau pour un niveau de difficulté "hard".
 * Score positif → favorable à l'IA (O), négatif → favorable au joueur (X).
 *
 * Stratégie :
 *   +10 par case propre dans une ligne non bloquée (IA)
 *   −10 par case adverse dans une ligne non bloquée (joueur)
 *   +5 bonus sur la case centrale
 *   +2 bonus sur les coins
 *
 * @param {Array<string|null>} board
 * @param {string} aiSymbol  – symbole de l'IA (ex: 'O')
 * @param {string} oppSymbol – symbole de l'adversaire (ex: 'X')
 * @returns {number}
 */
function evaluateBoard(board, aiSymbol, oppSymbol) {
  let score = 0;

  for (const line of WIN_LINES) {
    const aiCount  = line.filter(i => board[i] === aiSymbol).length;
    const oppCount = line.filter(i => board[i] === oppSymbol).length;

    // Ligne avec seulement des cases IA
    if (aiCount > 0 && oppCount === 0) {
      score += aiCount === 2 ? 50 : 10;
    }
    // Ligne avec seulement des cases adversaire
    if (oppCount > 0 && aiCount === 0) {
      score -= oppCount === 2 ? 50 : 10;
    }
  }

  // Bonus position centrale
  if (board[4] === aiSymbol)  score += 5;
  if (board[4] === oppSymbol) score -= 5;

  // Bonus coins
  const corners = [0, 2, 6, 8];
  for (const c of corners) {
    if (board[c] === aiSymbol)  score += 2;
    if (board[c] === oppSymbol) score -= 2;
  }

  return score;
}

// Exposition globale pour les autres modules
window.Evaluation = { checkWin, getWinLine, isBoardFull, evaluateBoard, WIN_LINES };
