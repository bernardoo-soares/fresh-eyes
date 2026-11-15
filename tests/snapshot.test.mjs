import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from '../scripts/lib/serve.mjs';
import { openPage } from '../scripts/lib/browser.mjs';
import { snapshot } from '../scripts/snapshot.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(HERE, 'fixtures', 'snapshot');
const OUT = path.join(HERE, '.tmp', 'snapshot');

// Share of pixels that differ by more than a small per-channel tolerance (anti-aliasing).
async function diffRatio(browser, a, b) {
  const page = await browser.newPage();
  const r = await page.evaluate(async ([a64, b64]) => {
    const load = (s) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = `data:image/png;base64,${s}`; });
    const [ia, ib] = await Promise.all([load(a64), load(b64)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return 1;
    const px = (img) => { const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return x.getImageData(0, 0, c.width, c.height).data; };
    const da = px(ia); const db = px(ib); let bad = 0;
    for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) > 24 || Math.abs(da[i + 1] - db[i + 1]) > 24 || Math.abs(da[i + 2] - db[i + 2]) > 24) bad++;
    return bad / (da.length / 4);
  }, [a.toString('base64'), b.toString('base64')]);
  await page.close();
  return r;
}

async function shot(browser, url, theme = 'light') {
  const o = await openPage(browser, { url, theme, themeMode: 'class' });
  assert.ok(o.ok, o.reason);
  const png = await o.page.screenshot({ fullPage: true });
  await o.context.close();
  return png;
}

