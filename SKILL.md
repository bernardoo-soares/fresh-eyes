---
name: fresh-eyes
description: Creates and reviews web product UI (app screens, dashboards, settings, tables, forms, onboarding, empty and error states, and the landing, home and pricing pages that sell the product) so it reads as made by a thoughtful person, not a template. Every screen is built from the user's task and real content, checked by rendering it and by a fresh pair of eyes, measured against WCAG 2.2 AA, and kept free of machine-made tells. Use it whenever someone wants to build, design, redesign, improve, review, audit or "make better" a screen, page or component of a web app, SaaS product or its website, fix a confusing or cluttered interface, write interface copy, or set up the visual system a product is built on, even if they never say "design". Not for logos, slide decks or native mobile apps.
license: MIT
compatibility: The scripts need Node 20 or later, npm and a one-time Chromium download. Without them the skill still works from its references.
metadata:
  version: "1.0.0"
---

# Fresh eyes

Design the screen for the person who will use it, from the job they came to do and the content they will see.
Judgement leads; the references sharpen it and the scripts check it. Nothing here outranks plain sense: if a
screen is confusing and no rule names why, it is still confusing.

`<skill>` below is this skill's directory: `${CLAUDE_SKILL_DIR}` (if that shows as a literal variable, use the
folder this file was read from).

## Setup

The scripts need Node 20 or later. When a script says it needs setup, run what it prints: one or both of
`npm --prefix "<skill>" install` and `node "<skill>/node_modules/playwright/cli.js" install chromium`, which work
from any folder and in any shell.

If the scripts cannot run here (no shell, no Node, no network for the browser download), do not stop: take
screenshots with whatever browser tool the session has, or check the code against `references/floor.md` line by
line, and say in the report that the render check did not run. Never report a visual check made from code alone.

## The loop

Use it for creating and for reviewing. For a review, read `references/review.md` first: its steps replace steps
1 to 4, and the improved version is a copy beside the original unless the person asked for their files to change.

1. **Understand.** Who uses this screen, for what job, how often, on what device, with what real content. Read
   the project's `DESIGN-CONTEXT.md` if there is one (`references/design-context.md`). If not, infer from the
   code, copy and request, and note your assumptions. Do not stop to interview the user first.
2. **Decide before styling.** Write down, briefly, in your working notes or the reply, before building: the one
   thing this screen is for; what the eye should land on first; what the first screen must hold for the main
   decision, on desktop and on the phone; the order of everything else; the single primary action; what you are
   leaving off. Name two or three products this category's users already like, whose structures you follow, and
   the one signature move this product owns (`references/modern.md`). This is your intent, and step 6 tests it.
3. **Write the words first.** Headings, labels, buttons, empty and error states, in the person's words, from the
   real data (`references/words.md`). Never invent figures, names, testimonials or trends; with no real data, use
   a visible placeholder.
4. **Build in order:** structure, then hierarchy, then craft, with the project's own components and tokens when
   it has them (for React with shadcn/ui, read `references/stacks/react-shadcn.md`). A new visual system starts
   from `node "<skill>/scripts/tokens.mjs" --accent "<hex>" --out <dir>`, which checks every colour pair.
5. **Render and look.** For an app, start its dev server and pass the URL. Write `--out` to a scratch folder
   outside the project: `node "<skill>/scripts/render.mjs" <page.html | url> --out <dir>` (if it asks for setup
   or cannot run, see Setup); behind a login, add `--storage-state <file>`. It saves desktop and phone, light and
   dark screenshots, prints the problems it can measure (contrast, focus, sideways scroll, small targets,
   competing primary buttons, edge stripes, em dashes), then a "check by eye" list. Fix every problem, or name in
   the report why one stands; a review fixes floor problems, stripes and em dashes, and offers the other measured
   tells as findings. If it warns that light and dark look identical, rerun with `--theme-mode class`. Look at
   the screenshots, the four `-first.png` first, and at each "check by eye" item: an empty list means the floor
   is clean, not that the screen is good. Render once with stress content: the longest real name, the largest
   amount, the empty account.
