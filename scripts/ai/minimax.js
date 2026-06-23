'use strict';

function minimax(board, depth, isMaximizing, alpha, beta, aiSymbol, oppSymbol, maxDepth) {
  if (window.Evaluation.checkWin(board, aiSymbol))  return 100 - depth;
  if (window.Evaluation.checkWin(board, oppSymbol)) return depth - 100;
  if (window.Evaluation.isBoardFull(board))          return 0;
  if (depth >= maxDepth) return window.Evaluation.evaluateBoard(board, aiSymbol, oppSymbol);

  const empty = board.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);

  if (isMaximizing) {
    let best = -Infinity;
    for (const i of empty) {
      board[i] = aiSymbol;
      const score = minimax(board, depth+1, false, alpha, beta, aiSymbol, oppSymbol, maxDepth);
      board[i] = null;
      best  = Math.max(best, score);
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const i of empty) {
      board[i] = oppSymbol;
      const score = minimax(board, depth+1, true, alpha, beta, aiSymbol, oppSymbol, maxDepth);
      board[i] = null;
      best = Math.min(best, score);
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

function bestMove(board, aiSymbol, oppSymbol, maxDepth) {
  let bestScore = -Infinity;
  let move = -1;
  const empty = board.reduce((acc, v, i) => v === null ? [...acc, i] : acc, []);
  for (const i of empty) {
    board[i] = aiSymbol;
    const score = minimax(board, 0, false, -Infinity, Infinity, aiSymbol, oppSymbol, maxDepth);
    board[i] = null;
    if (score > bestScore) { bestScore = score; move = i; }
  }
  return move;
}

window.Minimax = { minimax, bestMove };