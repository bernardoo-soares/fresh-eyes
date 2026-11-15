import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Every file under dir, as paths relative to it (readdirSync's recursive option needs Node 20.1).
const files = (dir, rel = '') => readdirSync(path.join(dir, rel), { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? files(dir, path.join(rel, e.name)) : [path.join(rel, e.name)]));

test('the committed eval cases are what make-cases.mjs writes, and each lets the first-look subagent run', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'di-cases-'));
  try {
    mkdirSync(path.join(tmp, 'evals'));
    cpSync(path.join(ROOT, 'evals', 'fixtures'), path.join(tmp, 'evals', 'fixtures'), { recursive: true });
    const r = spawnSync(process.execPath, [path.join(ROOT, 'evals', 'make-cases.mjs'), tmp], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr);
    const cases = r.stdout.trim().split('\n');
    assert.ok(cases.length >= 10, r.stdout);
    for (const c of cases) {
      const prompt = readFileSync(path.join(tmp, 'evals', c, 'prompt.md'), 'utf8');
      assert.match(prompt, /^allowed_tools: \[.*\bAgent\b.*\]$/m, `${c}: the first-look subagent (agents/first-look.md) needs the Agent tool`);
      for (const f of files(path.join(tmp, 'evals', c))) {
        assert.equal(readFileSync(path.join(ROOT, 'evals', c, f), 'utf8'), readFileSync(path.join(tmp, 'evals', c, f), 'utf8'), `${c}/${f} is out of date: run node evals/make-cases.mjs .`);
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
