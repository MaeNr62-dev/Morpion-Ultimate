/**
 * ui.js – Contrôleur UI Morpion Ultimate v2 (avec avatars)
 */

'use strict';

const UI = (() => {
  const $ = id => document.getElementById(id);

  const screenSetup = $('screen-setup');
  const screenGame  = $('screen-game');
  const boardEl     = $('board');
  const turnLabel   = $('turn-label');
  const gameStatus  = $('game-status');
  const scoreXName  = $('score-x-name');
  const scoreOName  = $('score-o-name');
  const scoreXVal   = $('score-x-val');
  const scoreOVal   = $('score-o-val');
  const teamInfo    = $('team-info');
  const teamXInfo   = $('team-x-info');
  const teamOInfo   = $('team-o-info');

  let currentTheme = localStorage.getItem('morpion_theme') || 'dark';
  let selectedMode = '1v1';
  let selectedDiff = 'normal';

  // ─────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────
  function showSetupScreen() {
    screenGame.classList.add('hidden');  screenGame.classList.remove('active');
    screenSetup.classList.remove('hidden'); screenSetup.classList.add('active');
  }

  function showGameScreen() {
    screenSetup.classList.add('hidden'); screenSetup.classList.remove('active');
    screenGame.classList.remove('hidden'); screenGame.classList.add('active');
  }

  // ─────────────────────────────────────────
  // PLATEAU
  // ─────────────────────────────────────────
  function renderBoard(board) {
    boardEl.innerHTML = '';
    boardEl.classList.remove('draw');

    board.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', `Case ${i + 1}`);

      if (val) {
        cell.classList.add('played', `cell-${val.toLowerCase()}`);
        _setCellAvatar(cell, val);
      }

      cell.addEventListener('click', () => {
        if (board[i] !== null) {
          cell.classList.add('invalid');
          Sound.error();
          setTimeout(() => cell.classList.remove('invalid'), 400);
          return;
        }
        Game.play(i);
      });

      boardEl.appendChild(cell);
    });
  }

  function renderCell(i, symbol) {
    const cells = boardEl.querySelectorAll('.cell');
    const cell  = cells[i];
    if (!cell) return;
    cell.classList.add('played', `cell-${symbol.toLowerCase()}`);
    _setCellAvatar(cell, symbol);
  }

  /** Injecte l'avatar (emoji ou photo) dans une cellule */
  function _setCellAvatar(cell, symbol) {
    cell.textContent = ''; // vide le texte par défaut
    const av = Avatar.getAvatar(symbol);

    if (av.type === 'photo') {
      const img = document.createElement('img');
      img.src = av.value;
      img.style.cssText = 'width:72%;height:72%;border-radius:50%;object-fit:cover;display:block;';
      cell.appendChild(img);
    } else {
      // Emoji / texte
      const span = document.createElement('span');
      span.textContent = av.value;
      span.style.cssText = 'font-size:2.4rem;line-height:1;display:block;text-align:center;';
      cell.appendChild(span);
    }
  }

  function animateCell(i, animClass) {
    const cell = boardEl.querySelectorAll('.cell')[i];
    if (!cell) return;
    cell.classList.remove(animClass);
    void cell.offsetWidth;
    cell.classList.add(animClass);
    cell.addEventListener('animationend', () => cell.classList.remove(animClass), { once: true });
  }

  function highlightWinLine(indices) {
    const cells = boardEl.querySelectorAll('.cell');
    indices.forEach(i => cells[i]?.classList.add('winning'));
  }

  function markDrawBoard()  { boardEl.classList.add('draw'); }

  function clearBoardState() {
    boardEl.classList.remove('draw');
    boardEl.querySelectorAll('.cell').forEach(c => c.classList.remove('winning','pop','invalid'));
  }

  // ─────────────────────────────────────────
  // SCORES
  // ─────────────────────────────────────────
  function updateTurnLabel(name) {
    turnLabel.textContent = `Tour de ${name}`;
    turnLabel.classList.remove('change');
    void turnLabel.offsetWidth;
    turnLabel.classList.add('change');
  }

  function updateScores(scores, playerNames) {
    scoreXName.textContent = playerNames.X?.[0] || 'Équipe X';
    scoreOName.textContent = playerNames.O?.[0] || 'Équipe O';
    const bump = el => {
      el.classList.remove('bump'); void el.offsetWidth;
      el.classList.add('bump');
      el.addEventListener('animationend', () => el.classList.remove('bump'), { once: true });
    };
    scoreXVal.textContent = scores.X;
    scoreOVal.textContent = scores.O;
    bump(scoreXVal); bump(scoreOVal);
  }

  /** Met à jour les mini-avatars dans la barre de score */
  function updateScoreAvatars() {
    for (const sym of ['X','O']) {
      const el  = $(`score-avatar-${sym.toLowerCase()}`);
      if (!el) continue;
      el.innerHTML = '';
      const av = Avatar.getAvatar(sym);
      if (av.type === 'photo') {
        const img = document.createElement('img');
        img.src = av.value;
        img.style.cssText = 'width:100%;height:100%;border-radius:50%;object-fit:cover;';
        el.appendChild(img);
      } else {
        el.textContent = av.value;
        el.style.fontSize = '1.3rem';
      }
    }
  }

  function setAIThinkingState(thinking) {
    if (thinking) {
      turnLabel.classList.add('ai-thinking');
      gameStatus.textContent = 'IA en train de réfléchir…';
    } else {
      turnLabel.classList.remove('ai-thinking');
      gameStatus.textContent = '';
    }
  }

  // ─────────────────────────────────────────
  // ÉQUIPES
  // ─────────────────────────────────────────
  function showTeamInfo({ x, o }) {
    teamXInfo.textContent = x;
    teamOInfo.textContent = o;
    teamInfo.classList.remove('hidden');
  }
  function hideTeamInfo() { teamInfo.classList.add('hidden'); }

  // ─────────────────────────────────────────
  // MODALES
  // ─────────────────────────────────────────
  function showResultModal(type, winnerName, symbol) {
    if (type === 'win') {
      const av = Avatar.getAvatar(symbol);
      $('result-emoji').textContent   = av.type === 'emoji' ? av.value : '🏆';
      $('result-title').textContent   = `${winnerName} gagne !`;
      $('result-subtitle').textContent= 'Félicitations, tu as remporté la partie !';
      $('result-title').style.color   = symbol === 'X' ? 'var(--x-color)' : 'var(--o-color)';
    } else {
      $('result-emoji').textContent   = '🤝';
      $('result-title').textContent   = 'Match nul !';
      $('result-subtitle').textContent= 'Personne ne gagne cette fois. Belle partie !';
      $('result-title').style.color   = 'var(--text-muted)';
    }
    $('modal-result').classList.remove('hidden');
  }

  function hideResultModal() { $('modal-result').classList.add('hidden'); }
  function openModal(m)  { m.classList.remove('hidden'); }
  function closeModal(m) { m.classList.add('hidden'); }

  // ─────────────────────────────────────────
  // HISTORIQUE / CLASSEMENT
  // ─────────────────────────────────────────
  function renderHistory() {
    const list    = $('history-list');
    const history = History.getHistory().slice().reverse();
    if (!history.length) {
      list.innerHTML = '<div class="history-empty">Aucune partie enregistrée.</div>';
      return;
    }
    list.innerHTML = history.map(e => {
      const date   = History.formatDate(e.date);
      const mode   = History.getModeLabel(e.mode);
      const result = e.winner ? `${e.winner} a gagné` : 'Match nul';
      const diff   = e.difficulty ? ` · ${window.Difficulty.getDifficultyInfo(e.difficulty).label}` : '';
      return `<div class="history-item">
        <div class="history-item-header">
          <span class="history-winner">${result}</span>
          <span class="history-date">${date}</span>
        </div>
        <div class="history-detail">${mode}${diff} · ${e.moves} coups</div>
      </div>`;
    }).join('');
  }

  function renderLeaderboard() {
    const list    = $('leaderboard-list');
    const entries = History.getSortedLeaderboard();
    if (!entries.length) {
      list.innerHTML = '<div class="history-empty">Aucun joueur enregistré.</div>';
      return;
    }
    const rankClass = i => ['gold','silver','bronze'][i] || '';
    const rankEmoji = i => ['🥇','🥈','🥉'][i] || `${i+1}`;
    list.innerHTML = entries.map((e, i) => `
      <div class="leaderboard-row">
        <span class="lb-rank ${rankClass(i)}">${rankEmoji(i)}</span>
        <span class="lb-name">${e.name}</span>
        <span class="lb-wins">${e.wins}V</span>
        <span class="lb-stat">${e.losses}D · ${e.draws}N · ${e.ratio}%</span>
      </div>`).join('');
  }

  // ─────────────────────────────────────────
  // THÈMES
  // ─────────────────────────────────────────
  const THEMES = ['dark','light','ocean','forest','sunset','neon','custom'];

  function applyTheme(name) {
    THEMES.forEach(t => document.body.classList.remove(`theme-${t}`));
    document.body.classList.add(`theme-${name}`);
    currentTheme = name;
    localStorage.setItem('morpion_theme', name);
  }

  function toggleTheme() {
    applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    Sound.select();
  }

  function applyCustomTheme() {
    const vars = {
      '--bg':       $('tc-bg').value,     '--bg-card':  $('tc-bg').value,
      '--bg-cell':  $('tc-cell').value,   '--text':     $('tc-text').value,
      '--accent':   $('tc-accent').value, '--accent-h': $('tc-accent').value,
      '--x-color':  $('tc-x').value,      '--o-color':  $('tc-o').value,
      '--border':   $('tc-cell').value
    };
    let s = document.getElementById('custom-theme-inline');
    if (!s) { s = document.createElement('style'); s.id = 'custom-theme-inline'; document.head.appendChild(s); }
    s.textContent = `body.theme-custom {\n  ${Object.entries(vars).map(([k,v])=>`${k}:${v};`).join('\n  ')}\n}`;
    localStorage.setItem('morpion_custom_theme', JSON.stringify(vars));
    applyTheme('custom');
  }

  function loadCustomTheme() {
    try {
      const vars = JSON.parse(localStorage.getItem('morpion_custom_theme') || 'null');
      if (!vars) return;
      let s = document.getElementById('custom-theme-inline');
      if (!s) { s = document.createElement('style'); s.id = 'custom-theme-inline'; document.head.appendChild(s); }
      s.textContent = `body.theme-custom {\n  ${Object.entries(vars).map(([k,v])=>`${k}:${v};`).join('\n  ')}\n}`;
    } catch {}
  }

  // ─────────────────────────────────────────
  // CONFETTIS
  // ─────────────────────────────────────────
  function triggerConfetti() {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    const colors = ['#f472b6','#34d399','#6366f1','#fbbf24','#38bdf8','#fb923c','#a78bfa'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left              = Math.random()*100+'%';
      p.style.background        = colors[Math.floor(Math.random()*colors.length)];
      p.style.width             = (6+Math.random()*8)+'px';
      p.style.height            = (8+Math.random()*12)+'px';
      p.style.animationDuration = (1.5+Math.random()*1.5)+'s';
      p.style.animationDelay    = (Math.random()*.5)+'s';
      p.style.borderRadius      = Math.random()>.5?'50%':'2px';
      container.appendChild(p);
    }
    setTimeout(() => container.remove(), 3500);
  }

  // ─────────────────────────────────────────
  // SETUP DYNAMIQUE
  // ─────────────────────────────────────────
  function showPlayerSection(mode) {
    $('section-1v1').classList.add('hidden');
    $('section-1vAI').classList.add('hidden');
    $('section-teams').classList.add('hidden');

    if (mode === '1v1')  { $('section-1v1').classList.remove('hidden'); }
    if (mode === '1vAI') { $('section-1vAI').classList.remove('hidden'); }
    if (['2v2','3v3','4v4'].includes(mode)) {
      $('section-teams').classList.remove('hidden');
      const size = parseInt(mode[0]);
      Teams.renderTeamInputs('X', size);
      Teams.renderTeamInputs('O', size);
    }
  }

  // ─────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────
  function init() {
    loadCustomTheme();
    applyTheme(currentTheme);
    _updateSoundButton();

    // Avatars : injecte les boutons dans le setup
    Avatar.injectAvatarButtons();

    // ── Header ──
    $('btn-toggle-theme').addEventListener('click', toggleTheme);

    $('btn-history').addEventListener('click', () => {
      renderHistory(); openModal($('modal-history')); Sound.select();
    });
    $('btn-leaderboard').addEventListener('click', () => {
      renderLeaderboard(); openModal($('modal-leaderboard')); Sound.select();
    });
    $('btn-sound').addEventListener('click', () => {
      const on = Sound.toggle();
      localStorage.setItem('morpion_sound', on);
      _updateSoundButton(); Sound.select();
    });
    $('btn-theme-editor').addEventListener('click', () => {
      openModal($('modal-theme-editor')); Sound.select();
    });

    // ── Fermeture modales ──
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => { const m = $(btn.dataset.modal); if (m) closeModal(m); });
    });
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); });
    });

    // ── Modes ──
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMode = btn.dataset.mode;
        showPlayerSection(selectedMode);
        Sound.select();
      });
    });

    // ── Difficulté ──
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDiff = btn.dataset.diff;
        Sound.select();
      });
    });

    // ── Démarrer ──
    $('btn-start').addEventListener('click', () => { Sound.select(); _launchGame(); });

    // ── Résultat ──
    $('result-replay').addEventListener('click', () => { hideResultModal(); Game.replay(); });
    $('result-menu').addEventListener('click', () => { hideResultModal(); showSetupScreen(); });

    // ── Jeu ──
    $('btn-replay').addEventListener('click', () => { Game.replay(); Sound.select(); });
    $('btn-menu').addEventListener('click', () => { hideResultModal(); showSetupScreen(); Sound.select(); });

    // ── Thème ──
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => { applyTheme(btn.dataset.preset); closeModal($('modal-theme-editor')); Sound.select(); });
    });
    $('btn-apply-theme').addEventListener('click', () => { applyCustomTheme(); closeModal($('modal-theme-editor')); });
    $('btn-reset-theme').addEventListener('click', () => { applyTheme('dark'); closeModal($('modal-theme-editor')); });

    // ── Historique ──
    $('btn-clear-history').addEventListener('click', () => {
      if (confirm('Effacer tout l\'historique et le classement ?')) {
        History.clearHistory(); renderHistory(); Sound.error();
      }
    });

    // ── Electron ──
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(v => { $('about-version').textContent = `v${v}`; });
      window.electronAPI.onMenuNewGame(() => { hideResultModal(); showSetupScreen(); });
      window.electronAPI.onMenuResetScores(() => Game.resetScores());
      window.electronAPI.onMenuAbout(() => openModal($('modal-about')));
    }

    showPlayerSection('1v1');
  }

  function _launchGame() {
    let namesX = [], namesO = [], teamsObj = null;

    if (selectedMode === '1v1') {
      namesX = [($('name-p1').value.trim() || 'Joueur X')];
      namesO = [($('name-p2').value.trim() || 'Joueur O')];
    } else if (selectedMode === '1vAI') {
      namesX = [($('name-human').value.trim() || 'Joueur')];
      namesO = ['IA'];
    } else {
      namesX  = Teams.collectTeamInputs('X');
      namesO  = Teams.collectTeamInputs('O');
      teamsObj = Teams.createTeams(selectedMode, namesX, namesO);
      namesX  = teamsObj.playersX;
      namesO  = teamsObj.playersO;
    }

    scoreXName.textContent = namesX[0];
    scoreOName.textContent = namesO[0];
    scoreXVal.textContent  = '0';
    scoreOVal.textContent  = '0';

    Avatar.saveToSession();

    Game.startGame({ mode: selectedMode, difficulty: selectedDiff, namesX, namesO, teams: teamsObj });
  }

  function _updateSoundButton() {
    $('btn-sound').textContent = Sound.isEnabled() ? '🔊' : '🔇';
    $('btn-sound').classList.toggle('active', !Sound.isEnabled());
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    showSetupScreen, showGameScreen,
    renderBoard, renderCell, animateCell,
    highlightWinLine, markDrawBoard, clearBoardState,
    updateTurnLabel, updateScores, updateScoreAvatars,
    setAIThinkingState,
    showTeamInfo, hideTeamInfo,
    showResultModal, hideResultModal,
    triggerConfetti
  };
})();

window.UI = UI;
