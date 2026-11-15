import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdtempSync, existsSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { serve } from '../scripts/lib/serve.mjs';
import { openPage } from '../scripts/lib/browser.mjs';
import { renderPage, problems, checkByEye, pageName, VARIANTS } from '../scripts/render.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(HERE, '..', 'evals', 'fixtures', 'app');
const fixture = (f) => path.join(fixtures, f);
const own = (f) => path.join(HERE, 'fixtures', 'render', f);
let browser;
let out;
before(async () => { browser = await chromium.launch(); out = mkdtempSync(path.join(tmpdir(), 'render-')); });
after(async () => { await browser.close(); rmSync(out, { recursive: true, force: true }); });
// One render per fixture, shared by the tests that read it.
const renders = new Map();
const rendered = (file) => { if (!renders.has(file)) renders.set(file, renderPage(browser, file, out)); return renders.get(file); };

test('a good page has no problems, and every variant gets a full and a first-screen capture', { timeout: 90_000 }, async () => {
  const r = await renderPage(browser, fixture('good-settings.html'), out);
  assert.deepEqual(problems(r), []);
  for (const v of VARIANTS) {
    assert.ok(existsSync(path.join(out, `good-settings-${v.id}.png`)));
    assert.ok(existsSync(path.join(out, `good-settings-${v.id}-first.png`)));
  }
});

test('a bad page reports contrast, unnamed controls, small targets and missing labels', { timeout: 90_000 }, async () => {
  const r = await renderPage(browser, fixture('bad-list.html'), out);
  const ids = new Set(r.variants['desktop-light'].axe.map((a) => a.id));
  for (const expected of ['color-contrast', 'button-name', 'target-size', 'label']) assert.ok(ids.has(expected), `missing ${expected}`);
  assert.ok(problems(r).some((p) => p.includes('color-contrast')));
});

test('focus is checked by pixels: a static shadow shows no focus, a background change does', { timeout: 90_000 }, async () => {
  const r = await renderPage(browser, fixture('focus.html'), out);
  const missing = r.variants['desktop-light'].noFocusRing;
  assert.ok(missing.includes('Static shadow'));
  assert.ok(!missing.includes('Background change'));
  assert.ok(!missing.includes('Default link'));
});

test('edge stripes are found however they are drawn, tab underlines and full borders are not', { timeout: 60_000 }, async () => {
  const r = await renderPage(browser, fixture('tells.html'), out);
  const d = r.variants['desktop-light'];
  const found = d.sideStripes.join(' | ');
  assert.match(found, /Border stripe.*border-left/);
  assert.match(found, /Inset stripe.*inset shadow/);
  assert.match(found, /Pseudo-element bar.*::before bar/);
  assert.equal(d.sideStripes.length, 3, found);
  assert.equal(d.emDashes, 1);
  assert.ok(problems(r).some((p) => p.startsWith('tell: coloured edge stripe')));
  assert.ok(problems(r).some((p) => p.startsWith('tell: 1 em dash')));
  assert.deepEqual(d.capsLabels, ['CURRENT PLAN'], 'a label capitalised by styling is reported; "PDF" written in capitals is not');
});

test('the current template devices are reported, each by name', { timeout: 60_000 }, async () => {
  const r = await renderPage(browser, fixture('template.html'), out);
  const t = r.variants['desktop-light'].template;
  assert.ok(t.eyebrowPills.some((x) => /version two/i.test(x)), JSON.stringify(t.eyebrowPills));
  assert.ok(t.eyebrowPills.some((x) => /setup/i.test(x)), 'a tracked capitals label inside a pill');
  assert.equal(t.twoColourHeadlines.length, 1);
  assert.deepEqual(t.floatingBubbles, ['Chat with us']);
  assert.deepEqual(t.repeatedCtas, ['"sign up for free" 2 times']);
  assert.equal(t.centredParagraphs.length, 1);
  assert.ok(t.nestedBoxes.some((x) => /Inner card/.test(x)));
  assert.ok(t.decorative.includes('repeating grid background'));
  assert.ok(t.decorative.some((x) => x.startsWith('blurred glow')));
  assert.ok(problems(r).filter((p) => p.startsWith('template:')).length >= 7);
  assert.deepEqual(r.variants['desktop-light'].disabledOnArrival, ['Import fixed rows']);
  assert.ok(problems(r).some((p) => p.includes('disabled when the screen opens')));
});

test('what loved products do is not reported: tracked section labels, one card around a list, a wide tab bar', { timeout: 60_000 }, async () => {
  const r = await renderPage(browser, fixture('template-allowed.html'), out);
  const t = r.variants['desktop-light'].template;
  for (const [k, v] of Object.entries(t)) assert.deepEqual(v, [], `${k}: ${JSON.stringify(v)}`);
  assert.deepEqual(r.variants['desktop-light'].disabledOnArrival, []);
  assert.deepEqual(r.variants['desktop-light'].capsLabels, []);
  assert.ok(!problems(r).some((p) => p.startsWith('template:')));
});

