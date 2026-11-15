import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { serve } from '../scripts/lib/serve.mjs';

const TMP = path.join(path.dirname(fileURLToPath(import.meta.url)), '.tmp', 'serve');

test('an SVG a mock references is served as an image and renders', { timeout: 60_000 }, async () => {
  await rm(TMP, { recursive: true, force: true }); await mkdir(TMP, { recursive: true });
  await writeFile(path.join(TMP, 'logo.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>');
  await writeFile(path.join(TMP, 'page.html'), '<!doctype html><img src="logo.svg" style="height:26px;width:auto">');
  const s = await serve(TMP); const browser = await chromium.launch();
  try {
    assert.equal((await fetch(`${s.url}/logo.svg`)).headers.get('content-type'), 'image/svg+xml');
    const page = await browser.newPage();
    await page.goto(`${s.url}/page.html`, { waitUntil: 'load' });
    assert.ok(await page.evaluate(() => document.images[0].naturalWidth > 0), 'the SVG did not render');
  } finally { await browser.close(); await s.close(); }
});
