# Reviewing an existing screen

The job of a review is to find what costs the person using the screen and remove only that. A good review often
changes little. "No change needed" is a complete answer when nothing costs anyone anything.

These steps replace steps 1 to 4 of the loop in `SKILL.md`; step 7 hands back to its steps 5 to 7. `<skill>` is
the skill's directory, as `SKILL.md` defines it.

**Where the change goes.** Build the improved version as a copy beside the original (a new file next to it, never
over it) and report. Edit the project's own files in place only when the person asked for the change to be made.

## How

1. **See it as it is.** Render the page: `node "<skill>/scripts/render.mjs" <file or url> --out <dir>`, with
   `<dir>` a scratch folder outside the project. For a live app behind a login, add `--storage-state <file>`, or
   freeze the page first with `node "<skill>/scripts/snapshot.mjs" <url> --out <dir>`. Run the first-look agent
   on the original with the job the page serves (step 6 of the loop). Its hesitations are your first list. If the
   scripts cannot run, follow the fallback under Setup in `SKILL.md`.
2. **Name what the page is for.** The person, the job, how often they come (posture, `references/structure.md`).
   Every finding is measured against that job, not against a style.
3. **Walk it as that person.** Do the job on the screenshots, then read the code for what the pictures cannot
   show: names, focus and states; `outline: none` with nothing in its place; `transition: all`; click handlers on
   elements that are not buttons or links; images without width and height; `100vh` on phones; paste blocked in
   a field; dates and money formatted by hand instead of for the person's locale. Note every place a person would
   hesitate, misread, get lost, or be harmed. Use the references to name the cause; never let a missing reference
   stop you. If something is plainly confusing, such as an error message shown under a full table, it is a
   finding even if no rule names it.
4. **Rank by cost to the person.** Harm first (data lost, money wrong, a decision made on a false number), then a
   blocked task, then a slowed task, then friction, then polish. Floor failures (`references/floor.md`) rank by
   the harm they do, not by their criterion number.
5. **Decide what to change.** Change what costs someone something. Keep what works, and say so. Never change for
   taste, novelty or "modern"; an opinion the owner did not ask for is offered as optional, clearly labelled.
   Fix every floor problem the render reports, and every edge stripe and em dash. The other measured tells (such
   as an eyebrow pill or a doubled call to action) are findings to offer, not silent changes. The first-look
   agent always finds some hesitation, so a hesitation alone is not evidence of cost: on a page that already
   works, one that neither blocks nor misleads the job is offered as an optional suggestion, not applied.
6. **Build the improved version** as the copy. Keep every piece of data and every action the page had: move it,
   rename it, demote it, but do not remove it. If an action looks like a leftover that does nothing, keep it and
   ask. Keep what other things depend on: page addresses and anchors, navigation labels, form field names and
   their order; change one only when it is itself a finding, and name it.
7. **Check it** with steps 5 to 7 of the loop, on the copy and with the same job. The hesitations should be gone
   and none should be new. Compare the two sets of first-look answers in your report.

## How to report

- **One line first:** the verdict and the single biggest cause, in plain words.
- **Findings, most costly first.** For each: what the person experiences (quote the screen), why it costs them,
  and what changed, or what you offer if you left it. No IDs, scores or rule numbers in the prose.
- **Every change named.** List each visual or behavioural change you made, including size, spacing and colour,
  even ones that seem too small to mention. A change the report does not name is a broken promise: if the reply
  says density is kept, the type and padding are what they were. A short table works: was, now, what it saves
  the person.
- **What already works,** briefly, so it survives the next edit.
- **Assumptions and questions,** at most three, each one you could not settle from the page.
- **What was measured:** the render problems before and after, and the first-look comparison.
- **What was not tested:** gestures, a real phone, Safari, a screen reader. If the render could not run, say so,
  and report no visual check made from the code alone.
- **Where the improved version is:** the copy's path, or the files changed in place when the person asked.

The lines that do not move in `SKILL.md` hold for the improved version too: no edge stripes, no em dashes.
