# Words

What the interface says: names, buttons, state messages, numbers, money and dates. Read it before writing or reviewing copy; the behaviour behind each message is in `states.md`.

- [The person's words, not the system's](#the-persons-words-not-the-systems)
- [One word per thing, everywhere](#one-word-per-thing-everywhere)
- [Button says what happens](#button-says-what-happens)
- [Write nothing](#write-nothing)
- [Structure before sentences](#structure-before-sentences)
- [Front-load the point](#front-load-the-point)
- [Concrete beats promotional](#concrete-beats-promotional)
- [Talk to one reader](#talk-to-one-reader)
- [Errors say what to do next](#errors-say-what-to-do-next)
- [No blame, no theatre](#no-blame-no-theatre)
- [Confirmations repeat the verb](#confirmations-repeat-the-verb)
- [Empty states lead to the first step](#empty-states-lead-to-the-first-step)
- [Success says what changed](#success-says-what-changed)
- [Loading says what and how long](#loading-says-what-and-how-long)
- [Batch results: totals, then causes](#batch-results-totals-then-causes)
- [Labels stay, placeholders show format](#labels-stay-placeholders-show-format)
- [Counts are numerals, with real plurals](#counts-are-numerals-with-real-plurals)
- [Money is unambiguous](#money-is-unambiguous)
- [Dates nobody can misread](#dates-nobody-can-misread)
- [Built to be translated](#built-to-be-translated)
- [Words that read as machine-made](#words-that-read-as-machine-made)

## Naming

### The person's words, not the system's
- **Decision:** Which words name things, states and errors here?
- **Do:** Use the noun people use in their own work ("tickets", "patients", "shifts"), not the table it lives in. Never let codes, enum values or object names reach the screen.
- **Why:** System words make people translate every line; those who cannot assume the product is broken. *Source:* Nielsen, 10 usability heuristics (#2); Krug, *Don't Make Me Think*; Norman, *The Design of Everyday Things* (system image); Redish, *Letting Go of the Words*.
- **Look for:** "records", "instances", "payload", "null", "schema" in UI text; SHOUTING_SNAKE statuses; camelCase labels; "job queued".
- **Unless:** A technical audience whose word it is (a developer console may say "API key" or HTTP 404), beside a plain sentence.

### One word per thing, everywhere
- **Decision:** Does every screen call the same thing by the same name?
- **Do:** One word per object, action and state, kept across buttons, headings, statuses and emails: button "Enrol", status "Enrolled", email "You're enrolled in Beginners' pottery". Expose the model people need (draft or live, saved or not), not the implementation.
- **Why:** A new word reads as a new thing, and shifting names build a wrong model that later causes mistakes. *Source:* Norman, *The Design of Everyday Things* (conceptual models); Yifrah, *Microcopy: The Complete Guide*.
- **Look for:** "Enrol" here, "Register" or "Join" there; "My loans" in the navigation, "Your borrowings" as the title.
- **Unless:** Two words really name two states (Requested and Booked), or experts share a technical vocabulary.

### Button says what happens
- **Decision:** What should this button say?
- **Do:** Name the action and, where it matters, the object or the stake. Before: "Submit", "OK". After: "Request leave", "Renew 3 books", "Pay £250 deposit".
- **Why:** A generic label makes people reread the screen; on money or bulk actions they act blind. *Source:* Yifrah, *Microcopy*.
- **Look for:** "Submit", "OK", "Proceed", "Click here"; labels that would fit any screen.
- **Unless:** A platform pair whose context is the label ("Cancel" and "Done" on a sheet editing one field).

## Saying less

### Write nothing
- **Decision:** Does this text need to be here at all?
- **Do:** Delete what the screen already says: welcome lines, self-praise, intros, captions restating the label, instructions for standard controls. A needed instruction is short and sits at the point of use.
- **Why:** Filler buries the line that matters, and people stop reading copy that wasted their time. *Source:* Krug, *Don't Make Me Think*, "Omit needless words" (happy talk); Redish, *Letting Go of the Words*.
- **Look for:** "Welcome to Rota! Here you can..."; "Enter your email" under "Email"; a subtitle repeating the title.
- **Unless:** It prevents a costly mistake (what a delete removes, when a charge happens), or explains a truly new concept once, beside its action.

### Structure before sentences
- **Decision:** Someone might hesitate here; how do I remove the doubt?
- **Do:** Reach for structure first: a clearer label, the value shown beside its comparison, a two-item list of the problems, a labelled bar, an icon on the one row that needs action. Add a sentence only when no structure can carry the point, and keep it to one line.
- **Why:** Each explanatory sentence is one more thing to read before acting, and a screen that explains itself in paragraphs reads as a document. Structure is scanned in a glance; prose is skipped. *Source:* Redish, *Letting Go of the Words*; Krug, *Don't Make Me Think*.
- **Look for:** A paragraph under a button saying what it will do; a warning box that restates in prose what the rows below already show; helper text longer than the control it explains.
- **Unless:** A consequence that cannot be shown, only told (what happens to data after cancelling, who else is affected), gets its one plain sentence.

### Front-load the point
- **Decision:** What comes first in a message, heading or list item?
- **Do:** The word that carries the meaning: the outcome, the object, the number. Before: "We were unable to renew your loan because the book is reserved." After: "Not renewed: this book is reserved. Return it by 12 March."
- **Why:** People read the first two or three words of a line and skip the rest. *Source:* Redish, *Letting Go of the Words*; GOV.UK style guide.
- **Look for:** Lines opening with "We", "Please note", "This page allows you to".
- **Unless:** Legal or consent text whose wording is fixed.

### Concrete beats promotional
- **Decision:** How should the product describe itself inside the app?
- **Do:** Say what the feature does in checkable terms; cut praise. Before: "Unlock powerful scheduling, seamlessly." After: "Swap a shift with a colleague; your manager sees it at once."
- **Why:** Marketing language hides the information people need to finish a task. *Source:* Fenton & Kiefer Lee, *Nicely Said*.
- **Look for:** Words from the closing list; headings that fit any product.
- **Unless:** A pricing page may sell, but still names concrete limits.

### Talk to one reader
- **Decision:** Who is the text addressed to?
- **Do:** "You", active voice, "we" only when the product did something ("We couldn't reach the carrier"). The verb, not its noun: "Confirm your place by Friday", not "Confirmation of your place is required".
- **Why:** Passive sentences hide who has to act. *Source:* Redish, *Letting Go of the Words*; GOV.UK style guide.
- **Look for:** "is required", "has been", "users" in text the user reads.
- **Unless:** Admin views about other people ("3 members haven't accepted").

## Messages for states

### Errors say what to do next
- **Decision:** What should this error say?
- **Do:** What went wrong in the person's terms, then the fix, in one or two sentences; any code small and secondary. Before: "Request failed: 422 Unprocessable." After: "This listing needs at least one photo. Add one to put it live."
- **Why:** A code or "Invalid input" says they failed, not how to succeed; they retry or leave. *Source:* Yifrah, *Microcopy*; Nielsen, 10 usability heuristics (#9).
- **Look for:** Codes or field keys in the message; "Something went wrong" with no next step.
- **Unless:** Nothing they can do fixes it (an outage): say so, whether work is saved, and when to retry.

### No blame, no theatre
- **Decision:** What tone should a failure or warning take?
- **Do:** State the problem neutrally, never as the person's fault; no jokes, mascots or "Oops" near money, lost data or someone else's decision. Before: "You entered an invalid tracking number." After: "This tracking number is too short. Check it against your receipt."
- **Why:** Cuteness in a bad moment reads as not caring; blame makes people less likely to retry. *Source:* Fenton & Kiefer Lee, *Nicely Said*; Yifrah, *Microcopy*.
- **Look for:** "Oops!", exclamation marks in errors; "you failed to"; apologies longer than the fix.
- **Unless:** A playful, low-stakes product whose voice the person chose; never on money or data-loss paths.

### Confirmations repeat the verb
- **Decision:** What should a confirm dialog say?
- **Do:** Title it with the action and object, state the one consequence the person might not expect, and put verbs on the buttons: "Delete 3 recipes?" with "Delete recipes" and "Keep them". Whether to confirm at all: `states.md`.
- **Why:** Yes and No make people parse the question under pressure. *Source:* Yifrah, *Microcopy*.
- **Look for:** "Are you sure?" as the whole message; Yes and No; a destructive button labelled "Confirm".
- **Unless:** A severe, irreversible action also asks for something specific, such as typing the name.

### Empty states lead to the first step
- **Decision:** What should an empty screen say?
- **Do:** What will appear here, and the one action that gets it there. Before: "No data available." After: "Recipes you save will show here." with "Browse recipes". For no results, name the active filter and offer "Clear filters".
- **Why:** On first run the empty screen is the onboarding. *Source:* Yifrah, *Microcopy* (empty states).
- **Look for:** "No data", "Nothing here" on a first visit; a big illustration with no action.
- **Unless:** Empty is the good outcome: one short line ("No tickets waiting"), no call to action.

### Success says what changed
- **Decision:** What should a success message say, and is one needed?
- **Do:** What happened and what comes next: "Request sent to Sam. You'll get an email when they reply." If the screen shows the change itself (the row appears, the toggle flips), say nothing.
- **Why:** "Success!" confirms nothing checkable; a toast for every visible change teaches people to ignore toasts. *Source:* Yifrah, *Microcopy*.
- **Look for:** "Success!", "Your changes have been saved successfully"; a toast after an inline edit.
- **Unless:** The action happens out of sight (an email sent, a charge queued): always confirm it.

### Loading says what and how long
- **Decision:** What should a wait say?
- **Do:** Past a few seconds, say what is happening; for long tasks, progress in the person's units and whether they can leave: "Copying 1,200 photos: 340 done. You can close this page; we'll email you."
- **Why:** A spinner with no end makes people reload and resubmit. *Source:* Yifrah, *Microcopy*.
- **Look for:** "Loading..." on a long task; jokey rotating messages.
- **Unless:** Waits under a second: text would flash unreadably.

### Batch results: totals, then causes
- **Decision:** How should the result of a bulk action read?
- **Do:** Lead with what succeeded and what did not, as two numbers; group failures by cause, each with a count, the items and the fix; end with the next action. "58 loans renewed. 6 not renewed: 4 are reserved (return by 12 March); 2 reached the renewal limit."
- **Why:** A line per failure hides that there are two problems, and whether it worked. *Source:* Redish, *Letting Go of the Words*; Yifrah, *Microcopy*.
- **Look for:** One error line per item; "Completed with errors".
- **Unless:** A single failure: name it and its fix.

## Fields and formats

### Labels stay, placeholders show format
- **Decision:** Where does a field's guidance go?
- **Do:** A visible label above every field; rules (format, limits) in a hint shown before typing; placeholder text only for an example value, if at all.
- **Why:** A placeholder vanishes at the first keystroke, taking the question with it. *Source:* Yifrah, *Microcopy* (forms).
- **Look for:** Grey text in an unlabelled field; a rule first stated after a failed submit.
- **Unless:** A single search box whose purpose is plain from its icon and position.

### Counts are numerals, with real plurals
- **Decision:** How should counts be written?
- **Do:** Numerals with the locale's thousands separator, and real plurals: "1 book", "12 books", never "book(s)". A word instead of a bare "0" ("No overdue books"). A non-breaking space keeps a number with its unit ("12 kg"); write a real ellipsis (…) and curly quotes.
- **Why:** Eyes catch numerals; "(s)" reads as unfinished. *Source:* GOV.UK style guide (numerals from 2, commas over 999); using "1" in counts is this skill's choice for interface text; Butterick, *Practical Typography* (ellipses, curly quotes).
- **Look for:** "(s)", "1 items", "1234567", "0 results" as a headline.
- **Unless:** "one" in ordinary phrasing ("one of your cards").

### Money is unambiguous
- **Decision:** How should amounts be written?
- **Do:** Show the currency wherever more than one could apply, format for the locale, keep one decimal count per column, and mark refunds in words or a minus sign, never colour alone: "€1,240.50", "Refund of €12.00".
- **Why:** An ambiguous currency or sign on a statement reads as an overcharge. *Source:* GOV.UK style guide (money).
- **Look for:** Bare numbers in a money column whose header names no currency; "$12" and "$12.00" in one table; red with no minus.
- **Unless:** A whole amount on its own may drop ".00" (GOV.UK writes "£75"), if a list does not mix both.

### Dates nobody can misread
- **Decision:** How should dates and times be written?
- **Do:** The month as a word ("3 March 2026", "3 Mar" where tight), never "03/04/2026". Relative time only for recent activity; absolute dates for deadlines, charges and anything legal. Ranges with "to" ("3 to 9 March"); "midday", not "12pm".
- **Why:** Numeric dates swap day and month between countries; a relative date on a receipt hides when it happened. *Source:* GOV.UK style guide (dates and times).
- **Look for:** Slash or dotted dates (03/04/2026, 03.04.26); "Due in 3 days" with no date; a dash between dates.
- **Unless:** Dense tables short of space, exports and logs: ISO dates (2026-04-03) never swap and they sort, so they may stand there. Even then, one format throughout.

### Built to be translated
- **Decision:** Will this text survive another language?
- **Do:** Room for text a third longer, and double or triple for short labels. Whole sentences with named slots ("{name} shared {file}"), never glued fragments; plural rules pick the form; `Intl.NumberFormat` and `Intl.DateTimeFormat` for numbers and dates; logical properties (`margin-inline-start`) so right-to-left mirrors; a time zone on every deadline.
- **Why:** Translations run longer, short strings most; word order and plural forms differ by language; a deadline without a zone is wrong everywhere else. *Source:* W3C Internationalization, "Text size in translation"; Unicode CLDR, language plural rules; ECMA-402 (the `Intl` API).
- **Look for:** Buttons that fit their English label exactly; "You have " + n + " item(s)"; dates assembled by hand.
- **Unless:** A product shipping in one language still formats with the locale functions; the rest can wait.

## Words that read as machine-made

- seamless, seamlessly: cut it, or say what no longer needs doing
- unlock: see, get, use
- supercharge, turbocharge: cut, or name the speed-up ("in 2 minutes")
- all-in-one: name the two or three things it does
- Welcome to the future of...: cut; start with the first step
- Oops!, Uh oh: cut; state the problem
- powerful, robust, cutting-edge: cut, or name the capability
- effortlessly, with ease: cut
- Something went wrong: say what, or that we don't know yet and what to try
- Successfully: cut ("Saved", not "Successfully saved")
- Please note that: cut; say the thing
- In order to: to
- e.g., i.e., etc.: for example, that is, or list the items
- Dive in, Let's get started!: the action itself ("Add a recipe")
- em dashes: a full stop, comma, colon or parentheses (the owner's ruling)
- Title Case Headings, ALL CAPS buttons: sentence case
