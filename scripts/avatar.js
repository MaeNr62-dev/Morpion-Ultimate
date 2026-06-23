/**
 * avatar.js – Sélecteur de symbole/avatar pour Morpion Ultimate
 *
 * Permet à chaque joueur de choisir :
 *   - Un emoji/icône parmi une liste prédéfinie
 *   - Une photo prise avec la caméra (getUserMedia)
 *   - Une image uploadée depuis le disque
 *
 * Le symbole choisi est rendu dans les cellules du plateau via
 * un <canvas> ou une balise <img> en remplacement de ✕ et ○.
 *
 * API publique : window.Avatar
 */

'use strict';

const Avatar = (() => {

  // ── Emojis / icônes prédéfinis ──
  const EMOJI_LIST = [
    '✕','○','⭐','🔥','❄️','⚡','💎','🎯',
    '🐶','🐱','🦊','🐸','🐼','🦁','🐲','🦄',
    '🍎','🍕','🌈','🎸','🚀','💀','👑','🎃',
    '🍀','🌸','🎲','🏆','💣','🌙','☀️','🎮'
  ];

  // ── État ──
  // avatars['X'] = { type: 'emoji'|'photo', value: string|dataURL }
  const avatars = {
    X: { type: 'emoji', value: '✕' },
    O: { type: 'emoji', value: '○' }
  };

  // Stream caméra actif (pour pouvoir le stopper)
  let cameraStream = null;
  let currentSymbol = 'X'; // Quel joueur est en train de choisir

  // ─────────────────────────────────────────
  // MODALE DE SÉLECTION
  // ─────────────────────────────────────────

  /**
   * Ouvre la modale de sélection d'avatar pour un symbole donné.
   * @param {string} symbol – 'X' ou 'O'
   */
  function openPicker(symbol) {
    currentSymbol = symbol;
    _buildModal();
    document.getElementById('modal-avatar').classList.remove('hidden');
  }

  function closePicker() {
    _stopCamera();
    const m = document.getElementById('modal-avatar');
    if (m) m.classList.add('hidden');
  }

  /** Construit la modale d'avatar (créée une seule fois dans le DOM) */
  function _buildModal() {
    let modal = document.getElementById('modal-avatar');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-avatar';
      modal.className = 'modal hidden';
      modal.innerHTML = `
        <div class="modal-card avatar-picker-card">
          <div class="modal-header">
            <h2 id="avatar-picker-title">Choisir un symbole</h2>
            <button class="modal-close" id="avatar-close-btn">✕</button>
          </div>

          <!-- Onglets -->
          <div class="avatar-tabs">
            <button class="avatar-tab active" data-tab="emojis">😀 Emojis</button>
            <button class="avatar-tab" data-tab="camera">📷 Caméra</button>
            <button class="avatar-tab" data-tab="upload">🖼️ Image</button>
          </div>

          <!-- Grille emojis -->
          <div id="avatar-tab-emojis" class="avatar-tab-content active">
            <div class="emoji-grid" id="emoji-grid"></div>
          </div>

          <!-- Caméra -->
          <div id="avatar-tab-camera" class="avatar-tab-content hidden">
            <div class="camera-container">
              <video id="avatar-video" autoplay playsinline muted></video>
              <canvas id="avatar-canvas" style="display:none"></canvas>
              <div id="camera-preview-wrap" class="hidden">
                <img id="camera-preview" alt="Aperçu photo" />
              </div>
            </div>
            <div class="camera-actions">
              <button id="btn-start-camera" class="btn-primary">📷 Activer la caméra</button>
              <button id="btn-capture" class="btn-primary hidden">📸 Prendre la photo</button>
              <button id="btn-retake" class="btn-secondary hidden">🔄 Reprendre</button>
              <button id="btn-use-photo" class="btn-primary hidden">✅ Utiliser</button>
            </div>
            <p class="camera-hint">La photo sera affichée dans les cellules du plateau.</p>
          </div>

          <!-- Upload image -->
          <div id="avatar-tab-upload" class="avatar-tab-content hidden">
            <div class="upload-zone" id="upload-zone">
              <div class="upload-icon">🖼️</div>
              <p>Clique ou glisse une image ici</p>
              <p class="upload-hint">PNG, JPG, GIF, WebP – max 2 Mo</p>
              <input type="file" id="avatar-file-input" accept="image/*" style="display:none" />
            </div>
            <div id="upload-preview-wrap" class="hidden">
              <img id="upload-preview" alt="Aperçu image" />
              <button id="btn-use-upload" class="btn-primary mt-12">✅ Utiliser cette image</button>
            </div>
          </div>

          <!-- Aperçu actuel -->
          <div class="avatar-current">
            <span class="avatar-current-label">Symbole actuel :</span>
            <div class="avatar-preview-circle" id="avatar-current-preview"></div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      _bindModalEvents(modal);
    }

    // Met à jour le titre
    const color = currentSymbol === 'X' ? 'var(--x-color)' : 'var(--o-color)';
    document.getElementById('avatar-picker-title').innerHTML =
      `Symbole de <span style="color:${color}">${currentSymbol === 'X' ? '✕ Joueur X' : '○ Joueur O'}</span>`;

    // Rempli la grille d'emojis
    _renderEmojiGrid();

    // Affiche l'avatar courant
    _updateCurrentPreview();

    // Reset onglet sur emojis
    _switchTab('emojis');
  }

  function _renderEmojiGrid() {
    const grid = document.getElementById('emoji-grid');
    if (!grid) return;
    grid.innerHTML = EMOJI_LIST.map(e => `
      <button class="emoji-btn ${avatars[currentSymbol]?.value === e ? 'selected' : ''}"
              data-emoji="${e}">${e}</button>
    `).join('');

    grid.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setAvatar(currentSymbol, { type: 'emoji', value: btn.dataset.emoji });
        _renderEmojiGrid();
        _updateCurrentPreview();
        // Ferme après sélection emoji
        setTimeout(closePicker, 300);
      });
    });
  }

  function _updateCurrentPreview() {
    const wrap = document.getElementById('avatar-current-preview');
    if (!wrap) return;
    wrap.innerHTML = '';
    wrap.appendChild(_makeAvatarEl(currentSymbol, 48));
  }

  function _switchTab(name) {
    document.querySelectorAll('.avatar-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    document.querySelectorAll('.avatar-tab-content').forEach(c => {
      c.classList.toggle('active', c.id === `avatar-tab-${name}`);
      c.classList.toggle('hidden', c.id !== `avatar-tab-${name}`);
    });
    if (name !== 'camera') _stopCamera();
  }

  function _bindModalEvents(modal) {
    // Fermeture
    modal.querySelector('#avatar-close-btn').addEventListener('click', closePicker);
    modal.addEventListener('click', e => { if (e.target === modal) closePicker(); });

    // Onglets
    modal.querySelectorAll('.avatar-tab').forEach(tab => {
      tab.addEventListener('click', () => _switchTab(tab.dataset.tab));
    });

    // ── Caméra ──
    const video       = modal.querySelector('#avatar-video');
    const canvas      = modal.querySelector('#avatar-canvas');
    const preview     = modal.querySelector('#camera-preview');
    const previewWrap = modal.querySelector('#camera-preview-wrap');
    const btnStart    = modal.querySelector('#btn-start-camera');
    const btnCapture  = modal.querySelector('#btn-capture');
    const btnRetake   = modal.querySelector('#btn-retake');
    const btnUse      = modal.querySelector('#btn-use-photo');

    btnStart.addEventListener('click', async () => {
      try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 300, height: 300 },
          audio: false
        });
        video.srcObject = cameraStream;
        video.style.display = 'block';
        previewWrap.classList.add('hidden');
        btnStart.classList.add('hidden');
        btnCapture.classList.remove('hidden');
        btnRetake.classList.add('hidden');
        btnUse.classList.add('hidden');
      } catch (err) {
        alert('Impossible d\'accéder à la caméra : ' + err.message);
      }
    });

    btnCapture.addEventListener('click', () => {
      const size = 300;
      canvas.width  = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      // Cadrage carré centré
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      const sq = Math.min(vw, vh);
      ctx.drawImage(video, (vw - sq) / 2, (vh - sq) / 2, sq, sq, 0, 0, size, size);

      const dataURL = canvas.toDataURL('image/jpeg', 0.85);
      preview.src = dataURL;
      video.style.display = 'none';
      previewWrap.classList.remove('hidden');
      btnCapture.classList.add('hidden');
      btnRetake.classList.remove('hidden');
      btnUse.classList.remove('hidden');
      _stopCamera();

      // Stocke temporairement
      canvas.dataset.dataUrl = dataURL;
    });

    btnRetake.addEventListener('click', () => {
      previewWrap.classList.add('hidden');
      video.style.display = 'block';
      btnStart.click(); // Relance la caméra
    });

    btnUse.addEventListener('click', () => {
      const dataURL = canvas.dataset.dataUrl;
      if (dataURL) {
        setAvatar(currentSymbol, { type: 'photo', value: dataURL });
        _updateCurrentPreview();
        setTimeout(closePicker, 300);
      }
    });

    // ── Upload ──
    const uploadZone  = modal.querySelector('#upload-zone');
    const fileInput   = modal.querySelector('#avatar-file-input');
    const uploadPrev  = modal.querySelector('#upload-preview');
    const uploadWrap  = modal.querySelector('#upload-preview-wrap');
    const btnUseUpload= modal.querySelector('#btn-use-upload');
    let uploadDataUrl = null;

    uploadZone.addEventListener('click', () => fileInput.click());
    uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
    uploadZone.addEventListener('drop', e => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) _loadImageFile(file, uploadPrev, uploadWrap, url => { uploadDataUrl = url; });
    });

    fileInput.addEventListener('change', () => {
      const file = fileInput.files[0];
      if (file) _loadImageFile(file, uploadPrev, uploadWrap, url => { uploadDataUrl = url; });
    });

    btnUseUpload.addEventListener('click', () => {
      if (uploadDataUrl) {
        setAvatar(currentSymbol, { type: 'photo', value: uploadDataUrl });
        _updateCurrentPreview();
        setTimeout(closePicker, 300);
      }
    });
  }

  function _loadImageFile(file, imgEl, wrapEl, cb) {
    if (file.size > 2 * 1024 * 1024) { alert('Image trop grande (max 2 Mo).'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      // Redimensionne via canvas
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        const sq  = Math.min(img.width, img.height);
        ctx.drawImage(img, (img.width-sq)/2, (img.height-sq)/2, sq, sq, 0, 0, size, size);
        const url = canvas.toDataURL('image/jpeg', 0.85);
        imgEl.src = url;
        wrapEl.classList.remove('hidden');
        cb(url);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function _stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
    const v = document.getElementById('avatar-video');
    if (v) { v.srcObject = null; v.style.display = 'none'; }
  }

  // ─────────────────────────────────────────
  // GESTION DES AVATARS
  // ─────────────────────────────────────────

  /**
   * Définit l'avatar d'un symbole.
   * @param {string} symbol – 'X' ou 'O'
   * @param {{ type: string, value: string }} avatar
   */
  function setAvatar(symbol, avatar) {
    avatars[symbol] = avatar;
    // Met à jour les boutons d'avatar dans le setup
    _refreshSetupAvatarBtn(symbol);
  }

  /**
   * Retourne l'avatar d'un symbole.
   * @param {string} symbol
   * @returns {{ type: string, value: string }}
   */
  function getAvatar(symbol) {
    return avatars[symbol] || { type: 'emoji', value: symbol };
  }

  /**
   * Crée un élément DOM représentant l'avatar (emoji ou image circulaire).
   * @param {string} symbol
   * @param {number} size – en pixels
   * @returns {HTMLElement}
   */
  function _makeAvatarEl(symbol, size = 56) {
    const av = getAvatar(symbol);
    if (av.type === 'photo') {
      const img = document.createElement('img');
      img.src = av.value;
      img.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;display:block;`;
      return img;
    } else {
      const span = document.createElement('span');
      span.textContent = av.value;
      span.style.cssText = `font-size:${Math.round(size * 0.65)}px;line-height:1;display:block;text-align:center;`;
      return span;
    }
  }

  /**
   * Retourne le contenu HTML/Node à injecter dans une cellule du plateau.
   * @param {string} symbol
   * @returns {HTMLElement}
   */
  function getCellContent(symbol) {
    return _makeAvatarEl(symbol, 56);
  }

  // Met à jour le bouton d'avatar dans la section setup
  function _refreshSetupAvatarBtn(symbol) {
    const btn = document.querySelector(`.avatar-pick-btn[data-symbol="${symbol}"]`);
    if (!btn) return;
    btn.innerHTML = '';
    btn.appendChild(_makeAvatarEl(symbol, 36));
  }

  /**
   * Insère les boutons de sélection d'avatar dans les groupes joueurs du setup.
   * À appeler après le rendu du DOM setup.
   */
  function injectAvatarButtons() {
    // Joueur X (1v1)
    _injectBtn('player-input-group-x', 'X');
    // Joueur O (1v1)
    _injectBtn('player-input-group-o', 'O');
    // Joueur humain (1vAI)
    _injectBtn('player-input-group-human', 'X');
  }

  function _injectBtn(containerId, symbol) {
    const container = document.getElementById(containerId);
    if (!container) return;
    // Évite les doublons
    if (container.querySelector('.avatar-pick-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'avatar-pick-btn';
    btn.dataset.symbol = symbol;
    btn.title = 'Changer le symbole';
    btn.appendChild(_makeAvatarEl(symbol, 36));
    btn.addEventListener('click', () => openPicker(symbol));
    container.prepend(btn);
  }

  // Persistance légère en sessionStorage (perdu à la fermeture)
  function saveToSession() {
    try {
      const data = {};
      for (const sym of ['X','O']) {
        const av = avatars[sym];
        // On ne persiste pas les dataURL photo (trop lourdes) — juste les emojis
        if (av.type === 'emoji') data[sym] = av;
      }
      sessionStorage.setItem('morpion_avatars', JSON.stringify(data));
    } catch {}
  }

  function loadFromSession() {
    try {
      const data = JSON.parse(sessionStorage.getItem('morpion_avatars') || '{}');
      for (const sym of ['X','O']) {
        if (data[sym]) avatars[sym] = data[sym];
      }
    } catch {}
  }

  loadFromSession();

  return {
    openPicker,
    closePicker,
    setAvatar,
    getAvatar,
    getCellContent,
    injectAvatarButtons,
    saveToSession,
    EMOJI_LIST
  };
})();

window.Avatar = Avatar;
