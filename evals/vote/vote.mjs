#!/usr/bin/env node
// Blind voting on two versions of the same screens. Candidates are captures laid out as
// <candidates>/<source>/<screen>-<light|dark>-<desktop|phone>.png. Each round shows two versions as A and B in a
// random, stable order; the page is never told which is which. Votes are stored by source in votes.json and the
// page resumes where it stopped. Usually started through evals/vote-iteration.mjs.
//   node evals/vote/vote.mjs <candidates dir> --screens <screens.json> [--votes <file>] [--port 4180]
import { createServer } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EXIT, isMain } from '../../scripts/lib/cli.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const THEMES = ['light', 'dark'];
// Each comparison is the skill against one alternative; the pair id names both, the page never sees it.
// `previous` is an earlier version of the skill, to show whether a change to the skill helped.
const COMPARISONS = [['skill', 'current'], ['skill', 'baseline'], ['skill', 'previous']];

// A pair id is "<screen>:<source>/<source>". A slash cannot occur in a folder name, so a configuration named
// "plain-claude" stays whole. Ids written before used "-" between the two, and their first source was always "skill".
export function sourcesOf(pairId) {
  const key = pairId.slice(pairId.indexOf(':') + 1);
  if (key.includes('/')) return key.split('/');
  const dash = key.indexOf('-');
  return [key.slice(0, dash), key.slice(dash + 1)];
}

const exists = (f) => access(f).then(() => true, () => false);
const shot = (dir, source, screen, theme, device = 'desktop') => path.join(dir, source, `${screen}-${theme}-${device}.png`);

export async function buildPairs(candidates, screens, comparisons = COMPARISONS) {
  const pairs = [];
  const autoSame = [];
  for (const s of screens) {
    for (const [a, b] of comparisons) {
      const files = (src) => THEMES.map((t) => shot(candidates, src, s.id, t));
      const fa = files(a);
      const fb = files(b);
      if (!(await Promise.all([...fa, ...fb].map(exists))).every(Boolean)) continue;
      const pair = { id: `${s.id}:${a}/${b}`, screen: s.id, name: s.name, job: s.job, sources: [a, b], files: { [a]: fa, [b]: fb }, start: s.view === 'phone' ? 'phone' : 'desktop' };
      // Phone captures are optional: offered when both sides have them in both themes.
      const pa = THEMES.map((t) => shot(candidates, a, s.id, t, 'phone'));
      const pb = THEMES.map((t) => shot(candidates, b, s.id, t, 'phone'));
      if ((await Promise.all([...pa, ...pb].map(exists))).every(Boolean)) pair.phone = { [a]: pa, [b]: pb };
      const same = (await Promise.all(THEMES.map(async (_, i) => (await readFile(fa[i])).equals(await readFile(fb[i]))))).every(Boolean);
      (same ? autoSame : pairs).push(pair);
    }
  }
  return { pairs, autoSame };
}

// Which source goes left: one hashed bit per pair, so the order looks random but survives a restart.
export function sideOf(pairId, salt) {
  const [a, b] = sourcesOf(pairId);
  const bit = createHash('sha256').update(`${salt}|${pairId}`).digest()[0] & 1;
  return bit ? { left: a, right: b } : { left: b, right: a };
}

export function summarize(votes) {
  const out = {};
  for (const v of votes) {
    const [first, other] = sourcesOf(v.pairId);
    const key = `${first}/${other}`;
    const r = (out[key] ??= { rounds: 0, wins: 0, losses: 0, same: 0, winRate: 0, worseForSkill: 0 });
    r.rounds += 1;
    if (v.winner === 'skill') r.wins += 1;
    else if (v.winner === other) r.losses += 1;
    else r.same += 1;
    if (v.worse.includes('skill')) r.worseForSkill += 1;
  }
  for (const r of Object.values(out)) r.winRate = r.wins + r.losses ? r.wins / (r.wins + r.losses) : 0;
  return out;
}

async function loadVotes(file) {
  let state;
  try { state = JSON.parse(await readFile(file, 'utf8')); } catch { return { salt: randomBytes(8).toString('hex'), votes: [] }; }
  // A file written before the separator changed resumes under today's ids.
  for (const v of state.votes) v.pairId = `${v.pairId.slice(0, v.pairId.indexOf(':'))}:${sourcesOf(v.pairId).join('/')}`;
  return state;
}

