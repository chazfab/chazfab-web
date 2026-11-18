(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});

  function encodePixelGrid(rows, palette, width, height, cls) {
    var rects = '';
    for (var y = 0; y < rows.length; y++) {
      var row = rows[y];
      var x = 0;
      while (x < row.length) {
        var ch = row[x];
        var run = 1;
        while (x + run < row.length && row[x + run] === ch) {
          run++;
        }
        if (ch !== '.' && palette[ch]) {
          rects += '<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1" fill="' + palette[ch] + '"/>';
        }
        x += run;
      }
    }
    return (
      '<svg class="nm-svg ' + cls + '" viewBox="0 0 ' + width + ' ' + height +
      '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' +
      rects +
      '</svg>'
    );
  }

  // 24x18 pixel matrices for authentic 1986/1990 MECC Frog Muncher
  var MUNCHER_IDLE_0 = [
    '....GGGG........GGGG....',
    '...GWWWWG......GWWWWG...',
    '...GWKKWG......GWKKWG...',
    '...GWWWWGGGGGGGGWWWWG...',
    '..GGGGGGGGGGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGGGGGGGGGG.',
    '.GGGKKKKKKKKKKKKKKKKGGG.',
    '.GGGGGGGGGGGGGGGGGGGGGG.',
    '..GGDDDGGGGGGGGGGDDDGG..',
    '..GGGGGGGGGGGGGGGGGGGG..',
    '...GGGGGGGGGGGGGGGGGG...',
    '...GGGG..DDDDDD..GGGG...',
    '..GGGG...DDDDDD...GGGG..',
    '.GGGG.....DDDD.....GGGG.',
    '.GGG................GGG.',
    'GGDGDGG..........GGDGDGG',
    'G.G.G..............G.G.G',
    '........................'
  ];

  var MUNCHER_IDLE_1 = [
    '....GGGG........GGGG....',
    '...GWWWWG......GWWWWG...',
    '...GWKKWG......GWKKWG...',
    '...GWWWWGGGGGGGGWWWWG...',
    '..GGGGGGGGGGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGGGGGGGGGG.',
    '.GGKKKKKKKKKKKKKKKKKKGG.',
    '.GGGGGGGGGGGGGGGGGGGGGG.',
    '..GGGGGGGGGGGGGGGGGGGG..',
    '...GGGDDDDDDDDDDDDGGG...',
    '...GGGGGGGGGGGGGGGGGG...',
    '..GGGG...DDDDDD...GGGG..',
    '.GGGG....DDDDDD....GGGG.',
    '.GGG................GGG.',
    'GGDGDGG..........GGDGDGG',
    'G.G.G..............G.G.G',
    '........................',
    '........................'
  ];

  var MUNCHER_CHOMP = [
    '....GGGG........GGGG....',
    '...GWWWWG......GWWWWG...',
    '...GWKKWG......GWKKWG...',
    '..GGGGGGGGGGGGGGGGGGGG..',
    '.GGGGGGGGGGGGGGGGGGGGGG.',
    '.GGKKKKKKKKKKKKKKKKKKGG.',
    '.GGKKKKKKKKKKKKKKKKKKGG.',
    '.GGKKKKKKRRRRRRKKKKKKGG.',
    '.GGKKKKRRRRRRRRRRKKKKGG.',
    '.GGKKKKKKKKKKKKKKKKKKGG.',
    '..GGGGGGGGGGGGGGGGGGGG..',
    '...GGGDDDDDDDDDDDDGGG...',
    '...GGGG..DDDDDD..GGGG...',
    '..GGGG....DDDD....GGGG..',
    '.GGG................GGG.',
    'GGDGDGG..........GGDGDGG',
    'G.G.G..............G.G.G',
    '........................'
  ];

  var MUNCHER_OOPS = [
    '....DDDD........DDDD....',
    '...DDDDDD......DDDDDD...',
    '...GWKKWG......GWKKWG...',
    '...GWWWWGGGGGGGGWWWWG...',
    '..GGGGGGGGGGGGGGGGGGGG..',
    'GGGGGGGGGGGGGGGGGGGGGGGG',
    'GGGKKKGGGGKKKKGGGGKKKGGG',
    'GGGGGKKKKKRRRRKKKKKGGGGG',
    'GGGGGGGGGGKKKKGGGGGGGGGG',
    '.GGGGDDDDDDDDDDDDDDGGGG.',
    '..GGGGGGGGGGGGGGGGGGGG..',
    '...GGGG..DDDDDD..GGGG...',
    '..GGGG...DDDDDD...GGGG..',
    '.GGGG.....DDDD.....GGGG.',
    '.GGG................GGG.',
    'GGDGDGG..........GGDGDGG',
    'G.G.G..............G.G.G',
    '........................'
  ];

  function renderMuncher(state, frame) {
    var s = state || 'idle';
    var f = frame ? 1 : 0;
    var isSuper = s === 'super';
    var palette = isSuper
      ? { G: '#FFAA00', D: '#AA5500', W: '#FFFFFF', K: '#000000', R: '#FF5555' }
      : { G: '#55FF55', D: '#00AA00', W: '#FFFFFF', K: '#000000', R: '#FF5555' };

    var grid = MUNCHER_IDLE_0;
    if (s === 'chomp') {
      grid = MUNCHER_CHOMP;
    } else if (s === 'oops') {
      grid = MUNCHER_OOPS;
    } else if (f === 1) {
      grid = MUNCHER_IDLE_1;
    }

    return encodePixelGrid(grid, palette, 24, 18, 'sprite-muncher sprite-muncher--' + s);
  }

  // 20x18 pixel matrices for the 5 classic Troggles
  var TROGGLE_MATRICES = {
    reggie: [
      [
        '..HH............HH..',
        '...HHH........HHH...',
        '....BBBBBBBBBBBB....',
        '...BBBBBBBBBBBBBB...',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBWKWBBBBWKWBBB..',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBBBBBBBBBBBBBB..',
        '..BBMMMMMMMMMMMMBB..',
        '..BBMWWMMWWMMWWMBB..',
        '..BBMMMWWMMWWMMMBB..',
        '..BBMMMMMMMMMMMMBB..',
        '...DDDDDDDDDDDDDD...',
        '....BBBB....BBBB....',
        '....DDD......DDD....',
        '...DDDD......DDDD...',
        '....................',
        '....................'
      ],
      [
        '..HH............HH..',
        '...HHH........HHH...',
        '....BBBBBBBBBBBB....',
        '...BBBBBBBBBBBBBB...',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBWKWBBBBWKWBBB..',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBBBBBBBBBBBBBB..',
        '..BBMMMMMMMMMMMMBB..',
        '..BBMWWMMWWMMWWMBB..',
        '..BBMMMWWMMWWMMMBB..',
        '..BBMMMMMMMMMMMMBB..',
        '...DDDDDDDDDDDDDD...',
        '.....BBB....BBB.....',
        '....DDDD....DDDD....',
        '.....DD......DD.....',
        '....................',
        '....................'
      ]
    ],
    bashful: [
      [
        '....................',
        '.....BBBBBBBBBB.....',
        '...BBBBBBBBBBBBBB...',
        '..DDDBBBBBBBBBBDDD..',
        '..DDBWWWBBBBWWWBDD..',
        '..DDBWKWBBBBWKWBDD..',
        '..DDBWWWBBBBWWWBDD..',
        '..DBBHHHBBBBHHHBBBD.',
        '..BBBBBBBBBBBBBBBB..',
        '..BBBBBBMMMMBBBBBB..',
        '..BBBBBBMMMMBBBBBB..',
        '...BBBBBBBBBBBBBB...',
        '....DDDDDDDDDDDD....',
        '....BBB......BBB....',
        '...DDDD......DDDD...',
        '....................',
        '....................',
        '....................'
      ],
      [
        '....................',
        '.....BBBBBBBBBB.....',
        '...BBBBBBBBBBBBBB...',
        '..DDDBBBBBBBBBBDDD..',
        '..DDBWWWBBBBWWWBDD..',
        '..DDBWKWBDDDWKWBDD..',
        '..DDBWWWBBBBWWWBDD..',
        '..DBBHHHBBBBHHHBBBD.',
        '..BBBBBBBBBBBBBBBB..',
        '..BBBBBBMMMMBBBBBB..',
        '..BBBBBBMMMMBBBBBB..',
        '...BBBBBBBBBBBBBB...',
        '....DDDDDDDDDDDD....',
        '.....BBB....BBB.....',
        '....DDDD....DDDD....',
        '....................',
        '....................',
        '....................'
      ]
    ],
    helper: [
      [
        '....................',
        '....BBBBBBBBBB......',
        '...BBBBBBBBBBBB.....',
        '..BBBWWWBBWWWBBB....',
        '..BBBWKWBBWKWBBB....',
        '..BBBWWWBBWWWBBB....',
        '..BBBBBBBBBBBBBB....',
        '..BBBBBBBBDDDDDDDD..',
        '..BBBBBBBBDDDDDDDM..',
        '..BBMMMMMMDDDDDDDM..',
        '..BBBBBBBBBBBBBB....',
        '...DDDDDDDDDDDD.....',
        '....BBB....BBB......',
        '...DDDD....DDDD.....',
        '....................',
        '....................',
        '....................',
        '....................'
      ],
      [
        '....................',
        '....BBBBBBBBBB......',
        '...BBBBBBBBBBBB.....',
        '..BBBWWWBBWWWBBB....',
        '..BBBWKWBBWKWBBB....',
        '..BBBWWWBBWWWBBB....',
        '..BBBBBBBBBBBBBB....',
        '..BBBBBBBBDDDDDDDDD.',
        '..BBBBBBBBDDDDDDDDM.',
        '..BBMMMMMMDDDDDDDDM.',
        '..BBBBBBBBBBBBBB....',
        '...DDDDDDDDDDDD.....',
        '.....BBB..BBB.......',
        '....DDDD..DDDD......',
        '....................',
        '....................',
        '....................',
        '....................'
      ]
    ],
    worker: [
      [
        '.........AA.........',
        '.........HH.........',
        '.....HHHHHHHHHH.....',
        '....HHHHHHHHHHHH....',
        '...HHHHHHHHHHHHHH...',
        '...BBBBBBBBBBBBBB...',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBWKWBBBBWKWBBB..',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBBBBBBBBBBBBBB..',
        '..BBMMMMMMMMMMMMBB..',
        '..BBMWWWMMMMWWWMBB..',
        '...DDDDDDDDDDDDDD...',
        '....BBBB....BBBB....',
        '...DDDD......DDDD...',
        '....................',
        '....................',
        '....................'
      ],
      [
        '.........KK.........',
        '.........HH.........',
        '.....HHHHHHHHHH.....',
        '....HHHHHHHHHHHH....',
        '...HHHHHHHHHHHHHH...',
        '...BBBBBBBBBBBBBB...',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBWKWBBBBWKWBBB..',
        '..BBBWWWBBBBWWWBBB..',
        '..BBBBBBBBBBBBBBBB..',
        '..BBMMMMMMMMMMMMBB..',
        '..BBMWWWMMMMWWWMBB..',
        '...DDDDDDDDDDDDDD...',
        '.....BBB....BBB.....',
        '....DDDD....DDDD....',
        '....................',
        '....................',
        '....................'
      ]
    ],
    smarty: [
      [
        '....BBBBBBBBBBBB....',
        '...BBBBBBBBBBBBBB...',
        '..BBBBBBBBBBBBBBBB..',
        '..BHHHHHHHHHHHHHHB..',
        '..BHWWWHBBBBHWWWHB..',
        '..BHWKWHHHHHHWKWHB..',
        '..BHWWWHBBBBHWWWHB..',
        '..BHHHHHHHHHHHHHHB..',
        '..BBBBBBBBBBBBBBBB..',
        '..BBMMMMMMMMMMMMBB..',
        '..BBMWWMMMMMMWWMBB..',
        '...DDDDDDDDDDDDDD...',
        '....BBBB....BBBB....',
        '...DDDD......DDDD...',
        '....................',
        '....................',
        '....................',
        '....................'
      ],
      [
        '....BBBBBBBBBBBB....',
        '...BBBBBBBBBBBBBB...',
        '..BBBBBBBBBBBBBBBB..',
        '..BHHHHHHHHHHHHHHB..',
        '..BHWWWHBBBBHWWWHB..',
        '..BHWKWHHHHHHWKWHB..',
        '..BHWWWHBBBBHWWWHB..',
        '..BHHHHHHHHHHHHHHB..',
        '..BBBBBBBBBBBBBBBB..',
        '..BBMMMMMMMMMMMMBB..',
        '..BBMWWMMMMMMWWMBB..',
        '...DDDDDDDDDDDDDD...',
        '.....BBB....BBB.....',
        '....DDDD....DDDD....',
        '....................',
        '....................',
        '....................',
        '....................'
      ]
    ]
  };

  var TROGGLE_PALETTES = {
    reggie:  { B: '#FF5555', D: '#AA0000', H: '#FFFF55', W: '#FFFFFF', K: '#000000', M: '#220000', A: '#FFFFFF' },
    bashful: { B: '#5555FF', D: '#55FFFF', H: '#FF55FF', W: '#FFFFFF', K: '#000000', M: '#000044', A: '#FFFFFF' },
    helper:  { B: '#FFFF55', D: '#AA5500', H: '#FFFFFF', W: '#FFFFFF', K: '#000000', M: '#221100', A: '#FF5555' },
    worker:  { B: '#FFAA00', D: '#AA5500', H: '#FFFF55', W: '#FFFFFF', K: '#000000', M: '#220022', A: '#FF5555' },
    smarty:  { B: '#AA00AA', D: '#FF55FF', H: '#FFFF55', W: '#FFFFFF', K: '#000000', M: '#110022', A: '#55FFFF' }
  };

  function addFrostBorder(rows) {
    var out = rows.slice();
    out[0] = 'IIIIIIIIIIIIIIIIIIII';
    out[17] = 'IIIIIIIIIIIIIIIIIIII';
    for (var y = 1; y < 17; y++) {
      out[y] = 'I' + out[y].slice(1, 19) + 'I';
    }
    return out;
  }

  function renderTroggle(type, state, frame) {
    var t = TROGGLE_MATRICES[type] ? type : 'reggie';
    var s = state || 'normal';
    var f = frame ? 1 : 0;
    var rows = TROGGLE_MATRICES[t][f];
    var pal = TROGGLE_PALETTES[t];

    if (s === 'frozen') {
      rows = addFrostBorder(rows);
      pal = {
        B: '#55FFFF',
        D: '#00AAAA',
        H: '#FFFFFF',
        W: '#FFFFFF',
        K: '#0000AA',
        M: '#004466',
        A: '#FFFFFF',
        I: '#FFFFFF'
      };
    } else if (s === 'frightened') {
      pal = {
        B: '#5555FF',
        D: '#0000AA',
        H: '#55FFFF',
        W: '#FFFFFF',
        K: '#000000',
        M: '#000044',
        A: '#55FFFF'
      };
    }

    return encodePixelGrid(rows, pal, 20, 18, 'sprite-troggle sprite-troggle--' + t + ' sprite-troggle--' + s);
  }

  var POWERUP_MATRICES = {
    freeze: {
      rows: [
        '.......CC.......',
        '.......CC.......',
        '..CC...WW...CC..',
        '...CC..CC..CC...',
        '....CC.WW.CC....',
        '......CCCC......',
        '.CCWWWWWWWWWCC..',
        '.CCWWWWWWWWWCC..',
        '......CCCC......',
        '....CC.WW.CC....',
        '...CC..CC..CC...',
        '..CC...WW...CC..',
        '.......CC.......',
        '.......CC.......',
        '................',
        '................'
      ],
      pal: { C: '#55FFFF', W: '#FFFFFF' }
    },
    pepper: {
      rows: [
        '..........GG....',
        '.........GGG....',
        '........GG......',
        '.......RRRR.....',
        '......RRRRRR....',
        '.....RRRRYYRR...',
        '....RRRRRRRR....',
        '...RRRRRRRR.....',
        '..RRRRRRRR......',
        '..RRRRRRR.......',
        '..RRRRR.........',
        '...RRR..........',
        '....R...........',
        '................',
        '................',
        '................'
      ],
      pal: { R: '#FF5555', Y: '#FFFF55', G: '#55FF55' }
    },
    xray: {
      rows: [
        '....YYYYYY......',
        '..YYCCCCCCYY....',
        '.YYCCCCCCCCYY...',
        '.YCCWWWWCCCCY...',
        '.YCCWWCCCCCCY...',
        '.YCCCCCCCCCCY...',
        '.YYCCCCCCCCYY...',
        '..YYCCCCCCYY....',
        '....YYYYYY......',
        '.........YYY....',
        '..........YYY...',
        '...........YYY..',
        '............YY..',
        '................',
        '................',
        '................'
      ],
      pal: { Y: '#FFFF55', C: '#55FFFF', W: '#FFFFFF' }
    },
    star: {
      rows: [
        '.......YY.......',
        '.......YY.......',
        '......YYYY......',
        '......YYYY......',
        '.YYYYYYYYYYYYYY.',
        '..YYYYWWWWYYYY..',
        '...YYYYYYYYYY...',
        '....YYYYYYYY....',
        '....YYYYYYYY....',
        '...YYYY..YYYY...',
        '..YYYY....YYYY..',
        '..YY........YY..',
        '................',
        '................',
        '................',
        '................'
      ],
      pal: { Y: '#FFFF55', W: '#FFFFFF' }
    }
  };

  function renderPowerUp(kind) {
    var spec = POWERUP_MATRICES[kind] || POWERUP_MATRICES.star;
    return encodePixelGrid(spec.rows, spec.pal, 16, 16, 'sprite-powerup sprite-powerup--' + (kind || 'star'));
  }

  function renderTitleBannerMascots() {
    return {
      muncherHtml: renderMuncher('idle', 0),
      reggieHtml: renderTroggle('reggie', 'normal', 0)
    };
  }

  var api = {
    renderMuncher: renderMuncher,
    renderTroggle: renderTroggle,
    renderPowerUp: renderPowerUp,
    renderTitleBannerMascots: renderTitleBannerMascots
  };

  NM.Sprites = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
