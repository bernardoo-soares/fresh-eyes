import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('a page that cannot be rendered is recorded with its error and the iteration goes on', { timeout: 180_000 }, () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'di-iteration-'));
  try {
    const outputs = path.join(tmp, 'create-settings', 'with_skill', 'outputs');
    mkdirSync(outputs, { recursive: true });
    // Sorted first, so an abort would stop before the good page.
    writeFileSync(path.join(outputs, 'a-broken.html'), '<!doctype html><html lang="en"><head><meta http-equiv="refresh" content="0; url=gone.html"><title>Gone</title></head><body></body></html>');
    copyFileSync(path.join(ROOT, 'evals', 'fixtures', 'app', 'good-settings.html'), path.join(outputs, 'settings.html'));
    const r = spawnSync(process.execPath, [path.join(ROOT, 'evals', 'render-outputs.mjs'), tmp], { encoding: 'utf8', timeout: 170_000 });
    assert.equal(r.status, 0, r.stderr);
    const metrics = JSON.parse(readFileSync(path.join(outputs, '_renders', 'metrics.json'), 'utf8'));
    assert.deepEqual(metrics.map((m) => m.file), ['a-broken.html', 'settings.html']);
    assert.match(metrics[0].error, /navigated away|redirected/);
    assert.deepEqual(metrics[1].problems, []);
    assert.ok(Array.isArray(metrics[1].checkByEye));
    assert.match(r.stdout + r.stderr, /a-broken\.html/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
