// One way to open a page, shared by render.mjs and snapshot.mjs, so both see the same sign-in, theme, device,
// readiness and redirect rules.
import { INSTALL_CHROMIUM, INSTALL_PACKAGES, SetupError } from './cli.mjs';

// 1440x900 is the most common laptop viewport; 390x844 is a current iPhone in CSS px, opened as a phone (isMobile,
// touch), so a page without a viewport meta tag shows the zoomed-out desktop layout a phone would show.
export const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
};
export const THEME_MODES = ['auto', 'media', 'class'];
// Navigation gives up after 30 s; a SaaS page slower than that is itself a finding.
const NAV_TIMEOUT_MS = 30_000;
// Network idle is best effort: pages with polling or websockets never go idle, so wait at most 5 s and note it.
const IDLE_MS = 5_000;
// Settle time for fonts and entry transitions; 500 ms covers the common 300 ms transition.
const SETTLE_MS = 500;
// A landing path that names a sign-in step.
const SIGN_IN_PATH = /(^|\/)(log[-_]?in|sign[-_]?in|auth|sso)(\/|\.|$)/i;

// Starts headless Chromium, or says in plain words what to install first: the packages, then the browser.
export async function launchChromium() {
  let chromium;
  try { ({ chromium } = await import('playwright')); } catch (e) {
    if (e?.code !== 'ERR_MODULE_NOT_FOUND') throw e;
    throw new SetupError('the playwright package is not installed', [INSTALL_PACKAGES, INSTALL_CHROMIUM]);
  }
  try { return await chromium.launch(); } catch (e) {
    throw new SetupError(`Chromium did not start (${String(e.message).split('\n')[0]})`, [INSTALL_CHROMIUM]);
  }
}

const segments = (p) => p.split('/').filter(Boolean);
const keeps = (landed, asked) => asked.length === 0 || landed.some((_, i) => asked.every((s, j) => landed[i + j] === s));

async function hasPasswordField(page) {
  const look = () => page.evaluate(() => [...document.querySelectorAll('input[type="password"]')].some((el) => el.getClientRects().length > 0));
  try { return await look(); } catch {
    // The page was navigating while it was read (a script redirect in progress): read it again once it has loaded.
    await page.waitForLoadState('load', { timeout: NAV_TIMEOUT_MS });
    return look();
  }
}

// A redirect is followed when the page it lands on keeps the path asked for (a trailing slash, a locale prefix, a
// default tab) and does not ask for a password. Anything else is refused, because it is usually a sign-in wall.
async function redirectProblem(page, url, allowRedirect) {
  if (allowRedirect) return null;
  const asked = new URL(url);
  const landed = new URL(page.url());
  if (landed.protocol !== asked.protocol) return `the page navigated away to ${page.url()} (a missing file or an address that did not answer)`;
  const a = segments(asked.pathname);
  const l = segments(landed.pathname);
  if (a.length === l.length && keeps(l, a)) return null;
  const signIn = SIGN_IN_PATH.test(landed.pathname) || await hasPasswordField(page);
  if (!signIn && keeps(l, a)) return null;
  if (signIn) return `redirected to ${landed.pathname}, which looks like a sign-in page: pass --storage-state <file> with a signed-in session (or --allow-redirect to measure that page anyway)`;
  return `redirected to ${landed.pathname}, away from the page asked for: if that is a sign-in page, pass --storage-state <file> with a signed-in session; if the redirect is expected, pass --allow-redirect`;
}

