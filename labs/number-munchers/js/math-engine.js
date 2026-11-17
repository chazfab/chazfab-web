(function (root) {
  'use strict';

  var NM = (root.NM = root.NM || {});

  var CHALLENGE_CYCLE = ['multiples', 'factors', 'primes', 'equality', 'inequality'];

  var FACTOR_POOLS = {
    elementary: [12, 16, 18, 20, 24, 28, 30, 32, 36],
    classic: [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 54, 56, 60, 72],
    whiz: [24, 36, 48, 54, 60, 72, 84, 90, 96, 100, 120]
  };

  var ODD_COMPOSITES = [
    9, 15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57,
    63, 65, 69, 75, 77, 81, 85, 87, 91, 93, 95, 99, 105, 111
  ];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function isPrime(n) {
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    var limit = Math.floor(Math.sqrt(n));
    for (var i = 3; i <= limit; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  function smallestFactor(n) {
    if (n % 2 === 0) return 2;
    var limit = Math.floor(Math.sqrt(n));
    for (var i = 3; i <= limit; i += 2) {
      if (n % i === 0) return i;
    }
    return n;
  }

  function getFactors(n) {
    var out = [];
    for (var i = 1; i <= n; i++) {
      if (n % i === 0) out.push(i);
    }
    return out;
  }

  function normalizeDifficulty(difficulty) {
    if (difficulty === 'elementary' || difficulty === 'whiz') return difficulty;
    return 'classic';
  }

  function createLevelRule(mode, level, difficulty) {
    var lvl = Math.max(1, Number(level) || 1);
    var tier = normalizeDifficulty(difficulty);
    var requestedMode = mode || 'multiples';
    var effectiveMode = requestedMode === 'challenge'
      ? CHALLENGE_CYCLE[(lvl - 1) % CHALLENGE_CYCLE.length]
      : requestedMode;

    var target = 0;
    var comparator = null;
    var bannerText = '';
    var subHint = '';
    var maxCeiling = 67;

    if (effectiveMode === 'multiples') {
      if (tier === 'elementary') {
        target = Math.min(6, 2 + ((lvl - 1) % 5));
      } else if (tier === 'whiz') {
        target = Math.min(16, 3 + ((lvl - 1) % 14));
      } else {
        target = Math.min(12, 2 + ((lvl - 1) % 11));
      }
      bannerText = 'Multiples of ' + target;
      subHint = 'Munch numbers that ' + target + ' divides evenly (like ' + target + ', ' + (target * 2) + ', ' + (target * 3) + ').';
    } else if (effectiveMode === 'factors') {
      var pool = FACTOR_POOLS[tier];
      var poolSliceMax = Math.min(pool.length, 3 + lvl * 2);
      target = pool[randInt(0, poolSliceMax - 1)];
      bannerText = 'Factors of ' + target;
      subHint = 'Munch positive whole numbers that divide ' + target + ' evenly.';
    } else if (effectiveMode === 'primes') {
      if (tier === 'elementary') {
        maxCeiling = Math.min(31, 19 + (lvl - 1) * 4);
      } else if (tier === 'whiz') {
        maxCeiling = Math.min(113, 47 + (lvl - 1) * 12);
      } else {
        maxCeiling = Math.min(67, 29 + (lvl - 1) * 6);
      }
      target = maxCeiling;
      bannerText = 'Prime Numbers';
      subHint = 'Munch numbers greater than 1 whose only factors are 1 and themselves (up to ' + maxCeiling + ').';
    } else if (effectiveMode === 'equality') {
      comparator = 'eq';
      if (tier === 'elementary') {
        target = randInt(3, Math.min(15, 7 + lvl * 2));
      } else if (tier === 'whiz') {
        target = randInt(10, Math.min(60, 22 + lvl * 5));
      } else {
        target = randInt(5, Math.min(30, 12 + lvl * 3));
      }
      bannerText = 'Equals ' + target + ' (= ' + target + ')';
      subHint = 'Munch expressions that evaluate to exactly ' + target + '.';
    } else {
      effectiveMode = 'inequality';
      var comps = ['ne', 'lt', 'gt'];
      comparator = comps[randInt(0, comps.length - 1)];
      if (comparator === 'ne') {
        if (tier === 'elementary') target = randInt(3, 12);
        else if (tier === 'whiz') target = randInt(10, 45);
        else target = randInt(5, 24);
        bannerText = 'Not Equal to ' + target + ' (\u2260 ' + target + ')';
        subHint = 'Munch expressions whose value is anything EXCEPT ' + target + '.';
      } else if (comparator === 'lt') {
        if (tier === 'elementary') target = randInt(6, 15);
        else if (tier === 'whiz') target = randInt(14, 50);
        else target = randInt(9, 28);
        bannerText = 'Less than ' + target + ' (< ' + target + ')';
        subHint = 'Munch values strictly smaller than ' + target + '.';
      } else {
        if (tier === 'elementary') target = randInt(3, 12);
        else if (tier === 'whiz') target = randInt(10, 42);
        else target = randInt(5, 22);
        bannerText = 'Greater than ' + target + ' (> ' + target + ')';
        subHint = 'Munch values strictly larger than ' + target + '.';
      }
    }

    return {
      mode: requestedMode,
      effectiveMode: effectiveMode,
      target: target,
      comparator: comparator,
      maxCeiling: maxCeiling,
      bannerText: bannerText,
      subHint: subHint,
      difficulty: tier,
      level: lvl
    };
  }

  function isCellValueValid(rule, numericValue) {
    if (typeof numericValue !== 'number' || !Number.isInteger(numericValue)) return false;
    switch (rule.effectiveMode) {
      case 'multiples':
        return numericValue > 0 && numericValue % rule.target === 0;
      case 'factors':
        return numericValue >= 1 && numericValue <= rule.target && rule.target % numericValue === 0;
      case 'primes':
        return isPrime(numericValue);
      case 'equality':
        return numericValue === rule.target;
      case 'inequality':
        if (rule.comparator === 'ne') return numericValue !== rule.target;
        if (rule.comparator === 'lt') return numericValue < rule.target;
        if (rule.comparator === 'gt') return numericValue > rule.target;
        return false;
      default:
        return false;
    }
  }

  function makeExpressionForValue(val, tier) {
    var ops = tier === 'elementary' ? ['+', '-', '*'] : ['+', '-', '*', '/'];
    if (val <= 1) ops = ['+', '-'];

    for (var attempt = 0; attempt < 24; attempt++) {
      var op = pick(ops);
      if (op === '+') {
        if (val >= 2) {
          var a = randInt(1, val - 1);
          var b = val - a;
          return { display: a + ' + ' + b, numericValue: val };
        }
      } else if (op === '-') {
        var maxSub = tier === 'elementary' ? 12 : (tier === 'whiz' ? 35 : 20);
        var bSub = randInt(1, maxSub);
        var aSub = val + bSub;
        return { display: aSub + ' \u2212 ' + bSub, numericValue: val };
      } else if (op === '*') {
        var pairs = [];
        for (var d = 2; d <= Math.min(12, Math.floor(Math.sqrt(val))); d++) {
          if (val % d === 0) {
            pairs.push([d, val / d]);
            if (d !== val / d) pairs.push([val / d, d]);
          }
        }
        if (pairs.length > 0) {
          var pair = pick(pairs);
          return { display: pair[0] + ' \u00d7 ' + pair[1], numericValue: val };
        }
      } else if (op === '/') {
        var maxDiv = tier === 'whiz' ? 12 : 9;
        var divisor = randInt(2, maxDiv);
        var dividend = val * divisor;
        if (dividend <= (tier === 'whiz' ? 180 : 108)) {
          return { display: dividend + ' \u00f7 ' + divisor, numericValue: val };
        }
      }
    }

    // Guaranteed clean fallback
    if (val >= 2) {
      var left = randInt(1, val - 1);
      return { display: left + ' + ' + (val - left), numericValue: val };
    }
    var subB = randInt(2, 9);
    return { display: (val + subB) + ' \u2212 ' + subB, numericValue: val };
  }

  function makeNumericPayload(rule, wantValid, usedDisplays) {
    var tier = rule.difficulty;
    var val = 0;
    var display = '';

    if (rule.effectiveMode === 'multiples') {
      var n = rule.target;
      if (wantValid) {
        var maxK = tier === 'elementary' ? 10 : 12;
        val = n * randInt(1, maxK);
      } else {
        for (var i = 0; i < 40; i++) {
          var modePick = Math.random();
          if (modePick < 0.55) {
            var baseMult = n * randInt(1, 11);
            var delta = pick([-2, -1, 1, 2]);
            val = Math.max(1, baseMult + delta);
          } else {
            var altN = Math.max(2, n + pick([-1, 1]));
            val = altN * randInt(1, 11);
          }
          if (!isCellValueValid(rule, val)) break;
        }
        if (isCellValueValid(rule, val)) val = n + 1;
      }
      display = String(val);
      return { display: display, numericValue: val, isValid: isCellValueValid(rule, val) };
    }

    if (rule.effectiveMode === 'factors') {
      var target = rule.target;
      var factors = getFactors(target);
      var nonFactors = [];
      for (var k = 2; k < target; k++) {
        if (target % k !== 0) nonFactors.push(k);
      }
      if (wantValid) {
        val = pick(factors);
      } else {
        // Weight near-misses (+/- 1 from real factors) and shared-divisor composites
        var nearMisses = nonFactors.filter(function (x) {
          return factors.some(function (f) { return Math.abs(f - x) === 1; });
        });
        if (nearMisses.length > 0 && Math.random() < 0.6) {
          val = pick(nearMisses);
        } else {
          val = nonFactors.length > 0 ? pick(nonFactors) : target + 1;
        }
      }
      display = String(val);
      return { display: display, numericValue: val, isValid: isCellValueValid(rule, val) };
    }

    if (rule.effectiveMode === 'primes') {
      var ceil = rule.maxCeiling || 67;
      var primesList = [];
      var compositesList = [1];
      for (var p = 2; p <= ceil; p++) {
        if (isPrime(p)) primesList.push(p);
        else compositesList.push(p);
      }
      var oddTraps = ODD_COMPOSITES.filter(function (c) { return c <= ceil; });
      if (wantValid) {
        val = pick(primesList);
      } else {
        var r = Math.random();
        if (r < 0.14) {
          val = 1; // Classic Number Munchers trap!
        } else if (oddTraps.length > 0 && r < 0.72) {
          val = pick(oddTraps);
        } else {
          val = pick(compositesList);
        }
      }
      display = String(val);
      return { display: display, numericValue: val, isValid: isCellValueValid(rule, val) };
    }

    if (rule.effectiveMode === 'equality') {
      var tEq = rule.target;
      if (wantValid) {
        val = tEq;
      } else {
        for (var j = 0; j < 25; j++) {
          var off = pick([-4, -3, -2, -1, 1, 2, 3, 4]);
          val = Math.max(1, tEq + off);
          if (val !== tEq) break;
        }
        if (val === tEq) val = tEq + 1;
      }
      var exprEq = null;
      for (var tries = 0; tries < 10; tries++) {
        var candidateEq = makeExpressionForValue(val, tier);
        exprEq = candidateEq;
        if (!usedDisplays || !usedDisplays.has(candidateEq.display)) break;
      }
      return {
        display: exprEq.display,
        numericValue: exprEq.numericValue,
        isValid: isCellValueValid(rule, exprEq.numericValue)
      };
    }

    // Inequality mode (ne, lt, gt)
    var tIneq = rule.target;
    var comp = rule.comparator;
    if (comp === 'ne') {
      if (wantValid) {
        val = Math.max(1, tIneq + pick([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]));
      } else {
        val = tIneq;
      }
    } else if (comp === 'lt') {
      if (wantValid) {
        val = randInt(1, Math.max(1, tIneq - 1));
      } else {
        val = randInt(tIneq, tIneq + (tier === 'whiz' ? 14 : 8));
      }
    } else {
      // gt
      if (wantValid) {
        val = randInt(tIneq + 1, tIneq + (tier === 'whiz' ? 18 : 10));
      } else {
        val = randInt(1, Math.max(1, tIneq));
      }
    }

    var usePlainInt = tier === 'elementary' && comp !== 'ne' && Math.random() < 0.35;
    if (usePlainInt) {
      return {
        display: String(val),
        numericValue: val,
        isValid: isCellValueValid(rule, val)
      };
    }

    var exprIneq = null;
    for (var t = 0; t < 10; t++) {
      var cand = makeExpressionForValue(val, tier);
      exprIneq = cand;
      if (!usedDisplays || !usedDisplays.has(cand.display)) break;
    }
    return {
      display: exprIneq.display,
      numericValue: exprIneq.numericValue,
      isValid: isCellValueValid(rule, exprIneq.numericValue)
    };
  }

  function generateSingleCell(rule, preferValidProbability) {
    var prob = typeof preferValidProbability === 'number' ? preferValidProbability : 0.38;
    var wantValid = Math.random() < prob;
    var payload = makeNumericPayload(rule, wantValid, null);
    return {
      display: payload.display,
      numericValue: payload.numericValue,
      isValid: isCellValueValid(rule, payload.numericValue)
    };
  }

  function generateBoard(rule, cols, rows) {
    var numCols = cols || 6;
    var numRows = rows || 5;
    var total = numCols * numRows;
    var validCount = randInt(11, 14);
    var invalidCount = total - validCount;

    var usedDisplays = new Set();
    var items = [];

    function createUniqueOrBounded(wantValid) {
      var best = null;
      for (var attempt = 0; attempt < 18; attempt++) {
        var candidate = makeNumericPayload(rule, wantValid, usedDisplays);
        best = candidate;
        if (!usedDisplays.has(candidate.display)) {
          usedDisplays.add(candidate.display);
          return candidate;
        }
      }
      // Allow controlled duplicates when natural pool size < quota (e.g., Factors of 12)
      return best;
    }

    for (var v = 0; v < validCount; v++) {
      items.push(createUniqueOrBounded(true));
    }
    for (var iv = 0; iv < invalidCount; iv++) {
      items.push(createUniqueOrBounded(false));
    }

    var shuffled = shuffle(items);
    return shuffled.map(function (item, idx) {
      return {
        index: idx,
        col: idx % numCols,
        row: Math.floor(idx / numCols),
        display: item.display,
        numericValue: item.numericValue,
        isValid: isCellValueValid(rule, item.numericValue),
        empty: false,
        powerUp: null
      };
    });
  }

  function explainMistake(rule, cell) {
    if (!cell || typeof cell.numericValue !== 'number') {
      return 'That cell is empty!';
    }
    var val = cell.numericValue;
    var disp = cell.display || String(val);

    if (rule.effectiveMode === 'multiples') {
      var n = rule.target;
      if (val < n) {
        return val + ' is less than ' + n + ', so it is not a positive Multiple of ' + n + '.';
      }
      var q = Math.floor(val / n);
      var r = val % n;
      return val + ' \u00f7 ' + n + ' = ' + q + ' with remainder ' + r + ' \u2014 not a Multiple of ' + n + '.';
    }

    if (rule.effectiveMode === 'factors') {
      var t = rule.target;
      if (val > t) {
        return val + ' is larger than ' + t + ', so it cannot be a Factor of ' + t + '.';
      }
      var rem = t % val;
      return t + ' \u00f7 ' + val + ' leaves remainder ' + rem + ' \u2014 ' + val + ' is not a Factor of ' + t + '.';
    }

    if (rule.effectiveMode === 'primes') {
      if (val === 1) {
        return '1 is NOT a Prime Number (primes are greater than 1 and have exactly 2 factors).';
      }
      if (val < 2) {
        return val + ' is not a Prime Number.';
      }
      var sf = smallestFactor(val);
      return val + ' = ' + sf + ' \u00d7 ' + (val / sf) + ', so ' + val + ' is composite \u2014 not a Prime Number!';
    }

    if (rule.effectiveMode === 'equality') {
      if (disp !== String(val)) {
        return disp + ' = ' + val + ', which does not equal ' + rule.target + '.';
      }
      return val + ' does not equal ' + rule.target + '.';
    }

    if (rule.effectiveMode === 'inequality') {
      var prefix = disp !== String(val) ? (disp + ' = ' + val) : String(val);
      if (rule.comparator === 'ne') {
        return prefix + ', which EQUALS ' + rule.target + ' (you want \u2260 ' + rule.target + ').';
      }
      if (rule.comparator === 'lt') {
        return prefix + ', which is NOT less than ' + rule.target + '.';
      }
      return prefix + ', which is NOT greater than ' + rule.target + '.';
    }

    return disp + ' does not match the current rule.';
  }

  var api = {
    createLevelRule: createLevelRule,
    generateBoard: generateBoard,
    generateSingleCell: generateSingleCell,
    explainMistake: explainMistake,
    isCellValueValid: isCellValueValid,
    isPrime: isPrime,
    getFactors: getFactors
  };

  NM.MathEngine = api;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : globalThis);
