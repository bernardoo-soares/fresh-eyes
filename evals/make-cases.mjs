// Writes the v1 eval cases into <skill>/evals/<case>/ in the layout `claude plugin eval` reads.
// All data is invented. Usage: node make-cases.mjs <skill dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.argv[2], 'evals');
const SETTINGS = `---
tags: [fresh-eyes]
max_turns: 60
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash, Agent]
---
`;
const PLACE = '#!/usr/bin/env bash\nset -eu\ncp -R "$(dirname "$0")/files/." .\n';
const BUILD = (file) =>
  `Build it as one self-contained HTML file named ${file} (inline CSS and JS, no network requests, no external fonts). It has to work on desktop and on a phone, in light and in dark mode.`;

// Deterministic PRNG so the data is identical on every machine.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function write(file, text) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text.endsWith('\n') ? text : text + '\n', { encoding: 'utf8' });
}

function writeCase(c) {
  const dir = path.join(ROOT, c.name);
  const inputs = Object.keys(c.files ?? {});
  const tail = inputs.length ? `\n\nInput files: ${inputs.join(', ')}` : '';
  write(path.join(dir, 'prompt.md'), `${SETTINGS}\n${c.prompt}${tail}`);
  const yaml = [
    'schema_version: "1.1"',
    `name: ${c.name}`,
    'expected_outcome: |',
    ...c.expected.trim().split('\n').map((l) => `  ${l}`),
  ];
  if (inputs.length) yaml.push('context:', '  scaffold_script: place-files.sh');
  write(path.join(dir, 'case.yaml'), yaml.join('\n'));
  if (inputs.length) {
    write(path.join(dir, 'place-files.sh'), PLACE);
    for (const [name, body] of Object.entries(c.files)) write(path.join(dir, 'files', name), body);
  }
  c.graders.forEach((g, i) => {
    const slug = g.slug;
    write(
      path.join(dir, 'graders', `${String(i + 1).padStart(2, '0')}-${slug}.md`),
      `---\ntype: llm\nfocus: trace\nweight: 1\n---\n\n${g.text}`,
    );
  });
}

const json = (o) => JSON.stringify(o, null, 2);

// ---------- data ----------
const billing = {
  workspace: 'Northwind Studio',
  plan: { name: 'Team', price_per_seat_month: 12, currency: 'EUR', billing_cycle: 'monthly' },
  seats: { used: 14, included: 15 },
  next_invoice: { date: '2026-12-01', amount: 168.0, currency: 'EUR' },
  payment_method: { brand: 'Visa', last4: '4242', exp_month: 8, exp_year: 2027 },
  billing_email: 'finance@northwind.example',
  tax_id: 'PT 512 345 678',
  billing_address: 'Rua das Flores 12, 1200-195 Lisboa, Portugal',
  invoices: [
    ['INV-2026-011', '2026-11-01', 168.0, 'paid'],
    ['INV-2026-010', '2026-10-01', 156.0, 'paid'],
    ['INV-2026-009', '2026-09-01', 156.0, 'paid'],
    ['INV-2026-008', '2026-08-01', 144.0, 'paid'],
    ['INV-2026-007', '2026-07-01', 144.0, 'paid', 'First attempt failed on 2026-07-01 (card declined); paid on retry 2026-07-03'],
    ['INV-2026-006', '2026-06-01', 132.0, 'paid'],
    ['INV-2026-005', '2026-05-01', 132.0, 'paid'],
    ['INV-2026-004', '2026-04-01', 120.0, 'paid'],
    ['INV-2026-003', '2026-03-01', 120.0, 'paid'],
    ['INV-2026-002', '2026-02-01', 108.0, 'paid'],
    ['INV-2026-001', '2026-01-01', 108.0, 'paid'],
    ['INV-2025-012', '2025-12-01', 96.0, 'paid'],
  ].map(([number, date, amount, status, note]) => ({ number, date, amount, currency: 'EUR', status, ...(note ? { note } : {}) })),
  other_plans: [
    { name: 'Business', price_per_seat_month: 20, adds: ['SSO', 'audit log', 'unlimited guests'] },
  ],
};

const ops = {
  company: 'Brightline Field Services',
  date: '2026-11-12',
  jobs_today: { total: 38, completed: 0, scheduled: 33, unassigned: 5 },
  overdue_from_yesterday: [
    { job: 'J-20931', customer: 'Harbor Dental', type: 'HVAC repair', promised: '2026-11-11 16:00' },
    { job: 'J-20944', customer: 'Lumen Bakery', type: 'Freezer fault', promised: '2026-11-11 12:00' },
    { job: 'J-20950', customer: 'Kestrel Offices', type: 'Annual service', promised: '2026-11-11 10:00' },
  ],
  sla_at_risk: [{ job: 'J-21002', customer: 'St. Clare Clinic', sla: '4h emergency', deadline: '2026-11-12 11:30', status: 'unassigned' }],
  technicians: { on_shift: 14, off_sick: ['Rui Matos', 'Dana Okafor'], vans_in_service: 1 },
  metrics: {
    first_time_fix_rate: { value: 0.82, target: 0.85, last_month: 0.84 },
    avg_rating_30d: { value: 4.6, out_of: 5 },
    revenue_mtd: { value: 184250, currency: 'EUR', target_month: 420000 },
    jobs_completed_mtd: 412,
    avg_travel_minutes: 27,
    parts_backordered: 6,
    open_quotes: 19,
  },
};

