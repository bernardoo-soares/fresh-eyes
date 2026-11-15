# fresh-eyes

A Claude skill that creates and reviews web product UI (app screens, dashboards, settings, tables, forms,
onboarding, empty and error states, and the landing, home and pricing pages that sell the product) so it reads as
made by a thoughtful person, not a template.

It aims at the gap between "modern" and "generated": take what is current from the platform and the category's
best products, spend novelty on one move the product owns, and leave out the devices that make a screen look like
every other generated screen. Then check the result by rendering it and by showing it to a fresh pair of eyes.

Not for logos, slide decks or native mobile apps. Version 1.0.0 (`CHANGELOG.md`).

## What it does

When you ask Claude to build, redesign, improve or review a screen, the skill runs one loop:

1. **Understand** who uses the screen, for what job, how often, on what device, with what real content.
2. **Decide before styling:** the one thing the screen is for, where the eye lands first, what the first screen
   must hold for the main decision, the single primary action, and what is left off.
3. **Write the words first,** from the real data. No invented figures, people or quotes.
4. **Build** structure, then hierarchy, then craft, using the project's own components and tokens when it has them.
5. **Render and look.** A script takes desktop and phone screenshots in light and dark, and lists the problems it
   can measure.
6. **Fresh eyes.** A subagent that has never seen the code or the brief looks at the screenshots and says what the
   page is, what it would click first, and where it hesitated. In Claude Code this is the plugin's `first-look`
   agent; in other tools, any new subagent reads the same brief, `agents/first-look.md`.
7. **Fix and stop,** within two more rounds, then report in plain words what changed and why, and what was not
   tested (gestures, a real phone, Safari, a screen reader).

### What changes in a review

A review follows the same loop and a few extra rules: keep every piece of data and every action the page had,
change only what costs the person something, name every change made, and say "no change needed" when that is
the honest answer. It builds the improved version as a copy beside the original and reports what changed; it
edits your files in place only when you ask for the change to be made.

## What it measures

`scripts/render.mjs` opens the page in Chromium, on a desktop and on an emulated phone, in light and dark, and
reports in plain words:

- contrast and other accessibility failures (axe-core, WCAG 2.2 AA);
- missing focus indicators, sideways scroll on a phone, touch targets that are too small, a missing viewport tag;
- more than one competing primary button, a main button disabled on arrival;
- coloured stripes on one edge used as an accent, em dashes in the copy, labels set in capitals by styling;
- devices of the current template look: eyebrow pills, two-colour headlines, decorative grids and glows, floating
  chat or contact bubbles, the same call to action twice on one screen, centred paragraphs, boxes in boxes. Proof
  stats, ambient motion and fake product shots are not measured; the skill looks for them by eye.

After the problems it prints a "check by eye" list of what it could not decide, such as text on a gradient or an
image. An empty problem list means the floor is clean, not that the screen is good. The skill always looks at
the screenshots too.

Two more scripts: `scripts/tokens.mjs` builds a colour and type token set from one accent colour and checks every
pair for contrast; `scripts/snapshot.mjs` freezes a live page into one self-contained HTML file for offline review.

## Install

Requires Node 20 or later and npm (Playwright 1.63 needs Node 20).

### As a Claude Code plugin

```bash
claude plugin marketplace add bernardoo-soares/fresh-eyes
claude plugin install fresh-eyes@fresh-eyes
```

Or in one step inside a session (Claude Code 2.1.275 or later):

```
/plugin install fresh-eyes --marketplace bernardoo-soares/fresh-eyes
```

Claude Code installs the npm packages itself when it installs the plugin. If Chromium is missing, the first
render says so and prints the one command that downloads it.

### As a personal skill

```bash
git clone https://github.com/bernardoo-soares/fresh-eyes.git "$HOME/.claude/skills/fresh-eyes"
npm --prefix "$HOME/.claude/skills/fresh-eyes" install
node "$HOME/.claude/skills/fresh-eyes/node_modules/playwright/cli.js" install chromium
```

