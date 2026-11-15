#!/usr/bin/env node
// Blind votes on an eval iteration's outputs, through the voting page in evals/vote/.
//   node evals/vote-iteration.mjs <iteration dir> --skill <config> --against <config>[,<config>] [--port 4180]
// Run evals/render-outputs.mjs on the iteration first. Each case contributes its main output (the HTML file the
// prompt asks for) as desktop light and dark captures. The voter sees the user's request, never the expected outcome
// or the graders, and never which configuration made which version.
import { readdirSync, existsSync, mkdirSync, copyFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { startVoting } from './vote/vote.mjs';

// Candidate file suffix -> render variant. Phone shots are optional; a case built for a phone opens on them.
const VIEWS = { 'light-desktop': 'desktop-light', 'dark-desktop': 'desktop-dark', 'light-phone': 'phone-light', 'dark-phone': 'phone-dark' };
const PHONE_FIRST = /phone screen|for a 390 ?px/i;

function flag(args, name) {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

// The HTML file a case asks for: the last "*.html" named in its prompt that is not an input file.
function mainOutput(prompt) {
  const inputs = (prompt.match(/Input files: (.*)$/m)?.[1] ?? '').split(/,\s*/);
  const named = [...prompt.matchAll(/([\w-]+\.html)/g)].map((m) => m[1]).filter((f) => !inputs.includes(f));
  return named.at(-1);
}

const args = process.argv.slice(2);
const iteration = args[0];
const skill = flag(args, '--skill');
const against = (flag(args, '--against') ?? '').split(',').filter(Boolean);
if (!iteration || !skill || !against.length) {
  console.error('usage: node evals/vote-iteration.mjs <iteration dir> --skill <config> --against <config>[,<config>] [--port 4180]');
  process.exit(2);
}

const voteDir = path.join(iteration, '_vote');
const candidates = path.join(voteDir, 'candidates');
const screens = [];
for (const c of readdirSync(iteration)) {
  const meta = path.join(iteration, c, 'eval_metadata.json');
  if (!existsSync(meta)) continue;
  const { prompt } = JSON.parse(readFileSync(meta, 'utf8'));
  const file = mainOutput(prompt);
  if (!file) continue;
  const base = path.basename(file, '.html');
  for (const config of [skill, ...against]) {
    const source = config === skill ? 'skill' : config;
    for (const [suffix, variant] of Object.entries(VIEWS)) {
      const from = path.join(iteration, c, config, 'outputs', '_renders', `${base}-${variant}.png`);
      if (!existsSync(from)) continue;
      mkdirSync(path.join(candidates, source), { recursive: true });
      copyFileSync(from, path.join(candidates, source, `${c}-${suffix}.png`));
    }
  }
  screens.push({ id: c, name: c.replace(/^(create|review|system)-/, '').replace(/-/g, ' '), job: prompt.split('\n')[0], view: PHONE_FIRST.test(prompt) ? 'phone' : 'desktop' });
}

const v = await startVoting({
  candidates,
  screens,
  votesFile: path.join(voteDir, 'votes.json'),
  port: Number(flag(args, '--port') ?? 4180),
  comparisons: against.map((a) => ['skill', a]),
});
console.log(`Voting at ${v.url} (${screens.length} cases; ${skill} against ${against.join(', ')})`);
