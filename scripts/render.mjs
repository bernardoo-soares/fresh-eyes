#!/usr/bin/env node
// Render a page the way a person will see it, then measure what a script can see.
//   node <skill>/scripts/render.mjs <page.html | url> [--out <dir>] [--theme-mode auto|media|class]
//        [--storage-state <file>] [--ready <selector>] [--allow-redirect]
// Writes to --out (default: ./render/<page name>/):
//   <name>-<variant>.png        full page, for desktop-light, desktop-dark, phone-light, phone-dark
//   <name>-<variant>-first.png  the first screen only, what a person sees before scrolling
//   metrics.json                every measurement
// and prints a short list of problems in plain words, then what a script could not decide ("check by eye"). An empty
// list means the floor and the tells are clean, not that the design is good: look at the screenshots.
// Exit codes: 0 rendered (read the problems); 1 the page could not be rendered or measured (the message says why);
// 2 wrong arguments; 3 the packages or Chromium are missing (the message gives the commands to run).
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { EXIT, INSTALL_PACKAGES, SKILL_DIR, SetupError, UsageError, exitWith, isMain, parseArgs } from './lib/cli.mjs';
import { THEME_MODES, closePair, launchChromium, openThemePair } from './lib/browser.mjs';

const require = createRequire(import.meta.url);
const DEVICES = [{ id: 'desktop', viewport: 'desktop' }, { id: 'phone', viewport: 'mobile' }];
const THEMES = ['light', 'dark'];
// 1440x900 is the most common laptop viewport; 390x844 is a current iPhone in CSS px (scripts/lib/browser.mjs).
export const VARIANTS = DEVICES.flatMap((d) => THEMES.map((theme) => ({ id: `${d.id}-${theme}`, device: d.id, theme })));
const MIN_TARGET_PX = 24; // WCAG 2.2 SC 2.5.8
const MAX_TABS = 60; // enough for a dense toolbar plus a table header
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

let axeSource;
function axe() {
  if (axeSource) return axeSource;
  let file;
  try { file = require.resolve('axe-core/axe.min.js'); } catch { throw new SetupError('the axe-core package is not installed', [INSTALL_PACKAGES]); }
  axeSource = readFileSync(file, 'utf8');
  return axeSource;
}

// Runs in the page before the checks: what they share, on window.__render.
function installHelpers() {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const cache = new Map();
  // Any CSS colour (rgb, hsl, oklch, oklab, lab, color(display-p3 ...)) as sRGB 0-255 and alpha 0-1. The browser
  // converts it, so no colour space has its numbers read as red, green and blue.
  const rgba = (c) => {
    const k = String(c);
    if (!cache.has(k)) {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillStyle = k; // a value the canvas cannot read leaves the transparent fill
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      cache.set(k, [r, g, b, a / 255]);
    }
    return cache.get(k);
  };
  const sat = (c) => {
    const [r, g, b, a] = rgba(c);
    if (a < 0.5) return 0;
    const mx = Math.max(r, g, b) / 255;
    const mn = Math.min(r, g, b) / 255;
    return mx === 0 ? 0 : (mx - mn) / mx;
  };
  // OKLCH chroma (Ottosson's OKLab): how colourful a colour looks. HSV saturation alone calls a dark muted tint
  // (#173a2f) or a blue-tinted near-black (#111827) saturated; chroma does not.
  const chroma = (c) => {
    const lin = rgba(c).slice(0, 3).map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    const [l, m, s] = [[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566], [0.0883024619, 0.2817188376, 0.6299787005]]
      .map((row) => Math.cbrt(row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]));
    return Math.hypot(1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
  };
  // A colour that reads as a colour, not a grey or a tint: opaque, saturated and with real chroma. Every accent
  // measured for this (blue, green, teal, red, violet, orange, yellow, light and dark) has a chroma of 0.086 or more.
  const coloured = (c) => sat(c) > 0.35 && chroma(c) >= 0.06;
  const hue = (c) => {
    const [r, g, b] = rgba(c);
    const mx = Math.max(r, g, b);
    const d = mx - Math.min(r, g, b);
    if (!d) return 0;
    const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return (h * 60 + 360) % 360;
  };
  const COLOUR = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)/g;
  // What fills an element at a glance: its gradient's opaque colours averaged, or its background colour.
  const fill = (s) => {
    const stops = /gradient/.test(s.backgroundImage) ? (s.backgroundImage.match(COLOUR) ?? []).map(rgba).filter((c) => c[3] >= 0.5) : [];
    if (!stops.length) return s.backgroundColor;
    const avg = [0, 1, 2].map((i) => Math.round(stops.reduce((t, c) => t + c[i], 0) / stops.length));
    return `rgb(${avg.join(', ')})`;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0;
  };
  // A button or link that does something, not a control showing a state or a selection drawn in the accent
  // (a switch that is on, a pressed chip, the selected tab, the current page).
  const STATE = '[role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="option"], [role^="menuitem"], [aria-pressed], [aria-checked], [aria-selected], [aria-current]:not([aria-current="false"])';
  const isAction = (el) => (el.tagName === 'BUTTON' || el.tagName === 'A' || el.getAttribute('role') === 'button') && !el.matches(STATE);
  const name = (el) => (el.innerText || el.getAttribute('aria-label') || el.tagName.toLowerCase()).trim().replace(/\s+/g, ' ').slice(0, 40);
  // What a person sees before scrolling, in CSS px: the visual viewport. On a phone, innerWidth grows to the content's
  // width when the content overflows, so it is not the screen.
  const screen = () => ({ w: window.visualViewport?.width ?? window.innerWidth, h: window.visualViewport?.height ?? window.innerHeight });
  window.__render = { rgba, coloured, hue, fill, visible, isAction, name, screen, COLOUR };
}