function orders() {
  const r = rng(42);
  const pick = (a) => a[Math.floor(r() * a.length)];
  const customers = ['Alder & Finch Ltd', 'Bluewater Grocers', 'Cobalt Hotels Group', 'Dunmore Pharmacy', 'Elm Street Café', 'Fjord Outdoor Co.', 'Granite Builders', 'Halcyon Spa', 'Ironbridge Pubs', 'Juniper Florists', 'Kingfisher Marine', 'Larkspur Schools Trust', 'Meridian Clinics', 'Northgate Deli', 'Oakhurst Golf Club'];
  const reps = ['M. Duarte', 'S. Lindqvist', 'A. Mensah', 'J. Park'];
  const pay = ['paid', 'paid', 'paid', 'paid', 'awaiting payment', 'overdue', 'refunded'];
  const ship = ['delivered', 'delivered', 'shipped', 'packing', 'not started', 'delivered'];
  const out = [];
  for (let i = 0; i < 180; i++) {
    const day = 1 + Math.floor((i * 74) / 180);
    const d = new Date(Date.UTC(2026, 8, 1) + day * 864e5).toISOString().slice(0, 10);
    const payment = pick(pay);
    out.push({
      order: `SO-${(48210 + i).toString()}`,
      customer: pick(customers),
      created: d,
      items: 1 + Math.floor(r() * 40),
      total: Math.round((80 + r() ** 2.2 * 24000) * 100) / 100,
      currency: 'EUR',
      payment,
      fulfilment: payment === 'refunded' ? 'cancelled' : pick(ship),
      sales_rep: pick(reps),
    });
  }
  return out.reverse();
}

const importResult = {
  file: 'contacts.csv',
  rows_total: 412,
  imported: 389,
  failed: 23,
  finished_at: '2026-11-12T09:41:07Z',
  errors: [
    ...[14, 37, 52, 88, 101, 150, 199, 233, 287, 341, 390].map((row, i) => ({ row, code: 'E_EMAIL_FORMAT', field: 'email', value: ['ana.silva@gmail', 'joao@@acme.pt', 'm.lee at corp.com', 'sara@', 'tom@corp', 'li.wei@', 'p.k@example.', 'x@y', 'hello@', '@acme.pt', 'r.diaz@acme..pt'][i] })),
    ...[9, 44, 45, 46, 210, 211, 305].map((row) => ({ row, code: 'E_REQUIRED', field: 'company', value: '' })),
    ...[61, 177, 260].map((row, i) => ({ row, code: 'E_DUPLICATE', field: 'email', value: ['c.nunes@verde.pt', 'h.ito@kaiko.jp', 'b.ross@finch.co.uk'][i], existing_contact: ['Carla Nunes', 'Hana Ito', 'Ben Ross'][i] })),
    ...[118, 402].map((row, i) => ({ row, code: 'E_PHONE_E164', field: 'phone', value: ['912 345 67', '00351-21-xx'][i] })),
  ],
};

const claim = {
  claim_id: 'EXP-7731',
  employee: { name: 'Inês Carvalho', team: 'Sales, Iberia' },
  submitted: '2026-11-10',
  trip: 'Client visit, Porto, 3–4 Nov 2026',
  project_code: 'PRJ-ATLAS',
  currency: 'EUR',
  lines: [
    { date: '2026-11-03', category: 'Train', amount: 62.4, receipt: true },
    { date: '2026-11-03', category: 'Hotel (1 night)', amount: 210.0, receipt: true, policy: { limit: 180.0, rule: 'Hotel max €180 per night in Porto' } },
    { date: '2026-11-04', category: 'Client dinner (4 people)', amount: 298.0, receipt: true },
    { date: '2026-11-04', category: 'Taxi', amount: 42.0, receipt: false },
  ],
  total: 612.4,
  approver_budget_left: { project: 'PRJ-ATLAS', amount: 1840.0 },
};

