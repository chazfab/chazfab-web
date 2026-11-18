(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});

  var COLS = 6;
  var ROWS = 5;
  var STORAGE_OPTS_KEY = 'nm_retro_options_v2';
  var STORAGE_HOF_KEY = 'nm_high_scores_v1';

  var DEFAULT_HOF = [
    { name: 'MECC', mode: 'Challenge', level: 12, score: 1250 },
    { name: 'MUNCH', mode: 'Multiples', level: 9, score: 940 },
    { name: 'CARMEN', mode: 'Primes', level: 7, score: 720 },
    { name: 'OREGON', mode: 'Factors', level: 6, score: 560 },
    { name: 'REGGIE', mode: 'Equality', level: 4, score: 310 }
  ];

  var MODE_LABELS = {
    multiples: 'Multiples',
    factors: 'Factors',
    primes: 'Primes',
    equality: 'Equality',
    inequality: 'Inequality',
    short_vowels: 'Short Vowels',
    long_vowels: 'Long Vowels',
    special_vowels: 'Vowel Teams',
    grammar: 'Grammar',
    synonyms: 'Synonyms',
    types: 'Frac Types',
    equivalents: 'Equivalents',
    comparing: 'Comparing',
    expressions: 'Frac Math',
    animals: 'Animals',
    space_geo: 'Space & Geo',
    science: 'Science',
    culture: 'Culture',
    challenge: 'Challenge'
  };

  var DISK_HOF_PREFIX = {
    number: '',
    word: 'Word: ',
    fraction: 'Frac: ',
    super: 'Super: '
  };

  var MONITOR_LABELS = {
    vga: 'IBM DOS VGA',
    apple2green: 'Apple II Green',
    apple2color: 'Apple II Color'
  };

  var TROGGLE_NAMES = {
    reggie: 'a Reggie',
    bashful: 'a Bashful',
    helper: 'a Helper',
    worker: 'a Worker',
    smarty: 'a Smarty'
  };

  var TROGGLE_GUIDE = [
    { type: 'reggie', name: 'Reggie', desc: 'Classic red horned Troggle. Charges straight across the board and exits on the far edge.' },
    { type: 'bashful', name: 'Bashful', desc: 'Shy blue Troggle. Reverses direction whenever Muncher approaches right in front of it!' },
    { type: 'helper', name: 'Helper', desc: 'Yellow long-snouted Troggle. Eats numbers off squares as it marches across the grid.' },
    { type: 'worker', name: 'Worker', desc: 'Orange hard-hat Troggle. Drops brand-new numbers onto squares behind it.' },
    { type: 'smarty', name: 'Smarty', desc: 'Purple bespectacled brainiac. Actively tracks Muncher across the board!' }
  ];

  var POWERUP_GUIDE = [
    { kind: 'freeze', name: 'Ice Crystal', desc: 'Freezes all Troggles solid for 6 seconds.' },
    { kind: 'pepper', name: 'Super Pepper', desc: 'Turns Muncher fiery for 6 seconds - eat Troggles for bonus points!' },
    { kind: 'xray', name: 'Math Radar Lens', desc: 'Marks valid numbers with a corner indicator for 4.5 seconds.' },
    { kind: 'star', name: 'Bonus Star', desc: 'Awards an instant +150 point boost.' }
  ];

  var options = {
    difficulty: 'classic',
    monitor: 'vga',
    crtEnabled: true,
    showHints: true,
    touchPadMode: 'auto',
    deluxeExtras: false,
    lastDisk: 'number'
  };

  var state = {
    phase: 'title', // 'title' | 'playing' | 'paused' | 'oops_prompt' | 'transition' | 'cutscene' | 'gameover'
    menuScreen: 'main', // 'main' | 'mode' | 'disk'
    mainMenuIndex: 0,
    modeMenuIndex: 0,
    diskMenuIndex: 0,
    selectedDisk: 'number',
    selectedMode: 'multiples',
    rule: null,
    board: [],
    muncher: { col: 2, row: 2, expr: 'idle', frame: 0, chompTimer: null },
    lives: 3,
    score: 0,
    streak: 0,
    superCharge: 0,
    nextExtraLifeScore: 1000,
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
    oopsOpenedAt: 0,
    oopsGameOverReason: '',
    pausedByModal: false,
    pausedByBackground: false,
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
    els.guideBtn = document.getElementById('guideBtn');
    els.optionsBtn = document.getElementById('optionsBtn');
    els.hofBtn = document.getElementById('hofBtn');
    els.diskBtn = document.getElementById('diskBtn');
    els.pauseBtn = document.getElementById('pauseBtn');
    els.pauseLabel = document.getElementById('pauseLabel');
    els.muteBtn = document.getElementById('muteBtn');
    els.muteLabel = document.getElementById('muteLabel');
    els.fullscreenBtn = document.getElementById('fullscreenBtn');
    els.fullscreenLabel = document.getElementById('fullscreenLabel');

    els.titleScreen = document.getElementById('titleScreen');
    els.titleHeading = document.getElementById('titleHeading');
    els.retroSubtitle = document.getElementById('retroSubtitle');
    els.heroMascot = document.getElementById('heroMascot');
    els.heroTroggle = document.getElementById('heroTroggle');
    els.diskStrip = document.getElementById('diskStrip');
    els.mainMenuBox = document.getElementById('mainMenuBox');
    els.playMainMenuText = document.getElementById('playMainMenuText');
    els.modeMenuBox = document.getElementById('modeMenuBox');
    els.modeMenuHeader = document.getElementById('modeMenuHeader');
    els.modeMenuList = document.getElementById('modeMenuList');
    els.diskMenuBox = document.getElementById('diskMenuBox');
    els.mainMenuMeta = document.getElementById('mainMenuMeta');

    els.gameStage = document.getElementById('gameStage');
    els.hudLevel = document.getElementById('hudLevel');
    els.hudRemaining = document.getElementById('hudRemaining');
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

    els.oopsOverlay = document.getElementById('oopsOverlay');
    els.oopsActorSprite = document.getElementById('oopsActorSprite');
    els.oopsMessage = document.getElementById('oopsMessage');
    els.oopsContinueBtn = document.getElementById('oopsContinueBtn');

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
    els.optMonitor = document.getElementById('optMonitor');
    els.optDifficulty = document.getElementById('optDifficulty');
    els.optCrt = document.getElementById('optCrt');
    els.optHints = document.getElementById('optHints');
    els.optDeluxe = document.getElementById('optDeluxe');
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
        if (parsed.monitor && MONITOR_LABELS[parsed.monitor]) options.monitor = parsed.monitor;
        if (typeof parsed.crtEnabled === 'boolean') options.crtEnabled = parsed.crtEnabled;
        if (typeof parsed.showHints === 'boolean') options.showHints = parsed.showHints;
        if (parsed.touchPadMode) options.touchPadMode = parsed.touchPadMode;
        if (typeof parsed.deluxeExtras === 'boolean') options.deluxeExtras = parsed.deluxeExtras;
        if (parsed.lastDisk && NM.ContentPacks && NM.ContentPacks.DISKS[parsed.lastDisk]) {
          options.lastDisk = parsed.lastDisk;
        }
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
    document.documentElement.setAttribute('data-monitor', options.monitor);
    els.cabinet.setAttribute('data-monitor', options.monitor);
    els.cabinet.classList.toggle('crt-enabled', options.crtEnabled);

    els.optMonitor.value = options.monitor;
    els.optDifficulty.value = options.difficulty;
    els.optCrt.checked = options.crtEnabled;
    els.optHints.checked = options.showHints;
    els.optDeluxe.checked = options.deluxeExtras;
    els.optVolume.value = String(Math.round(NM.Audio.getVolume() * 100));
    els.optTouchPad.value = options.touchPadMode;

    els.touchPad.classList.toggle('is-visible', options.touchPadMode === 'show');
    els.touchPad.classList.toggle('is-forced-hidden', options.touchPadMode === 'hide');

    els.streakStat.style.visibility = options.deluxeExtras ? 'visible' : 'hidden';
    if (!options.deluxeExtras) {
      els.powerupMeter.hidden = true;
    }

    var diffLabel = options.difficulty === 'elementary'
      ? 'Elementary'
      : (options.difficulty === 'whiz' ? 'Math Whiz' : 'Classic');
    els.mainMenuMeta.textContent =
      'Monitor: ' + (MONITOR_LABELS[options.monitor] || 'IBM DOS VGA') +
      ' | Difficulty: ' + diffLabel +
      ' | Bonus Items: ' + (options.deluxeExtras ? 'ON' : 'OFF');

    updateMuteButtonUI();
    updateFullscreenUI();
  }

  function updateMuteButtonUI() {
    var isMuted = NM.Audio.isMuted();
    els.muteLabel.textContent = isMuted ? ':Sound OFF' : ':Sound ON';
    els.muteBtn.setAttribute('aria-label', isMuted ? 'Unmute sound' : 'Mute sound');
  }

  function updateFullscreenUI() {
    var active = Boolean(document.fullscreenElement);
    els.fullscreenLabel.textContent = active ? ':Window' : ':Full';
    els.fullscreenBtn.setAttribute('aria-label', active ? 'Exit fullscreen' : 'Enter fullscreen');
  }

  function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        if (els.cabinet && els.cabinet.requestFullscreen) {
          els.cabinet.requestFullscreen().catch(function () {});
        }
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    } catch (_) {}
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

  function recordHighScore(name, diskKey, modeKey, level, score) {
    var cleanName = String(name || 'PLAYER 1').trim().toUpperCase().slice(0, 12) || 'PLAYER 1';
    var prefix = DISK_HOF_PREFIX[diskKey] || '';
    var scores = loadHighScores();
    scores.push({
      name: cleanName,
      mode: prefix + (MODE_LABELS[modeKey] || modeKey),
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
          '<div class="guide-sprite">' + NM.Sprites.renderTroggle(t.type, 'normal', 0) + '</div>' +
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
    function buildSlots(container, count, label) {
      container.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var slot = document.createElement('div');
        slot.className = 'warn-slot';
        slot.textContent = label;
        container.appendChild(slot);
      }
    }
    buildSlots(els.warnTop, COLS, 'TROGGLE');
    buildSlots(els.warnBottom, COLS, 'TROGGLE');
    buildSlots(els.warnLeft, ROWS, '\u25ba');
    buildSlots(els.warnRight, ROWS, '\u25c4');
  }

  /* ======================== RETRO MENU & DISK CONTROLLER ======================== */

  function createRuleForSelection(disk, mode, level, difficulty) {
    if (disk === 'number') {
      var r = NM.MathEngine.createLevelRule(mode, level, difficulty);
      r.disk = 'number';
      return r;
    }
    return NM.ContentPacks.createLevelRule(disk, mode, level, difficulty);
  }

  function generateBoardForRule(rule) {
    if (!rule || rule.disk === 'number') {
      return NM.MathEngine.generateBoard(rule, COLS, ROWS);
    }
    return NM.ContentPacks.generateBoard(rule, COLS, ROWS);
  }

  function generateSingleCellForRule(rule, prob) {
    if (!rule || rule.disk === 'number') {
      return NM.MathEngine.generateSingleCell(rule, prob);
    }
    return NM.ContentPacks.generateSingleCell(rule, prob);
  }

  function explainMistakeForRule(rule, cell) {
    if (!rule || rule.disk === 'number') {
      return NM.MathEngine.explainMistake(rule, cell);
    }
    return NM.ContentPacks.explainMistake(rule, cell);
  }

  function toTitleWords(str) {
    return String(str || '').toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  function selectDisk(diskId, openModeMenu) {
    var disks = NM.ContentPacks ? NM.ContentPacks.DISKS : null;
    var disk = disks && disks[diskId] ? disks[diskId] : (disks ? disks.number : null);
    if (!disk) return;

    state.selectedDisk = disk.id;
    options.lastDisk = disk.id;
    saveOptions();

    els.titleHeading.textContent = disk.title;
    els.retroSubtitle.textContent = disk.subtitle;
    els.playMainMenuText.textContent = 'Play ' + toTitleWords(disk.title);
    els.modeMenuHeader.textContent = disk.shortLabel + ' - CHOOSE A GAME';

    var radio = els.diskStrip.querySelector('input[name="activeDisk"][value="' + disk.id + '"]');
    if (radio) radio.checked = true;

    // Rebuild mode list dynamically for selected disk
    els.modeMenuList.innerHTML =
      disk.modes.map(function (m, idx) {
        return (
          '<li><button type="button" class="retro-menu-item' + (idx === 0 ? ' is-active' : '') +
          '" data-mode="' + m.id + '" role="menuitem"><span class="menu-arrow" aria-hidden="true">&gt;</span> ' +
          escapeHTML(m.label) + '</button></li>'
        );
      }).join('') +
      '<li><button type="button" class="retro-menu-item retro-menu-item--back" data-action="back" role="menuitem">' +
      '<span class="menu-arrow" aria-hidden="true">&gt;</span> Return to Main Menu</button></li>';

    state.selectedMode = disk.modes[0].id;
    state.modeMenuIndex = 0;

    if (openModeMenu) {
      setMenuScreen('mode');
    } else {
      renderMenuFocus();
    }
  }

  function getMenuItems(menuKind) {
    var box = els.mainMenuBox;
    if (menuKind === 'mode') box = els.modeMenuBox;
    else if (menuKind === 'disk') box = els.diskMenuBox;
    return Array.prototype.slice.call(box.querySelectorAll('.retro-menu-item'));
  }

  function setMenuScreen(menuKind) {
    state.menuScreen = (menuKind === 'mode' || menuKind === 'disk') ? menuKind : 'main';
    els.mainMenuBox.hidden = state.menuScreen !== 'main';
    els.modeMenuBox.hidden = state.menuScreen !== 'mode';
    els.diskMenuBox.hidden = state.menuScreen !== 'disk';
    renderMenuFocus();
  }

  function renderMenuFocus() {
    var items = getMenuItems(state.menuScreen);
    var activeIdx = state.mainMenuIndex;
    if (state.menuScreen === 'mode') activeIdx = state.modeMenuIndex;
    else if (state.menuScreen === 'disk') activeIdx = state.diskMenuIndex;
    if (activeIdx < 0 || activeIdx >= items.length) activeIdx = 0;

    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle('is-active', i === activeIdx);
    }
  }

  function moveMenuCursor(delta) {
    var items = getMenuItems(state.menuScreen);
    if (items.length === 0) return;
    if (state.menuScreen === 'mode') {
      state.modeMenuIndex = (state.modeMenuIndex + delta + items.length) % items.length;
    } else if (state.menuScreen === 'disk') {
      state.diskMenuIndex = (state.diskMenuIndex + delta + items.length) % items.length;
    } else {
      state.mainMenuIndex = (state.mainMenuIndex + delta + items.length) % items.length;
    }
    NM.Audio.playMenuMove();
    renderMenuFocus();
  }

  function activateMenuItem(btn) {
    if (!btn) return;
    NM.Audio.playMenuSelect();
    var action = btn.dataset.action;
    var mode = btn.dataset.mode;
    var disk = btn.dataset.disk;

    if (action === 'play') {
      setMenuScreen('mode');
      return;
    }
    if (action === 'disk') {
      setMenuScreen('disk');
      return;
    }
    if (action === 'hof') {
      openModal(els.hallOfFameDialog, renderHallOfFame);
      return;
    }
    if (action === 'info') {
      openModal(els.guideDialog);
      return;
    }
    if (action === 'options') {
      openModal(els.optionsDialog, syncOptionsUI);
      return;
    }
    if (action === 'back') {
      setMenuScreen('main');
      return;
    }
    if (disk) {
      selectDisk(disk, true);
      return;
    }
    if (mode) {
      startNewGame(mode);
    }
  }

  /* ======================== GAME ENGINE HELPERS ======================== */

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

  function getActorCoordSet() {
    var set = new Set();
    set.add(state.muncher.col + ',' + state.muncher.row);
    for (var i = 0; i < state.troggles.length; i++) {
      set.add(state.troggles[i].col + ',' + state.troggles[i].row);
    }
    return set;
  }

  function setStatus(kind, pill, message) {
    els.statusStrip.classList.remove('is-error', 'is-good');
    if (kind === 'error') els.statusStrip.classList.add('is-error');
    if (kind === 'good') els.statusStrip.classList.add('is-good');
    els.statusPill.textContent = pill;
    els.statusMessage.textContent = message;
  }

  function spawnPopup(col, row, text, isBad) {
    if (!options.deluxeExtras) return;
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
          { transform: 'translate3d(' + x + 'px, ' + (y - 24) + 'px, 0)', opacity: 0 }
        ],
        { duration: 700, easing: 'ease-out', fill: 'forwards' }
      );
      anim.onfinish = function () { div.remove(); };
    } else {
      root.setTimeout(function () { div.remove(); }, 650);
    }
  }

  function addScore(points, col, row) {
    state.score += points;
    var lifeStep = options.deluxeExtras ? 2000 : 1000;
    while (state.score >= state.nextExtraLifeScore) {
      state.lives += 1;
      state.nextExtraLifeScore += lifeStep;
      NM.Audio.playExtraLife();
      if (col !== undefined && row !== undefined) {
        spawnPopup(col, row, '+1 LIFE!', false);
      }
      setStatus('good', '1-UP!', 'Free Muncher earned at ' + state.score + ' points!');
    }
  }

  function renderBoardDOM() {
    els.boardGrid.innerHTML = '';
    var xrayActive = Date.now() < state.xrayUntil;
    var actorCoords = getActorCoordSet();

    for (var i = 0; i < state.board.length; i++) {
      var cell = state.board[i];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'board-cell';
      btn.setAttribute('role', 'gridcell');
      btn.dataset.col = String(cell.col);
      btn.dataset.row = String(cell.row);
      updateCellElement(btn, cell, xrayActive, actorCoords);
      els.boardGrid.appendChild(btn);
    }
    syncAllActorPositions();
  }

  function updateCellElement(btn, cell, xrayActive, actorCoords) {
    if (!btn || !cell) return;
    var coords = actorCoords || getActorCoordSet();
    var isHere = cell.col === state.muncher.col && cell.row === state.muncher.row;
    var hasActor = !cell.empty && coords.has(cell.col + ',' + cell.row);

    var textStr = cell.empty ? '' : String(cell.display || '');
    var len = textStr.length;

    btn.classList.toggle('is-empty', Boolean(cell.empty));
    btn.classList.toggle('is-muncher-here', isHere);
    btn.classList.toggle('has-actor', hasActor);
    btn.classList.toggle('is-long-text', !cell.empty && len >= 7 && len < 11);
    btn.classList.toggle('is-very-long-text', !cell.empty && len >= 11);
    btn.classList.toggle('is-xray-valid', Boolean(xrayActive && !cell.empty && cell.isValid));
    btn.setAttribute('tabindex', isHere ? '0' : '-1');

    var label = cell.empty ? 'Empty square' : textStr;
    if (cell.powerUp) label += ' with ' + cell.powerUp.kind + ' item';
    btn.setAttribute('aria-label', label);

    var textHtml = cell.empty ? '' : '<span class="cell-text">' + escapeHTML(textStr) + '</span>';
    var puHtml = cell.powerUp ? '<span class="cell-powerup">' + NM.Sprites.renderPowerUp(cell.powerUp.kind) + '</span>' : '';
    btn.innerHTML = textHtml + puHtml;
  }

  function refreshAllCells() {
    var xrayActive = Date.now() < state.xrayUntil;
    var actorCoords = getActorCoordSet();
    for (var i = 0; i < state.board.length; i++) {
      updateCellElement(els.boardGrid.children[i], state.board[i], xrayActive, actorCoords);
    }
  }

  function renderMuncherSprite() {
    var now = Date.now();
    var isSuper = now < state.pepperUntil;
    var expr = isSuper && state.muncher.expr === 'idle' ? 'super' : state.muncher.expr;
    var cell = getCell(state.muncher.col, state.muncher.row);
    var withNum = Boolean(cell && !cell.empty);

    els.muncherActor.innerHTML = NM.Sprites.renderMuncher(expr, state.muncher.frame);
    els.muncherActor.classList.toggle('is-invuln', now < state.invulnUntil);
    els.muncherActor.classList.toggle('is-with-number', withNum);
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
      var cell = getCell(t.col, t.row);
      el.classList.toggle('is-with-number', Boolean(cell && !cell.empty));

      var stateKey = t.type + ':' + trogState + ':' + (t.frame ? 1 : 0);
      if (el.dataset.renderedState !== stateKey) {
        el.innerHTML = NM.Sprites.renderTroggle(t.type, trogState, t.frame);
        el.dataset.renderedState = stateKey;
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
    els.ruleBanner.textContent = state.rule.bannerText;
    els.hudScore.textContent = String(state.score);
    els.hudStreak.textContent = 'x' + getStreakMultiplier();

    var livesCount = Math.max(0, state.lives);
    var shown = Math.min(5, livesCount);
    var html = '';
    for (var i = 0; i < shown; i++) {
      html += '<span class="life-icon" aria-hidden="true">' + NM.Sprites.renderMuncher('idle', 0) + '</span>';
    }
    if (livesCount > 5) {
      html += '<span class="life-extra">+' + (livesCount - 5) + '</span>';
    }
    if (livesCount === 0) {
      html = '<span class="life-extra" style="color:var(--txt-danger);">LAST MUNCHER</span>';
    }
    els.hudLives.innerHTML = html;
    els.hudLives.setAttribute('aria-label', livesCount + ' spare Munchers remaining');
  }

  function updatePowerUpMeter() {
    var now = Date.now();
    var isSuperActive = now < state.pepperUntil;
    if (!options.deluxeExtras && !isSuperActive) {
      els.powerupMeter.hidden = true;
      return;
    }
    var active = null;
    if (isSuperActive) {
      var superTotal = state.selectedDisk === 'super' && !options.deluxeExtras ? 6500 : 6000;
      active = { label: 'SUPER MUNCHER!', remaining: state.pepperUntil - now, total: superTotal };
    } else if (now < state.freezeUntil) {
      active = { label: 'TROGGLE FREEZE', remaining: state.freezeUntil - now, total: 6000 };
    } else if (now < state.xrayUntil) {
      active = { label: 'RADAR LENS', remaining: state.xrayUntil - now, total: 4500 };
    }

    if (active) {
      els.powerupMeter.hidden = false;
      els.powerupMeterText.textContent = active.label + ' ' + (active.remaining / 1000).toFixed(1) + 's';
      els.powerupMeterFill.style.transform = 'scaleX(' + Math.max(0, Math.min(1, active.remaining / active.total)) + ')';
    } else {
      els.powerupMeter.hidden = true;
    }
  }

  function showScreen(screen) {
    var isTitle = screen === 'title';
    els.titleScreen.hidden = !isTitle;
    els.gameStage.hidden = isTitle;
    els.pauseBtn.hidden = isTitle;
    if (isTitle) {
      renderMenuFocus();
    }
  }

  function startNewGame(mode) {
    NM.Cutscenes.cancel();
    clearTimers();
    state.selectedMode = mode || state.selectedMode || 'multiples';
    state.lives = 3;
    state.score = 0;
    state.streak = 0;
    state.superCharge = 0;
    state.nextExtraLifeScore = options.deluxeExtras ? 2000 : 1000;
    state.attempts = 0;
    state.correctHits = 0;
    state.invulnUntil = 0;
    state.freezeUntil = 0;
    state.pepperUntil = 0;
    state.xrayUntil = 0;
    state.pausedByModal = false;
    state.pausedByBackground = false;
    showScreen('game');
    startLevel(1);
  }

  function startLevel(level) {
    clearTimers();
    state.phase = 'playing';
    state.rule = createRuleForSelection(state.selectedDisk, state.selectedMode, level, options.difficulty);
    state.board = generateBoardForRule(state.rule);
    state.muncher = { col: 2, row: 2, expr: 'idle', frame: 0, chompTimer: null };
    state.munchedThisLevel = 0;
    state.troggles = [];
    state.pendingWarning = null;
    state.freezeUntil = 0;
    state.pepperUntil = 0;
    state.xrayUntil = 0;
    state.invulnUntil = Date.now() + 1200;
    state.nextPowerUpAt = Date.now() + 8500 + Math.floor(Math.random() * 5000);

    els.pauseVeil.hidden = true;
    els.levelClearVeil.hidden = true;
    els.oopsOverlay.hidden = true;
    els.theaterOverlay.hidden = true;
    els.pauseLabel.textContent = ':Pause';

    NM.Audio.playLevelStart();
    renderBoardDOM();
    renderMuncherSprite();
    renderTroggles();
    renderEdgeWarnings();
    renderHUD();
    updatePowerUpMeter();
    setStatus('neutral', 'LVL ' + level, state.rule.subHint);

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

    for (var i = 0; i < state.board.length; i++) {
      var cell = state.board[i];
      if (cell.powerUp && now >= cell.powerUp.expiresAt) {
        cell.powerUp = null;
        needsBoardRefresh = true;
      }
    }

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
      setStatus('good', 'FREEZE', 'All Troggles frozen for 6 seconds!');
      spawnPopup(cell.col, cell.row, 'FREEZE!', false);
    } else if (kind === 'pepper') {
      state.pepperUntil = now + 6000;
      renderMuncherSprite();
      renderTroggles();
      setStatus('good', 'PEPPER', 'Super Muncher active - chomp Troggles!');
      spawnPopup(cell.col, cell.row, 'SUPER!', false);
    } else if (kind === 'xray') {
      state.xrayUntil = now + 4500;
      refreshAllCells();
      setStatus('good', 'RADAR', 'Corner indicators reveal valid numbers!');
      spawnPopup(cell.col, cell.row, 'RADAR!', false);
    } else {
      addScore(150, cell.col, cell.row);
      renderHUD();
      setStatus('good', 'BONUS', 'Bonus Star collected (+150 points)!');
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

    state.muncher.col = nextCol;
    state.muncher.row = nextRow;
    state.muncher.frame = state.muncher.frame ? 0 : 1;

    NM.Audio.playHop(state.muncher.frame);
    refreshAllCells();
    renderMuncherSprite();
    syncActorToCell(els.muncherActor, nextCol, nextRow);

    collectPowerUpIfPresent(getCell(nextCol, nextRow));
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
      if (state.phase === 'playing') renderMuncherSprite();
    }, ms || 200);
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
      var basePts = options.deluxeExtras ? (25 * state.rule.level) : (5 * state.rule.level);
      var pts = basePts * mult;
      addScore(pts, cell.col, cell.row);

      NM.Audio.playMunchCorrect();
      setTempExpression('chomp', 180);
      spawnPopup(cell.col, cell.row, '+' + pts, false);
      refreshAllCells();
      renderMuncherSprite();

      if (cellEl) {
        cellEl.classList.add('flash-good');
        root.setTimeout(function () { cellEl.classList.remove('flash-good'); }, 220);
      }

      if (state.selectedDisk === 'super') {
        state.superCharge += 1;
        if (state.superCharge >= 10) {
          state.superCharge = 0;
          state.pepperUntil = Date.now() + 6500;
          NM.Audio.playPowerUp();
          renderTroggles();
          updatePowerUpMeter();
          setStatus('good', 'SUPER!', 'Super Muncher power unlocked - eat Troggles!');
        } else {
          setStatus('good', 'YUM!', 'Good munch! +' + pts + ' pts (' + state.superCharge + '/10 to Super)');
        }
      } else {
        setStatus('good', 'YUM!', 'Good munch! +' + pts + ' points.');
      }

      renderMuncherSprite();
      renderHUD();

      if (countRemainingValid() === 0) {
        handleLevelClear();
      }
    } else {
      cell.empty = true;
      state.streak = 0;
      state.superCharge = 0;
      state.lives -= 1;

      NM.Audio.playMunchWrong();
      refreshAllCells();
      if (cellEl) {
        cellEl.classList.add('flash-bad');
        root.setTimeout(function () { cellEl.classList.remove('flash-bad'); }, 260);
      }

      var reason = options.showHints
        ? explainMistakeForRule(state.rule, cell)
        : (cell.display + ' does not match ' + state.rule.bannerText + '.');

      renderHUD();
      enterOopsPrompt(
        NM.Sprites.renderMuncher('oops', 0),
        'Belch! ' + reason,
        'Wrong munches drained all Munchers!'
      );
    }
  }

  function enterOopsPrompt(spriteHtml, message, gameOverReason) {
    clearTimers();
    state.phase = 'oops_prompt';
    state.oopsOpenedAt = Date.now();
    state.oopsGameOverReason = gameOverReason || 'Game Over!';

    state.muncher.expr = 'oops';
    renderMuncherSprite();

    els.oopsActorSprite.innerHTML = spriteHtml;
    els.oopsMessage.textContent = message;
    els.oopsOverlay.hidden = false;
    setStatus('error', 'OOPS!', message);

    root.requestAnimationFrame(function () {
      try {
        els.oopsContinueBtn.focus();
      } catch (_) {}
    });
  }

  function dismissOopsPrompt() {
    if (state.phase !== 'oops_prompt') return;
    if (Date.now() - state.oopsOpenedAt < 320) return;

    els.oopsOverlay.hidden = true;
    NM.Audio.playMenuSelect();

    if (state.lives < 0) {
      triggerGameOver(state.oopsGameOverReason);
      return;
    }

    // Safe respawn: clear any Troggle on or adjacent to Muncher
    state.troggles = state.troggles.filter(function (t) {
      var dist = Math.abs(t.col - state.muncher.col) + Math.abs(t.row - state.muncher.row);
      return dist > 1;
    });
    state.muncher.expr = 'idle';
    state.invulnUntil = Date.now() + 1600;
    state.phase = 'playing';

    refreshAllCells();
    renderMuncherSprite();
    renderTroggles();
    renderEdgeWarnings();
    renderHUD();
    setStatus('neutral', 'LVL ' + state.rule.level, state.rule.subHint);
    startGameLoops();
  }

  function handleLevelClear() {
    clearTimers();
    state.phase = 'transition';
    var clearedLvl = state.rule.level;
    var bonus = (options.deluxeExtras ? 100 : 50) * clearedLvl;
    addScore(bonus);
    renderHUD();

    NM.Audio.playLevelClear();
    els.levelClearTitle.textContent = 'LEVEL ' + clearedLvl + ' CLEAR!';
    els.levelClearBonus.textContent = 'Bonus: ' + bonus + ' points';
    els.levelClearVeil.hidden = false;
    setStatus('good', 'CLEAR!', 'Level ' + clearedLvl + ' cleared! Bonus +' + bonus + ' pts.');

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
    els.gameOverReason.textContent = reason || 'All Munchers are gone!';
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

    var survivors = [];
    for (var i = 0; i < state.troggles.length; i++) {
      var t = state.troggles[i];
      var nextPos = computeTroggleStep(t, isPepper);
      if (!nextPos) continue;

      t.col = nextPos.col;
      t.row = nextPos.row;
      t.dCol = nextPos.dCol;
      t.dRow = nextPos.dRow;
      t.steps += 1;
      t.frame = t.frame ? 0 : 1;

      applyTroggleTileAction(t);
      if (state.phase !== 'playing') return;

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
        steps: 0,
        frame: 0
      };
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
      if (state.troggles.length === 0 || Math.random() < 0.6) {
        queueTroggleWarning();
      }
    }

    refreshAllCells();
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

    if (t.type === 'helper' && !cell.empty && Math.random() < 0.45) {
      cell.empty = true;
      cell.isValid = false;
      cell.display = '';
      renderHUD();

      if (countRemainingValid() === 0) {
        if (state.munchedThisLevel >= 1) {
          handleLevelClear();
        } else {
          var emptyCells = state.board.filter(function (c) {
            return c.empty && !(c.col === state.muncher.col && c.row === state.muncher.row);
          });
          if (emptyCells.length > 0) {
            var targetCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            var rep = generateSingleCellForRule(state.rule, 1.0);
            targetCell.display = rep.display;
            targetCell.num = rep.num;
            targetCell.den = rep.den;
            targetCell.numericValue = rep.numericValue;
            targetCell.isValid = rep.isValid;
            targetCell.explainWhy = rep.explainWhy || '';
            targetCell.empty = false;
            renderHUD();
          }
        }
      }
    } else if (t.type === 'worker' && Math.random() < 0.45) {
      var fresh = generateSingleCellForRule(state.rule, 0.38);
      cell.display = fresh.display;
      cell.num = fresh.num;
      cell.den = fresh.den;
      cell.numericValue = fresh.numericValue;
      cell.isValid = fresh.isValid;
      cell.explainWhy = fresh.explainWhy || '';
      cell.empty = false;
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
          setStatus('good', 'CHOMP!', 'Super Muncher ate a Troggle for +100 pts!');
          renderTroggles();
          renderHUD();
        } else if (now >= state.invulnUntil) {
          var eaterType = t.type;
          state.troggles.splice(i, 1);
          state.lives -= 1;
          state.streak = 0;
          state.superCharge = 0;

          NM.Audio.playTroggleEat();
          renderTroggles();
          renderHUD();

          var trogLabel = TROGGLE_NAMES[eaterType] || 'a Troggle';
          enterOopsPrompt(
            NM.Sprites.renderTroggle(eaterType, 'normal', 0),
            'Yikes! You were eaten by ' + trogLabel + '!',
            'You were eaten by ' + trogLabel + '!'
          );
          return;
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
        state.autoWalkTimer = root.setTimeout(step, 90);
      } else {
        stopAutoWalk();
      }
    }

    step();
  }

  /* ======================== PAUSE, VISIBILITY & MODALS ======================== */

  function pauseGame(byModal, byBackground) {
    if (state.phase !== 'playing') return;
    clearTimers();
    state.phase = 'paused';
    state.pausedByModal = Boolean(byModal);
    state.pausedByBackground = Boolean(byBackground);
    els.pauseLabel.textContent = ':Resume';
    els.pauseRuleReminder.textContent = state.rule ? state.rule.bannerText : 'Paused';
    els.pauseVeil.hidden = Boolean(byModal || byBackground);
  }

  function resumeGame() {
    if (state.phase !== 'paused') return;
    state.phase = 'playing';
    state.pausedByModal = false;
    state.pausedByBackground = false;
    els.pauseVeil.hidden = true;
    els.pauseLabel.textContent = ':Pause';
    startGameLoops();
  }

  function returnToMainMenu() {
    NM.Cutscenes.cancel();
    clearTimers();
    state.phase = 'title';
    setMenuScreen('main');
    showScreen('title');
  }

  function openModal(dialogEl, onOpen) {
    if (state.phase === 'playing') {
      pauseGame(true, false);
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
        state.selectedDisk,
        state.selectedMode,
        state.rule ? state.rule.level : 1,
        state.score
      );

      if (choice === 'again') {
        startNewGame(state.selectedMode);
      } else {
        returnToMainMenu();
      }
    });
  }

  function setupBackgroundEfficiency() {
    // Direct listener on content-visibility: auto element (event does not bubble in all engines)
    if (els.cabinet) {
      els.cabinet.addEventListener('contentvisibilityautostatechange', function (e) {
        if (e.skipped) {
          if (state.phase === 'playing') pauseGame(false, true);
        } else if (state.phase === 'paused' && state.pausedByBackground) {
          resumeGame();
        }
      });

      if (!('contentVisibility' in document.documentElement.style) && typeof IntersectionObserver === 'function') {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              if (state.phase === 'playing') pauseGame(false, true);
            } else if (state.phase === 'paused' && state.pausedByBackground) {
              resumeGame();
            }
          });
        }, { rootMargin: '120px' });
        io.observe(els.cabinet);
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && state.phase === 'playing') {
        pauseGame(false, false);
      }
    });
  }

  /* ======================== EVENT WIRING ======================== */

  function bindMenuEvents(box, menuKind) {
    box.addEventListener('click', function (e) {
      var item = e.target.closest('.retro-menu-item');
      if (!item) return;
      var items = getMenuItems(menuKind);
      var idx = items.indexOf(item);
      if (idx !== -1) {
        if (menuKind === 'mode') state.modeMenuIndex = idx;
        else if (menuKind === 'disk') state.diskMenuIndex = idx;
        else state.mainMenuIndex = idx;
        renderMenuFocus();
      }
      activateMenuItem(item);
    });

    box.addEventListener('mouseover', function (e) {
      var item = e.target.closest('.retro-menu-item');
      if (!item) return;
      var items = getMenuItems(menuKind);
      var idx = items.indexOf(item);
      if (idx !== -1) {
        if (menuKind === 'mode') state.modeMenuIndex = idx;
        else if (menuKind === 'disk') state.diskMenuIndex = idx;
        else state.mainMenuIndex = idx;
        renderMenuFocus();
      }
    });
  }

  function bindEvents() {
    bindMenuEvents(els.mainMenuBox, 'main');
    bindMenuEvents(els.modeMenuBox, 'mode');
    bindMenuEvents(els.diskMenuBox, 'disk');

    els.diskStrip.addEventListener('change', function (e) {
      var input = e.target;
      if (input && input.name === 'activeDisk' && input.checked) {
        NM.Audio.playMenuSelect();
        selectDisk(input.value, false);
      }
    });

    els.diskBtn.addEventListener('click', function () {
      NM.Audio.playMenuSelect();
      if (state.phase !== 'title') {
        returnToMainMenu();
      }
      setMenuScreen(state.menuScreen === 'disk' ? 'main' : 'disk');
    });

    els.homeBtn.addEventListener('click', function () {
      NM.Audio.playMenuSelect();
      returnToMainMenu();
    });

    els.pauseBtn.addEventListener('click', function () {
      if (state.phase === 'playing') pauseGame(false, false);
      else if (state.phase === 'paused') resumeGame();
    });

    els.resumeBtn.addEventListener('click', resumeGame);
    els.quitToMenuBtn.addEventListener('click', returnToMainMenu);
    els.oopsContinueBtn.addEventListener('click', dismissOopsPrompt);

    els.muteBtn.addEventListener('click', function () {
      NM.Audio.toggleMute();
      updateMuteButtonUI();
    });

    els.fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenUI);

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

    els.optMonitor.addEventListener('change', function () {
      options.monitor = els.optMonitor.value;
      saveOptions();
      syncOptionsUI();
    });
    els.optDifficulty.addEventListener('change', function () {
      options.difficulty = els.optDifficulty.value;
      saveOptions();
      syncOptionsUI();
    });
    els.optCrt.addEventListener('change', function () {
      options.crtEnabled = els.optCrt.checked;
      saveOptions();
      syncOptionsUI();
    });
    els.optHints.addEventListener('change', function () {
      options.showHints = els.optHints.checked;
      saveOptions();
    });
    els.optDeluxe.addEventListener('change', function () {
      options.deluxeExtras = els.optDeluxe.checked;
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

    els.boardGrid.addEventListener('click', function (e) {
      var cellBtn = e.target.closest('.board-cell');
      if (!cellBtn || state.phase !== 'playing') return;
      var col = Number(cellBtn.dataset.col);
      var row = Number(cellBtn.dataset.row);
      startAutoWalk(col, row);
    });

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
      } else if (state.phase === 'oops_prompt') {
        dismissOopsPrompt();
      }
    });

    root.addEventListener('keydown', function (e) {
      if (document.querySelector('dialog[open]')) return;
      var target = e.composedPath ? e.composedPath()[0] : e.target;
      if (target && target.matches && target.matches(':read-write, select, input, textarea')) {
        return;
      }

      // DOS Function keys
      if (e.key === 'F1') {
        e.preventDefault();
        openModal(els.guideDialog);
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        openModal(els.optionsDialog, syncOptionsUI);
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        openModal(els.hallOfFameDialog, renderHallOfFame);
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        NM.Audio.playMenuSelect();
        if (state.phase !== 'title') {
          returnToMainMenu();
        }
        setMenuScreen(state.menuScreen === 'disk' ? 'main' : 'disk');
        return;
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'm' || e.key === 'M') {
          NM.Audio.toggleMute();
          updateMuteButtonUI();
          return;
        }
        if (e.key === 'f' || e.key === 'F') {
          toggleFullscreen();
          return;
        }
        if (e.key === 'p' || e.key === 'P') {
          if (state.phase === 'playing') pauseGame(false, false);
          else if (state.phase === 'paused') resumeGame();
          return;
        }
      }

      if (e.key === 'Escape') {
        if (state.phase === 'title' && (state.menuScreen === 'mode' || state.menuScreen === 'disk')) {
          e.preventDefault();
          NM.Audio.playMenuMove();
          setMenuScreen('main');
          return;
        }
        if (state.phase !== 'title' && state.phase !== 'cutscene') {
          e.preventDefault();
          returnToMainMenu();
          return;
        }
      }

      if (state.phase === 'oops_prompt') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          dismissOopsPrompt();
        }
        return;
      }

      if (state.phase === 'title') {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          e.preventDefault();
          moveMenuCursor(-1);
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          e.preventDefault();
          moveMenuCursor(1);
        } else if (e.key === 'Enter' || e.key === ' ') {
          // Avoid double-triggering if native focused button also gets click on Space/Enter
          if (target && target.classList && target.classList.contains('retro-menu-item')) {
            return;
          }
          if (target && target.closest && target.closest('button')) return;
          e.preventDefault();
          var items = getMenuItems(state.menuScreen);
          var idx = state.mainMenuIndex;
          if (state.menuScreen === 'mode') idx = state.modeMenuIndex;
          else if (state.menuScreen === 'disk') idx = state.diskMenuIndex;
          activateMenuItem(items[idx]);
        }
        return;
      }

      if (state.phase !== 'playing') return;

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

    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(function () {
        if (state.phase === 'playing' || state.phase === 'paused' || state.phase === 'oops_prompt' || state.phase === 'transition') {
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

    var mascots = NM.Sprites.renderTitleBannerMascots();
    els.heroMascot.innerHTML = mascots.muncherHtml;
    els.heroTroggle.innerHTML = mascots.reggieHtml;

    syncOptionsUI();
    setupDialogs();
    setupBackgroundEfficiency();
    bindEvents();
    selectDisk(options.lastDisk || 'number', false);
    setMenuScreen('main');
    showScreen('title');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  var api = {
    startNewGame: startNewGame,
    getState: function () { return state; },
    getDefaultOptions: function () { return Object.assign({}, options); },
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

  NM.Game = api;
})(typeof window !== 'undefined' ? window : globalThis);