// Runs in the page. What a person sees on the first screen, whether it fits, and the machine-made tells.
function pageFacts(minTarget) {
  const { coloured, hue, fill, visible, isAction, name, screen, COLOUR } = window.__render;
  const { w: vw, h: vh } = screen();
  // The page's layout width: what it must fit without scrolling sideways (980 on a phone without a viewport tag).
  const layoutWidth = document.documentElement.clientWidth;
  const onScreen = (r) => r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
  const interactive = [...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])')].filter(visible);
  // Filled accent buttons on the first screen, grouped by hue: buttons that share one accent fill compete; a green
  // Accept beside a red Decline, or a red destructive button beside the primary, do not.
  const HUE_TOLERANCE = 30;
  const groups = [];
  for (const el of interactive) {
    if (!isAction(el) || !onScreen(el.getBoundingClientRect())) continue;
    const f = fill(getComputedStyle(el));
    if (!coloured(f)) continue;
    const h = hue(f);
    const g = groups.find((x) => Math.min(Math.abs(x.hue - h), 360 - Math.abs(x.hue - h)) <= HUE_TOLERANCE);
    if (g) g.els.push(el); else groups.push({ hue: h, els: [el] });
  }
  const competing = groups.reduce((best, g) => (g.els.length > best.length ? g.els : best), []);
  // axe's target-size checks every widget and applies WCAG's spacing exception. What it skips is a focusable element
  // with no widget role (a span or div with tabindex), so only those are checked here, with the same exception.
  const NATIVE = 'a[href], button, input, select, textarea, summary, area, iframe, audio, video';
  const WIDGET = /^(button|checkbox|combobox|gridcell|link|menuitem|menuitemcheckbox|menuitemradio|option|radio|scrollbar|searchbox|separator|slider|spinbutton|switch|tab|textbox|treeitem)$/;
  const hiddenVisually = (el, r) => {
    const s = getComputedStyle(el);
    return r.width <= 1 || r.height <= 1 || (s.clip !== 'auto' && s.clip !== '') || /inset\(50%\)/.test(s.clipPath);
  };
  const tooSmall = (r) => r.width < minTarget || r.height < minTarget;
  const centre = (r) => [r.left + r.width / 2, r.top + r.height / 2];
  const toRect = ([x, y], r) => Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom));
  const spaced = (el, r) => interactive.every((o) => {
    if (o === el || o.contains(el) || el.contains(o)) return true;
    const ro = o.getBoundingClientRect();
    return tooSmall(ro) ? Math.hypot(centre(r)[0] - centre(ro)[0], centre(r)[1] - centre(ro)[1]) >= minTarget : toRect(centre(r), ro) >= minTarget / 2;
  });
  const small = interactive.filter((el) => {
    if (el.matches(NATIVE) || WIDGET.test(el.getAttribute('role') ?? '')) return false;
    if (getComputedStyle(el).display === 'inline') return false; // inline in text is exempt
    const r = el.getBoundingClientRect();
    return tooSmall(r) && !hiddenVisually(el, r) && !spaced(el, r);
  });
  // A coloured stripe on one edge used as an accent: a one-side border, an inset shadow on one edge,
  // or a thin bar drawn by ::before/::after.
  const stripes = [];
  for (const el of document.querySelectorAll('body *')) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    const w = { top: parseFloat(s.borderTopWidth), right: parseFloat(s.borderRightWidth), bottom: parseFloat(s.borderBottomWidth), left: parseFloat(s.borderLeftWidth) };
    for (const side of ['left', 'right']) {
      const others = Object.entries(w).filter(([k]) => k !== side).map(([, v]) => v);
      const col = s[side === 'left' ? 'borderLeftColor' : 'borderRightColor'];
      if (w[side] >= 2 && w[side] > Math.max(...others) && coloured(col)) stripes.push(`"${name(el)}" (border-${side})`);
    }
    for (const sh of s.boxShadow === 'none' ? [] : s.boxShadow.split(/,(?![^(]*\))/)) {
      if (!/inset/.test(sh)) continue;
      const color = sh.match(COLOUR)?.[0] ?? '';
      const [x = 0, y = 0, blur = 0] = (sh.replace(color, '').match(/-?[\d.]+px/g) ?? []).map(parseFloat);
      if (Math.abs(x) >= 2 && y === 0 && blur === 0 && coloured(color)) stripes.push(`"${name(el)}" (inset shadow)`);
    }
    for (const pseudo of ['::before', '::after']) {
      const p = getComputedStyle(el, pseudo);
      if (p.content === 'none' || p.position !== 'absolute') continue;
      const pw = parseFloat(p.width);
      const ph = parseFloat(p.height);
      if (pw > 0 && pw <= 6 && ph >= 12 && coloured(p.backgroundColor)) stripes.push(`"${name(el)}" (${pseudo} bar)`);
    }
  }
  // A large button that cannot be pressed when the screen opens: the main path asks for work first.
  const disabledOnArrival = [...document.querySelectorAll('button:disabled, [aria-disabled="true"]')]
    .filter((el) => visible(el) && el.getBoundingClientRect().top < vh && el.getBoundingClientRect().width >= 120)
    .map(name);
  // Labels set in capitals by styling (owner ruling 2026-11-13): written in lower case, shown in upper case.
  // Real abbreviations written in capitals (PDF, VAT) are not styled, so they are not reported.
  const capsLabels = [...document.querySelectorAll('body *')].filter((el) => {
    if (!visible(el) || getComputedStyle(el).textTransform !== 'uppercase') return false;
    const own = [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    return own.length >= 2 && own.length <= 40 && /\p{Ll}/u.test(own);
  }).map(name);
  return {
    capsLabels: [...new Set(capsLabels)],
    disabledOnArrival,
    horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - layoutWidth),
    pageHeight: document.documentElement.scrollHeight,
    layoutWidth,
    viewportMeta: Boolean(document.querySelector('meta[name="viewport" i]')),
    filledButtonsFirstScreen: competing.map(name),
    smallTargets: small.map(name),
    sideStripes: [...new Set(stripes)],
    emDashes: (document.body.innerText.match(/\u2014/g) ?? []).length,
  };
}

