/**
 * sound.js – Moteur audio pour Morpion Ultimate.
 *
 * Utilise l'API Web Audio pour synthétiser les sons directement
 * sans dépendre de fichiers audio externes.
 * Sons disponibles : clic, victoire, égalité, coup IA, erreur.
 */

'use strict';

const Sound = (() => {
  /** @type {AudioContext|null} */
  let ctx = null;
  let enabled = true;

  /** Initialise ou retourne le contexte audio. */
  function getCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    // Reprend le contexte suspendu (règle Chrome autoplay policy)
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /**
   * Joue une onde simple.
   * @param {number}   freq        – fréquence en Hz
   * @param {number}   duration    – durée en secondes
   * @param {string}   type        – 'sine' | 'square' | 'triangle' | 'sawtooth'
   * @param {number}   volume      – 0 à 1
   * @param {number}   startDelay  – délai de démarrage en secondes
   */
  function playTone(freq, duration, type = 'sine', volume = 0.3, startDelay = 0) {
    if (!enabled) return;
    try {
      const ac  = getCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();

      osc.connect(gain);
      gain.connect(ac.destination);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime + startDelay);

      // Envelope ADSR basique
      gain.gain.setValueAtTime(0, ac.currentTime + startDelay);
      gain.gain.linearRampToValueAtTime(volume, ac.currentTime + startDelay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + startDelay + duration);

      osc.start(ac.currentTime + startDelay);
      osc.stop(ac.currentTime + startDelay + duration + 0.01);
    } catch (e) {
      /* Silencieux si l'audio n'est pas disponible */
    }
  }

  // ── Sons prédéfinis ──

  /** Son de clic sur une cellule. */
  function click() {
    playTone(440, 0.08, 'sine', 0.15);
    playTone(660, 0.06, 'sine', 0.08, 0.04);
  }

  /** Son de victoire (fanfare ascendante). */
  function win() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => playTone(freq, 0.18, 'sine', 0.3, i * 0.12));
    // Accord final
    playTone(1047, 0.4, 'triangle', 0.25, 0.5);
  }

  /** Son d'égalité (accord neutre descendant). */
  function draw() {
    playTone(440, 0.15, 'triangle', 0.25, 0);
    playTone(330, 0.15, 'triangle', 0.20, 0.15);
    playTone(220, 0.25, 'triangle', 0.18, 0.30);
  }

  /** Son du coup de l'IA (légèrement différent du joueur). */
  function aiMove() {
    playTone(330, 0.10, 'triangle', 0.12);
    playTone(440, 0.08, 'triangle', 0.08, 0.05);
  }

  /** Son d'erreur (cellule déjà jouée). */
  function error() {
    playTone(180, 0.12, 'square', 0.1);
    playTone(150, 0.10, 'square', 0.08, 0.08);
  }

  /** Son de sélection de menu. */
  function select() {
    playTone(600, 0.06, 'sine', 0.1);
  }

  /** Active/désactive les sons. */
  function toggle() {
    enabled = !enabled;
    return enabled;
  }

  /** Retourne l'état actuel. */
  function isEnabled() { return enabled; }

  // Charge l'état depuis le localStorage
  const stored = localStorage.getItem('morpion_sound');
  if (stored === 'false') enabled = false;

  return { click, win, draw, aiMove, error, select, toggle, isEnabled };
})();

window.Sound = Sound;
