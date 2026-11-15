// Color math for WCAG 2.2 contrast. Relative luminance per WCAG 2.2 "relative luminance" (0.03928 threshold).
export function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) { let h = m[1]; if (h.length === 3) h = [...h].map((c) => c + c).join(''); return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 }; }
  m = s.match(/^rgba?\(([^)]+)\)$/);
  if (m) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    const shapeOk = (p.length === 3 || p.length === 4) && p.every((n) => !Number.isNaN(n));
    if (shapeOk) {
      const [r, g, b, a = 1] = p;
      if ([r, g, b].every((n) => n >= 0 && n <= 255) && a >= 0 && a <= 1) return { r, g, b, a };
    }
    // Matched rgb()/rgba() syntax but with the wrong number of parts or a value outside its channel/alpha range.
    throw new Error(`Color "${input}" is out of range. Channels are 0-255, alpha 0-1.`);
  }
  throw new Error(`Unsupported color "${input}". Use #rgb, #rrggbb, rgb() or rgba().`);
}

export const toHex = ({ r, g, b }) => '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');

const composite = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });

function luminance({ r, g, b }) {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function exactRatio(fg, bg) {
  const b = parseColor(bg);
  if (b.a < 1) throw new Error(`Background "${bg}" is translucent. Composite it onto its surface first.`);
  const [hi, lo] = [luminance(composite(parseColor(fg), b)), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Floored, never rounded: WCAG gives no rounding allowance, so 4.499 must report as failing 4.5.
export const contrastRatio = (fg, bg) => Math.floor(exactRatio(fg, bg) * 100) / 100;

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : max === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  return { h, s, l };
}

function hslToRgb({ h, s, l }) {
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q;
  const f = (t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return { r: f(h + 1 / 3) * 255, g: f(h) * 255, b: f(h - 1 / 3) * 255 };
}

// Steps lightness away from the background in 0.5% increments (fine enough to land within 0.05 of the target).
export function adjustToContrast(fg, bg, target) {
  const b = parseColor(bg);
  const start = rgbToHsl(composite(parseColor(fg), b));
  const dir = luminance(b) > 0.18 ? -1 : 1;
  for (let i = 0; i <= 200; i++) {
    const l = Math.min(1, Math.max(0, start.l + dir * i * 0.005));
    const cand = toHex(hslToRgb({ ...start, l }));
    if (exactRatio(cand, bg) >= target) return cand;
  }
  throw new Error(`Cannot reach ${target}:1 for ${fg} on ${bg}. Choose a different base color.`);
}

// ── Perceptual colour: OKLab, OKLCH, delta E and colour-vision simulation ────────────────────────────
// For chart palettes (J-CHT-08, J-ACC-04). OKLab is Björn Ottosson's published definition (2020); the
// simulation uses the Machado, Oliveira and Fernandes (2009) matrices at severity 1.0 on linear RGB.
// Linearisation here is the sRGB transfer function (0.04045 threshold), not WCAG's luminance shortcut.
const toLinear = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const fromLinear = (v) => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

export function oklab(color) {
  const { r, g, b } = parseColor(color);
  const [R, G, B] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return {
    L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s,
  };
}

export function oklch(color) {
  const { L, a, b } = oklab(color);
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return { L, C: Math.hypot(a, b), h: h < 0 ? h + 360 : h };
}

// OKLab Euclidean distance times 100: the scale the chart thresholds use (15 for normal vision, 8 under CVD).
export function deltaE(c1, c2) {
  const p = oklab(c1);
  const q = oklab(c2);
  return Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b) * 100;
}

const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};

// How a colour looks with full protanopia, deuteranopia or tritanopia, as a hex string.
export function simulateCvd(color, kind) {
  const M = CVD[kind];
  if (!M) throw new Error(`Unknown colour-vision deficiency "${kind}". Use protan, deutan or tritan.`);
  const { r, g, b } = parseColor(color);
  const lin = [r, g, b].map(toLinear);
  const out = M.map((row) => Math.min(1, Math.max(0, row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2])));
  return toHex({ r: fromLinear(out[0]), g: fromLinear(out[1]), b: fromLinear(out[2]) });
}