// Runs in the page. The current template's devices (references/modern.md), each kept narrow so that what
// loved products do (short tracked section labels, one card around a list, a wide tab bar) is not reported.
function templateFacts() {
  const { rgba, coloured, fill, visible, isAction, screen } = window.__render;
  const { w: vw, h: vh } = screen();
  const differ = (a, b) => rgba(a).slice(0, 3).reduce((d, v, i) => d + Math.abs(v - rgba(b)[i]), 0) > 90;
  const text = (el) => (el.innerText || '').trim().replace(/\s+/g, ' ');
  const short = (el) => text(el).slice(0, 40);
  const all = [...document.querySelectorAll('body *')].filter(visible);
  const isMono = (s) => /mono|courier|consolas|menlo/i.test(s.fontFamily);
  const isPill = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const filled = rgba(s.backgroundColor)[3] > 0.05 || parseFloat(s.borderTopWidth) > 0;
    return filled && parseFloat(s.borderTopLeftRadius) >= r.height / 2 - 1 && r.width > r.height * 2;
  };

  const eyebrowPills = [];
  const twoColourHeadlines = [];
  const centredParagraphs = [];
  const decorative = [];
  for (const el of all) {
    const s = getComputedStyle(el);
    const t = text(el);
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (own && t.length >= 3 && t.length <= 60 && /[A-Z]/.test(t) && (s.textTransform === 'uppercase' || t === t.toUpperCase())) {
      const tracked = parseFloat(s.letterSpacing) >= 0.08 * parseFloat(s.fontSize);
      // A phrase, not a code: monospace order numbers and IDs are legitimate.
      const phrase = t.split(' ').length >= 2;
      if ((isMono(s) && phrase) || (tracked && (isPill(el) || (el.parentElement && isPill(el.parentElement))))) eyebrowPills.push(short(el));
    }
    // A display headline whose punchline (words, not a count badge) is in another colour or decorated.
    if (parseFloat(s.fontSize) >= 28 && t.length > 10) {
      for (const child of el.querySelectorAll('*')) {
        const c = getComputedStyle(child);
        const words = text(child).split(' ').filter((w) => /\p{L}/u.test(w)).length >= 2;
        const accent = differ(c.color, s.color) && coloured(c.color);
        const decorated = /underline/.test(c.textDecorationLine) || c.backgroundClip === 'text' || c.webkitBackgroundClip === 'text';
        if (words && (accent || decorated)) { twoColourHeadlines.push(short(el)); break; }
      }
    }
    if (own && s.textAlign === 'center' && t.length > 80 && parseFloat(s.fontSize) <= 20) {
      const lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.4;
      if (el.getBoundingClientRect().height / lh >= 3) centredParagraphs.push(short(el));
    }
    const r = el.getBoundingClientRect();
    const blur = parseFloat((s.filter.match(/blur\(([\d.]+)px\)/) ?? [])[1] ?? 0);
    if (blur >= 24 && r.width >= 100) decorative.push(`blurred glow (${Math.round(blur)}px)`);
    const tile = (s.backgroundSize.match(/[\d.]+px/g) ?? []).map(parseFloat);
    if (/gradient/.test(s.backgroundImage) && tile.length && Math.max(...tile) <= 80 && !/no-repeat/.test(s.backgroundRepeat)) decorative.push('repeating grid background');
  }

  const floatingBubbles = all.filter((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.position === 'fixed' && r.width <= 96 && Math.abs(r.width - r.height) <= 8
      && parseFloat(s.borderTopLeftRadius) >= r.width / 2 - 2 && r.left > vw * 0.6;
  }).map((el) => el.getAttribute('aria-label') || short(el) || 'round fixed button');

  // The same filled call to action twice on one screen (references/modern.md): two copies less than a viewport height
  // apart. Offering it again after the price, further down, is what references/landing.md asks for, and copies side
  // by side on one row (one "Choose plan" per plan card) are peers, not a repeat.
  const byLabel = {};
  for (const el of all) {
    if (!isAction(el) || !coloured(fill(getComputedStyle(el)))) continue;
    const key = text(el).toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').trim();
    const r = el.getBoundingClientRect();
    if (key) (byLabel[key] ??= []).push({ top: r.top + window.scrollY, bottom: r.bottom + window.scrollY });
  }
  const sameRow = (a, b) => a.top < b.bottom && b.top < a.bottom;
  const repeatedCtas = Object.entries(byLabel).flatMap(([k, at]) => {
    const n = at.filter((a) => at.some((b) => b !== a && Math.abs(a.top - b.top) < vh && !sameRow(a, b))).length;
    return n > 1 ? [`"${k}" ${n} times`] : [];
  });

  const skip = /^(BUTTON|A|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY)$/;
  const boxed = (el) => {
    if (skip.test(el.tagName) || el.getAttribute('role') === 'button') return false;
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (r.width < 120 || r.height < 48 || parseFloat(s.borderTopLeftRadius) < 4) return false;
    const bordered = ['Top', 'Right', 'Bottom', 'Left'].every((k) => parseFloat(s[`border${k}Width`]) >= 1 && rgba(s[`border${k}Color`])[3] > 0.1);
    return bordered || s.boxShadow !== 'none';
  };
  const nestedBoxes = all.filter(boxed).filter((el) => {
    let depth = 0;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) if (boxed(p)) depth++;
    return depth >= 2;
  }).map(short);

  const uniq = (a) => [...new Set(a)];
  return {
    eyebrowPills: uniq(eyebrowPills), twoColourHeadlines: uniq(twoColourHeadlines), floatingBubbles: uniq(floatingBubbles),
    repeatedCtas, centredParagraphs: uniq(centredParagraphs), nestedBoxes: uniq(nestedBoxes), decorative: uniq(decorative),
  };
}

