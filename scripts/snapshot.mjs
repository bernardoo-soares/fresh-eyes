#!/usr/bin/env node
// Freezes a rendered page into one self-contained HTML file: scripts removed, every stylesheet inlined, every image,
// font and canvas turned into a data URI, live form state written back into attributes. The result renders the same
// pixels with no app, no backend and no network, so evals and mocks can be served from a static directory.
//   node <skill>/scripts/snapshot.mjs <url> --out <dir> [--theme light|dark] [--theme-mode auto|media|class]
//        [--clock <iso>] [--storage '{"key":"value"}'] [--actions '[{"click":"<selector>"}]'] [--storage-state <file>]
//        [--ready <selector>] [--allow-redirect]
// Exit codes: 0 written; 1 the page could not be frozen (the message says why); 2 wrong arguments; 3 the packages or
// Chromium are missing (the message gives the commands to run).
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { EXIT, SKILL_DIR, UsageError, exitWith, isMain, parseArgs } from './lib/cli.mjs';
import { THEME_MODES, launchChromium, openPage, openThemePair } from './lib/browser.mjs';

// Settle after setup actions, the same budget openPage gives a fresh load.
const SETTLE_MS = 500;

async function runAction(page, action, timeout) {
  const [kind] = Object.keys(action);
  const arg = action[kind];
  try {
    if (kind === 'click') await page.locator(arg).first().click({ timeout });
    else if (kind === 'hover') await page.locator(arg).first().hover({ timeout });
    else if (kind === 'fill') await page.locator(arg[0]).first().fill(arg[1], { timeout });
    else if (kind === 'press') await page.keyboard.press(arg);
    else if (kind === 'wait') await page.waitForTimeout(arg);
    else throw new Error(`unknown action "${kind}"`);
  } catch (e) {
    throw new Error(`snapshot action ${kind} ${JSON.stringify(arg)} failed: ${e.message.split('\n')[0]}`);
  }
}

