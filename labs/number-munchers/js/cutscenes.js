(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});

  var SKITS = [
    {
      id: 'track',
      title: 'Muncher Theater #1: Troggle Track & Field',
      caption: 'Reggie attempts the Division Hurdle... while Muncher takes gold!'
    },
    {
      id: 'pizzeria',
      title: 'Muncher Theater #2: Pizzeria Prime',
      caption: 'Smarty insists 9 is prime. Muncher serves a cheesy counterexample!'
    },
    {
      id: 'magnet',
      title: 'Muncher Theater #3: Magnet-Matic 3000',
      caption: 'Worker aims a Mega-Magnet at Muncher — classic cartoon physics ensue!'
    },
    {
      id: 'boogie',
      title: 'Muncher Theater #4: Computer Lab Boogie',
      caption: 'Muncher & Bashful hit the Apple II disco floor until Reggie trips!'
    }
  ];

  var activeCleanup = null;

  function prefersReducedMotion() {
    return Boolean(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function buildSkitHTML(skit, levelJustCleared) {
    var Sprites = NM.Sprites;
    var stageContent = '';

    if (skit.id === 'track') {
      stageContent =
        '<div class="skit-scene skit-scene--track">' +
          '<div class="skit-track-floor"></div>' +
          '<div class="skit-prop skit-hurdle" aria-hidden="true">' +
            '<span class="skit-hurdle-bar">\u00f7</span>' +
          '</div>' +
          '<div class="skit-actor skit-actor--reggie-run">' + Sprites.renderTroggle('reggie', 'normal') + '</div>' +
          '<div class="skit-actor skit-actor--muncher-cool">' +
            Sprites.renderMuncher('happy') +
            '<span class="skit-sign">[10.0]</span>' +
          '</div>' +
          '<div class="skit-bubble skit-bubble--track">BONK!</div>' +
        '</div>';
    } else if (skit.id === 'pizzeria') {
      stageContent =
        '<div class="skit-scene skit-scene--pizzeria">' +
          '<div class="skit-counter"></div>' +
          '<div class="skit-actor skit-actor--smarty">' +
            '<div class="skit-speech">"1 PRIME SLICE!"</div>' +
            Sprites.renderTroggle('smarty', 'normal') +
          '</div>' +
          '<div class="skit-prop skit-pizza" aria-hidden="true">9 = 3\u00d73!</div>' +
          '<div class="skit-actor skit-actor--chef-muncher">' + Sprites.renderMuncher('chomp') + '</div>' +
          '<div class="skit-bubble skit-bubble--splat">SPLAT!</div>' +
        '</div>';
    } else if (skit.id === 'magnet') {
      stageContent =
        '<div class="skit-scene skit-scene--magnet">' +
          '<div class="skit-actor skit-actor--worker-mag">' +
            Sprites.renderTroggle('worker', 'normal') +
            '<span class="skit-magnet-badge">MAGNET ON!</span>' +
          '</div>' +
          '<div class="skit-prop skit-anvil" aria-hidden="true">88 LB</div>' +
          '<div class="skit-actor skit-actor--muncher-duck">' + Sprites.renderMuncher('happy') + '</div>' +
          '<div class="skit-bubble skit-bubble--clonk">CLANG!</div>' +
        '</div>';
    } else {
      stageContent =
        '<div class="skit-scene skit-scene--boogie">' +
          '<div class="skit-mirrorball" aria-hidden="true"></div>' +
          '<div class="skit-actor skit-actor--disco-muncher">' + Sprites.renderMuncher('happy') + '</div>' +
          '<div class="skit-actor skit-actor--disco-bashful">' + Sprites.renderTroggle('bashful', 'normal') + '</div>' +
          '<div class="skit-actor skit-actor--disco-reggie">' + Sprites.renderTroggle('reggie', 'frightened') + '</div>' +
          '<div class="skit-bubble skit-bubble--nosignal">NO SIGNAL... JK! LEVEL UP!</div>' +
        '</div>';
    }

    return (
      '<div class="theater-card" role="region" aria-label="' + skit.title + '">' +
        '<div class="theater-header">' +
          '<span class="theater-badge">INTERMISSION \u2022 LEVEL ' + levelJustCleared + ' CLEAR!</span>' +
          '<h2 class="theater-title">' + skit.title + '</h2>' +
        '</div>' +
        '<div class="theater-stage' + (prefersReducedMotion() ? ' is-reduced' : '') + '">' +
          stageContent +
        '</div>' +
        '<div class="theater-footer">' +
          '<p class="theater-caption">' + skit.caption + '</p>' +
          '<button type="button" class="btn btn--accent" id="skipCutsceneBtn">Skip Skit (Space / Esc)</button>' +
        '</div>' +
      '</div>'
    );
  }

  function cancel() {
    if (typeof activeCleanup === 'function') {
      activeCleanup();
      activeCleanup = null;
    }
  }

  function play(containerEl, levelJustCleared, forcedSkitIndex) {
    cancel();

    var skitIndex = typeof forcedSkitIndex === 'number'
      ? forcedSkitIndex
      : (Math.max(0, Math.floor((levelJustCleared - 1) / 3)) % SKITS.length);
    var skit = SKITS[skitIndex % SKITS.length];

    return new Promise(function (resolve) {
      if (!containerEl) {
        resolve();
        return;
      }

      containerEl.hidden = false;
      containerEl.innerHTML = buildSkitHTML(skit, levelJustCleared);

      if (NM.Audio) {
        NM.Audio.startCutsceneTune(skitIndex);
      }

      var done = false;
      var durationMs = prefersReducedMotion() ? 4500 : 6500;
      var timer = null;

      function finish() {
        if (done) return;
        done = true;
        if (timer !== null) {
          root.clearTimeout(timer);
          timer = null;
        }
        root.removeEventListener('keydown', onKeyDown, true);
        if (NM.Audio) {
          NM.Audio.stopCutsceneTune();
        }
        containerEl.hidden = true;
        containerEl.innerHTML = '';
        activeCleanup = null;
        resolve();
      }

      function onKeyDown(e) {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          finish();
        }
      }

      var skipBtn = containerEl.querySelector('#skipCutsceneBtn');
      if (skipBtn) {
        skipBtn.addEventListener('click', finish);
        root.requestAnimationFrame(function () {
          try {
            skipBtn.focus();
          } catch (_) {}
        });
      }

      root.addEventListener('keydown', onKeyDown, true);
      timer = root.setTimeout(finish, durationMs);
      activeCleanup = finish;
    });
  }

  NM.Cutscenes = {
    play: play,
    cancel: cancel,
    SKITS: SKITS
  };
})(typeof window !== 'undefined' ? window : globalThis);
