import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPairs, sideOf, summarize, startVoting } from '../evals/vote/vote.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES = path.join(HERE, 'fixtures', 'vote', 'candidates');
const OUT = path.join(HERE, '.tmp', 'vote');
const SCREENS = [
  { id: 'G01', name: 'Home', job: 'See what needs attention today' },
  { id: 'G02', name: 'Home, new account', job: 'Understand what to do first' },
  { id: 'G03', name: 'Library loans', job: 'Find a loan' },
];

test('pairs the skill against today and against plain Claude, skipping missing versions', async () => {
  const { pairs, autoSame } = await buildPairs(CANDIDATES, SCREENS);
  assert.deepEqual(pairs.map((p) => p.id).sort(), ['G01:skill/baseline', 'G01:skill/current', 'G02:skill/baseline']);
  // G02: the skill changed nothing, so skill vs today is not shown; it is recorded as the same.
  assert.deepEqual(autoSame.map((p) => p.id), ['G02:skill/current']);
});

test('the left/right order is random per pair but stable for a given salt', () => {
  const ids = Array.from({ length: 200 }, (_, i) => `G${i}:skill/current`);
  const a = ids.map((id) => sideOf(id, 'salt-1'));
  assert.deepEqual(a, ids.map((id) => sideOf(id, 'salt-1')), 'stable');
  const skillLeft = a.filter((s) => s.left === 'skill').length;
  assert.ok(skillLeft > 70 && skillLeft < 130, `balanced: skill on the left ${skillLeft} of 200 times`);
  assert.notDeepEqual(a, ids.map((id) => sideOf(id, 'salt-2')), 'another salt gives another order');
});

test('win rates count decided rounds only and track harm per source', () => {
  const votes = [
    { pairId: 'G01:skill/current', winner: 'skill', worse: [] },
    { pairId: 'G02:skill/current', winner: 'current', worse: ['skill'] },
    { pairId: 'G03:skill/current', winner: 'same', worse: [] },
    { pairId: 'G04:skill/current', winner: 'skill', worse: [] },
    { pairId: 'G01:skill/baseline', winner: 'baseline', worse: ['baseline'] },
  ];
  const s = summarize(votes);
  assert.deepEqual(s['skill/current'], { rounds: 4, wins: 2, losses: 1, same: 1, winRate: 2 / 3, worseForSkill: 1 });
  assert.deepEqual(s['skill/baseline'], { rounds: 1, wins: 0, losses: 1, same: 0, winRate: 0, worseForSkill: 0 });
});

