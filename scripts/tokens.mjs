#!/usr/bin/env node
// Generates a semantic token system from one accent colour. The colours are modelled on Apple's system colours; the
// type, spacing, radius and motion follow the starting values in references/craft.md. Every text and control pair
// is checked against WCAG 2.2 in light, dark and increased contrast, and adjusted until it passes.
//   node <skill>/scripts/tokens.mjs --accent '#0b7a75' [--accent-dark '#4fd1c5'] --out <dir>
// Writes tokens.css, tailwind.preset.cjs (Tailwind v3), tailwind.theme.css (Tailwind v4) and tokens.json.
// Exit codes: 0 written and every pair passes; 1 the script failed; 2 wrong arguments; 4 written, but some pairs fail
// contrast (each is printed). The last line printed says what to do.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { adjustToContrast, contrastRatio, toHex, parseColor } from './lib/color.mjs';
import { EXIT, SKILL_DIR, UsageError, exitWith, isMain, parseArgs } from './lib/cli.mjs';

// Apple HIG Color, iOS system and label colours. Label alphas are Apple's; the script solidifies and darkens them
// where they fail WCAG, which Apple's secondary label does for body text. Dark follows references/craft.md: a dim
// base (#121212, not pure black), raised surfaces lighter than it, and off-white text.
const APPLE = {
  light: { background: '#ffffff', surface: '#f2f2f7', elevated: '#ffffff', label: '#000000', 'label-secondary': 'rgba(60,60,67,0.6)', 'label-disabled': 'rgba(60,60,67,0.3)', separator: 'rgba(60,60,67,0.29)', destructive: '#ff3b30', success: '#34c759', warning: '#ff9500' },
  dark: { background: '#121212', surface: '#1c1c1e', elevated: '#2c2c2e', label: '#f5f5f7', 'label-secondary': 'rgba(235,235,245,0.6)', 'label-disabled': 'rgba(235,235,245,0.3)', separator: 'rgba(84,84,88,0.65)', destructive: '#ff453a', success: '#30d158', warning: '#ff9f0a' },
};
// WCAG 2.2: 1.4.3 text 4.5:1 (AA), 1.4.6 text 7:1 (AAA, used for increased contrast), 1.4.11 non-text 3:1.
const TEXT_AA = 4.5; const TEXT_IC = 7; const NON_TEXT = 3;
const BACKGROUNDS = ['background', 'surface', 'elevated'];

// references/craft.md, Starting values. Six text styles by role: [size in px, unitless line height, weight].
// Nothing is set below 12 px; sizes are emitted in rem so text follows the browser's font size.
const TYPE = { caption: [12, 1.35, 400], small: [14, 1.45, 400], body: [16, 1.5, 400], heading: [22, 1.25, 600], title: [28, 1.2, 600], display: [36, 1.15, 600] };
// A 4 px based scale, the gap between groups about double the gap within one.
const SPACE = [4, 8, 12, 16, 24, 32, 48, 64];
// Controls md, containers lg; full for chips and pills.
const RADIUS = { sm: 4, md: 6, lg: 10, full: 9999 };
// Feedback fast, menus base, dialogs slow; ease-out with no overshoot. `distance` is how far an entering element
// slides (a menu, a toast).
const MOTION = { fast: 120, base: 200, slow: 280, ease: 'cubic-bezier(0.2, 0, 0, 1)', distance: 8 };
// Reduced motion means gentler, not zero (craft.md): movement goes, short fades stay, so loaders keep running.
const REDUCED_MAX_MS = 120;
// Glass chrome for navigation only (Apple Materials); 72% opacity and 20 px blur keep labels legible over content.
const MATERIALS = { 'chrome-opacity': 0.72, 'chrome-blur': 20 };

function solid(color, bg) { const c = parseColor(color); return toHex({ r: c.r * c.a + parseColor(bg).r * (1 - c.a), g: c.g * c.a + parseColor(bg).g * (1 - c.a), b: c.b * c.a + parseColor(bg).b * (1 - c.a) }); }

function againstAll(color, mode, target) {
  let c = color;
  for (let pass = 0; pass < 3; pass++) for (const bg of BACKGROUNDS) if (contrastRatio(c, mode[bg]) < target) c = adjustToContrast(c, mode[bg], target);
  return c;
}

function onFill(fill, target) {
  if (contrastRatio('#ffffff', fill) >= target) return { fill, on: '#ffffff' };
  if (contrastRatio('#000000', fill) >= target) return { fill, on: '#000000' };
  return { fill: adjustToContrast(fill, '#ffffff', target), on: '#ffffff' };
}

function buildMode(base, accent, text) {
  const m = { ...base };
  m['label-secondary'] = againstAll(solid(base['label-secondary'], base.background), m, text);
  m['label-disabled'] = solid(base['label-disabled'], base.background); // below 4.5:1 on purpose: WCAG 1.4.3 exempts inactive controls
  m.separator = solid(base.separator, base.background);
  const a = onFill(accent, text); m.accent = a.fill; m['on-accent'] = a.on;
  m['accent-text'] = againstAll(accent, m, text);
  const d = onFill(base.destructive, text); m.destructive = d.fill; m['on-destructive'] = d.on;
  m['destructive-text'] = againstAll(base.destructive, m, text);
  m['success-text'] = againstAll(base.success, m, text);
  m['warning-text'] = againstAll(base.warning, m, text);
  m['focus-ring'] = againstAll(accent, m, NON_TEXT);
  // Borders of inputs and other controls (WCAG 1.4.11 needs 3:1); separator stays decorative.
  m['control-border'] = againstAll(solid(base.separator, base.background), m, NON_TEXT);
  return m;
}