const settingsList = [
  ['Display name', 'all', 'often'], ['Profile photo', 'all', 'rare'], ['Email address', 'all', 'rare'], ['Password', 'all', 'rare'],
  ['Two-factor authentication', 'all', 'rare'], ['Active sessions and devices', 'all', 'rare'], ['Language', 'all', 'rare'], ['Time zone', 'all', 'rare'],
  ['Date format', 'all', 'rare'], ['Theme (light/dark/system)', 'all', 'sometimes'], ['Email notifications: mentions', 'all', 'sometimes'], ['Email notifications: weekly digest', 'all', 'sometimes'],
  ['Push notifications', 'all', 'sometimes'], ['Do-not-disturb hours', 'all', 'sometimes'], ['Keyboard shortcuts', 'all', 'rare'], ['Workspace name', 'admin', 'rare'],
  ['Workspace logo', 'admin', 'rare'], ['Workspace URL', 'admin', 'rare'], ['Invite members', 'admin', 'often'], ['Member roles', 'admin', 'sometimes'],
  ['Guest access', 'admin', 'sometimes'], ['Single sign-on (SAML)', 'admin', 'rare'], ['Allowed email domains', 'admin', 'rare'], ['Audit log', 'admin', 'rare'],
  ['Plan and seats', 'admin', 'sometimes'], ['Payment method', 'admin', 'rare'], ['Invoices', 'admin', 'sometimes'], ['Slack integration', 'admin', 'rare'],
  ['Google Drive integration', 'admin', 'rare'], ['API tokens', 'admin', 'rare'], ['Webhooks', 'admin', 'rare'], ['Export all workspace data', 'admin', 'rare'],
  ['Delete my account', 'all', 'rare'], ['Delete workspace', 'admin', 'rare'],
].map(([name, audience, use]) => ({ name, audience: audience === 'all' ? 'every user' : 'workspace admins only', used: use }));