// `storage` presets localStorage keys before any page script runs (a preview state, a role); `clock` freezes Date at
// an ISO instant so date-relative copy ("ends in 3 days") renders the same on every run. `themeMode` 'media' emulates
// the colour-scheme setting only; 'class' also sets a dark class, data-theme and a stored theme, the way class-themed
// apps switch. The page's own Content-Security-Policy applies unless `bypassCSP` is set.
// Returns the open page with the external requests and script errors seen so far, or { ok: false, reason }.
export async function openPage(browser, { url, theme = 'light', viewport = 'desktop', themeMode = 'media', storageState, ready, storage, clock, allowRedirect = false, bypassCSP = false }) {
  if (!VIEWPORTS[viewport]) throw new Error(`Unknown viewport "${viewport}". Use ${Object.keys(VIEWPORTS).join(' or ')}.`);
  if (themeMode !== 'media' && themeMode !== 'class') throw new Error(`Unknown theme mode "${themeMode}". Use media or class.`);
  const context = await browser.newContext({ ...VIEWPORTS[viewport], deviceScaleFactor: 1, colorScheme: theme, reducedMotion: 'reduce', bypassCSP, ...(storageState ? { storageState } : {}) });
  if (storage) {
    await context.addInitScript((entries) => {
      try { for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v); } catch { /* storage blocked: the page reads its defaults */ }
    }, storage);
  }
  if (themeMode === 'class') {
    await context.addInitScript((t) => {
      try { localStorage.setItem('theme', t); } catch { /* storage blocked: the class below still applies */ }
      document.addEventListener('DOMContentLoaded', () => { document.documentElement.classList.toggle('dark', t === 'dark'); document.documentElement.dataset.theme = t; });
    }, theme);
  }
  const page = await context.newPage();
  const origin = /^https?:/.test(url) ? new URL(url).origin : null;
  const external = [];
  const errors = [];
  page.on('request', (r) => { const u = r.url(); if (!/^(file:|data:|about:|blob:)/.test(u) && !(origin && u.startsWith(origin))) external.push(u); });
  page.on('pageerror', (e) => errors.push(String(e.message).split('\n')[0].slice(0, 200)));
  if (clock) await page.clock.setFixedTime(new Date(clock));
  const fail = async (reason) => { await context.close(); return { ok: false, reason }; };
  let response;
  try { response = await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT_MS }); }
  catch (e) { return fail(`navigation failed (${e.message.split('\n')[0]}): check that the address opens in a browser and the server is running`); }
  if (!response) return fail('navigation returned no response: check that the address opens in a browser');
  if (response.status() >= 400) return fail(`answered HTTP ${response.status()}: check the address, or pass --storage-state <file> if the page needs a signed-in session`);
  const early = await redirectProblem(page, url, allowRedirect);
  if (early) return fail(early);
  let networkIdle = true;
  try { await page.waitForLoadState('networkidle', { timeout: IDLE_MS }); } catch { networkIdle = false; }
  if (ready) {
    try { await page.locator(ready).first().waitFor({ state: 'visible', timeout: NAV_TIMEOUT_MS }); }
    catch { return fail(`the --ready selector "${ready}" never became visible: check it, or leave --ready out`); }
  }
  await page.waitForTimeout(SETTLE_MS);
  // Checked again once the page has settled, so a redirect made by script after load (an app sending you to sign in)
  // is caught too.
  const late = await redirectProblem(page, url, allowRedirect);
  if (late) return fail(late);
  return { ok: true, page, context, landedUrl: page.url(), networkIdle, external, errors };
}

export async function closePair(pair) {
  for (const theme of ['light', 'dark']) await pair[theme]?.context.close();
}

// Opens the page in light and in dark and says whether the two look identical. 'auto' emulates the colour-scheme
// setting first and, when that changes no pixel, opens both again in 'class' mode, so a class-themed app (next-themes,
// Tailwind's class strategy) is never measured light twice. Each side carries its full-page screenshot.
export async function openThemePair(browser, options) {
  const asked = options.themeMode ?? 'auto';
  if (!THEME_MODES.includes(asked)) throw new Error(`Unknown theme mode "${asked}". Use ${THEME_MODES.join(', ')}.`);
  let pair = null;
  for (const themeMode of asked === 'auto' ? ['media', 'class'] : [asked]) {
    if (pair) await closePair(pair);
    pair = { themeMode };
    for (const theme of ['light', 'dark']) {
      const opened = await openPage(browser, { ...options, theme, themeMode });
      if (!opened.ok) { await closePair(pair); return opened; }
      opened.fullPage = await opened.page.screenshot({ fullPage: true });
      pair[theme] = opened;
    }
    pair.identical = pair.light.fullPage.equals(pair.dark.fullPage);
    if (!pair.identical) break;
  }
  return { ok: true, ...pair };
}
