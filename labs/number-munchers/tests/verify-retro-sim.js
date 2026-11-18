'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Sprites = require('../js/sprites.js');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css', 'styles.css'), 'utf8');
const gameJs = fs.readFileSync(path.join(ROOT, 'js', 'game.js'), 'utf8');

function assertPixelSprite(svg, label) {
  assert(typeof svg === 'string' && svg.includes('<svg'), `${label}: missing <svg>`);
  assert(svg.includes('shape-rendering="crispEdges"'), `${label}: missing shape-rendering="crispEdges"`);
  assert(svg.includes('<rect '), `${label}: missing <rect> pixels`);
  assert(!/<(circle|ellipse|polygon|path)\b/i.test(svg), `${label}: contains non-pixel vector primitive`);
}

// 1. Verify all pixel-matrix sprites
for (const state of ['idle', 'chomp', 'happy', 'oops', 'super']) {
  for (const frame of [0, 1]) {
    const svg = Sprites.renderMuncher(state, frame);
    assertPixelSprite(svg, `Muncher(${state},${frame})`);
    assert(svg.includes('viewBox="0 0 24 18"'), `Muncher(${state},${frame}): expected 24x18 frog viewBox`);
    const rects = [...svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="1"/g)];
    assert(rects.length > 0, `Muncher(${state},${frame}): expected <rect> elements`);
    for (const [, x, y, w] of rects) {
      assert(Number(x) + Number(w) <= 24 && Number(y) < 18, `Muncher(${state},${frame}): pixel out of 24x18 bounds`);
    }
  }
}

for (const type of ['reggie', 'bashful', 'helper', 'worker', 'smarty']) {
  for (const state of ['normal', 'frozen', 'frightened']) {
    assertPixelSprite(Sprites.renderTroggle(type, state, 0), `Troggle(${type},${state},0)`);
    assertPixelSprite(Sprites.renderTroggle(type, state, 1), `Troggle(${type},${state},1)`);
  }
}

for (const kind of ['freeze', 'pepper', 'xray', 'star']) {
  assertPixelSprite(Sprites.renderPowerUp(kind), `PowerUp(${kind})`);
}

const mascots = Sprites.renderTitleBannerMascots();
assertPixelSprite(mascots.muncherHtml, 'TitleMuncher');
assertPixelSprite(mascots.reggieHtml, 'TitleReggie');

// 2. Verify HTML structure, IDs, and native dialogs
for (const reqId of ['mainMenuBox', 'modeMenuBox', 'diskMenuBox', 'diskStrip', 'diskBtn', 'oopsOverlay', 'arcadeCabinet', 'guideDialog', 'optionsDialog', 'hallOfFameDialog', 'gameOverDialog']) {
  assert(html.includes(`id="${reqId}"`), `index.html missing id="${reqId}"`);
}
assert(html.includes('js/content-packs.js'), 'index.html must load js/content-packs.js');
assert(!/role=["']dialog["']/i.test(html), 'index.html must not contain role="dialog"');
assert(!/aria-modal=/i.test(html), 'index.html must not contain aria-modal');

// Verify every getElementById(...) in game.js exists in index.html
const idRefs = [...gameJs.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]);
assert(idRefs.length > 20, 'Expected DOM ID lookups in game.js');
for (const ref of idRefs) {
  assert(html.includes(`id="${ref}"`), `game.js references missing HTML id="${ref}"`);
}

// 3. Verify CSS monitor palettes, unobstructed actor cell alignment, and content-visibility
for (const mon of ['vga', 'apple2green', 'apple2color']) {
  assert(css.includes(`[data-monitor="${mon}"]`), `styles.css missing monitor palette "${mon}"`);
}
assert(css.includes('.board-cell.has-actor'), 'styles.css missing .board-cell.has-actor top alignment');
assert(css.includes('content-visibility: auto'), 'styles.css missing content-visibility: auto');
assert(!css.includes('880px'), 'styles.css must not cap arcade-cabinet width at 880px');
assert(css.includes('repeat(5, minmax(46px, 1fr))'), 'styles.css .board-grid must stretch row heights via 1fr');
assert(!css.includes('76px'), 'styles.css must not cap board-grid row height at 76px');
assert(gameJs.includes('contentvisibilityautostatechange'), 'game.js missing contentvisibilityautostatechange listener');

// 4. Verify pure classic default options in game.js
assert(/monitor:\s*'vga'/.test(gameJs), "game.js default monitor must be 'vga'");
assert(/deluxeExtras:\s*false/.test(gameJs), 'game.js default deluxeExtras must be false');

console.log(`Verified ${idRefs.length} DOM IDs, all pixel sprites, 3 monitor modes, and classic defaults.`);
console.log('ALL RETRO SIMULATION CHECKS PASSED');