// axe-core through evaluate, which the page's Content-Security-Policy does not block (an injected <script> it would).
async function runAxe(page) {
  await page.evaluate(axe());
  return page.evaluate(async (tags) => {
    const r = await window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
    const brief = (x) => ({ id: x.id, impact: x.impact, help: x.help, nodes: x.nodes.length, first: x.nodes[0]?.target?.[0] ?? null, why: x.nodes[0]?.any?.[0]?.data?.messageKey ?? null });
    return { violations: r.violations.map(brief), incomplete: r.incomplete.map(brief) };
  }, AXE_TAGS);
}

// Waits until a focus change has finished drawing: two frames, then every finite transition or animation, so a skip
// link that slides in is measured where it lands. Capped at 1 s, so endless spinners do not stall the walk.
const settle = (page) => page.evaluate(() => new Promise((done) => {
  setTimeout(done, 1000);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const finite = document.getAnimations().filter((a) => Number.isFinite(a.effect?.getComputedTiming().endTime));
    // `finished` rejects when an animation is cancelled; a cancelled animation has stopped drawing too.
    Promise.all(finite.map((a) => a.finished.catch(() => null))).then(done);
  }));
}));

// Tabs through the page and compares each control focused and blurred, pixel for pixel. Identity is the element
// itself, so a list of look-alike rows does not end the walk at its second row.
async function walkFocus(page) {
  // Caret blink and smooth scrolling would change pixels between the two shots. A constructed stylesheet is not
  // blocked by the page's Content-Security-Policy, unlike an injected <style>.
  await page.evaluate(() => {
    const s = new CSSStyleSheet();
    s.replaceSync('* { caret-color: transparent !important; } html, * { scroll-behavior: auto !important; }');
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, s];
  });
  const vp = page.viewportSize();
  const missing = [];
  const offscreen = [];
  for (let i = 0; i < MAX_TABS; i++) {
    await page.keyboard.press('Tab');
    await settle(page);
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const seen = (window.__renderFocusSeen ??= new WeakSet());
      if (seen.has(el)) return { again: true };
      seen.add(el);
      el.setAttribute('data-render-focus', '1');
      const r = el.getBoundingClientRect();
      // Transparent itself or inside something transparent (a toast at opacity 0): focus lands on what nobody sees.
      const hidden = el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true, checkOpacity: true, checkVisibilityCSS: true }) === false;
      return { label: (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40), x: r.x, y: r.y, w: r.width, h: r.height, hidden };
    });
    if (!info || info.again) break;
    const pad = 8;
    const x0 = Math.max(0, info.x - pad);
    const y0 = Math.max(0, info.y - pad);
    const x1 = Math.min(vp.width, info.x + info.w + pad);
    const y1 = Math.min(vp.height, info.y + info.h + pad);
    if (info.w < 1 || info.h < 1 || info.x >= vp.width || info.y >= vp.height || info.x + info.w <= 0 || info.y + info.h <= 0) {
      // Focus landed where nobody can see it: a closed drawer moved off the edge, a collapsed panel.
      offscreen.push(info.label);
      await page.evaluate(() => document.querySelector('[data-render-focus]')?.removeAttribute('data-render-focus'));
      continue;
    }
    const clip = { x: x0, y: y0, width: x1 - x0, height: y1 - y0 };
    const focused = await page.screenshot({ clip });
    await page.evaluate(() => document.activeElement?.blur());
    await settle(page);
    const blurred = await page.screenshot({ clip });
    await page.evaluate(() => { const el = document.querySelector('[data-render-focus]'); el?.focus({ preventScroll: true }); el?.removeAttribute('data-render-focus'); });
    // A transparent control whose focus shows nowhere is unseen (a faded toast's button); one that shows its ring on
    // a visible neighbour (the radio of a segmented control) changes pixels and passes.
    if (focused.equals(blurred)) (info.hidden ? offscreen : missing).push(info.label);
  }
  return { missing, offscreen };
}