These work from any folder in bash, zsh and PowerShell. Claude Code picks the skill up on its next start, and
because the folder holds `.claude-plugin/plugin.json`, it loads the `first-look` agent with it. In another tool
that loads skills, put the folder where that tool reads skills and run the same two setup commands with its path.

The skill starts on its own when a request is about building or reviewing a screen; you can also ask for it by
name.

For a project of your own, the skill can write a `DESIGN-CONTEXT.md` at the project root (who the users are, the
product's voice, its components and tokens). It reads that file on every later run, so the skill itself stays
free of any one product.

## What it runs on your machine

- An npm install of its two packages, Playwright and axe-core, into the skill's own folder. A plugin install does
  this for you.
- A one-time Chromium download through Playwright, into Playwright's own browser folder.
- Page loads: `render.mjs` and `snapshot.mjs` open the file or URL you give them in a headless Chromium, which
  fetches whatever that page loads. The scripts send nothing anywhere else.
- Your session, only if you pass it: `--storage-state <file>` loads the page with the cookies and local storage in
  that file, so the script sees what you see when signed in. Treat that file like a password and keep it out of
  the repository.
- Files: screenshots and `metrics.json` in the `--out` folder, and token files in the folder you give
  `tokens.mjs`.

## What is inside

| Path | What it holds |
|---|---|
| `SKILL.md` | setup, the loop, the questions that decide most screens, the lines that do not move |
| `references/` | one file per question: `hierarchy.md`, `structure.md`, `clarity.md`, `states.md`, `words.md`, `craft.md`, `floor.md`, `modern.md`, `tells.md`, `landing.md`, `review.md`, `design-context.md`, and `stacks/react-shadcn.md` |
| `agents/first-look.md` | the brief for the fresh-eyes subagent, also loaded as the plugin's `first-look` agent |
| `scripts/` | `render.mjs`, `tokens.mjs`, `snapshot.mjs`; each explains its flags with `--help` |
| `.claude-plugin/` | `plugin.json` and `marketplace.json`, for installing as a Claude Code plugin |
| `CHANGELOG.md` | what each release changed |
| `TASTE.md` | for maintainers: the owner's rulings from blind votes, and what each is measured by |
| `evals/` | the eval cases, the render and voting tools |
| `tests/` | the script tests |
| `NOTICE.md` | the published sources the references draw on |

Every card in `references/` has the same shape: a **Decision**, a **Do**, the **Why** with its source, what to
**Look for**, and when it does not apply (**Unless**). The knowledge is distilled in the skill's own words from
published design writing (Krug, Norman, Nielsen, Cooper, Rosenfeld and Morville, Tufte, Few, Refactoring UI,
GOV.UK content design, Apple's guidelines among others); `NOTICE.md` lists them.

## How it was tested

Each version was run against plain Claude on the same requests, with the same model, in a clean working folder.

- **Cases:** 12 in `evals/`, each a request with invented data: an operations dashboard, an orders table, billing
  settings, a settings page, a first-run screen, an import with errors, a phone approval, a savings home, an AI
  agents overview, a design system, and two reviews (one page with planted problems, one that already works).
- **Graded checks:** each case has outcome checks in `graders/` (for example "the outcome comes first", "only real
  figures", "works on a phone"), judged by a model from the output and its screenshots.
- **Measured problems:** every output is rendered with the skill's own `render.mjs`
  (`node evals/render-outputs.mjs <iteration dir>`).
- **Blind vote:** `node evals/vote-iteration.mjs <iteration dir> --skill <config> --against <config>` serves a page
  that shows two versions side by side, in random order, with desktop and phone views. The voter sees the request,
  never which version came from where.

In the latest round, the skill won 8 of 11 blind votes against plain Claude, with none marked worse; 92% of the
graded checks passed; all 12 of its outputs were clean on `render.mjs`, while plain Claude's outputs had measured
problems on 9 of 12. The votes are one person's, so read them as one careful opinion, not a survey.

`npm test` runs the script tests.

## License

MIT. See `LICENSE` and `NOTICE.md`.