6. **Fresh eyes.** Start a new subagent that has none of this conversation (not a fork of it); use the
   `first-look` agent type if one is listed. Its whole prompt: `Read <skill>/agents/first-look.md and follow it.
   The job: <one sentence>. Images: <absolute paths, first-screen ones first>. Open no other file.` Add nothing
   about your intent or what you built or changed. Compare its answers with step 2: a wrong "what is this", a
   wrong first click, a hesitation or a "feels off" is a fix; in a review of a page that already works, a
   hesitation that neither blocks nor misleads the job is an optional suggestion, not a fix. Without subagents,
   answer the first-look questions yourself from the first-screen images only, before rereading your code.
7. **Fix and stop.** Fix each hesitation with structure first (a label, a list, a visual, a regrouping); add a
   sentence only when nothing else can carry it. A doubt about a name is fixed by a better name, never by a line
   of explanation under it, and nothing is ever explained inside a menu. At most two more rounds of steps 5 and
   6, then name what is still open. Answer the three questions of the test in `references/modern.md` (which category product would
   call this current; where the signature is; could this belong to any startup), and report.

**The simplest path first.** The main action works the moment the screen opens; extra capability (editing every
row, bulk tools) sits one level down, never in the first screen's way (`references/structure.md`).

**Finished, not bare.** Avoiding tells is not the goal. A screen should look like a finished product: units the
person acts on in their own containers, icons and small visuals where they carry meaning, the whole decision on
the first screen. A wide column of grey sentences is a failure too (`references/hierarchy.md`).

**Scale it to the request.** Words only (labels, an error message): steps 1 to 3. A component or a small fix:
steps 1 to 5. A whole screen or a review: all seven.

## The questions that decide most screens

| Ask | Read |
|---|---|
| Who comes here, how often, for what job? How dense should it be (posture)? How are things grouped, named and reached? | `references/structure.md` |
| What should the eye land on first? Is there exactly one primary action? Does every number have its comparison, unit and date? | `references/hierarchy.md` |
| Can a first-timer tell what this is, where they are and what to do next? | `references/clarity.md` |
| Which state is each region in, and is it exactly one? When someone gets it wrong, undo or confirm? | `references/states.md` |
| Do the words name things as the person does? Does each error say the fix? | `references/words.md` |
| Is the type, spacing, colour, dark mode and motion deliberate? | `references/craft.md` |
| Does it look finished, or like a document? Does the first screen hold the decision? | `references/hierarchy.md` |
| Does it look current without looking generated? What is its signature? | `references/modern.md` |
| Could this screen belong to any product? What can leave it? | `references/tells.md` |
| Is it a landing, home or pricing page? What must a visitor decide? | `references/landing.md` |
| Keyboard, contrast, reflow, names, targets, in both themes? | `references/floor.md` |

Read a reference when its question is open on the screen in front of you, not all of them up front. Each card in
them has a **Decision**, a **Do**, the **Why** with its source, what to **Look for**, and when it does not apply
(**Unless**). The exceptions matter as much as the rules.

## Lines that do not move

- Real content only: no invented numbers, people, quotes or history.
- The accessibility floor (`references/floor.md`) holds in light and dark.
- No coloured stripe on one edge of an element as an accent, and no em dashes in copy (`references/tells.md`).
- In a review, keep every piece of data and every action the page had; move or demote, do not remove.
- "No change needed" is a complete review when nothing costs the person anything. Never change for taste alone.

## Report

Plain words, short:

- what you built or changed, each tied to the person's job and what it saves them; in a review, every change,
  however small (a size, a gap, a colour), for example as a short table of was, now and what it saves the person:
  a change you do not name is a broken promise;
- what you assumed, at most three items, and what would change if an assumption is wrong;
- what you checked: the render problems before and after, and how the first look compared with your intent;
- what you did not test (gestures, a real phone, Safari, a screen reader), and whether the render ran.

No scores, IDs or rule numbers. If the project has no `DESIGN-CONTEXT.md`, offer to write one from your
assumptions.