async function measure(opened, { id, outDir, base, focus }) {
  const { page } = opened;
  writeFileSync(path.join(outDir, `${base}-${id}.png`), opened.fullPage);
  await page.screenshot({ path: path.join(outDir, `${base}-${id}-first.png`) });
  await page.evaluate(installHelpers);
  const facts = await page.evaluate(pageFacts, MIN_TARGET_PX);
  facts.template = await page.evaluate(templateFacts);
  const { violations, incomplete } = await runAxe(page);
  const walked = focus ? await walkFocus(page) : null;
  return {
    ...facts, axe: violations, axeIncomplete: incomplete,
    ...(walked ? { noFocusRing: walked.missing, offscreenFocus: walked.offscreen } : {}),
    externalRequests: [...new Set(opened.external)], pageErrors: [...opened.errors],
  };
}

// A folder- and file-safe name for a page: the file name without .html, or the last segment of a URL's path,
// never its host, port or query.
export function pageName(input) {
  const raw = /^https?:\/\//.test(input) ? (new URL(input).pathname.split('/').filter(Boolean).pop() ?? '') : path.basename(input);
  return raw.replace(/\.html?$/i, '').replace(/[^\p{L}\p{N}_.-]+/gu, '-').replace(/^[-.]+|[-.]+$/g, '') || 'page';
}

