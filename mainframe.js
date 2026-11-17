/* ==========================================================================
   CHAZFAB MAINFRAME // Interactive Shell, Mobile Drawer, Command Bar & SFX
   Zero dependencies — works offline & across all desktop/tablet/mobile browsers.
   ========================================================================== */

(function () {
  'use strict';

  const ROOT = document.body.dataset.rootPrefix || './';
  const crt = document.getElementById('crtMonitor');
  const gridDrive = document.getElementById('gridDrive');
  const scanlines = document.getElementById('scanlinesToggle');
  const sfxToggle = document.getElementById('sfxToggle');

  /* ------------------------------------------------------------------------
     1. OPTIONAL WEB AUDIO 8-BIT CLICK BLIPS (Muted by default)
     ------------------------------------------------------------------------ */
  let audioCtx = null;
  let sfxEnabled = false;

  try {
    sfxEnabled = localStorage.getItem('chazfab_sfx') === '1';
  } catch (_) {}

  function playBlip(freq = 660, duration = 0.05) {
    if (!sfxEnabled) return;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      audioCtx = audioCtx || new AudioCtor();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, audioCtx.currentTime + duration);
      gain.gain.setValueAtTime(0.045, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (_) {}
  }

  /* ------------------------------------------------------------------------
     2. PERSISTED BEZEL DISPLAY TOGGLES + :has() CSS FALLBACK
     ------------------------------------------------------------------------ */
  function applyCrtClasses() {
    if (!crt) return;
    if (gridDrive) crt.classList.toggle('has-grid-drive', gridDrive.checked);
    if (scanlines) crt.classList.toggle('no-scanlines', !scanlines.checked);
  }

  try {
    if (gridDrive && localStorage.getItem('chazfab_grid') === '1') {
      gridDrive.checked = true;
    }
    if (scanlines && localStorage.getItem('chazfab_scanlines') === '0') {
      scanlines.checked = false;
    }
    if (sfxToggle) {
      sfxToggle.checked = sfxEnabled;
    }
  } catch (_) {}

  applyCrtClasses();

  if (gridDrive) {
    gridDrive.addEventListener('change', () => {
      try { localStorage.setItem('chazfab_grid', gridDrive.checked ? '1' : '0'); } catch (_) {}
      applyCrtClasses();
      playBlip(gridDrive.checked ? 760 : 440);
    });
  }

  if (scanlines) {
    scanlines.addEventListener('change', () => {
      try { localStorage.setItem('chazfab_scanlines', scanlines.checked ? '1' : '0'); } catch (_) {}
      applyCrtClasses();
      playBlip(scanlines.checked ? 680 : 420);
    });
  }

  if (sfxToggle) {
    sfxToggle.addEventListener('change', () => {
      sfxEnabled = sfxToggle.checked;
      try { localStorage.setItem('chazfab_sfx', sfxEnabled ? '1' : '0'); } catch (_) {}
      if (sfxEnabled) playBlip(880, 0.06);
    });
  }

  /* ------------------------------------------------------------------------
     3. MOBILE <DIALOG> SWIPE NAVIGATION DRAWER (navigation-drawer guide)
     ------------------------------------------------------------------------ */
  const drawer = document.getElementById('mobileDrawer');
  const openBtn = document.getElementById('drawerOpenBtn');
  const closeBtn = document.getElementById('drawerCloseBtn');

  if (drawer && openBtn && closeBtn) {
    const scroller = drawer.querySelector('.Drawer-scroller');
    const sheet = drawer.querySelector('.Drawer-sheet');
    let hasEnteredViewport = false;

    async function openDrawer() {
      playBlip(720);
      hasEnteredViewport = false;
      drawer.showModal();

      if (!CSS.supports('scroll-initial-target', 'nearest')) {
        scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'instant' });
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      }

      scroller.scrollTo({ left: 0, behavior: 'auto' });
    }

    function closeDrawer() {
      playBlip(460);
      scroller.scrollTo({ left: scroller.offsetWidth, behavior: 'auto' });
    }

    function onDrawerOpened() {
      openBtn.setAttribute('aria-expanded', 'true');
    }

    function onDrawerClosed() {
      if (drawer.open) drawer.close();
      hasEnteredViewport = false;
      openBtn.setAttribute('aria-expanded', 'false');
    }

    const visibleThreshold = 1 / Math.max(window.innerWidth, 320);
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries.at(-1);
        if (!entry) return;
        if (entry.intersectionRatio >= visibleThreshold) {
          hasEnteredViewport = true;
        }
        if (hasEnteredViewport && entry.intersectionRatio < visibleThreshold) {
          onDrawerClosed();
        }
        if (entry.intersectionRatio === 1) {
          onDrawerOpened();
        }
      },
      { root: drawer, threshold: [visibleThreshold, 1] }
    );
    observer.observe(sheet);

    if (!CSS.supports('animation-timeline: scroll()')) {
      scroller.addEventListener('scroll', () => {
        const ratio = Math.max(0, Math.min(1, 1 - scroller.scrollLeft / Math.max(sheet.offsetWidth, 1)));
        drawer.style.setProperty('--drawer-backdrop', String(ratio));
      });
    }

    openBtn.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);

    drawer.addEventListener('click', (event) => {
      if (!sheet.contains(event.target)) {
        closeDrawer();
      }
    });

    drawer.addEventListener('cancel', (event) => {
      if (event.cancelable) {
        event.preventDefault();
        closeDrawer();
      }
    });

    window.matchMedia('(min-width: 640px)').addEventListener('change', (mq) => {
      if (mq.matches && drawer.open) {
        onDrawerClosed();
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. INTERACTIVE C:\CHAZFAB> COMMAND PROMPT & SHORTCUT CHIPS
     ------------------------------------------------------------------------ */
  const cmdForm = document.getElementById('terminalForm');
  const cmdInput = document.getElementById('terminalInput');
  const cmdOutput = document.getElementById('terminalOutput');
  const cmdChips = document.querySelectorAll('.cmd-chip');

  const ROUTES = {
    home: 'index.html',
    mainframe: 'index.html',
    index: 'index.html',
    games: 'games.html',
    game: 'games.html',
    munchers: 'viewer.html?app=labs/number-munchers/index.html',
    climb: 'projects/climb-the-food-chain.html',
    cad: 'cad.html',
    '3d': 'cad.html',
    scanner: 'projects/3d-scanner.html',
    mesh: 'meshtastic.html',
    meshtastic: 'meshtastic.html',
    labs: 'labs.html',
    lab: 'labs.html',
    coach: 'viewer.html?app=labs/shot-couch-coach.html',
    tron: 'viewer.html?app=labs/tron-grid-test.html',
    sysop: 'sysop.html',
    about: 'sysop.html'
  };

  const EXTERNAL_UPLINKS = {
    github: 'https://github.com/chazfab',
    x: 'https://x.com/chazfabofficial',
    twitter: 'https://x.com/chazfabofficial',
    reddit: 'https://www.reddit.com/user/chazfab/',
    instagram: 'https://www.instagram.com/chazfabofficial/',
    ig: 'https://www.instagram.com/chazfabofficial/',
    tiktok: 'https://www.tiktok.com/@chazfabofficial',
    youtube: 'https://www.youtube.com/@chazfab',
    yt: 'https://www.youtube.com/@chazfab'
  };

  function runCommand(raw) {
    const cmd = (raw || '').trim().toLowerCase();
    if (!cmd) return;

    playBlip(660, 0.05);

    if (cmd === 'help' || cmd === '?') {
      if (cmdOutput) {
        cmdOutput.textContent =
          'COMMANDS: home | games | munchers | climb | cad | scanner | mesh | labs | coach | tron | sysop | socials | github | x | reddit | grid | scanlines | sfx | clear';
      }
      return;
    }

    if (cmd === 'socials' || cmd === 'links' || cmd === 'contact' || cmd === 'email') {
      if (cmdOutput) {
        cmdOutput.textContent =
          'UPLINKS: github.com/chazfab | x.com/chazfabofficial | reddit.com/u/chazfab | instagram.com/chazfabofficial | tiktok.com/@chazfabofficial | youtube.com/@chazfab | hello@chazfab.com';
      }
      return;
    }

    if (cmd === 'dir' || cmd === 'ls') {
      if (cmdOutput) {
        cmdOutput.textContent =
          'DIR C:\\CHAZFAB\\ -> MAINFRAME.EXE  GAME_STUDIO.EXE  3D_CAD.EXE  MESHTASTIC.EXE  HTML_LABS\\  SYSOP.TXT';
      }
      return;
    }

    if (cmd === 'clear' || cmd === 'cls') {
      if (cmdOutput) cmdOutput.textContent = '';
      return;
    }

    if (cmd === 'grid' && gridDrive) {
      gridDrive.checked = !gridDrive.checked;
      gridDrive.dispatchEvent(new Event('change'));
      if (cmdOutput) cmdOutput.textContent = `GRID DRIVE => ${gridDrive.checked ? 'ON' : 'OFF'}`;
      return;
    }

    if (cmd === 'scanlines' && scanlines) {
      scanlines.checked = !scanlines.checked;
      scanlines.dispatchEvent(new Event('change'));
      if (cmdOutput) cmdOutput.textContent = `SCANLINES => ${scanlines.checked ? 'ON' : 'OFF'}`;
      return;
    }

    if (cmd === 'sfx' && sfxToggle) {
      sfxToggle.checked = !sfxToggle.checked;
      sfxToggle.dispatchEvent(new Event('change'));
      if (cmdOutput) cmdOutput.textContent = `SFX BLIPS => ${sfxToggle.checked ? 'ON' : 'OFF'}`;
      return;
    }

    if (Object.hasOwn(EXTERNAL_UPLINKS, cmd)) {
      if (cmdOutput) cmdOutput.textContent = `OPENING ${EXTERNAL_UPLINKS[cmd]} ...`;
      window.open(EXTERNAL_UPLINKS[cmd], '_blank', 'noopener,noreferrer');
      return;
    }

    if (Object.hasOwn(ROUTES, cmd)) {
      if (cmdOutput) cmdOutput.textContent = `LAUNCHING ${ROUTES[cmd]} ...`;
      window.location.href = ROOT + ROUTES[cmd];
      return;
    }

    if (cmdOutput) {
      cmdOutput.textContent = `UNKNOWN COMMAND "${cmd}". TYPE "help" FOR LIST.`;
    }
  }

  if (cmdForm && cmdInput) {
    cmdForm.addEventListener('submit', (e) => {
      e.preventDefault();
      runCommand(cmdInput.value);
      cmdInput.value = '';
    });
  }

  cmdChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd || '';
      if (cmdInput) cmdInput.value = cmd;
      runCommand(cmd);
      if (cmdInput) cmdInput.value = '';
    });
  });

  document.querySelectorAll('.nav-tab, .btn-mainframe, .btn-raw, .btn-violet, .uplink-card, .uplink-pill').forEach((el) => {
    el.addEventListener('click', () => playBlip(740, 0.04));
  });
})();