test('the page never learns which version is which, and votes persist and resume', { timeout: 60_000 }, async () => {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  const votesFile = path.join(OUT, 'votes.json');
  let v = await startVoting({ candidates: CANDIDATES, screens: SCREENS, votesFile, port: 0 });
  try {
    const html = await (await fetch(`${v.url}/`)).text();
    assert.match(html, /About the same/);
    const first = await (await fetch(`${v.url}/api/next`)).json();
    const raw = JSON.stringify(first);
    assert.doesNotMatch(raw, /skill|baseline|current/, 'the round names no source');
    assert.equal(first.total, 3);
    assert.equal((await fetch(`${v.url}${first.left.light}`)).headers.get('content-type'), 'image/png');
    const res = await fetch(`${v.url}/api/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ round: first.round, choice: 'left', worse: ['right'], note: 'clearer' }) });
    assert.equal(res.status, 200);
  } finally { await v.close(); }

  const saved = JSON.parse(await readFile(votesFile, 'utf8'));
  assert.ok(saved.salt);
  // 1 cast + 1 recorded automatically (G02, the skill changed nothing).
  assert.equal(saved.votes.length, 2);
  const cast = saved.votes.find((x) => x.note === 'clearer');
  assert.ok(['skill', 'current', 'baseline'].includes(cast.winner), 'the vote is stored by source, not by side');
  assert.equal(cast.worse.length, 1);
  assert.notEqual(cast.worse[0], cast.winner);

  v = await startVoting({ candidates: CANDIDATES, screens: SCREENS, votesFile, port: 0 });
  try {
    const next = await (await fetch(`${v.url}/api/next`)).json();
    assert.equal(next.done, 1, 'resumes after the round already voted');
    assert.notEqual(next.round, undefined);
  } finally { await v.close(); }
});

test('phone captures are offered when both sides have them, and a phone-first case opens on them', async () => {
  const { copyFile } = await import('node:fs/promises');
  const dir = path.join(OUT, 'phone-candidates');
  await rm(dir, { recursive: true, force: true });
  for (const src of ['skill', 'baseline']) {
    await mkdir(path.join(dir, src), { recursive: true });
    for (const [theme, device, from] of [['light', 'desktop', 'G01-light-desktop.png'], ['dark', 'desktop', 'G01-dark-desktop.png'], ['light', 'phone', 'G01-light-desktop.png'], ['dark', 'phone', 'G01-dark-desktop.png']]) {
      await copyFile(path.join(CANDIDATES, src, from), path.join(dir, src, `P01-${theme}-${device}.png`));
    }
  }
  const screens = [{ id: 'P01', name: 'Approve', job: 'Approve a claim', view: 'phone' }];
  const { pairs } = await buildPairs(dir, screens, [['skill', 'baseline']]);
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].start, 'phone');
  assert.equal(pairs[0].phone.skill.length, 2);
  const plain = await buildPairs(CANDIDATES, SCREENS);
  assert.ok(plain.pairs.every((p) => !p.phone), 'no phone files, no phone view');

  const v = await startVoting({ candidates: dir, screens, votesFile: path.join(OUT, 'phone-votes.json'), port: 0, comparisons: [['skill', 'baseline']] });
  try {
    const next = await (await fetch(`${v.url}/api/next`)).json();
    assert.equal(next.phone, true);
    assert.equal(next.start, 'phone');
    const img = await fetch(`${v.url}${next.left['phone-dark']}`);
    assert.equal(img.status, 200);
    assert.ok((await img.arrayBuffer()).byteLength > 0);
  } finally {
    await v.close();
  }
});

test('a configuration whose name has a dash stays whole, and a votes file in the old format still resumes', async () => {
  const { copyFile, writeFile } = await import('node:fs/promises');
  const dir = path.join(OUT, 'dashed-candidates');
  await rm(dir, { recursive: true, force: true });
  for (const [src, from] of [['skill', 'skill'], ['plain-claude', 'baseline']]) {
    await mkdir(path.join(dir, src), { recursive: true });
    for (const theme of ['light', 'dark']) await copyFile(path.join(CANDIDATES, from, `G01-${theme}-desktop.png`), path.join(dir, src, `G01-${theme}-desktop.png`));
  }
  const comparisons = [['skill', 'plain-claude']];
  const screens = [SCREENS[0]];
  const { pairs } = await buildPairs(dir, screens, comparisons);
  assert.deepEqual(pairs.map((p) => p.id), ['G01:skill/plain-claude']);
  const side = sideOf(pairs[0].id, 'salt');
  assert.deepEqual([side.left, side.right].sort(), ['plain-claude', 'skill']);
  assert.deepEqual(summarize([{ pairId: 'G01:skill/plain-claude', winner: 'plain-claude', worse: [] }])['skill/plain-claude'], { rounds: 1, wins: 0, losses: 1, same: 0, winRate: 0, worseForSkill: 0 });

  const votesFile = path.join(OUT, 'dashed-votes.json');
  await writeFile(votesFile, JSON.stringify({ salt: 'old', votes: [] }));
  let v = await startVoting({ candidates: dir, screens, votesFile, port: 0, comparisons });
  try {
    const next = await (await fetch(`${v.url}/api/next`)).json();
    for (const k of ['light', 'dark']) assert.equal((await fetch(`${v.url}${next.left[k]}`)).status, 200, `${k} image of the left version`);
  } finally { await v.close(); }

  // Written before the separator changed: sources joined by "-", the first always "skill".
  await writeFile(votesFile, JSON.stringify({ salt: 'old', votes: [{ pairId: 'G01:skill-plain-claude', screen: 'G01', winner: 'plain-claude', worse: [], note: '' }] }));
  v = await startVoting({ candidates: dir, screens, votesFile, port: 0, comparisons });
  try {
    const next = await (await fetch(`${v.url}/api/next`)).json();
    assert.equal(next.finished, true, 'the old vote counts for the pair');
    assert.equal((await (await fetch(`${v.url}/api/summary`)).json())['skill/plain-claude'].losses, 1);
  } finally { await v.close(); }
});
