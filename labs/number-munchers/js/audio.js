(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});
  var STORAGE_KEY = 'nm_audio_prefs';

  var ctx = null;
  var masterGain = null;
  var muted = false;
  var volume = 0.55;
  var tuneTimer = null;
  var tuneStep = 0;

  function loadPrefs() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (typeof parsed.muted === 'boolean') muted = parsed.muted;
      if (typeof parsed.volume === 'number' && isFinite(parsed.volume)) {
        volume = Math.max(0, Math.min(1, parsed.volume));
      }
    } catch (_) {}
  }

  function savePrefs() {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted: muted, volume: volume }));
      }
    } catch (_) {}
  }

  function ensureContext() {
    var AudioCtx = root.AudioContext || root.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) {
      ctx = new AudioCtx();
      masterGain = ctx.createGain();
      masterGain.gain.value = muted ? 0 : volume;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function applyMasterGain() {
    if (!masterGain || !ctx) return;
    masterGain.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.01);
  }

  // Pure monophonic PC-Speaker / Apple II square-wave beep
  function playBeep(freq, duration, delay, gainLevel, endFreq) {
    if (muted || volume <= 0) return;
    var ac = ensureContext();
    if (!ac || !masterGain) return;

    var start = ac.currentTime + (delay || 0);
    var dur = Math.max(0.015, duration || 0.06);
    var osc = ac.createOscillator();
    var gain = ac.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(Math.max(35, freq || 440), start);
    if (endFreq && endFreq !== freq) {
      osc.frequency.linearRampToValueAtTime(Math.max(35, endFreq), start + dur);
    }

    var peak = typeof gainLevel === 'number' ? gainLevel : 0.14;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + 0.004);
    gain.gain.setValueAtTime(peak, start + Math.max(0.005, dur - 0.008));
    gain.gain.linearRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(start);
    osc.stop(start + dur + 0.005);
  }

  function unlock() {
    ensureContext();
  }

  function setMuted(val) {
    muted = Boolean(val);
    if (muted) stopCutsceneTune();
    applyMasterGain();
    savePrefs();
    return muted;
  }

  function toggleMute() {
    return setMuted(!muted);
  }

  function isMuted() {
    return muted;
  }

  function setVolume(val) {
    var v = Number(val);
    if (!isFinite(v)) return volume;
    volume = Math.max(0, Math.min(1, v));
    applyMasterGain();
    savePrefs();
    return volume;
  }

  function getVolume() {
    return volume;
  }

  function playMenuMove() {
    playBeep(620, 0.028, 0, 0.11);
  }

  function playMenuSelect() {
    playBeep(523, 0.04, 0, 0.13);
    playBeep(784, 0.06, 0.045, 0.13);
  }

  function playHop(stepParity) {
    var base = stepParity ? 240 : 195;
    playBeep(base, 0.03, 0, 0.1, base + 55);
  }

  function playMunchCorrect() {
    // Classic crisp 2-step upward PC-speaker chomp chirp
    playBeep(440, 0.045, 0, 0.14);
    playBeep(660, 0.055, 0.048, 0.14);
    playBeep(880, 0.075, 0.105, 0.14);
  }

  function playMunchWrong() {
    // Classic low raspy DOS PC-speaker buzz
    playBeep(118, 0.09, 0, 0.17, 92);
    playBeep(86, 0.16, 0.095, 0.17, 72);
  }

  function playTroggleWarn() {
    playBeep(920, 0.032, 0, 0.08);
    playBeep(920, 0.032, 0.065, 0.08);
  }

  function playTroggleEat() {
    // Descending gulp sweep
    playBeep(420, 0.09, 0, 0.16, 210);
    playBeep(210, 0.18, 0.095, 0.16, 78);
  }

  function playEatTroggle() {
    playBeep(330, 0.06, 0, 0.15, 660);
    playBeep(660, 0.09, 0.065, 0.15, 990);
  }

  function playPowerUp() {
    var notes = [523, 659, 784, 1046];
    for (var i = 0; i < notes.length; i++) {
      playBeep(notes[i], 0.055, i * 0.058, 0.13);
    }
  }

  function playExtraLife() {
    var notes = [523, 659, 784, 1046, 784, 1318];
    var times = [0, 0.07, 0.14, 0.21, 0.3, 0.38];
    for (var i = 0; i < notes.length; i++) {
      playBeep(notes[i], i === notes.length - 1 ? 0.18 : 0.065, times[i], 0.14);
    }
  }

  function playLevelStart() {
    var notes = [392, 523, 659, 784];
    for (var i = 0; i < notes.length; i++) {
      playBeep(notes[i], 0.055, i * 0.06, 0.12);
    }
  }

  function playLevelClear() {
    var notes = [523, 587, 659, 784, 659, 784, 1046];
    var times = [0, 0.075, 0.15, 0.225, 0.31, 0.385, 0.46];
    for (var i = 0; i < notes.length; i++) {
      playBeep(notes[i], i === notes.length - 1 ? 0.22 : 0.07, times[i], 0.14);
    }
  }

  function playGameOver() {
    var notes = [392, 370, 349, 294];
    var times = [0, 0.22, 0.44, 0.66];
    for (var i = 0; i < notes.length; i++) {
      playBeep(notes[i], i === 3 ? 0.42 : 0.18, times[i], 0.15, i === 3 ? 233 : notes[i]);
    }
  }

  // Monophonic 1-bit PC speaker intermission melodies (alternating bass/lead notes)
  var SKIT_SEQUENCES = [
    [262, 523, 330, 659, 392, 784, 330, 659, 294, 880, 392, 784, 330, 659, 294, 587],
    [220, 440, 262, 523, 330, 659, 262, 523, 294, 587, 330, 659, 349, 698, 220, 440],
    [196, 392, 233, 466, 262, 523, 294, 587, 311, 622, 294, 587, 262, 523, 233, 466],
    [262, 523, 262, 659, 330, 784, 392, 880, 330, 784, 294, 659, 262, 587, 392, 1046]
  ];

  function startCutsceneTune(skitIndex) {
    stopCutsceneTune();
    if (muted || volume <= 0) return;
    ensureContext();
    var seq = SKIT_SEQUENCES[(skitIndex || 0) % SKIT_SEQUENCES.length];
    tuneStep = 0;

    function tick() {
      if (muted || volume <= 0) return;
      var freq = seq[tuneStep % seq.length];
      if (freq > 0) {
        playBeep(freq, 0.085, 0, 0.1);
      }
      tuneStep++;
    }

    tick();
    tuneTimer = root.setInterval(tick, 130);
  }

  function stopCutsceneTune() {
    if (tuneTimer !== null) {
      root.clearInterval(tuneTimer);
      tuneTimer = null;
    }
  }

  function init() {
    loadPrefs();
    var handleGesture = function () {
      unlock();
      root.removeEventListener('pointerdown', handleGesture);
      root.removeEventListener('keydown', handleGesture);
    };
    root.addEventListener('pointerdown', handleGesture, { passive: true });
    root.addEventListener('keydown', handleGesture, { passive: true });
  }

  NM.Audio = {
    init: init,
    unlock: unlock,
    setMuted: setMuted,
    toggleMute: toggleMute,
    isMuted: isMuted,
    setVolume: setVolume,
    getVolume: getVolume,
    playMenuMove: playMenuMove,
    playMenuSelect: playMenuSelect,
    playHop: playHop,
    playMunchCorrect: playMunchCorrect,
    playMunchWrong: playMunchWrong,
    playTroggleWarn: playTroggleWarn,
    playTroggleEat: playTroggleEat,
    playEatTroggle: playEatTroggle,
    playPowerUp: playPowerUp,
    playExtraLife: playExtraLife,
    playLevelStart: playLevelStart,
    playLevelClear: playLevelClear,
    playGameOver: playGameOver,
    startCutsceneTune: startCutsceneTune,
    stopCutsceneTune: stopCutsceneTune
  };
})(typeof window !== 'undefined' ? window : globalThis);