export function buildTokens({ accent, accentDark }) {
  parseColor(accent);
  const darkAccent = accentDark ?? adjustToContrast(accent, APPLE.dark.background, TEXT_AA);
  const modes = {
    light: buildMode(APPLE.light, accent, TEXT_AA),
    dark: buildMode(APPLE.dark, darkAccent, TEXT_AA),
    'light-ic': buildMode(APPLE.light, accent, TEXT_IC),
    'dark-ic': buildMode(APPLE.dark, darkAccent, TEXT_IC),
  };
  const checks = [];
  for (const [mode, m] of Object.entries(modes)) {
    const text = mode.endsWith('-ic') ? TEXT_IC : TEXT_AA;
    for (const fg of ['label', 'label-secondary', 'accent-text', 'destructive-text', 'success-text', 'warning-text']) for (const bg of BACKGROUNDS) checks.push({ mode, fg, bg, ratio: contrastRatio(m[fg], m[bg]), required: text });
    checks.push({ mode, fg: 'on-accent', bg: 'accent', ratio: contrastRatio(m['on-accent'], m.accent), required: text });
    checks.push({ mode, fg: 'on-destructive', bg: 'destructive', ratio: contrastRatio(m['on-destructive'], m.destructive), required: text });
    for (const bg of BACKGROUNDS) checks.push({ mode, fg: 'focus-ring', bg, ratio: contrastRatio(m['focus-ring'], m[bg]), required: NON_TEXT });
    for (const bg of BACKGROUNDS) checks.push({ mode, fg: 'control-border', bg, ratio: contrastRatio(m['control-border'], m[bg]), required: NON_TEXT });
  }
  for (const c of checks) c.pass = c.ratio >= c.required;
  return { accent, modes, checks, type: { ...TYPE }, space: [...SPACE], radius: { ...RADIUS }, motion: { ...MOTION }, materials: { ...MATERIALS } };
}

// Roles that are not checked as text, and what they are for, so nobody uses them for reading.
const NOTES = {
  'label-disabled': 'disabled controls only: below 4.5:1 on purpose (WCAG 1.4.3 exempts inactive controls)',
  separator: 'decorative lines only; borders of inputs and controls use control-border',
};
const note = (k) => (NOTES[k] ? ` /* ${NOTES[k]} */` : '');
const vars = (m) => Object.entries(m).map(([k, v]) => `  --color-${k}: ${v};${note(k)}`).join('\n');
const rem = (px) => `${+(px / 16).toFixed(4)}rem`;
// Spacing steps are named by px / 4, as Tailwind numbers them: --space-6 is 24 px.
const spaceName = (px) => `--space-${px / 4}`;
const durations = (m, cap = Infinity) => ['fast', 'base', 'slow'].map((k) => `--duration-${k}: ${Math.min(m[k], cap)}ms;`);

export function renderCss(t) {
  const shared = [
    ...Object.entries(t.type).flatMap(([k, [size, lh, w]]) => [`  --text-${k}: ${rem(size)};`, `  --leading-${k}: ${lh};`, `  --weight-${k}: ${w};`]),
    ...t.space.map((v) => `  ${spaceName(v)}: ${rem(v)};`),
    ...Object.entries(t.radius).map(([k, v]) => `  --radius-${k}: ${v}px;`),
    ...durations(t.motion).map((d) => `  ${d}`), `  --ease-standard: ${t.motion.ease};`, `  --motion-distance: ${t.motion.distance}px;`,
    `  --chrome-bg: color-mix(in srgb, var(--color-background) ${t.materials['chrome-opacity'] * 100}%, transparent);`, `  --chrome-blur: ${t.materials['chrome-blur']}px;`,
  ].join('\n');
  return `/* Generated by fresh-eyes/scripts/tokens.mjs. Edit the input, not this file. */
:root {
${vars(t.modes.light)}
${shared}
  color-scheme: light;
}
/* :not(.light) also guards the OS-dark case: next-themes (attribute="class") sets class="light"/"dark" on <html>
   without touching data-theme, so a forced Light theme must not fall through to the OS-dark palette below. */
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]):not(.light) {
${vars(t.modes.dark)}
  color-scheme: dark;
} }
:root[data-theme="dark"], .dark {
${vars(t.modes.dark)}
  color-scheme: dark;
}
@media (prefers-contrast: more) {
  :root {
${vars(t.modes['light-ic'])}
  }
  :root[data-theme="dark"], .dark {
${vars(t.modes['dark-ic'])}
  color-scheme: dark;
  }
}
@media (prefers-contrast: more) and (prefers-color-scheme: dark) { :root:not([data-theme="light"]):not(.light) {
${vars(t.modes['dark-ic'])}
  color-scheme: dark;
} }
/* Gentler, not zero: slides and scales lose their distance, fades stay short so spinners and progress still show. */
@media (prefers-reduced-motion: reduce) { :root { ${durations(t.motion, REDUCED_MAX_MS).join(' ')} --motion-distance: 0px; } }
@media (prefers-reduced-transparency: reduce) { :root { --chrome-bg: var(--color-background); --chrome-blur: 0px; } }
`;
}