test('a URL that redirects to a login page is refused unless a signed-in session is passed', { timeout: 90_000 }, async () => {
  const s = await serve(fixtures);
  try {
    await assert.rejects(renderPage(browser, `${s.url}/account`, out), /redirected to \/login\.html/);
    const storageState = { cookies: [{ name: 'session', value: '1', domain: '127.0.0.1', path: '/', expires: -1, httpOnly: false, secure: false, sameSite: 'Lax' }], origins: [] };
    const r = await renderPage(browser, `${s.url}/account`, out, { storageState });
    assert.deepEqual(r.variants['desktop-light'].externalRequests, []);
  } finally {
    await s.close();
  }
});

test('the focus walk goes past rows of look-alike controls', { timeout: 90_000 }, async () => {
  const r = await rendered(own('look-alike.html'));
  assert.deepEqual(r.variants['desktop-light'].noFocusRing, ['Last button']);
});

test('focus on a control that is off-screen or invisible is reported instead of ending the render', { timeout: 90_000 }, async () => {
  const r = await rendered(own('drawer.html'));
  const d = r.variants['desktop-light'];
  assert.deepEqual(d.offscreenFocus, ['Close filters', 'Undo'], 'a skip link that slides in when focused is on screen');
  assert.deepEqual(d.noFocusRing, []);
  assert.ok(problems(r).some((p) => p.startsWith('desktop-light: keyboard focus lands on') && p.includes('Close filters')), problems(r).join('\n'));
});

test('what axe cannot decide is listed to check by eye, apart from the problems', { timeout: 90_000 }, async () => {
  const r = await rendered(own('gradient-text.html'));
  const eye = checkByEye(r);
  assert.ok(eye.some((p) => p.startsWith('desktop-light:') && p.includes('color-contrast') && /gradient/.test(p)), eye.join('\n'));
  assert.ok(!problems(r).some((p) => p.includes('color-contrast')), problems(r).join('\n'));
});

test('dark mode switched by a class on <html> renders dark; a page with no dark theme is reported', { timeout: 120_000 }, async () => {
  const r = await rendered(own('class-theme.html'));
  assert.equal(r.theme.used, 'class');
  assert.equal(r.theme.identical, false);
  for (const device of ['desktop', 'phone']) {
    const shot = (theme) => readFileSync(path.join(out, `class-theme-${device}-${theme}.png`));
    assert.ok(!shot('light').equals(shot('dark')), `${device} dark looks like light`);
  }
  assert.ok(!problems(r).some((p) => p.includes('look identical')));
  assert.equal((await rendered(own('no-viewport.html'))).theme.used, 'media', 'a prefers-color-scheme page needs no class');
  const none = await rendered(own('look-alike.html'));
  assert.equal(none.theme.identical, true);
  assert.ok(problems(none).some((p) => p.startsWith('light and dark look identical')), problems(none).join('\n'));
});

test('colours in oklch are read as colours: a neutral fill is not an accent, an oklch stripe is a stripe', { timeout: 90_000 }, async () => {
  const d = (await rendered(own('oklch.html'))).variants['desktop-light'];
  assert.deepEqual(d.filledButtonsFirstScreen, ['Save changes']);
  assert.deepEqual(d.sideStripes, ['"Inset stripe" (inset shadow)']);
});

test('the same call to action counts twice only on one screen: not after the price, not across plan cards', { timeout: 90_000 }, async () => {
  const r = await rendered(own('ctas.html'));
  assert.deepEqual(r.variants['desktop-light'].template.repeatedCtas, ['"start free trial" 2 times']);
});

test('state and selection drawn in the accent do not compete, nor do two hues; gradient fills count', { timeout: 120_000 }, async () => {
  assert.deepEqual((await rendered(own('states.html'))).variants['desktop-light'].filledButtonsFirstScreen, ['Send invoice']);
  const g = await rendered(own('gradients.html'));
  assert.deepEqual(g.variants['desktop-light'].filledButtonsFirstScreen, ['Generate report', 'Upgrade now']);
  assert.ok(problems(g).some((p) => p.startsWith('first screen: 2 filled accent buttons compete')), problems(g).join('\n'));
});

test('a fill counts as an accent by its chroma: tonal tints and tinted near-blacks are not accents, in light or dark', { timeout: 120_000 }, async () => {
  const r = await rendered(own('tonal.html'));
  for (const v of VARIANTS) {
    assert.deepEqual(r.variants[v.id].filledButtonsFirstScreen, ['Add money'], v.id);
    assert.deepEqual(r.variants[v.id].template.repeatedCtas, [], v.id);
  }
});

