'use strict';

const DIFFICULTY_CONFIG = {
  beginner: { depth: 0, label: '🟢 Débutant',  description: 'Joue aléatoirement' },
  normal:   { depth: 2, label: '🟡 Normal',     description: 'Minimax profondeur 2' },
  hard:     { depth: 4, label: '🟠 Difficile',  description: 'Minimax + heuristique' },
  pro:      { depth: 9, label: '🔴 Pro',         description: 'Minimax parfait' }
};

function randomMove(board) {
  const empty = board.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);
  if (empty.length === 0) return -1;
  return empty[Math.floor(Math.random() * empty.length)];
}

function getAIMove(board, aiSymbol, oppSymbol, difficulty = 'normal') {
  if (difficulty === 'beginner') return randomMove(board);
  if (difficulty === 'normal' && Math.random() < 0.25) return randomMove(board);
  if (difficulty === 'hard'   && Math.random() < 0.05) return randomMove(board);

  const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.normal;
  return window.Minimax.bestMove(board, aiSymbol, oppSymbol, config.depth);
}

function getDifficultyInfo(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.normal;
}

window.Difficulty = { getAIMove, getDifficultyInfo, DIFFICULTY_CONFIG };