import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = (name, root = ROOT) => path.join(root, 'scripts', name);
const FIXTURE = path.join(ROOT, 'evals', 'fixtures', 'app', 'good-settings.html');
const node = (args, opts = {}) => spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 120_000, ...opts });
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Like node(), without blocking this process: needed when this process also serves the page the script opens.
const nodeAsync = (args, opts = {}) => new Promise((resolve) => {
  const child = spawn(process.execPath, args, opts);
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (d) => { stdout += d; });
  child.stderr.on('data', (d) => { stderr += d; });
  child.on('close', (status) => resolve({ status, stdout, stderr }));
});

// Starts a long-running script and resolves with its first line of output, then stops it.
function firstLine(args, timeout = 20_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args);
    let out = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error(`no output after ${timeout} ms`)); }, timeout);
    child.stdout.on('data', (d) => { out += d; if (out.includes('\n')) { clearTimeout(timer); child.kill(); resolve(out.split('\n')[0]); } });
    child.on('exit', (code) => { clearTimeout(timer); if (!out.includes('\n')) resolve(`exited ${code} with no output`); });
  });
}

test('every script runs when the skill is reached through a symlink or a junction', { timeout: 180_000 }, async () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'di-link-'));
  const link = path.join(tmp, 'skill');
  symlinkSync(ROOT, link, process.platform === 'win32' ? 'junction' : 'dir');
  try {
    const tokens = node([script('tokens.mjs', link), '--accent', '#3355ff', '--out', path.join(tmp, 'tokens')]);
    assert.equal(tokens.status, 0, tokens.stderr);
    assert.ok(existsSync(path.join(tmp, 'tokens', 'tokens.css')), 'tokens.mjs wrote nothing');

    const render = node([script('render.mjs', link), FIXTURE, '--out', path.join(tmp, 'render')]);
    assert.equal(render.status, 0, render.stderr);
    assert.ok(existsSync(path.join(tmp, 'render', 'metrics.json')), 'render.mjs wrote nothing');

    const snap = node([script('snapshot.mjs', link), '--help']);
    assert.equal(snap.status, 0, snap.stderr);
    assert.match(snap.stdout, /--out/);

    const vote = node([path.join(link, 'evals', 'vote', 'vote.mjs')]);
    assert.equal(vote.status, 2, 'vote.mjs exited without printing its usage');
    assert.match(vote.stderr, /usage/i);

    assert.match(await firstLine([path.join(link, 'scripts', 'lib', 'serve.mjs'), ROOT, '0']), /^Serving .* at http:\/\/127\.0\.0\.1:\d+/);
  } finally {
    unlinkSync(link);
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('--help and -h explain every option on its own line and exit 0', () => {
  const options = {
    'render.mjs': ['--out', '--theme-mode', '--storage-state', '--ready', '--allow-redirect'],
    'snapshot.mjs': ['--out', '--theme', '--theme-mode', '--clock', '--storage', '--actions', '--storage-state', '--ready', '--allow-redirect'],
    'tokens.mjs': ['--accent', '--accent-dark', '--out'],
  };
  for (const [name, flags] of Object.entries(options)) {
    for (const h of ['--help', '-h']) {
      const r = node([script(name), h]);
      assert.equal(r.status, 0, `${name} ${h}: ${r.stderr}`);
      for (const f of flags) assert.match(r.stdout, new RegExp(`^ +${f} .*\\S`, 'm'), `${name} ${h} does not explain ${f}`);
      assert.match(r.stdout, /Exit codes/);
    }
  }
});

test('wrong arguments say what is wrong and exit 2; a missing page is named by its full path', () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'di-args-'));
  try {
    const missing = node([script('render.mjs'), 'nope.html'], { cwd: tmp });
    assert.equal(missing.status, 2);
    assert.match(missing.stderr, new RegExp(`no such file: ${escape(path.join(realpathSync(tmp), 'nope.html'))}`));

    const typo = node([script('render.mjs'), FIXTURE, '--them-mode', 'class']);
    assert.equal(typo.status, 2);
    assert.match(typo.stderr, /unknown option --them-mode/);
    assert.match(typo.stderr, /--help/);

    const mode = node([script('render.mjs'), FIXTURE, '--theme-mode', 'dark']);
    assert.equal(mode.status, 2);
    assert.match(mode.stderr, /--theme-mode/);

    assert.equal(node([script('render.mjs')]).status, 2);
    assert.equal(node([script('snapshot.mjs')]).status, 2);
    assert.equal(node([script('snapshot.mjs'), 'http://127.0.0.1:9/x']).status, 2, 'snapshot without --out');
    assert.equal(node([script('tokens.mjs'), '--accent', '#3355ff']).status, 2, 'tokens without --out');
    const colour = node([script('tokens.mjs'), '--accent', 'blue', '--out', path.join(tmp, 't')]);
    assert.equal(colour.status, 2);
    assert.match(colour.stderr, /--accent/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('without the packages or Chromium, the scripts print the commands that fix it and exit 3', { timeout: 120_000 }, () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'di-setup-'));
  try {
    // A copy of the scripts with no node_modules anywhere above it: a skill that was never installed.
    const bare = path.join(tmp, 'skill');
    mkdirSync(bare);
    cpSync(path.join(ROOT, 'scripts'), path.join(bare, 'scripts'), { recursive: true });
    cpSync(FIXTURE, path.join(tmp, 'page.html'));
    const skillDir = realpathSync(bare);
    for (const args of [[script('render.mjs', bare), path.join(tmp, 'page.html')], [script('snapshot.mjs', bare), 'http://127.0.0.1:9/x', '--out', path.join(tmp, 'snap')]]) {
      const r = node(args);
      assert.equal(r.status, 3, `${path.basename(args[0])}: ${r.stderr}`);
      assert.ok(r.stderr.includes(`npm --prefix "${skillDir}" install`), r.stderr);
      assert.ok(r.stderr.includes(`node "${path.join(skillDir, 'node_modules', 'playwright', 'cli.js')}" install chromium`), r.stderr);
      assert.doesNotMatch(r.stderr, /ERR_MODULE_NOT_FOUND|\n\s+at /, 'a raw stack trace');
    }
    // Installed packages but no browser: an empty browser cache.
    const noBrowser = node([script('render.mjs'), FIXTURE, '--out', path.join(tmp, 'r')], { env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: path.join(tmp, 'no-browsers') } });
    assert.equal(noBrowser.status, 3, noBrowser.stderr);
    assert.ok(noBrowser.stderr.includes(`node "${path.join(ROOT, 'node_modules', 'playwright', 'cli.js')}" install chromium`), noBrowser.stderr);
    assert.doesNotMatch(noBrowser.stderr, /npx playwright install\b(?! chromium)/, 'Playwright\'s own advice to install every browser');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('the default output folder from a URL is a valid folder name', { timeout: 120_000 }, async () => {
  const { serve } = await import('../scripts/lib/serve.mjs');
  const s = await serve(path.dirname(FIXTURE));
  const tmp = mkdtempSync(path.join(tmpdir(), 'di-out-'));
  try {
    const r = await nodeAsync([script('render.mjs'), `${s.url}/good-settings.html?tab=2`], { cwd: tmp });
    assert.equal(r.status, 0, r.stderr);
    assert.ok(existsSync(path.join(tmp, 'render', 'good-settings', 'metrics.json')), r.stdout);
    const metrics = JSON.parse(readFileSync(path.join(tmp, 'render', 'good-settings', 'metrics.json'), 'utf8'));
    assert.equal(metrics.page, `${s.url}/good-settings.html?tab=2`);
  } finally {
    await s.close();
    rmSync(tmp, { recursive: true, force: true });
  }
});
