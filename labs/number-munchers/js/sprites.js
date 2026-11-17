(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});

  function svgWrap(cls, viewBox, body) {
    return '<svg class="nm-svg ' + cls + '" viewBox="' + viewBox + '" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function renderMuncher(state) {
    var s = state || 'idle';
    var isSuper = s === 'super';
    var isChomp = s === 'chomp';
    var isHappy = s === 'happy';
    var isOops = s === 'oops';

    var bodyFill = isSuper ? '#ff7b00' : '#18d45a';
    var bellyFill = isSuper ? '#ffe066' : '#7ef5a2';
    var ridgeFill = isSuper ? '#ff2a55' : '#0b933a';

    var aura = isSuper
      ? '<circle cx="32" cy="34" r="29" fill="none" stroke="#ffe066" stroke-width="3" stroke-dasharray="6 4"/>'
      : '';

    // Dorsal ridges along top/back
    var ridges =
      '<polygon points="18,16 23,6 28,15" fill="' + ridgeFill + '" stroke="#072210" stroke-width="2"/>' +
      '<polygon points="27,14 32,4 37,14" fill="' + ridgeFill + '" stroke="#072210" stroke-width="2"/>' +
      '<polygon points="36,15 41,6 46,16" fill="' + ridgeFill + '" stroke="#072210" stroke-width="2"/>';

    // Feet
    var feet =
      '<rect x="16" y="51" width="11" height="7" rx="3" fill="' + ridgeFill + '" stroke="#072210" stroke-width="2.2"/>' +
      '<rect x="37" y="51" width="11" height="7" rx="3" fill="' + ridgeFill + '" stroke="#072210" stroke-width="2.2"/>';

    // Rounded pixel-bevel head/body
    var torso =
      '<rect x="10" y="13" width="44" height="40" rx="14" fill="' + bodyFill + '" stroke="#072210" stroke-width="2.6"/>' +
      '<rect x="17" y="37" width="30" height="12" rx="6" fill="' + bellyFill + '" opacity="0.65"/>';

    // Eyes
    var eyes = '';
    if (isOops) {
      eyes =
        '<circle cx="23" cy="24" r="6" fill="#fff" stroke="#072210" stroke-width="2"/>' +
        '<path d="M20,21 L26,27 M26,21 L20,27" stroke="#c81e3a" stroke-width="2.2" stroke-linecap="round"/>' +
        '<circle cx="41" cy="24" r="6" fill="#fff" stroke="#072210" stroke-width="2"/>' +
        '<path d="M38,21 L44,27 M44,21 L38,27" stroke="#c81e3a" stroke-width="2.2" stroke-linecap="round"/>';
    } else if (isHappy) {
      eyes =
        '<path d="M18,25 Q23,18 28,25" fill="none" stroke="#072210" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M36,25 Q41,18 46,25" fill="none" stroke="#072210" stroke-width="3" stroke-linecap="round"/>';
    } else {
      var brow = isSuper
        ? '<path d="M16,18 L28,21 M48,18 L36,21" stroke="#072210" stroke-width="2.6" stroke-linecap="round"/>'
        : '';
      eyes =
        '<circle cx="23" cy="24" r="6.2" fill="#ffffff" stroke="#072210" stroke-width="2.2"/>' +
        '<circle cx="24.5" cy="24" r="2.7" fill="#07111a"/>' +
        '<circle cx="25.5" cy="22.8" r="1" fill="#ffffff"/>' +
        '<circle cx="41" cy="24" r="6.2" fill="#ffffff" stroke="#072210" stroke-width="2.2"/>' +
        '<circle cx="42.5" cy="24" r="2.7" fill="#07111a"/>' +
        '<circle cx="43.5" cy="22.8" r="1" fill="#ffffff"/>' +
        brow;
    }

    // Mouth
    var mouth = '';
    if (isChomp) {
      mouth =
        '<rect x="16" y="31" width="32" height="17" rx="7" fill="#320512" stroke="#072210" stroke-width="2.2"/>' +
        '<polygon points="20,31 23,36 26,31" fill="#ffffff"/>' +
        '<polygon points="29,31 32,36 35,31" fill="#ffffff"/>' +
        '<polygon points="38,31 41,36 44,31" fill="#ffffff"/>' +
        '<ellipse cx="32" cy="44" rx="9" ry="3.2" fill="#ff5e7e"/>';
    } else if (isOops) {
      mouth =
        '<path d="M21,40 Q26,36 32,40 Q38,44 43,40" fill="none" stroke="#072210" stroke-width="2.8" stroke-linecap="round"/>';
    } else if (isHappy) {
      mouth =
        '<path d="M17,34 Q32,49 47,34 Z" fill="#320512" stroke="#072210" stroke-width="2.2"/>' +
        '<rect x="24" y="34" width="5" height="4" fill="#ffffff"/>' +
        '<rect x="35" y="34" width="5" height="4" fill="#ffffff"/>';
    } else {
      mouth =
        '<path d="M17,36 Q32,44 47,36 L44,42 Q32,48 20,42 Z" fill="#2c0510" stroke="#072210" stroke-width="2"/>' +
        '<polygon points="21,37 24,41 27,38" fill="#ffffff"/>' +
        '<polygon points="37,38 40,41 43,37" fill="#ffffff"/>';
    }

    var headband = isSuper
      ? '<rect x="11" y="15" width="42" height="5" rx="2" fill="#ff2a55" stroke="#072210" stroke-width="1.6"/>'
      : '';

    return svgWrap('sprite-muncher sprite-muncher--' + s, '0 0 64 64', aura + ridges + feet + torso + headband + eyes + mouth);
  }

  function renderTroggle(type, state) {
    var t = type || 'reggie';
    var s = state || 'normal';
    var isFrozen = s === 'frozen';
    var isFrightened = s === 'frightened';

    var palettes = {
      reggie: { body: '#e6244f', accent: '#a30f34', feature: '#ffd166' },
      bashful: { body: '#2c8eff', accent: '#1254b8', feature: '#ff96b6' },
      helper: { body: '#f5a623', accent: '#b86e00', feature: '#ffe999' },
      worker: { body: '#d97228', accent: '#8e3d0a', feature: '#f7d538' },
      smarty: { body: '#8938e6', accent: '#53159d', feature: '#ffe45e' }
    };

    var pal = palettes[t] || palettes.reggie;
    var bodyColor = isFrightened ? '#1d4ed8' : pal.body;
    var accentColor = isFrightened ? '#0f2d80' : pal.accent;

    var inner = '';

    // Feet common
    var feet =
      '<rect x="16" y="51" width="10" height="7" rx="3" fill="' + accentColor + '" stroke="#090814" stroke-width="2.2"/>' +
      '<rect x="38" y="51" width="10" height="7" rx="3" fill="' + accentColor + '" stroke="#090814" stroke-width="2.2"/>';

    if (t === 'reggie') {
      inner =
        feet +
        '<polygon points="15,18 11,5 24,14" fill="' + pal.feature + '" stroke="#090814" stroke-width="2.2"/>' +
        '<polygon points="49,18 53,5 40,14" fill="' + pal.feature + '" stroke="#090814" stroke-width="2.2"/>' +
        '<rect x="10" y="13" width="44" height="40" rx="12" fill="' + bodyColor + '" stroke="#090814" stroke-width="2.5"/>' +
        '<path d="M16,20 L27,24 M48,20 L37,24" stroke="#090814" stroke-width="2.8" stroke-linecap="round"/>';
    } else if (t === 'bashful') {
      inner =
        feet +
        '<ellipse cx="14" cy="24" rx="5" ry="9" fill="' + accentColor + '" stroke="#090814" stroke-width="2.2"/>' +
        '<ellipse cx="50" cy="24" rx="5" ry="9" fill="' + accentColor + '" stroke="#090814" stroke-width="2.2"/>' +
        '<rect x="12" y="14" width="40" height="39" rx="16" fill="' + bodyColor + '" stroke="#090814" stroke-width="2.5"/>' +
        '<circle cx="19" cy="34" r="4" fill="' + pal.feature + '" opacity="0.85"/>' +
        '<circle cx="45" cy="34" r="4" fill="' + pal.feature + '" opacity="0.85"/>';
    } else if (t === 'helper') {
      inner =
        feet +
        '<rect x="11" y="15" width="40" height="38" rx="13" fill="' + bodyColor + '" stroke="#090814" stroke-width="2.5"/>' +
        // Long vacuum/anteater snout
        '<path d="M36,30 L57,33 L57,41 L36,41 Z" fill="' + accentColor + '" stroke="#090814" stroke-width="2.2"/>' +
        '<ellipse cx="57" cy="37" rx="3" ry="5" fill="#1b1426"/>';
    } else if (t === 'worker') {
      inner =
        feet +
        '<rect x="11" y="17" width="42" height="36" rx="11" fill="' + bodyColor + '" stroke="#090814" stroke-width="2.5"/>' +
        // Hard hat + antenna
        '<line x1="32" y1="3" x2="32" y2="10" stroke="#090814" stroke-width="2.4"/>' +
        '<circle cx="32" cy="4" r="3" fill="#ff3b6b" stroke="#090814" stroke-width="1.6"/>' +
        '<path d="M13,20 Q15,7 32,7 Q49,7 51,20 Z" fill="' + pal.feature + '" stroke="#090814" stroke-width="2.2"/>' +
        '<rect x="9" y="18" width="46" height="5" rx="2.5" fill="' + pal.feature + '" stroke="#090814" stroke-width="2"/>';
    } else {
      // smarty
      inner =
        feet +
        '<path d="M12,17 Q32,4 52,17 L52,50 Q32,54 12,50 Z" fill="' + bodyColor + '" stroke="#090814" stroke-width="2.5"/>' +
        '<circle cx="24" cy="14" r="4" fill="' + accentColor + '" opacity="0.6"/>' +
        '<circle cx="40" cy="13" r="3.5" fill="' + accentColor + '" opacity="0.6"/>';
    }

    // Eyes & mouth (adjusted for frightened state)
    var eyes = '';
    var mouth = '';
    if (isFrightened) {
      eyes =
        '<circle cx="23" cy="27" r="5.5" fill="#fff" stroke="#090814" stroke-width="2"/>' +
        '<circle cx="23" cy="27" r="2" fill="#090814"/>' +
        '<circle cx="41" cy="27" r="5.5" fill="#fff" stroke="#090814" stroke-width="2"/>' +
        '<circle cx="41" cy="27" r="2" fill="#090814"/>';
      mouth =
        '<path d="M19,42 L24,38 L29,42 L34,38 L39,42 L45,38" fill="none" stroke="#aef" stroke-width="2.4" stroke-linecap="round"/>';
    } else {
      var eyeY = t === 'worker' ? 29 : 26;
      eyes =
        '<circle cx="23" cy="' + eyeY + '" r="5.4" fill="#ffffff" stroke="#090814" stroke-width="2"/>' +
        '<circle cx="24" cy="' + eyeY + '" r="2.4" fill="#090814"/>' +
        '<circle cx="41" cy="' + eyeY + '" r="5.4" fill="#ffffff" stroke="#090814" stroke-width="2"/>' +
        '<circle cx="40" cy="' + eyeY + '" r="2.4" fill="#090814"/>';

      if (t === 'smarty') {
        eyes +=
          '<rect x="16" y="20" width="14" height="12" rx="3" fill="none" stroke="#ffe45e" stroke-width="2.4"/>' +
          '<rect x="34" y="20" width="14" height="12" rx="3" fill="none" stroke="#ffe45e" stroke-width="2.4"/>' +
          '<line x1="30" y1="26" x2="34" y2="26" stroke="#ffe45e" stroke-width="2.4"/>';
      }

      if (t === 'bashful') {
        mouth = '<ellipse cx="32" cy="40" rx="4" ry="3" fill="#090814"/>';
      } else if (t === 'helper') {
        mouth = '<path d="M21,41 Q27,44 33,40" fill="none" stroke="#090814" stroke-width="2.4" stroke-linecap="round"/>';
      } else {
        mouth =
          '<path d="M18,39 Q32,47 46,39 L44,44 Q32,50 20,44 Z" fill="#1e0512" stroke="#090814" stroke-width="2"/>' +
          '<polygon points="22,40 25,44 28,40" fill="#ffffff"/>' +
          '<polygon points="36,40 39,44 42,40" fill="#ffffff"/>';
      }
    }

    var iceOverlay = isFrozen
      ? '<rect x="5" y="4" width="54" height="56" rx="10" fill="rgba(110, 235, 255, 0.38)" stroke="#9bf6ff" stroke-width="2.5"/>' +
        '<path d="M13,13 L21,21 M51,14 L43,22 M14,50 L22,42" stroke="#e0fcff" stroke-width="2" stroke-linecap="round"/>'
      : '';

    return svgWrap('sprite-troggle sprite-troggle--' + t + ' sprite-troggle--' + s, '0 0 64 64', inner + eyes + mouth + iceOverlay);
  }

  function renderPowerUp(kind) {
    if (kind === 'freeze') {
      return svgWrap(
        'sprite-powerup sprite-powerup--freeze',
        '0 0 40 40',
        '<circle cx="20" cy="20" r="17" fill="#0c4a6e" stroke="#67e8f9" stroke-width="2.2"/>' +
        '<path d="M20,6 L20,34 M8,13 L32,27 M32,13 L8,27" stroke="#a5f3fc" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="20" cy="20" r="4" fill="#ecfeff"/>'
      );
    }
    if (kind === 'pepper') {
      return svgWrap(
        'sprite-powerup sprite-powerup--pepper',
        '0 0 40 40',
        '<circle cx="20" cy="20" r="17" fill="#450a0a" stroke="#fb923c" stroke-width="2.2"/>' +
        '<path d="M24,10 C31,12 31,26 16,31 C13,32 11,30 13,27 C19,21 20,16 20,12 Z" fill="#ef4444" stroke="#fef08a" stroke-width="1.6"/>' +
        '<path d="M22,11 Q24,6 28,7" fill="none" stroke="#4ade80" stroke-width="2.6" stroke-linecap="round"/>'
      );
    }
    if (kind === 'xray') {
      return svgWrap(
        'sprite-powerup sprite-powerup--xray',
        '0 0 40 40',
        '<circle cx="20" cy="20" r="17" fill="#1e1b4b" stroke="#fde047" stroke-width="2.2"/>' +
        '<circle cx="18" cy="18" r="7.5" fill="#38bdf8" fill-opacity="0.35" stroke="#fde047" stroke-width="2.6"/>' +
        '<line x1="23.5" y1="23.5" x2="31" y2="31" stroke="#fde047" stroke-width="3.4" stroke-linecap="round"/>'
      );
    }
    // star
    return svgWrap(
      'sprite-powerup sprite-powerup--star',
      '0 0 40 40',
      '<circle cx="20" cy="20" r="17" fill="#3b0764" stroke="#facc15" stroke-width="2.2"/>' +
      '<polygon points="20,6 23.8,14.5 33,15.5 26,21.8 28,31 20,26.2 12,31 14,21.8 7,15.5 16.2,14.5" fill="#fde047" stroke="#854d0e" stroke-width="1.4"/>'
    );
  }

  NM.Sprites = {
    renderMuncher: renderMuncher,
    renderTroggle: renderTroggle,
    renderPowerUp: renderPowerUp
  };
})(typeof window !== 'undefined' ? window : globalThis);
