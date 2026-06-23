/**
 * game.js – Logique principale du jeu Morpion Ultimate (v2 avec avatars).
 */

'use strict';

const Game = (() => {
  let board = Array(9).fill(null);
  let currentSymbol = 'X';
  let active = false;
  let mode = '1v1';
  let difficulty = 'normal';
  let scores = { X: 0, O: 0 };
  let playerNames = { X: ['Joueur X'], O: ['Joueur O'] };
  let teams = null;
  let moveCount = 0;
  let aiThinking = false;

  const AI_SYMBOL  = 'O';
  const HUM_SYMBOL = 'X';

  function startGame(config) {
    mode        = config.mode       || '1v1';
    difficulty  = config.difficulty || 'normal';
    playerNames = { X: config.namesX || ['Joueur X'], O: config.namesO || ['Joueur O'] };
    teams       = config.teams || null;
    scores      = { X: 0, O: 0 };

    board         = Array(9).fill(null);
    currentSymbol = 'X';
    active        = true;
    moveCount     = 0;
    aiThinking    = false;

    UI.renderBoard(board);
    UI.updateTurnLabel(getActivePlayerName());
    UI.updateScoreAvatars();
    UI.showGameScreen();

    if (teams) UI.showTeamInfo(Teams.getTeamBadgeText(teams));
    else       UI.hideTeamInfo();
  }

  function play(i) {
    if (!active || board[i] !== null || aiThinking) return;

    board[i] = currentSymbol;
    moveCount++;
    Sound.click();

    UI.renderCell(i, currentSymbol);
    UI.animateCell(i, 'pop');

    const winLine = window.Evaluation.getWinLine(board, currentSymbol);
    if (winLine) { _handleWin(currentSymbol, winLine); return; }
    if (window.Evaluation.isBoardFull(board)) { _handleDraw(); return; }

    _nextTurn();
  }

  function _handleWin(symbol, winLine) {
    active = false;
    scores[symbol]++;
    UI.highlightWinLine(winLine);
    UI.updateScores(scores, playerNames);
    Sound.win();
    UI.triggerConfetti();

    const winnerName = getActivePlayerName(symbol);
    const loserName  = getActivePlayerName(symbol === 'X' ? 'O' : 'X');

    UI.showResultModal('win', winnerName, symbol);

    window.History.addGameToHistory({
      mode,
      winner:    winnerName,
      loser:     loserName,
      winSymbol: symbol,
      players: {
        X: teams ? teams.playersX : [playerNames.X[0]],
        O: teams ? teams.playersO : [playerNames.O[0]]
      },
      difficulty: mode === '1vAI' ? difficulty : undefined,
      moves: moveCount
    });
  }

  function _handleDraw() {
    active = false;
    Sound.draw();
    UI.markDrawBoard();
    UI.showResultModal('draw', null, null);

    window.History.addGameToHistory({
      mode,
      winner: null, loser: null, winSymbol: null,
      players: {
        X: teams ? teams.playersX : [playerNames.X[0]],
        O: teams ? teams.playersO : [playerNames.O[0]]
      },
      difficulty: mode === '1vAI' ? difficulty : undefined,
      moves: moveCount
    });
  }

  function _nextTurn() {
    if (teams) Teams.advanceTeamTurn(teams, currentSymbol);
    currentSymbol = currentSymbol === 'X' ? 'O' : 'X';
    UI.updateTurnLabel(getActivePlayerName());
    if (mode === '1vAI' && currentSymbol === AI_SYMBOL) _scheduleAIMove();
  }

  function _scheduleAIMove() {
    aiThinking = true;
    UI.setAIThinkingState(true);

    const delay = { beginner: 300, normal: 500, hard: 700, pro: 900 }[difficulty] || 500;

    setTimeout(() => {
      aiThinking = false;
      UI.setAIThinkingState(false);
      if (!active) return;

      const move = window.Difficulty.getAIMove([...board], AI_SYMBOL, HUM_SYMBOL, difficulty);
      if (move !== -1) { Sound.aiMove(); play(move); }
    }, delay);
  }

  function replay() {
    board = Array(9).fill(null);
    currentSymbol = 'X';
    active = true;
    moveCount = 0;
    aiThinking = false;

    if (teams) { teams.indexX = 0; teams.indexO = 0; }

    UI.renderBoard(board);
    UI.updateTurnLabel(getActivePlayerName());
    UI.hideResultModal();
    UI.clearBoardState();
  }

  function resetScores() {
    scores = { X: 0, O: 0 };
    UI.updateScores(scores, playerNames);
    UI.updateScores(scores, playerNames);
    replay();
  }

  function getActivePlayerName(symbol) {
    const sym = symbol || currentSymbol;
    if (mode === '1vAI' && sym === AI_SYMBOL) return '🤖 IA';
    if (teams) return Teams.getActivePlayer(teams, sym);
    return playerNames[sym]?.[0] || sym;
  }

  function getScores()        { return { ...scores }; }
  function getPlayerNames()   { return playerNames; }
  function getMode()          { return mode; }
  function getCurrentSymbol() { return currentSymbol; }
  function isActive()         { return active; }

  return { startGame, play, replay, resetScores, getActivePlayerName, getScores, getPlayerNames, getMode, getCurrentSymbol, isActive };
})();

window.Game = Game;