test('a page wider than the phone scrolls sideways there, measured against the phone\'s layout width', { timeout: 120_000 }, async () => {
  const r = await rendered(own('wide.html'));
  assert.equal(r.variants['desktop-light'].horizontalOverflowPx, 0);
  // The 700 px board starts after the 20 px left padding; the right padding does not add to the overflow.
  for (const id of ['phone-light', 'phone-dark']) assert.equal(r.variants[id].horizontalOverflowPx, 20 + 700 - 390, id);
  assert.ok(problems(r).includes('phone-light: the page scrolls sideways by 330px'), problems(r).join('\n'));
});

test('small targets come from axe, with the spacing exception and once; the own check covers what axe skips', { timeout: 120_000 }, async () => {
  const d = (await rendered(own('targets.html'))).variants['desktop-light'];
  assert.deepEqual(d.smallTargets, ['Red', 'Blue']);
  assert.ok(!d.axe.some((a) => a.id === 'target-size'), JSON.stringify(d.axe));
  const bad = await rendered(fixture('bad-list.html'));
  const lines = problems(bad).filter((p) => p.startsWith('desktop-light:') && /target-size|smaller than 24/.test(p));
  assert.equal(lines.length, 1, lines.join('\n'));
});

test('a strict Content-Security-Policy neither stops the measuring nor is switched off', { timeout: 90_000 }, async () => {
  const d = (await rendered(own('csp.html'))).variants['desktop-light'];
  assert.ok(Array.isArray(d.axe) && Array.isArray(d.noFocusRing));
  const o = await openPage(browser, { url: pathToFileURL(own('csp.html')).href });
  assert.ok(o.ok, o.reason);
  try {
    assert.notEqual(await o.page.evaluate(() => getComputedStyle(document.getElementById('blocked')).color), 'rgb(255, 0, 0)', 'the page\'s own policy still applies');
  } finally { await o.context.close(); }
});

test('phones are emulated as phones: without a viewport meta tag the desktop layout shows, and is reported', { timeout: 120_000 }, async () => {
  const r = await rendered(own('no-viewport.html'));
  assert.equal(r.variants['phone-light'].layoutWidth, 980);
  assert.ok(problems(r).some((p) => p.includes('no viewport meta tag')), problems(r).join('\n'));
  const ok = await rendered(own('look-alike.html'));
  assert.equal(ok.variants['phone-light'].layoutWidth, 390);
  assert.ok(!problems(ok).some((p) => p.includes('viewport meta')));
});

test('screen checks run on every variant and name where each finding occurs; focus is walked in dark too', { timeout: 120_000 }, async () => {
  const r = await rendered(own('variants.html'));
  const list = problems(r);
  assert.ok(list.some((p) => /^tell: coloured edge stripe on .*border-left.*, on the phone$/.test(p)), list.join('\n'));
  assert.ok(list.some((p) => p.startsWith('first screen: a main button is disabled when the screen opens (Pay EUR 42.00), on the phone')), list.join('\n'));
  assert.deepEqual(r.variants['desktop-light'].noFocusRing, []);
  assert.deepEqual(r.variants['desktop-dark'].noFocusRing, ['Retry']);
});

test('harmless redirects are followed; a sign-in page, reached before or after load, is refused', { timeout: 120_000 }, async () => {
  const s = await serve(own('site'), 0, { redirects: { '/settings': '/settings/', '/billing': '/billing/general.html', '/team': '/en/team/', '/reports': '/dashboard.html', '/': '/signin.html' } });
  const open = async (p, extra = {}) => { const o = await openPage(browser, { url: `${s.url}${p}`, ...extra }); if (o.ok) await o.context.close(); return o; };
  try {
    for (const p of ['/settings', '/billing', '/team']) { const o = await open(p); assert.ok(o.ok, `${p}: ${o.reason}`); }
    const client = await open('/client-redirect.html');
    assert.equal(client.ok, false, 'a redirect made by script after load');
    assert.match(client.reason, /redirected to \/signin\.html.*--storage-state/);
    const root = await open('/');
    assert.equal(root.ok, false);
    assert.match(root.reason, /sign-in page/);
    const away = await open('/reports');
    assert.equal(away.ok, false);
    assert.match(away.reason, /--allow-redirect/);
    assert.ok((await open('/reports', { allowRedirect: true })).ok);
  } finally {
    await s.close();
  }
});

test('a page name is a valid folder and file name', () => {
  assert.equal(pageName('http://127.0.0.1:4173/'), 'page');
  assert.equal(pageName('http://127.0.0.1:4173/settings/billing.html?tab=2#x'), 'billing');
  assert.equal(pageName('https://app.example.com/orders/'), 'orders');
  assert.equal(pageName(path.join('out', 'import-result.html')), 'import-result');
});