export async function startVoting({ candidates, screens, votesFile, port = 4180, comparisons = COMPARISONS }) {
  const { pairs, autoSame } = await buildPairs(candidates, screens, comparisons);
  const state = await loadVotes(votesFile);
  for (const p of autoSame) {
    if (!state.votes.some((v) => v.pairId === p.id)) state.votes.push({ pairId: p.id, screen: p.screen, winner: 'same', worse: [], note: '', auto: true });
  }
  const save = () => writeFile(votesFile, `${JSON.stringify(state, null, 2)}\n`);
  await save();
  // Rounds are opaque tokens; the pair id would name the sources.
  const roundOf = (p) => createHash('sha256').update(`${state.salt}#${p.id}`).digest('hex').slice(0, 12);
  const byRound = new Map(pairs.map((p) => [roundOf(p), p]));
  const order = [...pairs].sort((x, y) => roundOf(x).localeCompare(roundOf(y)));
  const voted = (p) => state.votes.some((v) => v.pairId === p.id);
  const page = await readFile(path.join(HERE, 'vote.html'), 'utf8');

  const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    try {
      if (req.method === 'GET' && url.pathname === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(page); }
      if (req.method === 'GET' && url.pathname === '/api/next') {
        const done = pairs.filter(voted).length;
        const p = order.find((x) => !voted(x));
        if (!p) return json(res, 200, { finished: true, done, total: pairs.length });
        const round = roundOf(p);
        const img = (side) => Object.fromEntries([
          ...THEMES.map((t) => [t, `/img/${round}/${side}-${t}`]),
          ...(p.phone ? THEMES.map((t) => [`phone-${t}`, `/img/${round}/${side}-${t}-phone`]) : []),
        ]);
        return json(res, 200, { round, name: p.name, job: p.job, left: img('left'), right: img('right'), phone: Boolean(p.phone), start: p.phone ? p.start : 'desktop', done, total: pairs.length });
      }
      const m = url.pathname.match(/^\/img\/([0-9a-f]{12})\/(left|right)-(light|dark)(-phone)?$/);
      if (req.method === 'GET' && m) {
        const p = byRound.get(m[1]);
        if (!p || (m[4] && !p.phone)) { res.writeHead(404); return res.end(); }
        const source = sideOf(p.id, state.salt)[m[2]];
        res.writeHead(200, { 'Content-Type': 'image/png', 'Cache-Control': 'no-store' });
        return res.end(await readFile((m[4] ? p.phone : p.files)[source][THEMES.indexOf(m[3])]));
      }
      if (req.method === 'POST' && url.pathname === '/api/vote') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const { round, choice, worse = [], note = '' } = JSON.parse(body);
        const p = byRound.get(round);
        if (!p || !['left', 'right', 'same'].includes(choice)) return json(res, 400, { error: 'Unknown round or choice' });
        const sides = sideOf(p.id, state.salt);
        state.votes = state.votes.filter((v) => v.pairId !== p.id);
        state.votes.push({ pairId: p.id, screen: p.screen, winner: choice === 'same' ? 'same' : sides[choice], worse: worse.filter((w) => w === 'left' || w === 'right').map((w) => sides[w]), note: String(note).slice(0, 5000), at: new Date().toISOString() });
        await save();
        return json(res, 200, { ok: true });
      }
      if (req.method === 'GET' && url.pathname === '/api/summary') {
        if (order.some((x) => !voted(x))) return json(res, 409, { error: 'Finish voting first; results stay hidden until then so they cannot steer a vote.' });
        return json(res, 200, summarize(state.votes));
      }
      res.writeHead(404); res.end();
    } catch (e) { json(res, 500, { error: e.message }); }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) };
}

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2);
  const get = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : undefined; };
  const candidates = args[0];
  if (!candidates || candidates.startsWith('--') || !get('--screens')) { console.error('Usage: vote.mjs <candidates dir> --screens <screens.json> [--votes <file>] [--port 4180]'); process.exit(EXIT.usage); }
  const { screens } = JSON.parse(await readFile(get('--screens'), 'utf8'));
  const v = await startVoting({ candidates, screens, votesFile: get('--votes') ?? path.join(candidates, 'votes.json'), port: Number(get('--port') ?? 4180) });
  console.log(`Voting at ${v.url}`);
}