const roles = (t) => Object.keys(t.modes.light);

const key = (r) => (/^[a-z]+$/.test(r) ? r : `'${r}'`);

export function renderTailwindV3(t) {
  const colors = roles(t).map((r) => `      ${key(r)}: 'var(--color-${r})',`).join('\n');
  const fontSize = Object.keys(t.type).map((k) => `      '${k}': ['var(--text-${k})', { lineHeight: 'var(--leading-${k})', fontWeight: 'var(--weight-${k})' }],`).join('\n');
  return `// Generated by fresh-eyes/scripts/tokens.mjs. Tailwind v3 preset: add to presets: [require('./tailwind.preset.cjs')]
module.exports = { theme: { extend: {
    colors: {
${colors}
    },
    fontSize: {
${fontSize}
    },
    borderRadius: { sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', full: 'var(--radius-full)' },
    transitionDuration: { fast: 'var(--duration-fast)', DEFAULT: 'var(--duration-base)', slow: 'var(--duration-slow)' },
    transitionTimingFunction: { DEFAULT: 'var(--ease-standard)' },
} } };
`;
}

// Tailwind v4 declares the namespace with light values; tokens.css, imported after it, overrides them
// for dark and increased contrast. Import order: "tailwindcss", then "./tailwind.theme.css", then "./tokens.css".
export function renderTailwindV4(t) {
  return `/* Generated by fresh-eyes/scripts/tokens.mjs. Tailwind v4 theme. Import after "tailwindcss" and before "./tokens.css". */
@theme {
${roles(t).map((r) => `  --color-${r}: ${t.modes.light[r]};${note(r)}`).join('\n')}
${Object.entries(t.type).map(([k, [size, lh, w]]) => `  --text-${k}: ${rem(size)};\n  --text-${k}--line-height: ${lh};\n  --text-${k}--font-weight: ${w};`).join('\n')}
  --radius-sm: ${t.radius.sm}px; --radius-md: ${t.radius.md}px; --radius-lg: ${t.radius.lg}px;
  --ease-standard: ${t.motion.ease};
}
`;
}

const HELP = `Generate light, dark and increased-contrast colour tokens from one accent, with type, spacing, radius and motion.

Usage: node "${path.join(SKILL_DIR, 'scripts', 'tokens.mjs')}" --accent <colour> --out <dir> [--accent-dark <colour>]

  --accent <colour>       the brand or accent colour, as #rgb, #rrggbb, rgb() or rgba()
  --accent-dark <colour>  the accent to use in dark mode (default: the accent, lightened until it reads on dark)
  --out <dir>             where tokens.css, tailwind.preset.cjs, tailwind.theme.css and tokens.json are written
  -h, --help              show this help

Exit codes: 0 written and every pair passes, 1 the script failed, 2 wrong arguments, 4 written but some pairs fail contrast.`;

async function main() {
  const args = parseArgs(process.argv.slice(2), { values: ['--accent', '--accent-dark', '--out'] });
  if (args.help) { console.log(HELP); return EXIT.ok; }
  if (args._.length) throw new UsageError(`unexpected argument "${args._[0]}"`);
  if (!args['--accent'] || !args['--out']) throw new UsageError('--accent and --out are required');
  for (const f of ['--accent', '--accent-dark']) {
    if (args[f] === undefined) continue;
    try { parseColor(args[f]); } catch (e) { throw new UsageError(`${f}: ${e.message}`); }
  }
  const out = args['--out'];
  const t = buildTokens({ accent: args['--accent'], accentDark: args['--accent-dark'] });
  const failing = t.checks.filter((c) => !c.pass);
  for (const c of failing) console.error(`FAIL ${c.mode} ${c.fg} on ${c.bg}: ${c.ratio}:1, needs ${c.required}:1`);
  await mkdir(out, { recursive: true });
  await writeFile(path.join(out, 'tokens.css'), renderCss(t));
  await writeFile(path.join(out, 'tailwind.preset.cjs'), renderTailwindV3(t));
  await writeFile(path.join(out, 'tailwind.theme.css'), renderTailwindV4(t));
  await writeFile(path.join(out, 'tokens.json'), JSON.stringify(t, null, 2));
  console.log(`${t.checks.length} pairs checked, ${failing.length} failing, written to ${out}`);
  if (!failing.length) return EXIT.ok;
  console.error('Some pairs fail contrast: pass a different --accent (or --accent-dark), or fix those pairs by hand before using them.');
  return EXIT.contrast;
}

if (isMain(import.meta.url)) {
  try { process.exitCode = await main(); } catch (e) { exitWith(e, 'tokens.mjs'); }
}
