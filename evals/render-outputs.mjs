#!/usr/bin/env node
// Renders every top-level HTML file each run produced, the same way for every configuration, with the skill's
// own scripts/render.mjs, so a run is measured exactly as the skill measures itself.
//   node evals/render-outputs.mjs <iteration dir> [--only <case>]
// For each <case>/<config>/outputs/*.html it writes outputs/_renders/<file>-<variant>[-first].png and
// outputs/_renders/metrics.json (one entry per file, with the plain-words problems and check-by-eye lists). A page
// that cannot be rendered is recorded with its error, and the iteration goes on.
import { readdirSync, existsSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { renderPage, problems, checkByEye } from '../scripts/render.mjs';
import { launchChromium } from '../scripts/lib/browser.mjs';
import { exitWith } from '../scripts/lib/cli.mjs';

const a = process.argv.slice(2);
const dir = a[0];
const only = a.includes('--only') ? a[a.indexOf('--only') + 1] : null;
if (!dir) {
  console.error('usage: node evals/render-outputs.mjs <iteration dir> [--only <case>]');
  process.exit(2);
}

const runs = [];
for (const c of readdirSync(dir).sort()) {
  if (only && c !== only) continue;
  const cdir = path.join(dir, c);
  if (!statSync(cdir).isDirectory()) continue;
  for (const cfg of readdirSync(cdir).sort()) {
    const outputs = path.join(cdir, cfg, 'outputs');
    if (existsSync(outputs)) runs.push({ name: `${c}/${cfg}`, outputs });
  }
}

let browser;
try { browser = await launchChromium(); } catch (e) { exitWith(e, 'render-outputs.mjs'); }
let failed = 0;
try {
  for (const run of runs) {
    const htmls = readdirSync(run.outputs).filter((f) => f.endsWith('.html')).sort();
    if (!htmls.length) continue;
    const shots = path.join(run.outputs, '_renders');
    mkdirSync(shots, { recursive: true });
    const metrics = [];
    for (const f of htmls) {
      try {
        const result = await renderPage(browser, path.join(run.outputs, f), shots);
        metrics.push({ file: f, problems: problems(result), checkByEye: checkByEye(result), ...result });
      } catch (e) {
        failed++;
        const error = String(e?.message ?? e).split('\n')[0];
        metrics.push({ file: f, error });
        console.error(`${run.name}/${f}: not rendered: ${error}`);
      }
    }
    writeFileSync(path.join(shots, 'metrics.json'), JSON.stringify(metrics, null, 2) + '\n');
    console.log(`${run.name}: ${htmls.join(', ')}`);
  }
} finally {
  await browser.close();
}
if (failed) console.error(`${failed} page${failed > 1 ? 's' : ''} could not be rendered; each has an "error" in its metrics.json entry.`);
