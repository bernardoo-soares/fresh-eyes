# Modern without the template

How to make a screen look current without it looking generated. Read it when choosing the visual direction of a
new screen or product, and when a screen "looks like AI".

## Why this is hard for a model

A model's sense of "modern" is the average of what it has seen most, and the most-produced interfaces of recent
years are startup landing pages and template dashboards. Reaching for "modern" by default therefore reaches for
the template's devices (listed below), which people now read as machine-made at first sight. Loved products are
just as current, but their modernity comes from two other sources: **the platform** (the current phone and web
idiom, executed precisely) and **their own brand** (a few choices that belong only to them).

## The method

1. **Name the category's leaders.** Before designing, name two or three products people in this category already
   use and like, and note how they show the things this screen shows: the key number, the list, the main action,
   the empty state. Follow those structures. Current means current in this category's best products, not in
   "modern web design". (This is Jakob's law used for taste: people judge a screen against the apps they use
   every day.)
2. **Choose one signature move,** and keep everything else conventional. Spend all the novelty in one owned place:
   an accent colour with a job (action and selection only); a typeface choice for the hero number or the product
   name; an illustration style used for onboarding, explanations and empty states; an opening or success motion (`craft.md`, Care at moments).
   Write it down in step 2 of the loop and in `DESIGN-CONTEXT.md`, so the next screen reuses it.
3. **Derive expression from the content.** Colour from what the screen shows (logos, photos, flags, the data's own
   states), illustration from what the product does, words from the person's task. If a stylistic choice could be
   pasted into any other product unchanged, it is template.
4. **Spend care at moments.** Personality goes where a person is learning, waiting or arriving (see "Care at
   moments" in `craft.md`). Working screens stay calm.
5. **Run the test** at the end of the loop.

## The current template: devices to leave out

Each of these reads as generated because it is applied by default rather than chosen for the content.
`scripts/render.mjs` reports the ones a script can see (marked *measured*).

- **Eyebrow pills:** a small pill above a headline in monospace or widely spaced capitals, often with a dot
  ("● NOW IN BETA"). *measured*
- **Two-colour headlines:** the last words of a headline in the accent colour, often underlined or with a
  gradient. *measured*
- **Decorative backgrounds:** faint grids, blurred colour glows, corner brackets, scattered "+" marks, sparkles.
  *measured (grids and glows)*
- **Proof stats:** a row of round numbers with "+", "~" or "%" ("500+ teams", "5M+ users") where the person's own
  data should be.
- **Floating bubbles:** chat, contact or messaging buttons fixed over the content. *measured*
- **The same call to action twice** on one screen, usually a pill with an arrow and a coloured shadow. *measured*
- **Centred paragraphs:** body text of three or more lines centred. *measured*
- **Boxes in boxes:** a card inside a card inside a panel. *measured*
- **Ambient motion:** decoration that floats, pulses or drifts on a working screen, or behind or on text, buttons and numbers. Gentle motion inside an illustration at a moment of care is allowed (`craft.md`, Care at moments); anything that moves for more than five seconds beside other content stops by itself or can be stopped (WCAG 2.2.2).
- **Fake product shots:** an illustrative console, dashboard or chat that shows invented rows.
- **AI ornaments:** sparkles, magic wands, robot heads or a glowing gradient standing in for an automated feature.
  Name what it does ("Drafts replies", "Sorts by urgency") and give it the same icon language as everything else.

None of these is banned because it is ugly. Each is a signal that nobody chose it for this product. When a brand
genuinely owns one (it was there before, it is used everywhere, people recognise it), keep it and say so.

## What stays allowed

The test is ownership and count, not the element. Floating pill tab bars, large type for the key number with
smaller decimals, rounded
containers, tinted dark surfaces, translucency on navigation, illustration at the right moment: all of these
appear in products people love. They become the template when several arrive together with no reason.

## Density fits the job

There is no right amount of space. A screen for one decision (book a ride, start a workout, pick one plan) is
sparse, with one thing to do. A screen people scan all day (a portfolio, a queue) is dense, with everything in
its place. Both feel right when the density matches how the screen is used (`structure.md`, posture).

## The test

Answer these in writing before reporting:

1. **Which product in this category would recognise this screen as current?** Name it.
2. **What is this product's signature, and where is it on this screen?** One thing.
3. **Could this screen belong to any startup?** If yes, it is not finished: replace a template device with
   something from the content or the signature.
