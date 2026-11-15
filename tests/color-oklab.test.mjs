import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oklab, oklch, deltaE, simulateCvd, parseColor } from '../scripts/lib/color.mjs';

const near = (actual, expected, tol, label) => assert.ok(Math.abs(actual - expected) <= tol, `${label}: ${actual} is not within ${tol} of ${expected}`);

test('OKLab matches the published reference values', () => {
  const w = oklab('#ffffff');
  near(w.L, 1, 1e-3, 'white L'); near(w.a, 0, 1e-3, 'white a'); near(w.b, 0, 1e-3, 'white b');
  near(oklab('#000000').L, 0, 1e-6, 'black L');
  const red = oklab('#ff0000');
  near(red.L, 0.628, 1e-3, 'red L'); near(red.a, 0.2249, 1e-3, 'red a'); near(red.b, 0.1258, 1e-3, 'red b');
});

test('OKLCH gives chroma and hue in degrees', () => {
  const red = oklch('#ff0000');
  near(red.C, 0.2577, 1e-3, 'red chroma');
  near(red.h, 29.23, 0.1, 'red hue');
  near(oklch('#808080').C, 0, 1e-3, 'grey has no chroma');
});

test('delta E is the OKLab distance times 100', () => {
  assert.equal(deltaE('#3366cc', '#3366cc'), 0);
  near(deltaE('#000000', '#ffffff'), 100, 0.1, 'black to white');
});

test('colour-blindness simulation follows Machado 2009 at full severity', () => {
  // Pure red under protanopia: linear (1,0,0) maps to the first matrix column, clamped and re-encoded.
  const p = parseColor(simulateCvd('#ff0000', 'protan'));
  near(p.r, 109, 1, 'protan red r'); near(p.g, 95, 1, 'protan red g'); near(p.b, 0, 1, 'protan red b');
  // Each matrix row sums to about 1, so greys are left alone.
  for (const kind of ['protan', 'deutan', 'tritan']) {
    const g = parseColor(simulateCvd('#808080', kind));
    for (const ch of ['r', 'g', 'b']) near(g[ch], 128, 1, `${kind} grey ${ch}`);
  }
  assert.throws(() => simulateCvd('#808080', 'achromat'), /protan, deutan or tritan/);
});

test('a red and green pair collapses under deuteranopia', () => {
  const normal = deltaE('#d62728', '#2ca02c');
  const deutan = deltaE(simulateCvd('#d62728', 'deutan'), simulateCvd('#2ca02c', 'deutan'));
  assert.ok(normal > 15, `normal vision tells them apart (${normal})`);
  assert.ok(deutan < normal / 2, `deuteranopia brings them together (${deutan} vs ${normal})`);
});
