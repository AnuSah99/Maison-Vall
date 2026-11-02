import test from 'node:test';
import assert from 'node:assert/strict';
import {
  wrap,
  clamp,
  computeDepthState,
  computeCardOffset,
  KX,
  KF,
  KH,
  KB,
  KO,
} from './depthMath.js';

test('wrap function handles positive, negative, and zero values correctly', () => {
  assert.equal(wrap(0, 6), 0);
  assert.equal(wrap(1, 6), 1);
  assert.equal(wrap(6, 6), 0);
  assert.equal(wrap(7, 6), 1);
  assert.equal(wrap(-1, 6), 5);
  assert.equal(wrap(-6, 6), 0);
  assert.equal(wrap(-7, 6), 5);
});

test('clamp function correctly bounds values', () => {
  assert.equal(clamp(5, 0, 10), 5);
  assert.equal(clamp(-2, 0, 10), 0);
  assert.equal(clamp(15, 0, 10), 10);
});

test('computeDepthState at position 0 for model 0', () => {
  const W = 1000;
  const H = 800;
  const base = H * 1.2;
  const ratio = 0.5;

  // At p = 0, model 0 has d = 0, which corresponds to stop k = 1 (d = 0)
  const state = computeDepthState(0, 0, 6, W, H, ratio, base);
  assert.equal(state.d, 0);
  assert.equal(state.zIndex, 100);
  // KX[1] = 0.744, KH[1] = 0.832, KF[1] = 0.89, KB[1] = 0, KO[1] = 1
  const expectedH = KH[1] * H;
  const expectedS = expectedH / base;
  const expectedW = expectedH * ratio;
  const expectedX = KX[1] * W - expectedW / 2;
  const expectedY = KF[1] * H - expectedH;

  assert.ok(Math.abs(state.scale - expectedS) < 0.0001);
  assert.ok(Math.abs(state.x - expectedX) < 0.0001);
  assert.ok(Math.abs(state.y - expectedY) < 0.0001);
  assert.equal(state.blur, 0);
  assert.equal(state.opacity, 1);
});

test('computeDepthState for furthest model d = 5', () => {
  const W = 1000;
  const H = 800;
  const base = H * 1.2;
  const ratio = 0.5;

  // Model 5 at p = 0 has d = 5 (stop index 6)
  const state = computeDepthState(5, 0, 6, W, H, ratio, base);
  assert.equal(state.d, 5);
  assert.equal(state.zIndex, 50);
  assert.equal(state.opacity, KO[6]); // 0 opacity at the back
  assert.ok(state.blur > 10); // Haze blur
});

test('computeCardOffset wraps cards across the product rail correctly', () => {
  const cardS = 200;
  const totalCards = 12;
  const all = cardS * totalCards;

  // At p = 0, card 0 is at offset 0
  const y0 = computeCardOffset(0, 0, cardS, totalCards);
  assert.equal(y0, 0);

  // At p = 1, card 0 wraps to 2000 (all - 400)
  const y1 = computeCardOffset(0, 1, cardS, totalCards);
  assert.equal(y1, 2000);

  // Wraps around when exceeding track height
  const yWrapped = computeCardOffset(11, 0, cardS, totalCards);
  assert.ok(yWrapped <= all - cardS);
});
