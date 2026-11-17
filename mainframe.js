/* ==========================================================================
   CHAZFAB SYSOP // Interactive Terminal Shell, CRT Controls & SFX
   Zero dependencies — works offline & across all desktop/tablet/mobile browsers.
   ========================================================================== */

(function () {
  'use strict';

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
     3. INTERACTIVE C:\CHAZFAB> COMMAND PROMPT & SHORTCUT CHIPS
     ------------------------------------------------------------------------ */
  const cmdForm = document.getElementById('terminalForm');
  const cmdInput = document.getElementById('terminalInput');
  const cmdOutput = document.getElementById('terminalOutput');
  const cmdChips = document.querySelectorAll('.cmd-chip');

  const SECTION_TARGETS = {
    home: 'top',
    top: 'top',
    sysop: 'top',
    about: 'dossier',
    bio: 'dossier',
    dossier: 'dossier',
    uplinks: 'uplinks'
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

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function runCommand(raw) {
    const cmd = (raw || '').trim().toLowerCase();
    if (!cmd) return;

    playBlip(660, 0.05);

    if (cmd === 'help' || cmd === '?') {
      if (cmdOutput) {
        cmdOutput.textContent =
          'COMMANDS: home | dossier | bio | uplinks | socials | bench | github | x | reddit | instagram | tiktok | youtube | email | grid | scanlines | sfx | clear';
      }
      return;
    }

    if (cmd === 'socials' || cmd === 'links' || cmd === 'contact' || cmd === 'email') {
      if (cmdOutput) {
        cmdOutput.textContent =
          'UPLINKS: github.com/chazfab | x.com/chazfabofficial | reddit.com/u/chazfab | instagram.com/chazfabofficial | tiktok.com/@chazfabofficial | youtube.com/@chazfab | hello@chazfab.com';
      }
      scrollToSection('uplinks');
      return;
    }

    if (cmd === 'bench') {
      if (cmdOutput) {
        cmdOutput.textContent =
          'BENCH: Bambu Lab H2C (0.2 / 0.4 / 0.6mm) | ESP32 / LoRa / MeshCore / Meshtastic | Retro Arcade & Pure HTML/CSS';
      }
      scrollToSection('dossier');
      return;
    }

    if (cmd === 'dir' || cmd === 'ls') {
      if (cmdOutput) {
        cmdOutput.textContent =
          'DIR C:\\CHAZFAB\\ -> SYSOP.EXE  OPERATOR_BIO.TXT  COMMS_UPLINK.SYS  SYSOP_AVATAR.PNG';
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

    if (Object.hasOwn(SECTION_TARGETS, cmd)) {
      const target = SECTION_TARGETS[cmd];
      if (cmdOutput) {
        cmdOutput.textContent = target === 'dossier'
          ? 'CHAZ // CHAZFAB — Indie Games • 3D Printing CAD • Meshtastic Off-Grid • Raw .HTML Labs (hello@chazfab.com)'
          : `FOCUSING #${target.toUpperCase()} ...`;
      }
      scrollToSection(target);
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

  document.querySelectorAll('.nav-tab, .btn-mainframe, .btn-raw, .btn-violet, .uplink-card').forEach((el) => {
    el.addEventListener('click', () => playBlip(740, 0.04));
  });
})();