// Renders one page in every variant into outDir; returns the metrics. Shared with evals/render-outputs.mjs.
// opts: { themeMode: 'auto' | 'media' | 'class', storageState, ready, allowRedirect }.
export async function renderPage(browser, input, outDir, opts = {}) {
  const isUrl = /^https?:\/\//.test(input);
  const url = isUrl ? input : pathToFileURL(path.resolve(input)).href;
  const base = pageName(input);
  mkdirSync(outDir, { recursive: true });
  const result = { page: input, theme: { asked: opts.themeMode ?? 'auto' }, variants: {} };
  let themeMode = result.theme.asked;
  for (const device of DEVICES) {
    const pair = await openThemePair(browser, { url, viewport: device.viewport, themeMode, storageState: opts.storageState, ready: opts.ready, allowRedirect: opts.allowRedirect });
    if (!pair.ok) throw new Error(`${input}: ${pair.reason}`);
    if (device.id === 'desktop') {
      // Decided once, on desktop: the phone is switched the same way.
      themeMode = pair.themeMode;
      Object.assign(result.theme, { used: pair.themeMode, identical: pair.identical });
    }
    try {
      for (const theme of THEMES) {
        const id = `${device.id}-${theme}`;
        // Keyboard focus is walked on desktop, in light and in dark: a ring can vanish on one theme only.
        result.variants[id] = await measure(pair[theme], { id, outDir, base, focus: device.id === 'desktop' });
      }
    } finally {
      await closePair(pair);
    }
  }
  return result;
}

// Where a finding occurs, in words: "in every variant", "on the phone", "in dark", or the variants by name.
function where(ids, all) {
  const has = (list) => list.length === ids.length && list.every((x) => ids.includes(x));
  if (has(all)) return 'in every variant';
  if (has(['desktop-light', 'desktop-dark'])) return 'on desktop';
  if (has(['phone-light', 'phone-dark'])) return 'on the phone';
  if (has(['desktop-light', 'phone-light'])) return 'in light';
  if (has(['desktop-dark', 'phone-dark'])) return 'in dark';
  return `in ${ids.join(', ')}`;
}

