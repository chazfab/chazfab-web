(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});
  var STORAGE_KEY = 'nm_audio_prefs';

  var ctx = null;
  var masterGain = null;
  var muted = false;
  var volume = 0.6;
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
    } catch (_) {
      // Ignore storage errors in sandboxed contexts
    }
  }

  function savePrefs() {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted: muted, volume: volume }));
      }
    } catch (_) {
      // Ignore storage errors
    }
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
    masterGain.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.015);
  }

  function playTone(opts) {
    if (muted || volume <= 0) return;
    var ac = ensureContext();
    if (!ac || !masterGain) return;

    var start = ac.currentTime + (opts.delay || 0);
    var dur = opts.duration || 0.1;
    var freq = opts.freq || 440;
    var endFreq = opts.endFreq || freq;
    var type = opts.type || 'square';
    var peak = typeof opts.gain === 'number' ? opts.gain : 0.18;

    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), start);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + dur);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.012, dur * 0.25));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(start);
    osc.stop(start + dur + 0.015);
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

  function playHop() {
    playTone({ type: 'triangle', freq: 185, endFreq: 270, duration: 0.045, gain: 0.14 });
  }

  function playMunchCorrect(streak) {
    var boost = Math.min(12, Math.max(0, (streak || 1) - 1)) * 22;
    // Two-bite chomp + ascending bright chime
    playTone({ type: 'square', freq: 310 + boost, endFreq: 460 + boost, duration: 0.055, gain: 0.14, delay: 0 });
    playTone({ type: 'square', freq: 523.25 + boost, endFreq: 659.25 + boost, duration: 0.09, gain: 0.16, delay: 0.055 });
    playTone({ type: 'triangle', freq: 783.99 + boost, duration: 0.11, gain: 0.14, delay: 0.115 });
  }

  function playMunchWrong() {
    playTone({ type: 'sawtooth', freq: 220, endFreq: 110, duration: 0.24, gain: 0.18, delay: 0 });
    playTone({ type: 'square', freq: 207, endFreq: 98, duration: 0.24, gain: 0.12, delay: 0.01 });
  }

  function playTroggleWarn() {
    playTone({ type: 'sine', freq: 620, duration: 0.05, gain: 0.09, delay: 0 });
    playTone({ type: 'sine', freq: 760, duration: 0.055, gain: 0.09, delay: 0.075 });
  }

  function playTroggleEat() {
    playTone({ type: 'sawtooth', freq: 380, endFreq: 130, duration: 0.16, gain: 0.18, delay: 0 });
    playTone({ type: 'square', freq: 240, endFreq: 72, duration: 0.28, gain: 0.18, delay: 0.14 });
  }

  function playEatTroggle() {
    playTone({ type: 'square', freq: 300, endFreq: 880, duration: 0.14, gain: 0.18, delay: 0 });
    playTone({ type: 'triangle', freq: 880, endFreq: 1174, duration: 0.12, gain: 0.16, delay: 0.11 });
  }

  function playPowerUp() {
    var notes = [523.25, 659.25, 783.99, 1046.5];
    for (var i = 0; i < notes.length; i++) {
      playTone({ type: 'triangle', freq: notes[i], duration: 0.085, gain: 0.16, delay: i * 0.065 });
    }
  }

  function playExtraLife() {
    var notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1318.5];
    var times = [0, 0.08, 0.16, 0.24, 0.34, 0.44];
    for (var i = 0; i < notes.length; i++) {
      playTone({
        type: 'square',
        freq: notes[i],
        duration: i === notes.length - 1 ? 0.22 : 0.09,
        gain: 0.14,
        delay: times[i]
      });
    }
  }

  function playLevelClear() {
    var notes = [523.25, 587.33, 659.25, 783.99, 659.25, 783.99, 1046.5, 1318.5];
    var times = [0, 0.08, 0.16, 0.24, 0.34, 0.42, 0.52, 0.64];
    for (var i = 0; i < notes.length; i++) {
      playTone({
        type: i % 2 === 0 ? 'square' : 'triangle',
        freq: notes[i],
        duration: i === notes.length - 1 ? 0.28 : 0.09,
        gain: 0.15,
        delay: times[i]
      });
    }
  }

  function playGameOver() {
    var notes = [392.0, 369.99, 349.23, 293.66];
    var times = [0, 0.24, 0.48, 0.72];
    for (var i = 0; i < notes.length; i++) {
      playTone({
        type: 'sawtooth',
        freq: notes[i],
        endFreq: i === 3 ? 246.94 : notes[i] * 0.96,
        duration: i === 3 ? 0.48 : 0.2,
        gain: 0.14,
        delay: times[i]
      });
    }
  }

  var SKIT_MELODIES = [
    // Ragtime gallop
    {
      tempoMs: 155,
      lead: [523, 659, 784, 659, 880, 784, 659, 587, 523, 659, 784, 1046, 880, 784, 659, 0],
      bass: [131, 0, 196, 0, 147, 0, 196, 0, 131, 0, 196, 0, 165, 196, 262, 0]
    },
    // Pizzeria tarantella
    {
      tempoMs: 145,
      lead: [440, 523, 659, 523, 587, 659, 698, 659, 587, 523, 494, 523, 659, 440, 440, 0],
      bass: [110, 165, 110, 165, 147, 220, 147, 220, 131, 196, 123, 196, 110, 165, 110, 0]
    },
    // Mad-lab sci-fi bounce
    {
      tempoMs: 165,
      lead: [392, 466, 523, 587, 622, 587, 523, 466, 392, 523, 622, 784, 698, 622, 523, 0],
      bass: [98, 196, 117, 196, 131, 196, 117, 196, 98, 196, 131, 196, 147, 131, 98, 0]
    },
    // 90s Disco Lab Boogie
    {
      tempoMs: 150,
      lead: [523, 523, 659, 784, 0, 784, 880, 784, 659, 587, 523, 587, 659, 784, 1046, 0],
      bass: [131, 262, 131, 262, 165, 330, 165, 330, 147, 294, 147, 294, 196, 147, 131, 0]
    }
  ];

  function startCutsceneTune(skitIndex) {
    stopCutsceneTune();
    if (muted || volume <= 0) return;
    ensureContext();
    var song = SKIT_MELODIES[(skitIndex || 0) % SKIT_MELODIES.length];
    tuneStep = 0;

    function tick() {
      if (muted || volume <= 0) return;
      var idx = tuneStep % song.lead.length;
      var leadFreq = song.lead[idx];
      var bassFreq = song.bass[idx];
      if (leadFreq > 0) {
        playTone({ type: 'square', freq: leadFreq, duration: 0.1, gain: 0.08 });
      }
      if (bassFreq > 0) {
        playTone({ type: 'triangle', freq: bassFreq, duration: 0.11, gain: 0.11 });
      }
      tuneStep++;
    }

    tick();
    tuneTimer = root.setInterval(tick, song.tempoMs);
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
    playHop: playHop,
    playMunchCorrect: playMunchCorrect,
    playMunchWrong: playMunchWrong,
    playTroggleWarn: playTroggleWarn,
    playTroggleEat: playTroggleEat,
    playEatTroggle: playEatTroggle,
    playPowerUp: playPowerUp,
    playExtraLife: playExtraLife,
    playLevelClear: playLevelClear,
    playGameOver: playGameOver,
    startCutsceneTune: startCutsceneTune,
    stopCutsceneTune: stopCutsceneTune
  };
})(typeof window !== 'undefined' ? window : globalThis);
