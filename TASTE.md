# Taste rulings

The skill owner's rulings from blind votes. The skill follows them, and `evals/render-outputs.mjs` measures the
ones a script can see, so a run that breaks one is caught without anyone looking. This is a maintainer's file:
the skill does not read it at run time, because every ruling also lives in the references.

| Date | Ruling | Measured as |
|---|---|---|
| 2026-11-11 | No coloured stripe on one edge of an element as an accent: the bar on a selected nav item, a callout, a card or a row. Mark a selected item by weight, a filled background or text colour. | `sideStripes` (one-side border, inset shadow, or a thin `::before`/`::after` bar, when saturated) |
| 2026-11-11 | No em dashes in interface copy. Use a comma, colon, full stop or parentheses. | `emDashes` (count in the rendered text) |
| 2026-11-11 | Finished, not bare. A screen must look like a product, not a document: units in their own containers, icons and small visuals that carry meaning, the whole decision on the first screen. Fix a doubt with structure before a sentence. | not measured; judged in the blind vote |
| 2026-11-13 | Modern, but not AI slop. Take "modern" from the platform and the category's best products, spend novelty on one signature move the product owns, and leave out the current template's devices (eyebrow pills in monospace or spaced capitals, two-colour headlines, grids and glows, proof stats, floating bubbles, a doubled call to action, centred paragraphs, boxes in boxes, ambient motion). From 40 of the owner's own loved and disliked screens (`references/modern.md`). | `template` problems in render.mjs |
| 2026-11-13 | One job owns the first screen, the answer is the biggest thing, one visual system per screen, care shown at moments (onboarding, explanation, empty, success), never sell inside the task. | judged in the blind vote |
| 2026-11-13 | Labels in sentence case, never set in capitals by styling ("CURRENT PLAN", "NEXT INVOICE"). Supersedes the analysis's allowance for short capital labels. | `capsLabels` in render.mjs |
| 2026-11-13 | In a list of records that carry an amount, the amount is the last column, at the right edge. | not measured |
| 2026-11-14 | Landing, home and pricing pages are in scope (`references/landing.md`); logos stay out. | the description, tuned with skill-creator's trigger evaluation on 2026-11-14 (34 queries, 13 of 13 held out) |
| 2026-11-14 | A profile photo is changed by tapping the round photo itself, marked with a small "+" or camera badge; never a bare upload button or file field beside it. | not measured |
| 2026-11-14 | In a review, every change is named in the report, however small; a silent change to type size or padding breaks a promise to keep density. On a page that already works, a first-look hesitation that neither blocks nor misleads is offered as optional, not applied (moving a working "Save changes" was graded an invented change three rounds running). | graded in the review cases |
| 2026-11-15 | The important thing comes first, in the reading path: the main action directly under the number or result it acts on ("Add money" under the balance, the download under the import result), never in a side column or only in a bottom bar; things to check are summed up at the top ("2 things to check") before the details. "All about user focus." | judged in the blind vote |
| 2026-11-15 | A page for managing an account (billing, plan, payment) stays plain: each fact with the button that changes it; no charts, strips or extra panels. | judged in the blind vote |
| 2026-11-15 | A menu is short labels only. Never a line of explanation under each item ("Your account" then a description): "a state of the art app never does that, too much info". A label that needs explaining is the wrong label. | not measured |
| 2026-11-14 | Ambient motion is allowed inside an illustration at a moment of care (welcome, empty state, success): small, slow, stopped under reduced motion. Never on a working screen, never behind or on text, buttons or numbers. From a loved opening sequence studied frame by frame: one object made of the product's own parts, once at arrival, about a second, then a screen that holds still. | not measured |

## Blind votes so far

| Iteration | Comparison | Result |
|---|---|---|
| 1 (pilot, 2 cases) | today's skill vs plain Claude | plain Claude won 2 of 2 |
| 1 (pilot, 2 cases) | today's skill vs impeccable | today's skill won 2 of 2, one marked "something got worse" (the stripe) |
| 2 (10 cases, 9 voted) | v2 vs plain Claude | v2 won 5 of 9 (orders, dashboard, settings, review, design system); lost first-run, billing, import, phone approval for being bare. Nothing marked worse. |
| 3 (6 cases) | v3 vs v2 | v3 won 6 of 6 |
| 3 (6 cases) | v3 vs plain Claude | v3 won 4 of 6 (billing and first-run flipped to wins); lost import (over-built: 23 editable fields, the main button disabled on arrival) and phone approval (voted on desktop-width shots of a phone screen). Nothing marked worse. |
| 4 (6 cases, phone view in the vote) | v4 vs plain Claude | v4 won 5 of 6 (83%, target met); lost billing (plain Claude's layout preferred, its capital labels disliked). Nothing marked worse. |
| 4 (6 cases) | v4 vs v3 | v4 won 4 of 6; v3 kept billing (filled primary action, brand-coloured chart, fewer cards) and the dashboard. |
| 5 (12 cases, 11 voted) | v4.1 vs plain Claude | v4.1 won 8 of 11 (73%, target met): both goal cases (agent overview, savings home), planted review, dashboard, billing, phone approval, settings, orders. Lost first-run, import and the design system. Nothing marked worse. Note on settings: the photo upload belongs in the circle, with a "+". |
| 6 (12 cases, 11 voted) | 1.0.0 candidate vs plain Claude | won 6 of 11 (55%, below target): first-run and the design system flipped to wins; lost phone approval, savings home, billing and settings (all won by v4.1) and import. Nothing marked worse. Graded checks 69/73 (95%), zero measured problems, about 1.7x the tokens of v4.1. Held from publishing. |
| 7 (the 5 lost cases, after the 2026-11-15 rulings) | 1.0.0 vs plain Claude | won 5 of 5; with round 6's other wins, every case's latest version beats plain Claude (11 of 11). Nothing marked worse. Published. |