// Runs inside the page. Returns the serialized document and the URLs it could not inline.
async function freeze() {
  const unresolved = [];
  const toDataUrl = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      return await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
    } catch { unresolved.push(url); return null; }
  };
  const URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;
  const inlineUrls = async (css, base) => {
    const found = [...css.matchAll(URL_RE)].map((m) => m[2]).filter((u) => !u.startsWith('data:') && !u.startsWith('#'));
    const map = {};
    for (const u of new Set(found)) map[u] = await toDataUrl(new URL(u, base).href);
    return css.replace(URL_RE, (all, q, u) => (map[u] ? `url("${map[u]}")` : all));
  };

  // Form state lives in properties, which outerHTML does not serialize.
  for (const el of document.querySelectorAll('input')) {
    if (el.type === 'checkbox' || el.type === 'radio') el.toggleAttribute('checked', el.checked);
    else if (el.type !== 'file' && el.type !== 'password') el.setAttribute('value', el.value);
  }
  for (const el of document.querySelectorAll('textarea')) el.textContent = el.value;
  for (const el of document.querySelectorAll('option')) el.toggleAttribute('selected', el.selected);

  // A canvas is pixels drawn by script; keep the pixels.
  for (const c of document.querySelectorAll('canvas')) {
    const img = document.createElement('img');
    for (const a of c.attributes) img.setAttribute(a.name, a.value);
    try { img.setAttribute('src', c.toDataURL('image/png')); } catch { unresolved.push('canvas (tainted)'); }
    c.replaceWith(img);
  }

  for (const img of document.querySelectorAll('img[src]')) {
    img.removeAttribute('srcset'); img.removeAttribute('loading');
    const src = img.getAttribute('src');
    if (!src.startsWith('data:')) { const d = await toDataUrl(img.src); if (d) img.setAttribute('src', d); }
  }
  for (const el of document.querySelectorAll('picture source')) el.remove();
  for (const el of document.querySelectorAll('[style*="url("]')) {
    el.setAttribute('style', await inlineUrls(el.getAttribute('style'), document.baseURI));
  }
  // SVG sprites referenced by URL (<use href="/icons.svg#x">) cannot render from a data URI; inline the symbol.
  for (const use of document.querySelectorAll('use')) {
    const ref = use.getAttribute('href') || use.getAttribute('xlink:href') || '';
    if (ref && !ref.startsWith('#')) unresolved.push(ref);
  }

  // A font family declares a face per weight and unicode range, and the browser downloads only the ones the page
  // draws. Keeping just those keeps a snapshot to the few faces it shows instead of the whole family.
  // document.fonts is the primary signal: the resource timing buffer holds only 250 entries by default, and a dev
  // server's module requests push the font downloads out of it.
  const faceKey = (family, weight, style, range) => `${family.replace(/^["']|["']$/g, '')}|${weight || '400'}|${style || 'normal'}|${range || 'U+0-10FFFF'}`;
  const loadedFaces = new Set([...document.fonts].filter((f) => f.status === 'loaded').map((f) => faceKey(f.family, f.weight, f.style, f.unicodeRange)));
  const fetched = new Set(performance.getEntriesByType('resource').map((e) => e.name));
  const faceLoaded = (rule, base) => {
    const st = rule.style;
    if (loadedFaces.has(faceKey(st.getPropertyValue('font-family'), st.getPropertyValue('font-weight'), st.getPropertyValue('font-style'), st.getPropertyValue('unicode-range')))) return true;
    return [...rule.cssText.matchAll(URL_RE)].some((m) => m[2].startsWith('data:') || fetched.has(new URL(m[2], base).href));
  };

  // Every stylesheet, in document order, as one block. @import rules are expanded in place. A cross-origin sheet
  // (a web font service) hides its rules from script, so its text is fetched and parsed instead.
  const sheetText = async (sheet, base = sheet.href || document.baseURI) => {
    let rules;
    try { rules = sheet.cssRules; } catch {
      try {
        const parsed = new CSSStyleSheet();
        parsed.replaceSync(await (await fetch(sheet.href)).text());
        rules = parsed.cssRules;
      } catch { unresolved.push(sheet.href); return ''; }
    }
    let out = '';
    for (const rule of rules) {
      if (rule instanceof CSSImportRule && rule.styleSheet) out += await sheetText(rule.styleSheet);
      else if (rule instanceof CSSFontFaceRule && !faceLoaded(rule, base)) continue;
      else out += `${await inlineUrls(rule.cssText, base)}\n`;
    }
    return out;
  };
  let css = '';
  for (const sheet of document.styleSheets) css += await sheetText(sheet);
  for (const sheet of document.adoptedStyleSheets ?? []) css += await sheetText(sheet);

  // A Content-Security-Policy meta tag would block the frozen file's own inlined <style> and data URIs.
  for (const el of document.querySelectorAll('script, noscript, link, style, iframe, meta[http-equiv="Content-Security-Policy" i]')) el.remove();
  const style = document.createElement('style');
  style.setAttribute('data-snapshot', '');
  style.textContent = css;
  document.head.appendChild(style);

  // The snapshot is theme-neutral: whoever serves it picks light or dark the way the app does (a class on <html>).
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  if (!root.classList.length) root.removeAttribute('class');
  root.style.removeProperty('color-scheme');
  if (!root.getAttribute('style')) root.removeAttribute('style');
  root.removeAttribute('data-theme');

  return { html: `<!doctype html>\n${root.outerHTML}`, unresolved: [...new Set(unresolved)] };
}

// Opens the page in the asked theme. 'auto' (the default, as in render.mjs) emulates the colour-scheme setting and, when
// that changes nothing, also sets a dark class on <html>. The page's Content-Security-Policy is bypassed here: freezing
// fetches every stylesheet, image and font from inside the page, which a strict connect-src would refuse.
async function openForSnapshot(browser, { theme, themeMode, ...options }) {
  if (themeMode !== 'auto') return { opened: await openPage(browser, { ...options, theme, themeMode, bypassCSP: true }), themeMode };
  const pair = await openThemePair(browser, { ...options, themeMode, bypassCSP: true });
  if (!pair.ok) return { opened: pair, themeMode };
  await pair[theme === 'dark' ? 'light' : 'dark'].context.close();
  return { opened: pair[theme], themeMode: pair.themeMode };
}