test('freezes a script-rendered page into one self-contained HTML file', { timeout: 120_000 }, async () => {
  await rm(OUT, { recursive: true, force: true });
  const s = await serve(FIX);
  const browser = await chromium.launch();
  try {
    const r = await snapshot(browser, { url: `${s.url}/app.html`, out: path.join(OUT, 'basic') });
    const html = await readFile(r.file, 'utf8');
    assert.match(html, /^<!doctype html>/i);
    assert.doesNotMatch(html, /<script/i, 'scripts are removed');
    assert.doesNotMatch(html, /<link[^>]+stylesheet/i, 'stylesheets are inlined');
    assert.match(html, /data-test="state"/, 'content rendered after load is kept');
    assert.match(html, /\.injected-later/, 'inline style blocks are kept');
    assert.match(html, /--card/, 'linked stylesheet rules are inlined');
    // No reference to any file next to the page: everything is a data URI.
    assert.doesNotMatch(html, /(?:src|href)="(?!data:|#)[^"]+"/, 'no external src or href');
    assert.doesNotMatch(html, /url\((?!["']?data:)[^)]+\)/, 'no external url() in CSS');
  } finally { await browser.close(); await s.close(); }
});

test('inlines only the font faces the page loaded', { timeout: 120_000 }, async () => {
  const s = await serve(FIX);
  const browser = await chromium.launch();
  try {
    const r = await snapshot(browser, { url: `${s.url}/app.html`, out: path.join(OUT, 'fonts') });
    const html = await readFile(r.file, 'utf8');
    assert.match(html, /@font-face\s*\{[^}]*FixtureBold[^}]*url\("data:font\/woff2/, 'the face the heading uses is inlined');
    assert.doesNotMatch(html, /NeverUsed/, 'a face no element uses is dropped');
    assert.deepEqual(r.meta.unresolved, [], 'a dropped face is not reported as unresolved');
  } finally { await browser.close(); await s.close(); }
});

test('keeps live form state, canvas pixels and the theme class out of the frozen root', { timeout: 120_000 }, async () => {
  const s = await serve(FIX);
  const browser = await chromium.launch();
  try {
    const r = await snapshot(browser, { url: `${s.url}/app.html`, out: path.join(OUT, 'state'), theme: 'dark', themeMode: 'class' });
    const html = await readFile(r.file, 'utf8');
    assert.match(html, /data-test="input"[^>]*value="acme"|value="acme"[^>]*data-test="input"/);
    assert.match(html, /data-test="check"[^>]*checked|checked[^>]*data-test="check"/);
    assert.match(html, /<option selected[^>]*>GBP|<option[^>]*selected[^>]*>GBP/);
    assert.match(html, /<img[^>]*data-test="canvas"[^>]*src="data:image\/png/, 'canvas becomes an image of its pixels');
    assert.doesNotMatch(html, /<html[^>]*class="[^"]*\bdark\b/, 'the root does not bake in the dark class');
  } finally { await browser.close(); await s.close(); }
});

test('the served snapshot looks like the live page in light and dark', { timeout: 180_000 }, async () => {
  const s = await serve(FIX);
  const browser = await chromium.launch();
  try {
    await snapshot(browser, { url: `${s.url}/app.html`, out: path.join(FIX, '.snap') });
    for (const theme of ['light', 'dark']) {
      const live = await shot(browser, `${s.url}/app.html`, theme);
      const frozen = await shot(browser, `${s.url}/.snap/index.html`, theme);
      const d = await diffRatio(browser, live, frozen);
      assert.ok(d < 0.005, `${theme}: ${(d * 100).toFixed(2)}% of pixels differ`);
    }
  } finally { await browser.close(); await s.close(); await rm(path.join(FIX, '.snap'), { recursive: true, force: true }); }
});

test('a frozen clock, preset storage and setup actions shape what is frozen', { timeout: 120_000 }, async () => {
  const s = await serve(FIX);
  const browser = await chromium.launch();
  try {
    const r = await snapshot(browser, {
      url: `${s.url}/app.html`,
      out: path.join(OUT, 'setup'),
      clock: '2026-09-01T09:00:00Z',
      storage: { demoState: 'empty' },
      actions: [{ click: '[data-test=open]' }],
    });
    const html = await readFile(r.file, 'utf8');
    assert.match(html, /today: 2026-09-01/);
    assert.match(html, /state: empty/);
    assert.match(html, /<div data-test="dialog">/, 'the dialog opened by the action is frozen open');
    const meta = JSON.parse(await readFile(path.join(OUT, 'setup', 'meta.json'), 'utf8'));
    assert.equal(meta.clock, '2026-09-01T09:00:00Z');
    assert.deepEqual(meta.storage, { demoState: 'empty' });
  } finally { await browser.close(); await s.close(); }
});

test('a page under a strict Content-Security-Policy freezes into a file that still renders', { timeout: 180_000 }, async () => {
  const s = await serve(FIX);
  const browser = await chromium.launch();
  try {
    const r = await snapshot(browser, { url: `${s.url}/csp.html`, out: path.join(FIX, '.snap-csp') });
    const html = await readFile(r.file, 'utf8');
    assert.doesNotMatch(html, /Content-Security-Policy/i, 'the policy would block the frozen file\'s own inlined styles and images');
    assert.match(html, /<img[^>]*src="data:image\/png/);
    const live = await shot(browser, `${s.url}/csp.html`);
    const frozen = await shot(browser, `${s.url}/.snap-csp/index.html`);
    const d = await diffRatio(browser, live, frozen);
    assert.ok(d < 0.005, `${(d * 100).toFixed(2)}% of pixels differ`);
  } finally { await browser.close(); await s.close(); await rm(path.join(FIX, '.snap-csp'), { recursive: true, force: true }); }
});

test('an action whose selector never appears fails the snapshot, naming it', { timeout: 120_000 }, async () => {
  const s = await serve(FIX);
  const browser = await chromium.launch();
  try {
    await assert.rejects(
      snapshot(browser, { url: `${s.url}/app.html`, out: path.join(OUT, 'bad'), actions: [{ click: '[data-test=nope]' }], actionTimeout: 2000 }),
      /\[data-test=nope\]/,
    );
  } finally { await browser.close(); await s.close(); }
});
