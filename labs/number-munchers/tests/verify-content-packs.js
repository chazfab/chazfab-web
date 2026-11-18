'use strict';

const assert = require('assert');
const ContentPacks = require('../js/content-packs.js');

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function parseFraction(str) {
  const m = String(str).trim().match(/^(\d+)\s*\/\s*(\d+)$/);
  assert(m, `Invalid fraction token: "${str}"`);
  const num = Number(m[1]);
  const den = Number(m[2]);
  assert(den > 0, `Zero denominator in "${str}"`);
  return { num, den };
}

function evalFractionDisplay(display) {
  const s = String(display).trim();
  const expr = s.match(/^(\d+\/\d+)\s*([+-])\s*(\d+\/\d+)$/);
  if (!expr) {
    return parseFraction(s);
  }
  const left = parseFraction(expr[1]);
  const right = parseFraction(expr[3]);
  const op = expr[2];
  const rawNum = op === '+'
    ? (left.num * right.den + right.num * left.den)
    : (left.num * right.den - right.num * left.den);
  const rawDen = left.den * right.den;
  assert(rawNum > 0, `Non-positive fraction expression result in "${display}"`);
  const g = gcd(rawNum, rawDen);
  return { num: rawNum / g, den: rawDen / g };
}

function refFractionValid(rule, f) {
  switch (rule.effectiveMode) {
    case 'types':
      if (rule.subType === 'proper') return f.num > 0 && f.num < f.den;
      if (rule.subType === 'improper') return f.num >= f.den;
      if (rule.subType === 'whole') return f.num >= f.den && f.num % f.den === 0;
      return f.den > 1 && gcd(f.num, f.den) === 1;
    case 'equivalents':
    case 'expressions':
      return f.num * rule.targetDen === f.den * rule.targetNum;
    case 'comparing':
      if (rule.comparator === 'lt') return f.num * rule.targetDen < rule.targetNum * f.den;
      return f.num * rule.targetDen > rule.targetNum * f.den;
    default:
      throw new Error(`Unexpected fraction mode: ${rule.effectiveMode}`);
  }
}

// 1. Disjointness checks across Word & Trivia dictionaries
const allVowelWords = new Map();
for (const [key, pool] of Object.entries(ContentPacks.VOWEL_POOLS)) {
  for (const w of [...pool.easy, ...pool.hard]) {
    assert(!allVowelWords.has(w), `Word "${w}" appears in both "${allVowelWords.get(w)}" and "${key}"`);
    allVowelWords.set(w, key);
  }
}

const allGrammarWords = new Map();
for (const [key, pool] of Object.entries(ContentPacks.GRAMMAR_POOLS)) {
  for (const w of pool.words) {
    assert(!allGrammarWords.has(w), `Grammar word "${w}" appears in both "${allGrammarWords.get(w)}" and "${key}"`);
    allGrammarWords.set(w, key);
  }
}

for (const syn of ContentPacks.SYNONYM_SETS) {
  const validSet = new Set(syn.valid);
  for (const inv of syn.invalid) {
    assert(!validSet.has(inv), `Synonym set "${syn.banner}" has overlapping word "${inv}"`);
  }
}

for (const topics of Object.values(ContentPacks.TRIVIA_TOPICS)) {
  for (const topic of topics) {
    const validSet = new Set(topic.valid);
    for (const [invWord] of topic.invalid) {
      assert(!validSet.has(invWord), `Trivia "${topic.banner}" has overlapping item "${invWord}"`);
    }
  }
}

// 2. Generate & verify 540+ boards across word, fraction, super disks
const TIERS = ['elementary', 'classic', 'whiz'];
let boardsChecked = 0;
let cellsChecked = 0;
let explanationsChecked = 0;

for (const diskId of ['word', 'fraction', 'super']) {
  const disk = ContentPacks.DISKS[diskId];
  for (const modeObj of disk.modes) {
    for (const tier of TIERS) {
      for (let level = 1; level <= 12; level++) {
        const rule = ContentPacks.createLevelRule(diskId, modeObj.id, level, tier);
        assert(rule && rule.bannerText.length > 0, `Missing banner for ${diskId}/${modeObj.id}`);
        assert(!/[\u2212\u2260\u2014]/.test(rule.bannerText), `Unsupported pixel char in banner: ${rule.bannerText}`);

        const board = ContentPacks.generateBoard(rule, 6, 5);
        assert.strictEqual(board.length, 30, 'Board must contain 30 cells');

        let validCount = 0;
        for (const cell of board) {
          assert(cell.display && !/[\u2212\u2260\u2014]/.test(cell.display), `Bad cell display: ${cell.display}`);

          if (diskId === 'fraction') {
            const evaluated = evalFractionDisplay(cell.display);
            const expectedValid = refFractionValid(rule, evaluated);
            assert.strictEqual(
              cell.isValid,
              expectedValid,
              `Fraction mismatch ${modeObj.id}/L${level} (${rule.bannerText}) cell "${cell.display}": got ${cell.isValid}, expected ${expectedValid}`
            );
          } else if (diskId === 'word') {
            if (rule.effectiveMode === 'grammar') {
              const targetWords = new Set(ContentPacks.GRAMMAR_POOLS[rule.poolKey].words);
              assert.strictEqual(cell.isValid, targetWords.has(cell.display));
            } else if (rule.effectiveMode === 'synonyms') {
              const targetWords = new Set(ContentPacks.SYNONYM_SETS[rule.synIndex].valid);
              assert.strictEqual(cell.isValid, targetWords.has(cell.display));
            } else {
              const pool = ContentPacks.VOWEL_POOLS[rule.poolKey];
              const targetWords = new Set([...pool.easy, ...pool.hard]);
              assert.strictEqual(cell.isValid, targetWords.has(cell.display));
            }
          } else {
            const topic = ContentPacks.TRIVIA_TOPICS[rule.effectiveMode][rule.topicIndex];
            const targetItems = new Set(topic.valid);
            assert.strictEqual(cell.isValid, targetItems.has(cell.display));
          }

          if (cell.isValid) {
            validCount++;
          } else {
            const exp = ContentPacks.explainMistake(rule, cell);
            assert(typeof exp === 'string' && exp.trim().length > 6, `Missing explanation for ${cell.display}`);
            assert(!/[\u2212\u2260\u2014]/.test(exp), `Unsupported pixel char in explanation: ${exp}`);
            explanationsChecked++;
          }
          cellsChecked++;
        }

        assert(validCount >= 10 && validCount <= 16, `Valid count ${validCount} out of range for ${diskId}/${modeObj.id}`);
        boardsChecked++;
      }
    }
  }
}

// 3. Test generateSingleCell across all non-number disks
for (const diskId of ['word', 'fraction', 'super']) {
  const firstMode = ContentPacks.DISKS[diskId].modes[0].id;
  const rule = ContentPacks.createLevelRule(diskId, firstMode, 2, 'classic');
  for (let i = 0; i < 25; i++) {
    const cell = ContentPacks.generateSingleCell(rule, 0.5);
    assert(cell && typeof cell.display === 'string' && typeof cell.isValid === 'boolean');
    if (diskId === 'fraction') {
      assert.strictEqual(cell.isValid, refFractionValid(rule, evalFractionDisplay(cell.display)));
    }
  }
}

console.log(`Checked ${boardsChecked} boards, ${cellsChecked} cells, ${explanationsChecked} explanations across Word, Fraction, and Super Munchers.`);
console.log('ALL CONTENT PACK CHECKS PASSED');