export async function snapshot(browser, { url, out, theme = 'light', themeMode = 'auto', viewport = 'desktop', storageState, ready, clock, storage, allowRedirect = false, actions = [], actionTimeout = 10_000 }) {
  const { opened, themeMode: used } = await openForSnapshot(browser, { url, theme, viewport, themeMode, storageState, ready, clock, storage, allowRedirect });
  if (!opened.ok) throw new Error(`snapshot ${url}: ${opened.reason}`);
  const { page, context } = opened;
  try {
    for (const action of actions) await runAction(page, action, actionTimeout);
    if (actions.length) await page.waitForTimeout(SETTLE_MS);
    const { html, unresolved } = await page.evaluate(freeze);
    await mkdir(out, { recursive: true });
    const file = path.join(out, 'index.html');
    await writeFile(file, html);
    const meta = { url, landedUrl: opened.landedUrl, theme, themeMode: used, viewport, clock: clock ?? null, storage: storage ?? null, actions, unresolved };
    await writeFile(path.join(out, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`);
    return { file, meta };
  } finally {
    await context.close();
  }
}

const HELP = `Freeze a rendered page into one self-contained HTML file (no scripts, no network) for evals and mocks.

Usage: node "${path.join(SKILL_DIR, 'scripts', 'snapshot.mjs')}" <url> --out <dir> [options]

  --out <dir>             where index.html and meta.json are written (required)
  --theme <theme>         light (default) or dark
  --theme-mode <mode>     how dark mode is switched on: auto (default; the colour-scheme setting, then a dark class on <html> if that changed nothing), media or class
  --clock <iso>           freeze the date and time, e.g. 2026-09-01T09:00:00Z, so dates in the copy stay put
  --storage <json>        local storage keys set before the page loads, e.g. '{"demoState":"empty"}'
  --actions <json>        clicks, fills, key presses or waits run before freezing, e.g. '[{"click":"#open"}]'
  --storage-state <file>  a Playwright storage state file (cookies, local storage) for a page behind a sign-in
  --ready <selector>      wait until this element is visible before freezing
  --allow-redirect        freeze the page a URL lands on even when it redirected somewhere else
  -h, --help              show this help

Exit codes: 0 written, 1 the page could not be frozen, 2 wrong arguments, 3 packages or Chromium missing.`;

function json(flag, value) {
  if (value === undefined) return undefined;
  try { return JSON.parse(value); } catch { throw new UsageError(`${flag} is not valid JSON: ${value}`); }
}

async function main() {
  const args = parseArgs(process.argv.slice(2), { values: ['--out', '--theme', '--theme-mode', '--clock', '--storage', '--actions', '--storage-state', '--ready'], switches: ['--allow-redirect'] });
  if (args.help) { console.log(HELP); return EXIT.ok; }
  const [url, extra] = args._;
  if (!url) throw new UsageError('give the URL of the page to freeze');
  if (extra) throw new UsageError(`unexpected argument "${extra}"`);
  if (!args['--out']) throw new UsageError('--out <dir> is required');
  const theme = args['--theme'] ?? 'light';
  if (theme !== 'light' && theme !== 'dark') throw new UsageError(`--theme is light or dark, not "${theme}"`);
  const themeMode = args['--theme-mode'] ?? 'auto';
  if (!THEME_MODES.includes(themeMode)) throw new UsageError(`--theme-mode is ${THEME_MODES.join(', ')}, not "${themeMode}"`);
  const statePath = args['--storage-state'];
  if (statePath && !existsSync(statePath)) throw new UsageError(`no such file: ${path.resolve(statePath)}`);
  const options = {
    url, out: args['--out'], theme, themeMode, clock: args['--clock'], ready: args['--ready'], allowRedirect: Boolean(args['--allow-redirect']),
    storage: json('--storage', args['--storage']), actions: json('--actions', args['--actions']) ?? [],
    storageState: statePath ? json('--storage-state', await readFile(statePath, 'utf8')) : undefined,
  };
  const browser = await launchChromium();
  try {
    const r = await snapshot(browser, options);
    console.log(`${r.file}${r.meta.unresolved.length ? `\nNot inlined: ${r.meta.unresolved.join(', ')}` : ''}`);
    return EXIT.ok;
  } finally {
    await browser.close();
  }
}

if (isMain(import.meta.url)) {
  try { process.exitCode = await main(); } catch (e) { exitWith(e, 'snapshot.mjs'); }
}
