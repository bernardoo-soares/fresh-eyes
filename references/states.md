# States

How a screen behaves while it loads, when it is empty, when something fails, and when a person needs to back out. Read it when building or reviewing anything that fetches, saves or deletes; the wording of these messages lives in `words.md`.

- [One state per region](#one-state-per-region)
- [Acknowledge, then show status and freshness](#acknowledge-then-show-status-and-freshness)
- [Loading keeps the layout](#loading-keeps-the-layout)
- [Empty states differ by cause](#empty-states-differ-by-cause)
- [Errors beside their cause](#errors-beside-their-cause)
- [Prevent the error, explain the constraint](#prevent-the-error-explain-the-constraint)
- [Check a field when the person leaves it](#check-a-field-when-the-person-leaves-it)
- [Accept what people type](#accept-what-people-type)
- [Slips and mistakes need different fixes](#slips-and-mistakes-need-different-fixes)
- [Easy to back out](#easy-to-back-out)
- [Undo before confirm](#undo-before-confirm)
- [Forcing functions for the catastrophic](#forcing-functions-for-the-catastrophic)
- [Success in proportion](#success-in-proportion)

## What the screen is showing

### One state per region
- **Decision:** Which state is this region in right now: loading, empty, error, partial or full?
- **Do:** Derive the message from the data actually rendered, so the states exclude each other, and replace it in the same render when data arrives or a retry succeeds. When part fails, say which part, next to that part.
- **Why:** A screen that contradicts itself makes every number on it suspect; the person cannot tell what the system did. *Source:* Nielsen, 10 usability heuristics (#1, #4); Norman, *The Design of Everyday Things* (gulf of evaluation).
- **Look for:** "No results" or an error under a full table; a spinner beside loaded content; an error banner still up after a successful reload.
- **Unless:** A partial result is the truth (three of four carriers' tracking loaded): show the data and one scoped note naming what is missing and why.

### Acknowledge, then show status and freshness
- **Decision:** What does the person see the instant after they click, while it runs, and once it is done?
- **Do:** Respond on the control within a tenth of a second (pressed, pending, disabled against a second submit). Past about a second, show progress, determinate if it runs for several. Confirm completion, and date anything that can go stale ("Stock counted 09:40"). When an optimistic change fails, put the old value back, say so beside it, and keep what the person typed.
- **Why:** Without feedback people click again and create two of everything, abandon the action, or trust old numbers. *Source:* Nielsen, 10 usability heuristics (#1); Nielsen, "Response Times: The 3 Important Limits" (0.1 s feels instant); Norman, *The Design of Everyday Things* (feedback); Doherty threshold.
- **Look for:** A button with no visible change after a click; a submit that can be pressed twice; a long upload with only a spinner; a stock level or price with no as-of time.
- **Unless:** Truly instant actions need no spinner; let the change be the feedback. The Doherty 400 ms figure comes from 1980s mainframe studies: a rule of thumb, not a target. Optimistic updates suit actions that rarely fail and can be reversed.

### Loading keeps the layout
- **Decision:** On a first load or a refetch, what replaces the content?
- **Do:** On first load, show a placeholder shaped like the final content. On a refetch, keep the old data visible and mark it as updating; never blank the page. Reserve space first: `width` and `height` or `aspect-ratio` on media, placeholders the size of the result, a fallback font of similar width. Insert late content below or beside what is on screen, never above.
- **Why:** Blanking content loses the person's place and makes every filter change feel like a page reload; a shift under the finger turns a tap into the wrong tap. *Source:* Norman, *The Design of Everyday Things* (feedback, system state); web.dev, Core Web Vitals (layout shift 0.1 or less).
- **Look for:** A full-page spinner when a filter changes; content jumping as it arrives; a late banner that pushes the list down.
- **Unless:** Loads that finish under roughly 300 ms show nothing; a flashed skeleton reads as flicker. A change the person asked for (expanding a row) may move content, in place and at once.

### Empty states differ by cause
- **Decision:** Is this empty because nothing exists yet, because filters hide everything, because the work is done, or because this account cannot see it?
- **Do:** Treat them apart. Nothing yet: explain the object and offer the action that creates the first one. Filtered to nothing: name the active filters and offer to clear them in place. Done: say so, with no call to action. No access: say what is here, that this account cannot see or change it, and who can grant access. Hide what a role can never use; show disabled, with its reason, what it could ask for.
- **Why:** A generic "No data" strands a new person, makes a filtered one think their data is gone, and hides from someone without access that anything is there. *Source:* Norman, *The Design of Everyday Things* (gulf of execution); Nielsen, 10 usability heuristics (#1, #9).
- **Look for:** The same "No data" everywhere; "No results" with no way to reset filters; a first-time visitor shown the filtered message.
- **Unless:** Small inline lists where empty is self-evident ("No tags") need no explanation.

## When something goes wrong

### Errors beside their cause
- **Decision:** Where does an error appear, and what survives it?
- **Do:** Show it beside the thing that failed, keep everything the person entered, and leave it in place until fixed or dismissed. Never clear a form on failure. It says what happened and the next step.
- **Why:** A vague, distant or vanishing error turns a recoverable slip into a dead end and a support ticket. *Source:* Nielsen, 10 usability heuristics (#9); Norman, *The Design of Everyday Things* (designing for error).
- **Look for:** Errors listed far from their fields; a toast gone before it is read; a form emptied after a failed submit; a raw code as the headline.
- **Unless:** Developer audiences want the code: show it secondary and copyable, under the plain sentence.

### Prevent the error, explain the constraint
- **Decision:** Can this mistake be made impossible instead of reported?
- **Do:** Constrain input with the right control and a good default (date picker, stepper, a field that knows its currency), and show rules before typing. When an option or button is disabled, say why next to it.
- **Why:** A prevented error costs nothing, a caught one costs a round trip, and an unexplained disabled control is a puzzle with no way out. *Source:* Nielsen, 10 usability heuristics (#5); Norman, *The Design of Everyday Things* (constraints).
- **Look for:** A rule ("no spaces") shown only after submit; a greyed Submit with no reason; a typed date rejected for its format.
- **Unless:** Disabling Submit until a form is valid often hides what is wrong; letting the submit run and marking each field inline is usually clearer.

### Check a field when the person leaves it
- **Decision:** When does a field say it is wrong?
- **Do:** Check a field when the person leaves it, not while they first type; once in error, recheck on each keystroke so the error clears the moment it is fixed. On submit, keep the button enabled, focus the first problem and, on a long form, list the problems at the top as links. Mark the few optional fields "(optional)". Set `type`, `inputmode` and `autocomplete`; never block paste.
- **Why:** In a small test, inline checks beat checks on submit, and checking after the field beat checking while typing; an error mid-word scolds people for what they have not finished. *Source:* Wroblewski, "Inline Validation in Web Forms" (A List Apart, 2009); Nielsen Norman Group, "10 Design Guidelines for Reporting Errors in Forms" (Krause, 2019); GOV.UK Design System (error summary; question pages); WCAG 1.3.5, 3.3.1.
- **Look for:** "Enter a valid postcode" after the first character; an error left over a corrected value; an asterisk on every field.
- **Unless:** A rule the person can meet as they type (password length, characters left) shows live progress as help, not as an error. A short form may check on submit alone, as GOV.UK services do.

### Accept what people type
- **Decision:** How strict should this field be about format?
- **Do:** Accept common variants (spaces in card numbers, dashes in phone numbers, "1,000", mixed-case emails), normalise them, and show the normalised value back.
- **Why:** Rejecting understandable input blames the person for the system's rigidity. *Source:* Postel's law (Laws of UX); Krug, *Don't Make Me Think*, "Usability as common courtesy".
- **Look for:** "Digits only" messages; a paste that fails on whitespace.
- **Unless:** Never guess when the reading is ambiguous and the value matters (03/04 as a date, a comma that may be a decimal point); constrain or ask instead.

### Slips and mistakes need different fixes
- **Decision:** Did this error come from a fumble or from a misunderstanding?
- **Do:** Fix slips (right goal, wrong action) with spacing, distinct styling and undo. Fix mistakes (wrong goal from a wrong model) with clearer labels, previews and explanations, not more confirmations.
- **Why:** A confirm dialog does not cure a misunderstanding; the person confirms the wrong thing with confidence. *Source:* Norman, *The Design of Everyday Things* (slips versus mistakes).
- **Look for:** A confirmation bolted onto a misunderstood flow; Delete styled and placed like Edit.
- **Unless:** When you cannot tell which kind it is, undo covers both.

## Backing out

### Easy to back out
- **Decision:** What happens when someone guesses wrong?
- **Do:** Make wrong guesses cheap: a visible exit from every flow and dialog, a working back button, entered data kept when they step back. A draft survives a reload, a lost connection and a signed-out session, and the screen says it was kept.
- **Why:** People muddle through rather than learn how things work; if mistakes are costly they stop exploring. *Source:* Nielsen, 10 usability heuristics (#3); Krug, *Don't Make Me Think*, "How we really use the Web".
- **Look for:** A wizard with no back; a modal with no close; a form wiped by one error.
- **Unless:** An action already committed outside the product (a parcel handed to the carrier) cannot be undone; show its status and the next recourse.

### Undo before confirm
- **Decision:** Should this destructive action ask first, or act and offer undo?
- **Do:** If it can be reversed, do it and offer Undo in place. Confirm only what cannot be reversed, naming the object, the count and the consequence, with a verb on the button and focus starting on the safe choice. Keep irreversible or everyone-affecting actions in their own final section, never styled and placed like routine ones.
- **Why:** Routine confirmations train people to click through, so the one that matters is ignored; a delete beside a rename invites the wrong click. *Source:* Norman, *The Design of Everyday Things* (designing for error, undo); Cooper et al., *About Face*; Yifrah, *Microcopy: The Complete Guide*; WAI-ARIA Authoring Practices (dialog pattern: focus the least destructive action).
- **Look for:** "Are you sure?" with Yes and No; a confirm on archive or mark as read; "Delete team" styled and placed like "Rename team".
- **Unless:** Actions others see at once (a message sent, money paid) can offer undo only if the system truly delays them; otherwise confirm, naming the count and the recipient.

### Forcing functions for the catastrophic
- **Decision:** Does this action need a deliberate step that cannot be done on autopilot?
- **Do:** For the rare action that destroys much data or affects others irreversibly, require an act habit cannot perform, such as typing the object's name.
- **Why:** A habitual click can erase months of work. *Source:* Norman, *The Design of Everyday Things* (forcing functions).
- **Look for:** Deleting a whole account or library in one click; or the reverse, type-to-confirm on removing one list item.
- **Unless:** Overuse teaches people to copy and paste the name, which defeats it; keep it to a handful of actions.

### Success in proportion
- **Decision:** How loudly should this success be confirmed?
- **Do:** Confirm routine actions inline and quietly. At the end of a significant flow, show a clear finish that says what happens next. A message that disappears by itself carries only what the person can afford to miss; an error or an Undo stays until dismissed.
- **Why:** A modal "Success!" adds a click to every task, while a vague ending to a big flow leaves doubt. *Source:* peak-end rule (Laws of UX); Norman, *The Design of Everyday Things* (feedback); WCAG 2.2.1, 4.1.3.
- **Look for:** A modal with OK after each save; a long sign-up that ends on a blank page.
- **Unless:** Peak-end comes from studies of remembered pain and pleasure; use it to place effort on endings, not to justify celebration screens.
