(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});

  var COLS = 6;
  var ROWS = 5;
  var STORAGE_OPTS_KEY = 'nm_options_v1';
  var STORAGE_HOF_KEY = 'nm_high_scores_v1';

  var DEFAULT_HOF = [
    { name: 'MECC', mode: 'Challenge Mix', level: 12, score: 3850 },
    { name: 'MUNCH', mode: 'Multiples', level: 9, score: 2750 },
    { name: 'CARMEN', mode: 'Primes', level: 7, score: 2100 },
    { name: 'OREGON', mode: 'Factors', level: 6, score: 1650 },
    { name: 'REGGIE', mode: 'Equality', level: 4, score: 950 }
  ];

  var MODE_LABELS = {
    multiples: 'Multiples',
    factors: 'Factors',
    primes: 'Primes',
    equality: 'Equality',
    inequality: 'Inequality',
    challenge: 'Challenge Mix'
  };

  var TROGGLE_GUIDE = [
    { type: 'reggie', name: 'Reggie', desc: 'Classic crimson charger. Moves straight across the grid and exits on the far edge.' },
    { type: 'bashful', name: 'Bashful', desc: 'Shy blue Troggle. Reverses direction if Muncher gets right in front of it!' },
    { type: 'helper', name: 'Helper', desc: 'Amber number-vacuum. Eats numbers off tiles as it wanders (can even clear stragglers).' },
    { type: 'worker', name: 'Worker', desc: 'Hard-hat Troggle. Drops fresh numbers onto grid cells as it marches past.' },
    { type: 'smarty', name: 'Smarty', desc: 'Purple brainiac. Actively hunts Muncher unless frightened by Super Pepper!' }
  ];

  var POWERUP_GUIDE = [
    { kind: 'freeze', name: 'Ice Crystal', desc: 'Freezes all Troggles solid for 6 seconds.' },
    { kind: 'pepper', name: 'Super Pepper', desc: 'Powers up Muncher for 6 seconds — chomp Troggles for +100 pts!' },
    { kind: 'xray', name: 'Math Radar Lens', desc: 'Highlights valid numbers with a golden corner pip for 4.5 seconds.' },
    { kind: 'star', name: 'Arcade Bonus Star', desc: 'Grants an instant +150 point boost.' }
  ];

  var options = {
    difficulty: 'classic',
    deluxeExtras: true,
    showHints: true,
    crtEnabled: true,
    touchPadMode: 'auto'
  };

  var state = {
    phase: 'title', // 'title' | 'playing' | 'paused' | 'transition' | 'cutscene' | 'gameover'
    selectedMode: 'multiples',
    rule: null,
    board: [],
    muncher: { col: 2, row: 2, expr: 'idle', chompTimer: null },
    lives: 3,
    score: 0,
    streak: 0,
    nextExtraLifeScore: 2000,
    attempts: 0,
    correctHits: 0,
    munchedThisLevel: 0,
    invulnUntil: 0,
    troggles: [],
    nextTroggleId: 1,
    pendingWarning: null,
    freezeUntil: 0,
    pepperUntil: 0,
    xrayUntil: 0,
    nextPowerUpAt: 0,
    pausedByModal: false,
    autoWalkTarget: null,
    autoWalkTimer: null,
    aiTimer: null,
    hudTimer: null,
    transitionTimer: null
  };

  var els = {};

  function cacheElements() {
    els.cabinet = document.getElementById('arcadeCabinet');
    els.homeBtn = document.getElementById('homeBtn');
    els.pauseBtn = document.getElementById('pauseBtn');
    els.muteBtn = document.getElementById('muteBtn');
    els.crtBtn = document.getElementById('crtBtn');
    els.guideBtn = document.getElementById('guideBtn');
    els.optionsBtn = document.getElementById('optionsBtn');
    els.hofBtn = document.getElementById('hofBtn');

    els.titleScreen = document.getElementById('titleScreen');
    els.heroMascot = document.getElementById('heroMascot');
    els.modeGrid = document.getElementById('modeGrid');
    els.titleDeluxeCheck = document.getElementById('titleDeluxeCheck');
    els.startGameBtn = document.getElementById('startGameBtn');

    els.gameStage = document.getElementById('gameStage');
    els.hudLevel = document.getElementById('hudLevel');
    els.hudRemaining = document.getElementById('hudRemaining');
    els.ruleModeTag = document.getElementById('ruleModeTag');
    els.ruleBanner = document.getElementById('ruleBanner');
    els.hudScore = document.getElementById('hudScore');
    els.streakStat = document.getElementById('streakStat');
    els.hudStreak = document.getElementById('hudStreak');
    els.hudLives = document.getElementById('hudLives');

    els.powerupMeter = document.getElementById('powerupMeter');
    els.powerupMeterText = document.getElementById('powerupMeterText');
    els.powerupMeterFill = document.getElementById('powerupMeterFill');

    els.warnTop = document.getElementById('warnTop');
    els.warnBottom = document.getElementById('warnBottom');
    els.warnLeft = document.getElementById('warnLeft');
    els.warnRight = document.getElementById('warnRight');

    els.boardViewport = document.getElementById('boardViewport');
    els.boardGrid = document.getElementById('boardGrid');
    els.actorLayer = document.getElementById('actorLayer');
    els.muncherActor = document.getElementById('muncherActor');
    els.trogglesContainer = document.getElementById('trogglesContainer');
    els.popupsContainer = document.getElementById('popupsContainer');

    els.pauseVeil = document.getElementById('pauseVeil');
    els.pauseRuleReminder = document.getElementById('pauseRuleReminder');
    els.resumeBtn = document.getElementById('resumeBtn');
    els.quitToMenuBtn = document.getElementById('quitToMenuBtn');

    els.levelClearVeil = document.getElementById('levelClearVeil');
    els.levelClearTitle = document.getElementById('levelClearTitle');
    els.levelClearBonus = document.getElementById('levelClearBonus');
    els.theaterOverlay = document.getElementById('theaterOverlay');

    els.statusStrip = document.getElementById('statusStrip');
    els.statusPill = document.getElementById('statusPill');
    els.statusMessage = document.getElementById('statusMessage');

    els.touchPad = document.getElementById('touchPad');
    els.touchMunchBtn = document.getElementById('touchMunchBtn');

    els.guideDialog = document.getElementById('guideDialog');
    els.troggleGuideList = document.getElementById('troggleGuideList');
    els.powerUpGuideList = document.getElementById('powerUpGuideList');

    els.optionsDialog = document.getElementById('optionsDialog');
    els.optDifficulty = document.getElementById('optDifficulty');
    els.optDeluxe = document.getElementById('optDeluxe');
    els.optHints = document.getElementById('optHints');
    els.optCrt = document.getElementById('optCrt');
    els.optVolume = document.getElementById('optVolume');
    els.optTouchPad = document.getElementById('optTouchPad');

    els.hallOfFameDialog = document.getElementById('hallOfFameDialog');
    els.hofTableBody = document.getElementById('hofTableBody');
    els.resetHofBtn = document.getElementById('resetHofBtn');

    els.gameOverDialog = document.getElementById('gameOverDialog');
    els.gameOverForm = document.getElementById('gameOverForm');
    els.gameOverReason = document.getElementById('gameOverReason');
    els.goScore = document.getElementById('goScore');
    els.goLevel = document.getElementById('goLevel');
    els.goAccuracy = document.getElementById('goAccuracy');
    els.goPlayerName = document.getElementById('goPlayerName');
  }

  function loadOptions() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_OPTS_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.difficulty) options.difficulty = parsed.difficulty;
        if (typeof parsed.deluxeExtras === 'boolean') options.deluxeExtras = parsed.deluxeExtras;
        if (typeof parsed.showHints === 'boolean') options.showHints = parsed.showHints;
        if (typeof parsed.crtEnabled === 'boolean') options.crtEnabled = parsed.crtEnabled;
        if (parsed.touchPadMode) options.touchPadMode = parsed.touchPadMode;
      }
    } catch (_) {}
  }

  function saveOptions() {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(STORAGE_OPTS_KEY, JSON.stringify(options));
      }
    } catch (_) {}
  }

  function syncOptionsUI() {
    els.cabinet.classList.toggle('crt-enabled', options.crtEnabled);
    els.crtBtn.textContent = options.crtEnabled ? 'CRT: ON' : 'CRT: OFF';
    els.crtBtn.setAttribute('aria-pressed', String(options.crtEnabled));

    els.titleDeluxeCheck.checked = options.deluxeExtras;
    var radio = document.querySelector('input[name="titleDifficulty"][value="' + options.difficulty + '"]');
    if (radio) radio.checked = true;

    els.optDifficulty.value = options.difficulty;
    els.optDeluxe.checked = options.deluxeExtras;
    els.optHints.checked = options.showHints;
    els.optCrt.checked = options.crtEnabled;
    els.optVolume.value = String(Math.round(NM.Audio.getVolume() * 100));
    els.optTouchPad.value = options.touchPadMode;

    els.touchPad.classList.toggle('is-visible', options.touchPadMode === 'show');
    els.touchPad.classList.toggle('is-forced-hidden', options.touchPadMode === 'hide');

    els.streakStat.style.visibility = options.deluxeExtras ? 'visible' : 'hidden';
    updateMuteButtonUI();
  }

  function updateMuteButtonUI() {
    var isMuted = NM.Audio.isMuted();
    els.muteBtn.textContent = isMuted ? 'Sound: OFF' : 'Sound: ON';
    els.muteBtn.setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
  }

  function loadHighScores() {
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORAGE_HOF_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_HOF.slice();
  }

  function saveHighScores(list) {
    try {
      if (root.localStorage) {
        root.localStorage.setItem(STORAGE_HOF_KEY, JSON.stringify(list.slice(0, 10)));
      }
    } catch (_) {}
  }

  function recordHighScore(name, modeKey, level, score) {
    var cleanName = String(name || 'PLAYER 1').trim().toUpperCase().slice(0, 12) || 'PLAYER 1';
    var scores = loadHighScores();
    scores.push({
      name: cleanName,
      mode: MODE_LABELS[modeKey] || modeKey,
      level: level,
      score: score
    });
    scores.sort(function (a, b) {
      return b.score - a.score || b.level - a.level;
    });
    saveHighScores(scores.slice(0, 10));
  }

  function renderHallOfFame() {
    var scores = loadHighScores();
    els.hofTableBody.innerHTML = '';
    scores.forEach(function (entry, idx) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + (idx + 1) + '</td>' +
        '<td>' + escapeHTML(entry.name) + '</td>' +
        '<td>' + escapeHTML(entry.mode) + '</td>' +
        '<td>' + entry.level + '</td>' +
        '<td>' + entry.score + '</td>';
      els.hofTableBody.appendChild(tr);
    });
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function populateFieldGuide() {
    els.troggleGuideList.innerHTML = TROGGLE_GUIDE.map(function (t) {
      return (
        '<li class="guide-item">' +
          '<div class="guide-sprite">' + NM.Sprites.renderTroggle(t.type, 'normal') + '</div>' +
          '<div>' +
            '<div class="guide-item-title">' + t.name + '</div>' +
            '<div class="guide-item-desc">' + t.desc + '</div>' +
          '</div>' +
        '</li>'
      );
    }).join('');

    els.powerUpGuideList.innerHTML = POWERUP_GUIDE.map(function (p) {
      return (
        '<li class="guide-item">' +
          '<div class="guide-sprite">' + NM.Sprites.renderPowerUp(p.kind) + '</div>' +
          '<div>' +
            '<div class="guide-item-title">' + p.name + '</div>' +
            '<div class="guide-item-desc">' + p.desc + '</div>' +
          '</div>' +
        '</li>'
      );
    }).join('');
  }

  function buildPerimeterWarningSlots() {
    function buildSlots(container, count, arrow) {
      container.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var slot = document.createElement('div');
        slot.className = 'warn-slot';
        slot.textContent = arrow;
        container.appendChild(slot);
      }
    }
    buildSlots(els.warnTop, COLS, '\u25bc');
    buildSlots(els.warnBottom, COLS, '\u25b2');
    buildSlots(els.warnLeft, ROWS, '\u25b6');
    buildSlots(els.warnRight, ROWS, '\u25c0');
  }

  function clearTimers() {
    if (state.aiTimer !== null) {
      root.clearInterval(state.aiTimer);
      state.aiTimer = null;
    }
    if (state.hudTimer !== null) {
      root.clearInterval(state.hudTimer);
      state.hudTimer = null;
    }
    if (state.transitionTimer !== null) {
      root.clearTimeout(state.transitionTimer);
      state.transitionTimer = null;
    }
    stopAutoWalk();
  }

  function stopAutoWalk() {
    state.autoWalkTarget = null;
    if (state.autoWalkTimer !== null) {
      root.clearTimeout(state.autoWalkTimer);
      state.autoWalkTimer = null;
    }
  }

  function getCell(col, row) {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
    return state.board[row * COLS + col] || null;
  }

  function getCellEl(col, row) {
    return els.boardGrid.children[row * COLS + col] || null;
  }

  function countRemainingValid() {
    var count = 0;
    for (var i = 0; i < state.board.length; i++) {
      var c = state.board[i];
      if (!c.empty && c.isValid) count++;
    }
    return count;
  }

  function getStreakMultiplier() {
    if (!options.deluxeExtras) return 1;
    if (state.streak >= 12) return 4;
    if (state.streak >= 8) return 3;
    if (state.streak >= 4) return 2;
    return 1;
  }

  function getTroggleTickMs() {
    var lvl = state.rule ? state.rule.level : 1;
    if (options.difficulty === 'elementary') {
      return Math.max(760, 1650 - (lvl - 1) * 75);
    }
    if (options.difficulty === 'whiz') {
      return Math.max(540, 1050 - (lvl - 1) * 65);
    }
    return Math.max(620, 1350 - (lvl - 1) * 75);
  }

  function getMaxTroggles() {
    var lvl = state.rule ? state.rule.level : 1;
    if (lvl <= 1) return 1;
    if (lvl <= 3) return 2;
    if (lvl <= 6) return 3;
    return 4;
  }

  function getAllowedTroggleTypes() {
    var lvl = state.rule ? state.rule.level : 1;
    var types = ['reggie', 'bashful'];
    if (lvl >= 2 || options.difficulty === 'whiz') {
      types.push('helper', 'worker');
    }
    var smartyLvl = options.difficulty === 'whiz' ? 2 : (options.difficulty === 'elementary' ? 4 : 3);
    if (lvl >= smartyLvl) {
      types.push('smarty');
    }
    return types;
  }

  function setStatus(kind, pill, message) {
    els.statusStrip.classList.remove('is-error', 'is-good');
    if (kind === 'error') els.statusStrip.classList.add('is-error');
    if (kind === 'good') els.statusStrip.classList.add('is-good');
    els.statusPill.textContent = pill;
    els.statusMessage.textContent = message;
  }

  function spawnPopup(col, row, text, isBad) {
    var cellEl = getCellEl(col, row);
    if (!cellEl) return;
    var div = document.createElement('div');
    div.className = 'score-popup' + (isBad ? ' score-popup--bad' : '');
    div.textContent = text;
    var x = cellEl.offsetLeft + cellEl.offsetWidth * 0.5 - 24;
    var y = cellEl.offsetTop + 6;
    div.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
    els.popupsContainer.appendChild(div);

    if (typeof div.animate === 'function' && !(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var anim = div.animate(
        [
          { transform: 'translate3d(' + x + 'px, ' + y + 'px, 0)', opacity: 1 },
          { transform: 'translate3d(' + x + 'px, ' + (y - 28) + 'px, 0)', opacity: 0 }
        ],
        { duration: 760, easing: 'ease-out', fill: 'forwards' }
      );
      anim.onfinish = function () {
        div.remove();
      };
    } else {
      root.setTimeout(function () {
        div.remove();
      }, 650);
    }
  }

  function addScore(points, col, row) {
    state.score += points;
    while (state.score >= state.nextExtraLifeScore) {
      state.lives += 1;
      state.nextExtraLifeScore += 2000;
      NM.Audio.playExtraLife();
      spawnPopup(col !== undefined ? col : state.muncher.col, row !== undefined ? row : state.muncher.row, '+1 LIFE!', false);
      setStatus('good', '1-UP!', 'Bonus Muncher earned at ' + state.score + ' points!');
    }
  }

  function renderBoardDOM() {
    els.boardGrid.innerHTML = '';
    var xrayActive = Date.now() < state.xrayUntil;

    for (var i = 0; i < state.board.length; i++) {
      var cell = state.board[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'board-cell';
      btn.setAttribute('role', 'gridcell');
      btn.dataset.col = String(cell.col);
      btn.dataset.row = String(cell.row);
      updateCellElement(btn, cell, xrayActive);
      els.boardGrid.appendChild(btn);
    }
    syncAllActorPositions();
  }

  function updateCellElement(btn, cell, xrayActive) {
    if (!btn || !cell) return;
    var isHere = cell.col === state.muncher.col && cell.row === state.muncher.row;
    btn.classList.toggle('is-empty', Boolean(cell.empty));
    btn.classList.toggle('is-muncher-here', isHere);
    btn.classList.toggle('is-xray-valid', Boolean(xrayActive && !cell.empty && cell.isValid));
    btn.setAttribute('tabindex', isHere ? '0' : '-1');

    var label = cell.empty ? 'Empty square' : cell.display;
    if (cell.powerUp) label += ' with ' + cell.powerUp.kind + ' power-up';
    btn.setAttribute('aria-label', label);

    var textHtml = cell.empty ? '' : '<span class="cell-text">' + escapeHTML(cell.display) + '</span>';
    var puHtml = cell.powerUp ? '<span class="cell-powerup">' + NM.Sprites.renderPowerUp(cell.powerUp.kind) + '</span>' : '';
    btn.innerHTML = textHtml + puHtml;
  }

  function refreshAllCells() {
    var xrayActive = Date.now() < state.xrayUntil;
    for (var i = 0; i < state.board.length; i++) {
      updateCellElement(els.boardGrid.children[i], state.board[i], xrayActive);
    }
  }

  function renderMuncherSprite() {
    var now = Date.now();
    var isSuper = now < state.pepperUntil;
    var expr = isSuper && state.muncher.expr === 'idle' ? 'super' : state.muncher.expr;
    els.muncherActor.innerHTML = NM.Sprites.renderMuncher(expr);
    els.muncherActor.classList.toggle('is-invuln', now < state.invulnUntil);
    els.muncherActor.classList.toggle('is-chomping', state.muncher.expr === 'chomp');
  }

  function syncActorToCell(actorEl, col, row) {
    var cellEl = getCellEl(col, row);
    if (!cellEl || !actorEl) return;
    actorEl.style.width = cellEl.offsetWidth + 'px';
    actorEl.style.height = cellEl.offsetHeight + 'px';
    actorEl.style.transform = 'translate3d(' + cellEl.offsetLeft + 'px, ' + cellEl.offsetTop + 'px, 0)';
  }

  function syncAllActorPositions() {
    syncActorToCell(els.muncherActor, state.muncher.col, state.muncher.row);
    for (var i = 0; i < state.troggles.length; i++) {
      var t = state.troggles[i];
      var el = els.trogglesContainer.querySelector('[data-troggle-id="' + t.id + '"]');
      if (el) syncActorToCell(el, t.col, t.row);
    }
  }

  function renderTroggles() {
    var now = Date.now();
    var trogState = now < state.freezeUntil ? 'frozen' : (now < state.pepperUntil ? 'frightened' : 'normal');

    var seenIds = new Set();
    for (var i = 0; i < state.troggles.length; i++) {
      var t = state.troggles[i];
      seenIds.add(String(t.id));
      var el = els.trogglesContainer.querySelector('[data-troggle-id="' + t.id + '"]');
      if (!el) {
        el = document.createElement('div');
        el.className = 'actor actor--troggle';
        el.dataset.troggleId = String(t.id);
        els.trogglesContainer.appendChild(el);
      }
      if (el.dataset.renderedState !== t.type + ':' + trogState) {
        el.innerHTML = NM.Sprites.renderTroggle(t.type, trogState);
        el.dataset.renderedState = t.type + ':' + trogState;
      }
      syncActorToCell(el, t.col, t.row);
    }

    var children = Array.prototype.slice.call(els.trogglesContainer.children);
    for (var j = 0; j < children.length; j++) {
      if (!seenIds.has(children[j].dataset.troggleId)) {
        children[j].remove();
      }
    }
  }

  function renderEdgeWarnings() {
    var groups = [els.warnTop, els.warnBottom, els.warnLeft, els.warnRight];
    for (var g = 0; g < groups.length; g++) {
      var slots = groups[g].children;
      for (var s = 0; s < slots.length; s++) {
        slots[s].classList.remove('is-warning');
      }
    }
    var w = state.pendingWarning;
    if (!w) return;
    if (w.edge === 'top' && els.warnTop.children[w.col]) {
      els.warnTop.children[w.col].classList.add('is-warning');
    } else if (w.edge === 'bottom' && els.warnBottom.children[w.col]) {
      els.warnBottom.children[w.col].classList.add('is-warning');
    } else if (w.edge === 'left' && els.warnLeft.children[w.row]) {
      els.warnLeft.children[w.row].classList.add('is-warning');
    } else if (w.edge === 'right' && els.warnRight.children[w.row]) {
      els.warnRight.children[w.row].classList.add('is-warning');
    }
  }

  function renderHUD() {
    if (!state.rule) return;
    els.hudLevel.textContent = String(state.rule.level);
    els.hudRemaining.textContent = String(countRemainingValid());
    els.ruleModeTag.textContent = (MODE_LABELS[state.rule.effectiveMode] || state.rule.effectiveMode).toUpperCase();
    els.ruleBanner.textContent = state.rule.bannerText;
    els.hudScore.textContent = String(state.score).padStart(5, '0');
    els.hudStreak.textContent = '\u00d7' + getStreakMultiplier();

    // Render lives icons (max 5 visual icons + extra count)
    var livesCount = Math.max(0, state.lives);
    var shown = Math.min(5, livesCount);
    var html = '';
    for (var i = 0; i < shown; i++) {
      html += '<span class="life-icon" aria-hidden="true">' + NM.Sprites.renderMuncher('idle') + '</span>';
    }
    if (livesCount > 5) {
      html += '<span class="life-extra">+' + (livesCount - 5) + '</span>';
    }
    if (livesCount === 0) {
      html = '<span class="life-extra" style="color:#fca5a5;">LAST CHANCE</span>';
    }
    els.hudLives.innerHTML = html;
    els.hudLives.setAttribute('aria-label', livesCount + ' spare lives remaining');
  }

  function updatePowerUpMeter() {
    var now = Date.now();
    var active = null;
    if (now < state.pepperUntil) {
      active = { label: 'SUPER PEPPER!', remaining: state.pepperUntil - now, total: 6000 };
    } else if (now < state.freezeUntil) {
      active = { label: 'TROGGLE FREEZE!', remaining: state.freezeUntil - now, total: 6000 };
    } else if (now < state.xrayUntil) {
      active = { label: 'MATH RADAR X-RAY', remaining: state.xrayUntil - now, total: 4500 };
    }

    if (active) {
      els.powerupMeter.classList.add('is-active');
      els.powerupMeterText.textContent = active.label + ' ' + (active.remaining / 1000).toFixed(1) + 's';
      els.powerupMeterFill.style.transform = 'scaleX(' + Math.max(0, Math.min(1, active.remaining / active.total)) + ')';
    } else {
      els.powerupMeter.classList.remove('is-active');
    }
  }

  function showScreen(screen) {
    var isTitle = screen === 'title';
    els.titleScreen.hidden = !isTitle;
    els.gameStage.hidden = isTitle;
    els.pauseBtn.hidden = isTitle;
  }

  function startNewGame(mode) {
    NM.Cutscenes.cancel();
    clearTimers();
    state.selectedMode = mode || state.selectedMode || 'multiples';
    state.lives = 3;
    state.score = 0;
    state.streak = 0;
    state.nextExtraLifeScore = 2000;
    state.attempts = 0;
    state.correctHits = 0;
    state.invulnUntil = 0;
    state.freezeUntil = 0;
    state.pepperUntil = 0;
    state.xrayUntil = 0;
    showScreen('game');
    startLevel(1);
  }

  function startLevel(level) {
    clearTimers();
    state.phase = 'playing';
    state.rule = NM.MathEngine.createLevelRule(state.selectedMode, level, options.difficulty);
    state.board = NM.MathEngine.generateBoard(state.rule, COLS, ROWS);
    state.muncher = { col: 2, row: 2, expr: 'idle', chompTimer: null };
    state.munchedThisLevel = 0;
    state.troggles = [];
    state.pendingWarning = null;
    state.freezeUntil = 0;
    state.pepperUntil = 0;
    state.xrayUntil = 0;
    state.invulnUntil = Date.now() + 1200;
    state.nextPowerUpAt = Date.now() + 8000 + Math.floor(Math.random() * 5000);

    els.pauseVeil.hidden = true;
    els.levelClearVeil.hidden = true;
    els.theaterOverlay.hidden = true;
    els.pauseBtn.textContent = 'Pause';

    renderBoardDOM();
    renderMuncherSprite();
    renderTroggles();
    renderEdgeWarnings();
    renderHUD();
    updatePowerUpMeter();
    setStatus('neutral', 'LEVEL ' + level, state.rule.subHint);

    startGameLoops();
  }

  function startGameLoops() {
    clearTimers();
    if (state.phase !== 'playing') return;

    state.aiTimer = root.setInterval(onAITick, getTroggleTickMs());
    state.hudTimer = root.setInterval(onFastTick, 120);
  }

  function onFastTick() {
    if (state.phase !== 'playing') return;
    var now = Date.now();
    var needsBoardRefresh = false;

    // Expire timed power-ups on board
    for (var i = 0; i < state.board.length; i++) {
      var cell = state.board[i];
      if (cell.powerUp && now >= cell.powerUp.expiresAt) {
        cell.powerUp = null;
        needsBoardRefresh = true;
      }
    }

    // Spawn a Deluxe Power-Up periodically
    if (options.deluxeExtras && now >= state.nextPowerUpAt) {
      var hasPowerUp = state.board.some(function (c) { return Boolean(c.powerUp); });
      if (!hasPowerUp) {
        spawnRandomPowerUp(now);
        needsBoardRefresh = true;
      }
      state.nextPowerUpAt = now + 10000 + Math.floor(Math.random() * 4500);
    }

    if (els.muncherActor.classList.contains('is-invuln') && now >= state.invulnUntil) {
      renderMuncherSprite();
    }

    if (state.xrayUntil > 0 && now >= state.xrayUntil) {
      state.xrayUntil = 0;
      needsBoardRefresh = true;
    }

    if (state.pepperUntil > 0 && now >= state.pepperUntil) {
      state.pepperUntil = 0;
      renderMuncherSprite();
      renderTroggles();
    }

    if (state.freezeUntil > 0 && now >= state.freezeUntil) {
      state.freezeUntil = 0;
      renderTroggles();
    }

    if (needsBoardRefresh) refreshAllCells();
    updatePowerUpMeter();
  }

  function spawnRandomPowerUp(now) {
    var candidates = state.board.filter(function (c) {
      return !(c.col === state.muncher.col && c.row === state.muncher.row) && !c.powerUp;
    });
    if (candidates.length === 0) return;
    var chosen = candidates[Math.floor(Math.random() * candidates.length)];
    var kinds = ['freeze', 'pepper', 'xray', 'star'];
    chosen.powerUp = {
      kind: kinds[Math.floor(Math.random() * kinds.length)],
      expiresAt: now + 8000
    };
  }

  function collectPowerUpIfPresent(cell) {
    if (!cell || !cell.powerUp) return;
    var kind = cell.powerUp.kind;
    cell.powerUp = null;
    NM.Audio.playPowerUp();
    var now = Date.now();

    if (kind === 'freeze') {
      state.freezeUntil = now + 6000;
      renderTroggles();
      setStatus('good', 'FREEZE!', 'All Troggles frozen for 6 seconds!');
      spawnPopup(cell.col, cell.row, 'FREEZE!', false);
    } else if (kind === 'pepper') {
      state.pepperUntil = now + 6000;
      renderMuncherSprite();
      renderTroggles();
      setStatus('good', 'PEPPER!', 'Super Muncher active — eat Troggles for +100 pts!');
      spawnPopup(cell.col, cell.row, 'SUPER!', false);
    } else if (kind === 'xray') {
      state.xrayUntil = now + 4500;
      refreshAllCells();
      setStatus('good', 'RADAR!', 'Golden corner pips reveal valid answers for 4.5s!');
      spawnPopup(cell.col, cell.row, 'X-RAY!', false);
    } else {
      addScore(150, cell.col, cell.row);
      renderHUD();
      setStatus('good', 'BONUS!', 'Grabbed an Arcade Star for +150 points!');
      spawnPopup(cell.col, cell.row, '+150', false);
    }

    updateCellElement(getCellEl(cell.col, cell.row), cell, now < state.xrayUntil);
    updatePowerUpMeter();
  }

  function moveMuncher(dCol, dRow) {
    if (state.phase !== 'playing') return false;
    var nextCol = Math.max(0, Math.min(COLS - 1, state.muncher.col + dCol));
    var nextRow = Math.max(0, Math.min(ROWS - 1, state.muncher.row + dRow));
    if (nextCol === state.muncher.col && nextRow === state.muncher.row) return false;

    var prevCell = getCell(state.muncher.col, state.muncher.row);
    state.muncher.col = nextCol;
    state.muncher.row = nextRow;

    var xrayActive = Date.now() < state.xrayUntil;
    updateCellElement(getCellEl(prevCell.col, prevCell.row), prevCell, xrayActive);
    var nextCell = getCell(nextCol, nextRow);
    updateCellElement(getCellEl(nextCol, nextRow), nextCell, xrayActive);

    NM.Audio.playHop();
    syncActorToCell(els.muncherActor, nextCol, nextRow);

    collectPowerUpIfPresent(nextCell);
    checkCollisions();
    return true;
  }

  function setTempExpression(expr, ms) {
    if (state.muncher.chompTimer) {
      root.clearTimeout(state.muncher.chompTimer);
    }
    state.muncher.expr = expr;
    renderMuncherSprite();
    state.muncher.chompTimer = root.setTimeout(function () {
      state.muncher.expr = 'idle';
      state.muncher.chompTimer = null;
      renderMuncherSprite();
    }, ms || 220);
  }

  function munchCurrentCell() {
    if (state.phase !== 'playing') return;
    var cell = getCell(state.muncher.col, state.muncher.row);
    if (!cell) return;

    collectPowerUpIfPresent(cell);
    if (cell.empty) return;

    state.attempts += 1;
    var cellEl = getCellEl(cell.col, cell.row);

    if (cell.isValid) {
      cell.empty = true;
      state.correctHits += 1;
      state.munchedThisLevel += 1;
      state.streak = options.deluxeExtras ? (state.streak + 1) : 1;

      var mult = getStreakMultiplier();
      var pts = 25 * state.rule.level * mult;
      addScore(pts, cell.col, cell.row);

      NM.Audio.playMunchCorrect(state.streak);
      setTempExpression('chomp', 180);
      spawnPopup(cell.col, cell.row, '+' + pts, false);
      updateCellElement(cellEl, cell, Date.now() < state.xrayUntil);
      if (cellEl) {
        cellEl.classList.add('flash-good');
        root.setTimeout(function () { cellEl.classList.remove('flash-good'); }, 240);
      }

      var msg = mult > 1
        ? 'Streak \u00d7' + mult + '! +' + pts + ' points.'
        : 'Good munch! +' + pts + ' points.';
      setStatus('good', 'YUM!', msg);
      renderHUD();

      if (countRemainingValid() === 0) {
        handleLevelClear();
      }
    } else {
      cell.empty = true;
      state.streak = 0;
      state.lives -= 1;
      state.invulnUntil = Date.now() + 2000;

      NM.Audio.playMunchWrong();
      setTempExpression('oops', 450);
      spawnPopup(cell.col, cell.row, 'OOPS!', true);
      updateCellElement(cellEl, cell, Date.now() < state.xrayUntil);
      if (cellEl) {
        cellEl.classList.add('flash-bad');
        root.setTimeout(function () { cellEl.classList.remove('flash-bad'); }, 320);
      }

      var reason = options.showHints
        ? NM.MathEngine.explainMistake(state.rule, cell)
        : (cell.display + ' does not match the current rule!');
      setStatus('error', 'OOPS!', reason);
      renderMuncherSprite();
      renderHUD();

      if (state.lives < 0) {
        triggerGameOver('Wrong munches drained all Muncher lives!');
      }
    }
  }

  function handleLevelClear() {
    clearTimers();
    state.phase = 'transition';
    var clearedLvl = state.rule.level;
    var bonus = 100 * clearedLvl;
    addScore(bonus);
    renderHUD();

    NM.Audio.playLevelClear();
    els.levelClearTitle.textContent = 'LEVEL ' + clearedLvl + ' CLEAR!';
    els.levelClearBonus.textContent = '+' + bonus + ' Level Clear Bonus!';
    els.levelClearVeil.hidden = false;
    setStatus('good', 'CLEAR!', 'All valid numbers munched! +' + bonus + ' bonus points!');

    state.transitionTimer = root.setTimeout(function () {
      els.levelClearVeil.hidden = true;
      if (clearedLvl % 3 === 0) {
        state.phase = 'cutscene';
        NM.Cutscenes.play(els.theaterOverlay, clearedLvl).then(function () {
          if (state.phase === 'cutscene') {
            startLevel(clearedLvl + 1);
          }
        });
      } else {
        startLevel(clearedLvl + 1);
      }
    }, 1500);
  }

  function triggerGameOver(reason) {
    clearTimers();
    state.phase = 'gameover';
    NM.Audio.playGameOver();

    var acc = state.attempts > 0 ? Math.round((state.correctHits / state.attempts) * 100) : 100;
    els.gameOverReason.textContent = reason || 'Game Over!';
    els.goScore.textContent = String(state.score);
    els.goLevel.textContent = String(state.rule ? state.rule.level : 1);
    els.goAccuracy.textContent = acc + '%';
    els.gameOverDialog.showModal();
  }

  /* ======================== TROGGLE AI ======================== */

  function onAITick() {
    if (state.phase !== 'playing') return;
    if (Date.now() < state.freezeUntil) return;

    var now = Date.now();
    var isPepper = now < state.pepperUntil;

    // 1. Advance existing Troggles
    var survivors = [];
    for (var i = 0; i < state.troggles.length; i++) {
      var t = state.troggles[i];
      var nextPos = computeTroggleStep(t, isPepper);
      if (!nextPos) {
        // Exited the board
        continue;
      }
      t.col = nextPos.col;
      t.row = nextPos.row;
      t.dCol = nextPos.dCol;
      t.dRow = nextPos.dRow;
      t.steps += 1;

      applyTroggleTileAction(t);
      if (state.phase !== 'playing') return; // Helper may have cleared the board

      // Check Troggle-on-Troggle collision: newcomer eats existing!
      var eatenIdx = -1;
      for (var s = 0; s < survivors.length; s++) {
        if (survivors[s].col === t.col && survivors[s].row === t.row) {
          eatenIdx = s;
          break;
        }
      }
      if (eatenIdx !== -1) {
        survivors.splice(eatenIdx, 1);
        spawnPopup(t.col, t.row, 'GULP!', false);
      }
      survivors.push(t);
    }
    state.troggles = survivors;

    // 2. Step pending perimeter warning onto board
    if (state.pendingWarning) {
      var pw = state.pendingWarning;
      state.pendingWarning = null;
      var newTrog = {
        id: state.nextTroggleId++,
        type: pw.type,
        col: pw.col,
        row: pw.row,
        dCol: pw.dCol,
        dRow: pw.dRow,
        steps: 0
      };
      // Check if spawning on another Troggle
      state.troggles = state.troggles.filter(function (existing) {
        if (existing.col === newTrog.col && existing.row === newTrog.row) {
          spawnPopup(newTrog.col, newTrog.row, 'GULP!', false);
          return false;
        }
        return true;
      });
      state.troggles.push(newTrog);
      applyTroggleTileAction(newTrog);
      if (state.phase !== 'playing') return;
    } else if (state.troggles.length < getMaxTroggles()) {
      // Queue next warning with reasonable cadence
      if (state.troggles.length === 0 || Math.random() < 0.6) {
        queueTroggleWarning();
      }
    }

    renderEdgeWarnings();
    renderTroggles();
    checkCollisions();
  }

  function queueTroggleWarning() {
    var edges = ['top', 'bottom', 'left', 'right'];
    var edge = edges[Math.floor(Math.random() * edges.length)];
    var col = 0;
    var row = 0;
    var dCol = 0;
    var dRow = 0;

    for (var tries = 0; tries < 8; tries++) {
      edge = edges[Math.floor(Math.random() * edges.length)];
      if (edge === 'top') {
        col = Math.floor(Math.random() * COLS); row = 0; dCol = 0; dRow = 1;
      } else if (edge === 'bottom') {
        col = Math.floor(Math.random() * COLS); row = ROWS - 1; dCol = 0; dRow = -1;
      } else if (edge === 'left') {
        col = 0; row = Math.floor(Math.random() * ROWS); dCol = 1; dRow = 0;
      } else {
        col = COLS - 1; row = Math.floor(Math.random() * ROWS); dCol = -1; dRow = 0;
      }
      var dist = Math.abs(col - state.muncher.col) + Math.abs(row - state.muncher.row);
      if (dist >= 2) break;
    }

    var pool = getAllowedTroggleTypes();
    var type = pool[Math.floor(Math.random() * pool.length)];
    state.pendingWarning = { edge: edge, col: col, row: row, dCol: dCol, dRow: dRow, type: type };
    NM.Audio.playTroggleWarn();
  }

  function orthogonalTurn(dCol, dRow) {
    if (dCol !== 0) {
      return Math.random() < 0.5 ? { dCol: 0, dRow: 1 } : { dCol: 0, dRow: -1 };
    }
    return Math.random() < 0.5 ? { dCol: 1, dRow: 0 } : { dCol: -1, dRow: 0 };
  }

  function computeTroggleStep(t, isPepper) {
    var col = t.col;
    var row = t.row;
    var dCol = t.dCol;
    var dRow = t.dRow;

    if (t.type === 'reggie') {
      var nc = col + dCol;
      var nr = row + dRow;
      if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS) return null;
      return { col: nc, row: nr, dCol: dCol, dRow: dRow };
    }

    if (t.type === 'bashful') {
      var aheadCol = col + dCol;
      var aheadRow = row + dRow;
      var dist = Math.abs(col - state.muncher.col) + Math.abs(row - state.muncher.row);
      if ((aheadCol === state.muncher.col && aheadRow === state.muncher.row) || dist === 1) {
        dCol = -dCol;
        dRow = -dRow;
      } else if (Math.random() < 0.25) {
        var turnB = orthogonalTurn(dCol, dRow);
        if (getCell(col + turnB.dCol, row + turnB.dRow)) {
          dCol = turnB.dCol;
          dRow = turnB.dRow;
        }
      }
      var bc = col + dCol;
      var br = row + dRow;
      if (bc < 0 || bc >= COLS || br < 0 || br >= ROWS) return null;
      return { col: bc, row: br, dCol: dCol, dRow: dRow };
    }

    if (t.type === 'smarty') {
      if (t.steps >= 14 && (col === 0 || col === COLS - 1 || row === 0 || row === ROWS - 1)) {
        return null;
      }
      var dirs = [
        { dCol: 1, dRow: 0 },
        { dCol: -1, dRow: 0 },
        { dCol: 0, dRow: 1 },
        { dCol: 0, dRow: -1 }
      ].filter(function (d) {
        return Boolean(getCell(col + d.dCol, row + d.dRow));
      });
      dirs.sort(function (a, b) {
        var da = Math.abs(col + a.dCol - state.muncher.col) + Math.abs(row + a.dRow - state.muncher.row);
        var db = Math.abs(col + b.dCol - state.muncher.col) + Math.abs(row + b.dRow - state.muncher.row);
        return isPepper ? (db - da) : (da - db);
      });
      var best = dirs[0];
      return { col: col + best.dCol, row: row + best.dRow, dCol: best.dCol, dRow: best.dRow };
    }

    // helper / worker
    if (Math.random() < 0.3) {
      var turn = orthogonalTurn(dCol, dRow);
      if (getCell(col + turn.dCol, row + turn.dRow)) {
        dCol = turn.dCol;
        dRow = turn.dRow;
      }
    }
    var nx = col + dCol;
    var ny = row + dRow;
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) {
      if (t.steps >= 10) return null;
      // Bounce inside grid once or twice before exiting
      var bounce = orthogonalTurn(dCol, dRow);
      if (getCell(col + bounce.dCol, row + bounce.dRow)) {
        return { col: col + bounce.dCol, row: row + bounce.dRow, dCol: bounce.dCol, dRow: bounce.dRow };
      }
      return { col: col - dCol, row: row - dRow, dCol: -dCol, dRow: -dRow };
    }
    return { col: nx, row: ny, dCol: dCol, dRow: dRow };
  }

  function applyTroggleTileAction(t) {
    var cell = getCell(t.col, t.row);
    if (!cell || cell.powerUp) return;
    if (t.col === state.muncher.col && t.row === state.muncher.row) return;

    var xrayActive = Date.now() < state.xrayUntil;

    if (t.type === 'helper' && !cell.empty && Math.random() < 0.45) {
      cell.empty = true;
      cell.isValid = false;
      cell.display = '';
      updateCellElement(getCellEl(cell.col, cell.row), cell, xrayActive);
      renderHUD();

      // Soft-lock guard if Helper ate the last valid number
      if (countRemainingValid() === 0) {
        if (state.munchedThisLevel >= 1) {
          handleLevelClear();
        } else {
          // Spawn a guaranteed valid replacement on an empty cell so player never skips a level on 0 munches
          var emptyCells = state.board.filter(function (c) {
            return c.empty && !(c.col === state.muncher.col && c.row === state.muncher.row);
          });
          if (emptyCells.length > 0) {
            var targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            var rep = NM.MathEngine.generateSingleCell(state.rule, 1.0);
            targetCell.display = rep.display;
            targetCell.numericValue = rep.numericValue;
            targetCell.isValid = rep.isValid;
            targetCell.empty = false;
            updateCellElement(getCellEl(targetCell.col, targetCell.row), targetCell, xrayActive);
            renderHUD();
          }
        }
      }
    } else if (t.type === 'worker' && Math.random() < 0.45) {
      var fresh = NM.MathEngine.generateSingleCell(state.rule, 0.38);
      cell.display = fresh.display;
      cell.numericValue = fresh.numericValue;
      cell.isValid = fresh.isValid;
      cell.empty = false;
      updateCellElement(getCellEl(cell.col, cell.row), cell, xrayActive);
      renderHUD();
    }
  }

  function checkCollisions() {
    if (state.phase !== 'playing') return;
    var now = Date.now();
    var isPepper = now < state.pepperUntil;

    for (var i = state.troggles.length - 1; i >= 0; i--) {
      var t = state.troggles[i];
      if (t.col === state.muncher.col && t.row === state.muncher.row) {
        if (isPepper) {
          state.troggles.splice(i, 1);
          addScore(100, t.col, t.row);
          NM.Audio.playEatTroggle();
          setTempExpression('chomp', 200);
          spawnPopup(t.col, t.row, '+100 CHOMP!', false);
          setStatus('good', 'CHOMP!', 'Super Muncher gobbled a Troggle for +100 points!');
          renderTroggles();
          renderHUD();
        } else if (now >= state.invulnUntil) {
          state.troggles.splice(i, 1);
          state.lives -= 1;
          state.streak = 0;
          state.invulnUntil = now + 2000;
          stopAutoWalk();
          NM.Audio.playTroggleEat();
          setTempExpression('oops', 500);
          spawnPopup(t.col, t.row, 'OUCH!', true);
          setStatus('error', 'CAUGHT!', 'A Troggle caught Muncher! Watch the border arrows.');
          renderTroggles();
          renderMuncherSprite();
          renderHUD();

          if (state.lives < 0) {
            triggerGameOver('A Troggle caught up with Muncher!');
            return;
          }
        }
      }
    }
  }

  /* ======================== AUTO-WALK (CLICK/TAP) ======================== */

  function startAutoWalk(targetCol, targetRow) {
    stopAutoWalk();
    if (state.phase !== 'playing') return;
    if (targetCol === state.muncher.col && targetRow === state.muncher.row) {
      munchCurrentCell();
      return;
    }

    state.autoWalkTarget = { col: targetCol, row: targetRow };

    function step() {
      if (state.phase !== 'playing' || !state.autoWalkTarget) return;
      var dx = state.autoWalkTarget.col - state.muncher.col;
      var dy = state.autoWalkTarget.row - state.muncher.row;
      if (dx === 0 && dy === 0) {
        stopAutoWalk();
        return;
      }
      if (Math.abs(dx) >= Math.abs(dy)) {
        moveMuncher(dx > 0 ? 1 : -1, 0);
      } else {
        moveMuncher(0, dy > 0 ? 1 : -1);
      }
      if (state.phase === 'playing' && state.autoWalkTarget &&
          (state.muncher.col !== state.autoWalkTarget.col || state.muncher.row !== state.autoWalkTarget.row)) {
        state.autoWalkTimer = root.setTimeout(step, 95);
      } else {
        stopAutoWalk();
      }
    }

    step();
  }

  /* ======================== PAUSE & MODALS ======================== */

  function pauseGame(byModal) {
    if (state.phase !== 'playing') return;
    clearTimers();
    state.phase = 'paused';
    state.pausedByModal = Boolean(byModal);
    els.pauseBtn.textContent = 'Resume';
    els.pauseRuleReminder.textContent = state.rule ? state.rule.bannerText : 'Take a breather!';
    els.pauseVeil.hidden = byModal; // Don't stack pause veil behind a modal
  }

  function resumeGame() {
    if (state.phase !== 'paused') return;
    state.phase = 'playing';
    state.pausedByModal = false;
    els.pauseVeil.hidden = true;
    els.pauseBtn.textContent = 'Pause';
    startGameLoops();
  }

  function openModal(dialogEl, onOpen) {
    if (state.phase === 'playing') {
      pauseGame(true);
    }
    if (typeof onOpen === 'function') onOpen();
    dialogEl.showModal();
  }

  function setupDialogs() {
    var lightDismissDialogs = [els.guideDialog, els.optionsDialog, els.hallOfFameDialog];

    lightDismissDialogs.forEach(function (dlg) {
      dlg.addEventListener('close', function () {
        dlg.returnValue = '';
        if (state.pausedByModal && !document.querySelector('dialog[open]')) {
          resumeGame();
        }
      });

      // Mandatory fallback for browsers without closedby attribute support
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        var outside = function (e) {
          var r = dlg.getBoundingClientRect();
          return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        };
        var pressedOutside = false;
        dlg.addEventListener('pointerdown', function (e) {
          pressedOutside = outside(e);
        });
        dlg.addEventListener('pointerup', function (e) {
          if (pressedOutside && outside(e)) dlg.close();
          pressedOutside = false;
        });
      }
    });

    els.gameOverDialog.addEventListener('close', function () {
      var choice = els.gameOverDialog.returnValue;
      els.gameOverDialog.returnValue = '';

      recordHighScore(
        els.goPlayerName.value,
        state.selectedMode,
        state.rule ? state.rule.level : 1,
        state.score
      );

      if (choice === 'again') {
        startNewGame(state.selectedMode);
      } else {
        clearTimers();
        state.phase = 'title';
        showScreen('title');
      }
    });
  }

  /* ======================== EVENT WIRING ======================== */

  function bindEvents() {
    // Mode selection cards on title screen
    els.modeGrid.addEventListener('click', function (e) {
      var card = e.target.closest('.mode-card');
      if (!card) return;
      state.selectedMode = card.dataset.mode;
      var cards = els.modeGrid.querySelectorAll('.mode-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].classList.toggle('is-selected', cards[i] === card);
      }
    });

    // Double-click mode card starts right away
    els.modeGrid.addEventListener('dblclick', function (e) {
      var card = e.target.closest('.mode-card');
      if (!card) return;
      state.selectedMode = card.dataset.mode;
      startNewGame(state.selectedMode);
    });

    document.querySelectorAll('input[name="titleDifficulty"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) {
          options.difficulty = radio.value;
          saveOptions();
          syncOptionsUI();
        }
      });
    });

    els.titleDeluxeCheck.addEventListener('change', function () {
      options.deluxeExtras = els.titleDeluxeCheck.checked;
      saveOptions();
      syncOptionsUI();
    });

    els.startGameBtn.addEventListener('click', function () {
      NM.Audio.unlock();
      startNewGame(state.selectedMode);
    });

    els.homeBtn.addEventListener('click', function () {
      NM.Cutscenes.cancel();
      clearTimers();
      state.phase = 'title';
      showScreen('title');
    });

    els.pauseBtn.addEventListener('click', function () {
      if (state.phase === 'playing') pauseGame(false);
      else if (state.phase === 'paused') resumeGame();
    });

    els.resumeBtn.addEventListener('click', resumeGame);
    els.quitToMenuBtn.addEventListener('click', function () {
      clearTimers();
      state.phase = 'title';
      showScreen('title');
    });

    els.muteBtn.addEventListener('click', function () {
      NM.Audio.toggleMute();
      updateMuteButtonUI();
    });

    els.crtBtn.addEventListener('click', function () {
      options.crtEnabled = !options.crtEnabled;
      saveOptions();
      syncOptionsUI();
    });

    els.guideBtn.addEventListener('click', function () {
      openModal(els.guideDialog);
    });

    els.optionsBtn.addEventListener('click', function () {
      openModal(els.optionsDialog, syncOptionsUI);
    });

    els.hofBtn.addEventListener('click', function () {
      openModal(els.hallOfFameDialog, renderHallOfFame);
    });

    els.resetHofBtn.addEventListener('click', function () {
      saveHighScores(DEFAULT_HOF);
      renderHallOfFame();
    });

    // Options controls
    els.optDifficulty.addEventListener('change', function () {
      options.difficulty = els.optDifficulty.value;
      saveOptions();
      syncOptionsUI();
    });
    els.optDeluxe.addEventListener('change', function () {
      options.deluxeExtras = els.optDeluxe.checked;
      saveOptions();
      syncOptionsUI();
    });
    els.optHints.addEventListener('change', function () {
      options.showHints = els.optHints.checked;
      saveOptions();
    });
    els.optCrt.addEventListener('change', function () {
      options.crtEnabled = els.optCrt.checked;
      saveOptions();
      syncOptionsUI();
    });
    els.optVolume.addEventListener('input', function () {
      NM.Audio.setVolume(Number(els.optVolume.value) / 100);
    });
    els.optTouchPad.addEventListener('change', function () {
      options.touchPadMode = els.optTouchPad.value;
      saveOptions();
      syncOptionsUI();
    });

    // Board clicks / taps
    els.boardGrid.addEventListener('click', function (e) {
      var cellBtn = e.target.closest('.board-cell');
      if (!cellBtn || state.phase !== 'playing') return;
      var col = Number(cellBtn.dataset.col);
      var row = Number(cellBtn.dataset.row);
      startAutoWalk(col, row);
    });

    // Touch D-pad
    els.touchPad.addEventListener('click', function (e) {
      var dirBtn = e.target.closest('.dpad-btn');
      if (!dirBtn || state.phase !== 'playing') return;
      stopAutoWalk();
      var dir = dirBtn.dataset.dir;
      if (dir === 'up') moveMuncher(0, -1);
      else if (dir === 'down') moveMuncher(0, 1);
      else if (dir === 'left') moveMuncher(-1, 0);
      else if (dir === 'right') moveMuncher(1, 0);
    });

    els.touchMunchBtn.addEventListener('click', function () {
      if (state.phase === 'playing') {
        stopAutoWalk();
        munchCurrentCell();
      }
    });

    // Keyboard routing
    root.addEventListener('keydown', function (e) {
      if (document.querySelector('dialog[open]')) return;
      var target = e.composedPath ? e.composedPath()[0] : e.target;
      if (target && target.matches && target.matches(':read-write, select, input, textarea')) {
        return;
      }

      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        NM.Audio.toggleMute();
        updateMuteButtonUI();
        return;
      }

      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (state.phase === 'playing') pauseGame(false);
        else if (state.phase === 'paused') resumeGame();
        return;
      }

      if (state.phase !== 'playing') return;

      // Let toolbar buttons activate cleanly with Space/Enter when focused outside the board
      if ((e.key === ' ' || e.key === 'Enter') && target && target.closest) {
        var btn = target.closest('button');
        if (btn && !btn.classList.contains('board-cell')) {
          return;
        }
      }

      var handled = true;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          stopAutoWalk();
          moveMuncher(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          stopAutoWalk();
          moveMuncher(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          stopAutoWalk();
          moveMuncher(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          stopAutoWalk();
          moveMuncher(1, 0);
          break;
        case ' ':
        case 'Enter':
          stopAutoWalk();
          munchCurrentCell();
          break;
        default:
          handled = false;
      }

      if (handled) {
        e.preventDefault();
      }
    });

    // Keep sprites aligned on viewport resize
    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(function () {
        if (state.phase === 'playing' || state.phase === 'paused' || state.phase === 'transition') {
          syncAllActorPositions();
        }
      });
      ro.observe(els.boardGrid);
    } else {
      root.addEventListener('resize', syncAllActorPositions);
    }
  }

  function init() {
    cacheElements();
    NM.Audio.init();
    loadOptions();
    populateFieldGuide();
    buildPerimeterWarningSlots();

    els.heroMascot.innerHTML = NM.Sprites.renderMuncher('happy');
    var firstCard = els.modeGrid.querySelector('.mode-card[data-mode="multiples"]');
    if (firstCard) firstCard.classList.add('is-selected');

    syncOptionsUI();
    setupDialogs();
    bindEvents();
    showScreen('title');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose minimal read/test hooks for diagnostics & verification
  NM.Game = {
    startNewGame: startNewGame,
    getState: function () { return state; },
    playSkitPreview: function (skitIdx) {
      if (state.phase === 'title') {
        startNewGame('multiples');
      }
      clearTimers();
      state.phase = 'cutscene';
      return NM.Cutscenes.play(els.theaterOverlay, 3, skitIdx).then(function () {
        if (state.phase === 'cutscene') startLevel((state.rule ? state.rule.level : 1) + 1);
      });
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
