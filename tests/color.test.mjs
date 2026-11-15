import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, adjustToContrast, parseColor } from '../scripts/lib/color.mjs';

test('known WCAG ratios', () => {
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#777777', '#ffffff'), 4.47);
  assert.equal(contrastRatio('#007aff', '#ffffff'), 4.01);
});

test('translucent foreground is composited', () => {
  assert.ok(contrastRatio('rgba(60,60,67,0.6)', '#ffffff') < 4.5);
});

test('translucent background is rejected with a fix', () => {
  assert.throws(() => contrastRatio('#000', 'rgba(0,0,0,0.5)'), /Composite it onto its surface/);
});

test('adjustToContrast reaches the target in the right direction', () => {
  const light = adjustToContrast('#007aff', '#ffffff', 4.5);
  assert.ok(contrastRatio(light, '#ffffff') >= 4.5);
  const dark = adjustToContrast('#0040dd', '#000000', 4.5);
  assert.ok(contrastRatio(dark, '#000000') >= 4.5);
});

test('rejects unsupported formats', () => {
  assert.throws(() => parseColor('blue'), /Use #rgb, #rrggbb, rgb\(\) or rgba\(\)/);
});

test('parseColor rejects out-of-range rgb/rgba values', () => {
  assert.throws(() => parseColor('rgba(0,0,0,5)'), { message: 'Color "rgba(0,0,0,5)" is out of range. Channels are 0-255, alpha 0-1.' });
  assert.throws(() => parseColor('rgb(300,300,300)'), { message: 'Color "rgb(300,300,300)" is out of range. Channels are 0-255, alpha 0-1.' });
  assert.throws(() => parseColor('rgb(1,2,3,4,5)'), { message: 'Color "rgb(1,2,3,4,5)" is out of range. Channels are 0-255, alpha 0-1.' });
});
