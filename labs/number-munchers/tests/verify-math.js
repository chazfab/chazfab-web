'use strict';

const assert = require('assert');
const MathEngine = require('../js/math-engine.js');

function evalDisplayExpression(display) {
  const str = String(display).trim();
  if (/^\d+$/.test(str)) {
    return Number(str);
  }
  const match = str.match(/^(\d+)\s*([+\-\u2212\u00d7\u00f7])\s*(\d+)$/);
  assert(match, `Unparseable display expression: "${display}"`);
  const a = Number(match[1]);
  const op = match[2];
  const b = Number(match[3]);
  switch (op) {
    case '+':
      return a + b;
    case '-':
    case '\u2212':
      return a - b;
    case '\u00d7':
      return a * b;
    case '\u00f7':
      assert(b !== 0 && a % b === 0, `Non-integer division in expression: "${display}"`);
      return a / b;
    default:
      throw new Error(`Unexpected operator "${op}" in "${display}"`);
  }
}

function refIsPrime(n) {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function refCheckValid(rule, val) {
  switch (rule.effectiveMode) {
    case 'multiples':
      return val > 0 && val % rule.target === 0;
    case 'factors':
      return val >= 1 && val <= rule.target && rule.target % val === 0;
    case 'primes':
      return refIsPrime(val);
    case 'equality':
      return val === rule.target;
    case 'inequality':
      if (rule.comparator === 'ne') return val !== rule.target;
      if (rule.comparator === 'lt') return val < rule.target;
      if (rule.comparator === 'gt') return val > rule.target;
      throw new Error(`Unknown comparator: ${rule.comparator}`);
    default:
      throw new Error(`Unknown effectiveMode: ${rule.effectiveMode}`);
  }
}

const MODES = ['multiples', 'factors', 'primes', 'equality', 'inequality', 'challenge'];
const TIERS = ['elementary', 'classic', 'whiz'];

let boardsChecked = 0;
let cellsChecked = 0;
let mistakeExplanationsChecked = 0;

for (const mode of MODES) {
  for (const tier of TIERS) {
    for (let level = 1; level <= 20; level++) {
      const rule = MathEngine.createLevelRule(mode, level, tier);
      assert(rule && rule.bannerText.length > 0, 'Rule must have non-empty bannerText');
      assert(!/[\u2212\u2260]/.test(rule.bannerText), `Unsupported pixel font char in banner: "${rule.bannerText}"`);

      const board = MathEngine.generateBoard(rule, 6, 5);
      assert.strictEqual(board.length, 30, 'Board must have 30 cells');

      let validCount = 0;
      for (const cell of board) {
        assert(!/[\u2212\u2260]/.test(cell.display), `Unsupported pixel font char in display: "${cell.display}"`);
        const evaluated = evalDisplayExpression(cell.display);
        assert.strictEqual(
          evaluated,
          cell.numericValue,
          `Mismatch between evaluated "${cell.display}" (${evaluated}) and numericValue (${cell.numericValue})`
        );

        const expectedValid = refCheckValid(rule, evaluated);
        assert.strictEqual(
          cell.isValid,
          expectedValid,
          `isValid mismatch for ${mode}/${tier}/L${level} (${rule.bannerText}) cell "${cell.display}"=${evaluated}: got ${cell.isValid}, expected ${expectedValid}`
        );

        if (expectedValid) {
          validCount++;
        } else {
          const explanation = MathEngine.explainMistake(rule, cell);
          assert(
            typeof explanation === 'string' && explanation.trim().length > 8,
            `Expected informative explanation for invalid cell "${cell.display}" in ${rule.bannerText}`
          );
          assert(!/[\u2212\u2260]/.test(explanation), `Unsupported pixel font char in explanation: "${explanation}"`);
          mistakeExplanationsChecked++;
        }
        cellsChecked++;
      }

      assert(
        validCount >= 10 && validCount <= 16,
        `Valid cell count out of range (${validCount}) for ${mode}/${tier}/L${level}`
      );
      boardsChecked++;
    }
  }
}

// Verify Challenge mode cycles through all 5 modes across levels 1..5
const seenChallengeModes = new Set();
for (let lvl = 1; lvl <= 5; lvl++) {
  const r = MathEngine.createLevelRule('challenge', lvl, 'classic');
  seenChallengeModes.add(r.effectiveMode);
}
assert.strictEqual(seenChallengeModes.size, 5, 'Challenge mode must cycle through all 5 core modes');

// Verify generateSingleCell (Worker Troggle spawns)
for (const mode of ['multiples', 'factors', 'primes', 'equality', 'inequality']) {
  const rule = MathEngine.createLevelRule(mode, 3, 'classic');
  for (let i = 0; i < 30; i++) {
    const single = MathEngine.generateSingleCell(rule, 0.5);
    const evaluated = evalDisplayExpression(single.display);
    assert.strictEqual(evaluated, single.numericValue);
    assert.strictEqual(single.isValid, refCheckValid(rule, evaluated));
  }
}

console.log(`Checked ${boardsChecked} boards, ${cellsChecked} cells, ${mistakeExplanationsChecked} explanations.`);
console.log('ALL MATH ENGINE CHECKS PASSED');