// The checks that read one screen, as [kind, items found in one variant].
const SCREEN_CHECKS = (m) => [
  ['compete', m.filledButtonsFirstScreen.length > 1 ? [JSON.stringify(m.filledButtonsFirstScreen)] : []],
  ['stripe', m.sideStripes],
  ['disabled', m.disabledOnArrival ?? []],
  ['emDash', m.emDashes ? [String(m.emDashes)] : []],
  ['caps', m.capsLabels ?? []],
  ...Object.entries(m.template ?? {}).map(([k, v]) => [`template.${k}`, v]),
];
const TEMPLATE = {
  eyebrowPills: 'monospace or spaced-capitals pill labels', twoColourHeadlines: 'headline split into two colours',
  floatingBubbles: 'floating round button over the content', repeatedCtas: 'the same filled call to action more than once',
  centredParagraphs: 'centred paragraph of three or more lines', nestedBoxes: 'box inside a box inside a box', decorative: 'decorative background',
};
// One line per kind and place, in plain words.
function say(kind, items, at) {
  if (kind === 'compete') return items.map((json) => { const names = JSON.parse(json); return `first screen: ${names.length} filled accent buttons compete (${names.join(', ')}), ${at}`; });
  if (kind === 'stripe') return [`tell: coloured edge stripe on ${items.join(', ')}, ${at}`];
  if (kind === 'disabled') return [`first screen: a main button is disabled when the screen opens (${items.join(', ')}), ${at}; give the screen an action that works now`];
  if (kind === 'emDash') return items.map((n) => `tell: ${n} em dash${Number(n) > 1 ? 'es' : ''} in the copy, ${at}`);
  if (kind === 'caps') return [`tell: labels set in capitals (write them in sentence case): ${items.slice(0, 5).join(', ')}, ${at}`];
  return [`template: ${TEMPLATE[kind.slice('template.'.length)]}: ${items.slice(0, 3).join('; ')}, ${at}`];
}

// The metrics as a short list of problems in plain words, for the model to act on.
export function problems(result) {
  const out = [];
  const ids = Object.keys(result.variants);
  for (const [id, m] of Object.entries(result.variants)) {
    for (const a of m.axe) out.push(`${id}: ${a.help} (${a.id}, ${a.nodes} element${a.nodes > 1 ? 's' : ''}, e.g. ${a.first})`);
    if (m.horizontalOverflowPx) out.push(`${id}: the page scrolls sideways by ${m.horizontalOverflowPx}px`);
    if (m.smallTargets.length) out.push(`${id}: ${m.smallTargets.length} focusable element${m.smallTargets.length > 1 ? 's' : ''} smaller than 24px with too little space around ${m.smallTargets.length > 1 ? 'them' : 'it'}: ${m.smallTargets.slice(0, 5).join(', ')}`);
    if (m.noFocusRing?.length) out.push(`${id}: no visible focus on ${m.noFocusRing.slice(0, 5).join(', ')}`);
    if (m.offscreenFocus?.length) out.push(`${id}: keyboard focus lands on controls that are off-screen or hidden (${m.offscreenFocus.slice(0, 5).join(', ')}); take closed panels out of the tab order (display: none or inert), or show the focus on the visible part of a custom control`);
    if (m.externalRequests.length) out.push(`${id}: ${m.externalRequests.length} external requests, e.g. ${m.externalRequests[0]}`);
    if (m.pageErrors.length) out.push(`${id}: script error: ${m.pageErrors[0]}`);
  }
  if (result.theme?.identical) {
    out.push(result.theme.used === 'media'
      ? 'light and dark look identical: the page may have no dark theme, or switches it another way (pass --theme-mode class, or leave --theme-mode out to try both)'
      : 'light and dark look identical, with the colour-scheme setting and with a dark class on <html>: the page may have no dark theme, or switches it another way');
  }
  if (Object.entries(result.variants).some(([id, m]) => id.startsWith('phone') && m.viewportMeta === false)) {
    out.push('phone: no viewport meta tag: phones will show the desktop layout zoomed out; add <meta name="viewport" content="width=device-width, initial-scale=1">');
  }
  // Each finding once, naming the variants where it occurs; findings in the same variants share a line.
  const found = new Map();
  for (const [id, m] of Object.entries(result.variants)) {
    for (const [kind, items] of SCREEN_CHECKS(m)) {
      for (const item of items) {
        const k = `${kind}\n${item}`;
        if (!found.has(k)) found.set(k, { kind, item, at: [] });
        found.get(k).at.push(id);
      }
    }
  }
  const lines = new Map();
  for (const { kind, item, at } of found.values()) {
    const k = `${kind}\n${where(at, ids)}`;
    if (!lines.has(k)) lines.set(k, { kind, at: where(at, ids), items: [] });
    lines.get(k).items.push(item);
  }
  for (const { kind, at, items } of lines.values()) out.push(...say(kind, items, at));
  return [...new Set(out)];
}