// A review fixture with planted clarity defects and two decoys. The truth lives only in the graders.
const plantedPage = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Projects</title>
<style>
  :root { --bg:#ffffff; --panel:#f6f7f9; --text:#1d2330; --muted:#5b6475; --line:#dde1e8; --accent:#2f5bea; --on-accent:#fff; --danger:#c62828; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0f1218; --panel:#171b23; --text:#e8ebf1; --muted:#a3abba; --line:#2a303b; --accent:#7c9cff; --on-accent:#0f1218; --danger:#ff8a80; } }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; background:var(--bg); color:var(--text); }
  .shell { display:grid; grid-template-columns:220px 1fr; min-height:100vh; }
  nav { background:var(--panel); border-right:1px solid var(--line); padding:16px 12px; }
  nav a { display:block; padding:8px 10px; border-radius:6px; color:var(--text); text-decoration:none; }
  nav a:hover { background:var(--line); }
  main { padding:24px 32px; }
  .top { display:flex; align-items:center; gap:12px; }
  .top h1 { font-size:22px; margin:0; flex:1; }
  .btn { height:36px; padding:0 14px; border-radius:6px; border:0; font:inherit; font-weight:600; background:var(--accent); color:var(--on-accent); cursor:pointer; }
  .icon { width:36px; height:36px; border-radius:6px; border:1px solid var(--line); background:transparent; color:var(--text); cursor:pointer; }
  .toolbar { display:flex; gap:8px; margin:20px 0 12px; }
  .toolbar input { height:36px; flex:1; max-width:320px; padding:0 10px; border:1px solid var(--line); border-radius:6px; background:var(--bg); color:var(--text); font:inherit; }
  .toolbar input::placeholder { color:#c3c8d1; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; color:var(--muted); font-weight:600; padding:6px 8px; border-bottom:1px solid var(--line); }
  td { padding:6px 8px; border-bottom:1px solid var(--line); }
  td.num { text-align:right; font-variant-numeric:tabular-nums; }
  .pill { display:inline-block; padding:1px 8px; border-radius:99px; font-size:12px; }
  .pill.ok { background:#2e7d32; color:#fff; } .pill.late { background:#c62828; color:#fff; } .pill.hold { background:#ef6c00; color:#fff; }
  .muted { color:var(--muted); }
  .empty { margin-top:28px; padding:20px; border:1px dashed var(--line); border-radius:8px; color:var(--muted); }
  .danger-row { margin-top:28px; display:flex; gap:8px; }
</style>
</head>
<body>
<div class="shell">
  <nav aria-label="Main">
    <a href="#">Home</a>
    <a href="#">Projects</a>
    <a href="#">Resources</a>
    <a href="#">Insights</a>
    <a href="#">Admin</a>
  </nav>
  <main>
    <div class="top">
      <h1>Overview</h1>
      <button class="icon" type="button" title="">&#x21bb;</button>
      <button class="btn" type="button">Save</button>
      <button class="btn" type="button">Publish</button>
      <button class="btn" type="button">Process</button>
    </div>
    <div class="toolbar">
      <input type="search" placeholder="Search projects by name or client">
      <button class="icon" type="button">&#x2699;</button>
    </div>
    <table>
      <thead><tr><th>Project</th><th>Client</th><th>Owner</th><th>Due</th><th class="num">Budget used</th><th>State</th></tr></thead>
      <tbody>
        <tr><td>Website relaunch</td><td>Harbor Dental</td><td>M. Duarte</td><td>2026-12-04</td><td class="num">62%</td><td><span class="pill ok">&#9679;</span></td></tr>
        <tr><td>Brand refresh</td><td>Lumen Bakery</td><td>S. Lindqvist</td><td>11/20/2026</td><td class="num">104%</td><td><span class="pill late">&#9679;</span></td></tr>
        <tr><td>Intranet</td><td>Kestrel Offices</td><td>A. Mensah</td><td>2026-11-28</td><td class="num">38%</td><td><span class="pill hold">&#9679;</span></td></tr>
        <tr><td>Patient app</td><td>St. Clare Clinic</td><td>J. Park</td><td>3 Jan</td><td class="num">71%</td><td><span class="pill ok">&#9679;</span></td></tr>
        <tr><td>Menu boards</td><td>Northgate Deli</td><td>M. Duarte</td><td>2026-11-19</td><td class="num">96%</td><td><span class="pill late">&#9679;</span></td></tr>
        <tr><td>Booking flow</td><td>Halcyon Spa</td><td>S. Lindqvist</td><td>2026-12-15</td><td class="num">12%</td><td><span class="pill ok">&#9679;</span></td></tr>
      </tbody>
    </table>
    <p class="muted" style="font-size:13px;margin-top:8px">6 projects &middot; budgets as of today</p>
    <div class="empty">No entities match the current predicate (ERR_NULL_SET). Adjust parameters.</div>
    <div class="danger-row">
      <button class="btn" type="button">Export</button>
      <button class="btn" type="button" onclick="document.querySelector('tbody').innerHTML=''">Delete all</button>
    </div>
  </main>
</div>
</body>
</html>
`;

// The two cases below pull hardest toward the current template (an AI product) and toward "modern consumer app"
// (a phone money home): they test the gap between modern and generated directly.
const agents = {
  workspace: 'Harbour & Pine (online homeware shop)',
  date: '2026-11-13',
  agents: [
    { name: 'Inbox triage', job: 'Reads incoming customer emails and routes them to the right queue', status: 'running', runs_today: 412, handled_without_human: 0.94, avg_seconds: 6, last_error: null },
    { name: 'Refund drafts', job: 'Drafts refund replies for damaged or late orders; a person approves each one', status: 'waiting for approval', runs_today: 37, awaiting_approval: 3, oldest_waiting_minutes: 52, last_error: null },
    { name: 'Stock questions', job: 'Answers "is this back in stock?" emails from the stock feed', status: 'failing', runs_today: 58, failed_today: 21, last_error: 'Stock feed returned 401 Unauthorized since 09:12', handled_without_human: 0.6 },
    { name: 'Review replies', job: 'Drafts public replies to product reviews under 3 stars', status: 'paused', runs_today: 0, paused_by: 'Marta Lopes', paused_reason: 'Tone check after a complaint', paused_since: '2026-11-12 17:40' },
  ],
  awaiting_approval: [
    { id: 'R-8812', customer: 'Joana Reis', summary: 'Lamp arrived cracked; asks for a refund of €89.00', drafted: '08:41' },
    { id: 'R-8815', customer: 'Tom Becker', summary: 'Rug delivered 9 days late; asks for delivery fee back (€12.50)', drafted: '09:02' },
    { id: 'R-8819', customer: 'Aiko Tanaka', summary: 'Two of six glasses broken; asks for partial refund of €18.00', drafted: '09:30' },
  ],
  totals_today: { runs: 507, handled_without_human: 0.88, human_minutes_saved: 410, cost_eur: 6.84 },
  last_7_days_runs: [431, 455, 398, 470, 502, 389, 507],
};

const savings = {
  person: 'Ana',
  currency: 'EUR',
  total: 4826.4,
  change_this_month: 312.0,
  pots: [
    { name: 'Rainy day', balance: 2400.0, goal: 3000.0 },
    { name: 'Lisbon flat deposit', balance: 1980.4, goal: 12000.0, goal_date: '2028-06-01' },
    { name: 'Christmas', balance: 446.0, goal: 500.0, goal_date: '2026-12-15' },
  ],
  round_ups: { on: true, this_month: 18.4 },
  next_scheduled: { amount: 150.0, date: '2026-11-15', to: 'Lisbon flat deposit' },
  recent: [
    { date: '2026-11-12', what: 'Round-ups', pot: 'Rainy day', amount: 4.2 },
    { date: '2026-11-10', what: 'Moved to Christmas', pot: 'Christmas', amount: 50.0 },
    { date: '2026-11-08', what: 'Interest', pot: 'Rainy day', amount: 6.1 },
    { date: '2026-11-03', what: 'Withdrawal to current account', pot: 'Rainy day', amount: -120.0 },
    { date: '2026-11-01', what: 'Monthly transfer', pot: 'Lisbon flat deposit', amount: 150.0 },
  ],
  interest_rate_aer: 0.0275,
};

// ---------- cases ----------
const cases = [
  {
    name: 'create-agent-overview',
    prompt: `Our product lets online shops run AI agents on their customer emails. agents.json is today's state for one shop. Build the agents overview: the screen the shop's operations lead opens to see what the agents did and what needs a person. ${BUILD('agents.html')}`,
    files: { 'agents.json': json(agents) },
    expected: `An overview that leads with what needs a person (the failing Stock questions agent with its cause, three refund drafts waiting for approval, the oldest for 52 minutes), then each agent's state in words, then today's totals in context, with every figure from agents.json and none of the current AI-product template (sparkles, glows, gradient headlines, eyebrow pills, "AI-powered" copy).`,
    graders: [
      { slug: 'needs-a-person-first', text: 'In agents.html, the failing agent (with the 401 stock feed cause) and the three refund drafts awaiting approval appear first and with more visual weight than the totals and the healthy agents.' },
      { slug: 'state-in-words', text: 'agents.html states each of the four agents\' status in words (running, waiting for approval, failing, paused), not by colour alone, and names who paused Review replies and why.' },
      { slug: 'only-real-figures', text: 'Every figure on agents.html comes from agents.json or is arithmetic on it; no invented accuracy scores, savings, trends or agents.' },
      { slug: 'no-ai-template', text: 'agents.html has none of the AI-product template: no sparkle or magic-wand icons, glows, gradient or two-colour headlines, eyebrow pills, robot imagery, or copy such as "AI-powered", "supercharge" or "intelligent".' },
      { slug: 'one-primary-action', text: 'The first screen of agents.html at 1440×900 shows at most one filled, accent-coloured button.' },
      { slug: 'works-on-phone', text: 'agents.html has no horizontal page scroll at 390 px wide, and what needs a person comes first on the phone too.' },
    ],
  },
  {
    name: 'create-savings-home',
    prompt: `This is the home screen of our savings app: people open it on their phone to see how much they have put aside and to add money. savings.json is one customer's data. Build that phone screen as one self-contained HTML file named savings.html (inline CSS and JS, no network requests, no external fonts), designed for a 390 px wide phone, in light and in dark mode.`,
    files: { 'savings.json': json(savings) },
    expected: `A phone home where the total saved is the biggest thing, the three pots show progress against their goals, adding money is one tap within thumb reach, recent movements show signed amounts at the right edge, and the screen looks like a current consumer finance app without any of the generated template.`,
    graders: [
      { slug: 'total-is-hero', text: 'In savings.html at 390×844, the total saved (€4,826.40) is the largest text on the first screen.' },
      { slug: 'pots-against-goals', text: 'savings.html shows the three pots with their progress against each goal (for example 2,400 of 3,000), and at least two pots are visible on the first screen.' },
      { slug: 'add-money-reach', text: 'In savings.html, adding money is one tap from the first screen, on a target at least 44 px tall in the lower half of the screen or in a fixed bar.' },
      { slug: 'signed-amounts-right', text: 'In savings.html, recent movements show signed amounts (the withdrawal of €120.00 as a negative) right-aligned at the end of each row, with the sign or a word as well as any colour.' },
      { slug: 'only-real-figures', text: 'Every figure on savings.html comes from savings.json or is arithmetic on it; no invented history, projections or rates.' },
      { slug: 'no-overflow-dark', text: 'savings.html has no horizontal page scroll at 390 px wide, and its dark mode text meets WCAG AA contrast.' },
    ],
  },
  {
    name: 'create-billing-settings',
    prompt: `I'm building the Billing page of our project-management SaaS (teams of 5 to 50 people). billing.json has the current workspace's data. ${BUILD('billing.html')}`,
    files: { 'billing.json': json(billing) },
    expected: `A billing page built from the task people come for (download an invoice, check or change the card, see what the next charge will be), with the plan and seats clear, the 14 of 15 seats surfaced, upgrade present but not dominating, and every figure taken from billing.json.`,
    graders: [
      { slug: 'only-real-figures', text: 'Every figure, date, name and plan detail shown on billing.html comes from billing.json or is arithmetic on it; nothing is invented (no fake usage charts, testimonials, savings claims or extra plans).' },
      { slug: 'policy-claims-flagged', text: 'Any statement on billing.html about billing policy that billing.json does not support (who can change billing, when a cancellation or plan change takes effect, proration) is listed as an assumption in the reply to the user.' },
      { slug: 'invoice-and-card-first-screen', text: 'At 1440×900 in billing.html, the latest invoice can be downloaded and the payment card can be changed from the first screen, without scrolling.' },
      { slug: 'next-charge-stated', text: 'billing.html states the next charge (EUR 168.00 on 1 December 2026) in plain words.' },
      { slug: 'seats-near-limit', text: 'billing.html makes it visible that 14 of 15 seats are used, so the next member added will need a seat.' },
      { slug: 'one-primary-action', text: 'The first screen of billing.html at 1440×900 shows at most one filled, accent-coloured button.' },
      { slug: 'works-on-phone-and-dark', text: 'billing.html has no horizontal page scroll at 390 px wide and has a dark mode whose text meets WCAG AA contrast.' },
    ],
  },
  {
    name: 'create-attention-dashboard',
    prompt: `Our operations managers open the dashboard of our field-service app first thing every morning. ops.json has today's data. ${BUILD('dashboard.html')} Desktop first.`,
    files: { 'ops.json': json(ops) },
    expected: `A morning dashboard that leads with what needs a decision today (the SLA job at risk and unassigned, five unassigned jobs, three overdue jobs, two technicians off sick) and gives the routine metrics less weight, with every number from ops.json.`,
    graders: [
      { slug: 'action-items-lead', text: 'In dashboard.html, the items that need action today (the SLA job at risk, unassigned jobs, overdue jobs, technicians off sick) appear above and with more visual weight than the routine metrics.' },
      { slug: 'sla-risk-unmissable', text: 'dashboard.html shows the St. Clare Clinic emergency job with its 11:30 deadline and that it is unassigned, in the first screen at 1440×900.' },
      { slug: 'metrics-in-context', text: 'Where dashboard.html shows a metric that has a target or a previous value in ops.json (first-time fix rate, revenue), it shows it against that target or previous value, not as a bare number.' },
      { slug: 'only-real-figures', text: 'Every number on dashboard.html comes from ops.json; no invented trends, sparklines with made-up history, or percentages not derivable from the data.' },
      { slug: 'not-equal-tiles', text: 'dashboard.html does not lay its first screen out as a grid of equally weighted KPI tiles.' },
      { slug: 'works-on-phone', text: 'dashboard.html has no horizontal page scroll at 390 px wide, and the action items come first on the phone too.' },
    ],
  },
  {
    name: 'create-orders-table',
    prompt: `Build the Orders list for our B2B wholesale admin. Staff keep it open all day to find an order and check whether it is paid and shipped. orders.json has the 180 most recent orders. ${BUILD('orders.html')}`,
    files: { 'orders.json': json(orders()) },
    expected: `A dense, scannable orders table: findable by order number or customer, payment and fulfilment status readable at a glance without relying on colour, amounts right-aligned in tabular figures, dates in one format, and usable on a phone.`,
    graders: [
      { slug: 'find-an-order', text: 'orders.html lets a person find an order by order number and by customer name, and the search or filter actually works on the 180 orders.' },
      { slug: 'status-without-colour', text: 'In orders.html, payment and fulfilment status are each readable as words or icons with text, not by colour alone.' },
      { slug: 'numbers-aligned', text: 'In orders.html, money amounts are right-aligned, use tabular figures and show the currency consistently.' },
      { slug: 'density-for-all-day-use', text: 'At 1440×900, orders.html shows at least 15 order rows on the first screen.' },
      { slug: 'problems-findable', text: 'orders.html offers a way to see only orders that need attention (overdue or awaiting payment, or not shipped yet).' },
      { slug: 'works-on-phone', text: 'orders.html has no horizontal page scroll at 390 px wide; order number, customer, total and both statuses stay readable on the phone.' },
    ],
  },
  {
    name: 'create-import-errors',
    prompt: `People import contacts into our CRM from a CSV. An import of contacts.csv just finished: 389 of 412 rows went in and 23 failed. import-result.json lists every error. Design the screen the person sees right after the import. ${BUILD('import-result.html')}`,
    files: { 'import-result.json': json(importResult) },
    expected: `A result screen that states the outcome first in plain words, groups the 23 failures by cause with counts, says for each cause what to do in the person's terms, offers a way to fix or download the failed rows and retry, and never shows internal error codes as the message.`,
    graders: [
      { slug: 'outcome-first', text: 'The first thing import-result.html says is the outcome in plain words: 389 contacts imported and 23 that need attention.' },
      { slug: 'grouped-by-cause', text: 'import-result.html groups the 23 failed rows by cause (invalid email 11, missing company 7, already a contact 3, phone format 2) with counts, rather than listing 23 undifferentiated lines first.' },
      { slug: 'fix-in-users-terms', text: 'For each cause, import-result.html says what to do in the person\'s terms, and no internal code (E_EMAIL_FORMAT, E_REQUIRED, E_DUPLICATE, E_PHONE_E164) is used as the message.' },
      { slug: 'recover-path', text: 'import-result.html offers a way to get the failed rows back out (download them or fix them inline) and to import them again.' },
      { slug: 'duplicates-are-not-errors', text: 'import-result.html treats the 3 rows that match existing contacts differently from broken data (for example offering to update or skip), naming the existing contact.' },
      { slug: 'works-on-phone', text: 'import-result.html has no horizontal page scroll at 390 px wide.' },
    ],
  },
  {
    name: 'create-first-run',
    prompt: `New users of our product-analytics tool land on an empty workspace right after sign-up: no data source connected, no dashboards, no teammates. They can connect Postgres, Stripe, Google Sheets or upload a CSV, and there is a sample dataset to explore. Build that first screen. ${BUILD('welcome.html')}`,
    files: {},
    expected: `A first screen with one obvious first step (connect data), the sample dataset as a clear secondary path, copy that is specific to this product rather than generic welcome language, and no invented charts or numbers presented as the user's data.`,
    graders: [
      { slug: 'one-first-step', text: 'welcome.html makes one first step obvious: there is a single primary action, and it leads to connecting data.' },
      { slug: 'sample-path', text: 'welcome.html offers the sample dataset as a clear secondary path.' },
      { slug: 'no-fake-data', text: 'welcome.html shows no charts, metrics or numbers that could be read as the new user\'s own data.' },
      { slug: 'specific-copy', text: 'The headline and body copy of welcome.html are specific to a product-analytics tool; they contain no generic phrases such as "Welcome to the future", "unlock", "supercharge", "seamless" or "all-in-one".' },
      { slug: 'all-sources-named', text: 'welcome.html names all four ways to bring data in (Postgres, Stripe, Google Sheets, CSV).' },
      { slug: 'works-on-phone', text: 'welcome.html has no horizontal page scroll at 390 px wide.' },
    ],
  },
  {
    name: 'create-mobile-approval',
    prompt: `Managers approve expense claims from their phone, usually between meetings. claim.json is one claim waiting for approval. Build that phone screen as one self-contained HTML file named approve.html (inline CSS and JS, no network requests, no external fonts), designed for a 390 px wide phone, in light and in dark mode.`,
    files: { 'claim.json': json(claim) },
    expected: `A phone screen where the total and the two problems (hotel over the €180 policy limit, taxi without receipt) are seen before the decision, approve and reject are large and within thumb reach, and rejecting or partially approving asks for a reason.`,
    graders: [
      { slug: 'problems-before-decision', text: 'In approve.html the hotel over policy (€210 vs €180 limit) and the taxi without a receipt are both visible before the person reaches the approve button.' },
      { slug: 'total-prominent', text: 'approve.html shows the total (€612.40) and who submitted the claim prominently near the top.' },
      { slug: 'thumb-reach', text: 'In approve.html at 390×844, approve and reject are in the lower part of the screen and each is at least 44 px tall.' },
      { slug: 'reject-asks-why', text: 'Rejecting in approve.html (or sending back) asks for a reason before it completes.' },
      { slug: 'only-real-figures', text: 'Every figure in approve.html comes from claim.json.' },
      { slug: 'no-overflow', text: 'approve.html has no horizontal page scroll at 390 px wide, and its dark mode text meets WCAG AA contrast.' },
    ],
  },
  {
    name: 'create-settings-ia',
    prompt: `Our app's settings grew into one long page of 34 options and people can't find anything. settings.json lists every option, who can change it and how often people use it. Reorganise them and build the new Settings. ${BUILD('settings.html')} Explain the structure you chose, and why, in structure.md.`,
    files: { 'settings.json': json(settingsList) },
    expected: `A settings structure grouped in people's words, with personal settings separated from workspace-admin settings, frequent options easy to reach, every one of the 34 options present exactly once, destructive actions set apart and guarded, and a short rationale in structure.md.`,
    graders: [
      { slug: 'all-34-once', text: 'settings.html contains every one of the 34 options from settings.json exactly once (renamed is fine if the meaning is the same).' },
      { slug: 'personal-vs-workspace', text: 'settings.html separates the settings that are about me (every user) from the ones that are about the workspace (admins only).' },
      { slug: 'no-junk-drawer', text: 'No group in settings.html is a catch-all ("General", "Other", "Misc", "Advanced") holding more than 5 unrelated options.' },
      { slug: 'destructive-apart', text: 'In settings.html, "Delete my account" and "Delete workspace" are set apart from other options and ask for confirmation.' },
      { slug: 'rationale', text: 'structure.md explains the organising principle in a few sentences, in terms of who looks for what.' },
      { slug: 'works-on-phone', text: 'settings.html has no horizontal page scroll at 390 px wide and its navigation between groups works on the phone.' },
    ],
  },
  {
    name: 'review-planted-clarity',
    prompt: `Here's the Projects page of our agency's project tool: projects.html. People say it's confusing. Review it and tell me what should change and why. Show me the improved version as projects-improved.html.`,
    files: { 'projects.html': plantedPage },
    expected: `A review that finds the planted clarity defects (no current page in the navigation and a heading that does not match it, three competing primary buttons with a vague "Process", an unlabelled icon button, status shown only by colour dots, inconsistent date formats, a placeholder used as the only label and too faint to read, a jargon empty state, and a "Delete all" styled like "Export" next to it with no confirmation), leaves the two decoys alone (13 px table text and right-aligned budget numbers are deliberate and fine), and shows an improved version that fixes what it found.`,
    graders: [
      { slug: 'finds-navigation', text: 'The review says the navigation does not show the current page and/or the heading "Overview" does not match the "Projects" page.' },
      { slug: 'finds-competing-actions', text: 'The review says Save, Publish and Process compete as three equal primary buttons and/or that "Process" is a vague label.' },
      { slug: 'finds-unlabelled-icons', text: 'The review says the icon-only buttons (refresh and settings) have no accessible name or visible label.' },
      { slug: 'finds-colour-only-status', text: 'The review says project state is shown by coloured dots only, without words.' },
      { slug: 'finds-date-formats', text: 'The review says the Due column mixes date formats.' },
      { slug: 'finds-jargon-empty-state', text: 'The review says the empty-state message ("No entities match the current predicate (ERR_NULL_SET)") is jargon and should say what happened and what to do in plain words.' },
      { slug: 'finds-dangerous-delete', text: 'The review says "Delete all" looks the same as "Export", sits next to it, and deletes without confirmation.' },
      { slug: 'finds-placeholder-label', text: 'The review says the search field relies on a placeholder as its label and/or the placeholder text is too faint to read.' },
      { slug: 'leaves-decoys', text: 'The review does not propose enlarging the 13 px table text or left-aligning the right-aligned budget numbers.' },
      { slug: 'improved-version-fixes', text: 'projects-improved.html fixes the problems the review names without removing any data or action that projects.html had.' },
    ],
  },
  {
    name: 'review-good-settings',
    prompt: `Here's our Settings page: settings.html. Improve the UI wherever it's needed.`,
    files: { 'settings.html': '__COPY_GOOD_SETTINGS__' },
    expected: `The page already meets WCAG 2.2 AA and has no clarity problem, so the result says no change is needed (or proposes at most clearly-labelled optional opinions) instead of inventing changes.`,
    graders: [
      { slug: 'no-invented-changes', text: 'The response does not change or propose changing settings.html for taste, modernity or speculative features; it says no change is needed, or labels any remaining remarks as optional opinion.' },
      { slug: 'checked-not-assumed', text: 'The response shows the page was actually checked (rendered or measured: contrast, focus, sizes), not judged from the code alone.' },
    ],
  },
  {
    name: 'system-tidemark',
    prompt: `We're starting Tidemark, a booking tool for independent physiotherapy clinics. Our brand colour is #b45309. Set up the design system we should build the UI on, and show it on one sample screen (today's appointments for one clinic) as tidemark-sample.html.`,
    files: {},
    expected: `A token system with semantic colour roles for light and dark (and ideally increased contrast), a type scale in rem, spacing, radius and motion, all contrast-checked by measurement, applied to a day-of-appointments sample screen where the brand colour is used for emphasis rather than everywhere.`,
    graders: [
      { slug: 'contrast-measured', text: 'Every text/background colour pair in the system is reported with a measured contrast ratio, and each meets 4.5:1 for body text.' },
      { slug: 'light-and-dark', text: 'The system defines both light and dark themes as semantic roles (for example text, muted text, surface, accent, danger), not only a raw palette.' },
      { slug: 'rem-type-scale', text: 'Type sizes are in rem, so they follow the user\'s font-size setting.' },
      { slug: 'reduced-motion', text: 'The system includes a reduced-motion rule.' },
      { slug: 'brand-for-emphasis', text: 'On tidemark-sample.html, the brand colour is used for emphasis (primary action, selection, links) and not as the fill of most surfaces.' },
      { slug: 'times-aligned', text: 'On tidemark-sample.html, appointment times line up in tabular figures and the appointments read in time order.' },
    ],
  },
];

import { readFileSync } from 'node:fs';
const good = readFileSync(path.join(ROOT, 'fixtures', 'app', 'good-settings.html'), 'utf8');
for (const c of cases) {
  if (c.files?.['settings.html'] === '__COPY_GOOD_SETTINGS__') c.files['settings.html'] = good;
  writeCase(c);
}
console.log(cases.map((c) => c.name).join('\n'));