// What axe could not decide (text on a gradient or an image, a target partly covered): not counted as problems,
// listed so a person checks them on the screenshots.
const WHY = {
  bgImage: 'text over an image', bgGradient: 'text over a gradient', bgOverlap: 'text under another element', fgAlpha: 'translucent text',
  elmPartiallyObscured: 'text partly covered', pseudoContent: 'a pseudo-element behind the text', partiallyObscured: 'a target partly covered',
  partiallyObscuredNonTabbable: 'a target partly covered', contentOverflow: 'content spills out of the target',
};
export function checkByEye(result) {
  const out = [];
  for (const [id, m] of Object.entries(result.variants)) {
    for (const a of m.axeIncomplete ?? []) out.push(`${id}: ${a.help} (${a.id}, ${a.nodes} element${a.nodes > 1 ? 's' : ''}, e.g. ${a.first}${WHY[a.why] ? `; ${WHY[a.why]}` : ''})`);
  }
  return out;
}

const HELP = `Render a page as a person sees it (desktop and phone, light and dark) and list what a script can measure.

Usage: node "${path.join(SKILL_DIR, 'scripts', 'render.mjs')}" <page.html | url> [options]

  --out <dir>             where the screenshots and metrics.json go (default: ./render/<page name>)
  --theme-mode <mode>     how dark mode is switched on: auto (default; the colour-scheme setting, then a dark class on <html> if that changed nothing), media or class
  --storage-state <file>  a Playwright storage state file (cookies, local storage) for a page behind a sign-in
  --ready <selector>      wait until this element is visible before measuring
  --allow-redirect        measure the page a URL lands on even when it redirected somewhere else
  -h, --help              show this help

Exit codes: 0 rendered (read the problems), 1 the page could not be rendered or measured, 2 wrong arguments, 3 packages or Chromium missing.`;

async function main() {
  const args = parseArgs(process.argv.slice(2), { values: ['--out', '--theme-mode', '--storage-state', '--ready'], switches: ['--allow-redirect'] });
  if (args.help) { console.log(HELP); return EXIT.ok; }
  const [input, extra] = args._;
  if (!input) throw new UsageError('give a page to render: an HTML file or an http(s) URL');
  if (extra) throw new UsageError(`unexpected argument "${extra}"`);
  const isUrl = /^https?:\/\//.test(input);
  if (!isUrl && !existsSync(input)) throw new UsageError(`no such file: ${path.resolve(input)}`);
  const themeMode = args['--theme-mode'] ?? 'auto';
  if (!THEME_MODES.includes(themeMode)) throw new UsageError(`--theme-mode is ${THEME_MODES.join(', ')}, not "${themeMode}"`);
  const storageState = args['--storage-state'];
  if (storageState && !existsSync(storageState)) throw new UsageError(`no such file: ${path.resolve(storageState)}`);
  const outDir = args['--out'] ?? path.join('render', pageName(input));
  const browser = await launchChromium();
  try {
    const result = await renderPage(browser, input, outDir, { themeMode, storageState, ready: args['--ready'], allowRedirect: Boolean(args['--allow-redirect']) });
    writeFileSync(path.join(outDir, 'metrics.json'), JSON.stringify(result, null, 2) + '\n');
    const list = problems(result);
    const eye = checkByEye(result);
    console.log(`Screenshots and metrics in ${outDir}`);
    console.log(list.length ? list.map((p) => `- ${p}`).join('\n') : '- nothing measured is wrong (now look at the screenshots)');
    if (eye.length) console.log(`Check by eye (a script could not decide these; look at the screenshots):\n${eye.map((p) => `- ${p}`).join('\n')}`);
    return EXIT.ok;
  } finally {
    await browser.close();
  }
}

if (isMain(import.meta.url)) {
  try { process.exitCode = await main(); } catch (e) { exitWith(e, 'render.mjs'); }
}
