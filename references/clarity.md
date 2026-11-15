# Clarity

What a screen must make obvious without help: what this is, where I am, what I can do. Read it when shaping a new screen, and when reviewing one a person could get lost on.

- [Self-evident screen](#self-evident-screen)
- [Where am I (trunk test)](#where-am-i-trunk-test)
- [The first plausible choice is right](#the-first-plausible-choice-is-right)
- [Clickable looks clickable](#clickable-looks-clickable)
- [Follow conventions, then be consistent](#follow-conventions-then-be-consistent)
- [Keep knowledge on the screen](#keep-knowledge-on-the-screen)
- [Show the current state](#show-the-current-state)
- [Built for scanning](#built-for-scanning)
- [Do not drain goodwill](#do-not-drain-goodwill)
- [Design for a named person's goal](#design-for-a-named-persons-goal)
- [Serve the fiftieth visit](#serve-the-fiftieth-visit)
- [Judge by the task, not the polish](#judge-by-the-task-not-the-polish)
- [Tests a reviewer can run on screenshots](#tests-a-reviewer-can-run-on-screenshots)

## What is this, where am I

### Self-evident screen
- **Decision:** Can a first-time visitor tell what this screen is for, and what to do, without stopping to think?
- **Do:** Make the purpose, the main object and the next step obvious at a glance. Where that is impossible, explain in a few words placed exactly where the question arises.
- **Why:** Each small puzzle (what is this, where do I tap) costs attention and adds up to doubt about the whole product. *Source:* Krug, *Don't Make Me Think*.
- **Look for:** A heading that names a feature, not the person's job ("Insights Hub"); no visible answer to "what do I do here".
- **Unless:** A tool trained staff use all day may trade some first-glance clarity for density, if the first-run path still explains itself.

### Where am I (trunk test)
- **Decision:** Does every screen say what it is and where it sits?
- **Do:** Give each screen a prominent name that matches the link that led to it, mark the current place in the navigation, and keep a way back and a way home.
- **Why:** People arrive from links, notifications and searches, not from the front door; lost people leave. *Source:* Krug, *Don't Make Me Think*, "Street signs and Breadcrumbs" (the trunk test).
- **Look for:** A heading that differs from the label clicked; navigation with no current item; a deep screen with no way back.
- **Unless:** A single-purpose step (one checkout step) may drop the main navigation, but keeps its own name and an exit.

### The first plausible choice is right
- **Decision:** If someone takes the first option that looks right, will it be the right one?
- **Do:** Make labels specific and mutually exclusive, so only one can plausibly fit each task, and put the likeliest choices first.
- **Why:** People satisfice (Herbert Simon's term, which Krug applies to the web): they take the first reasonable option rather than compare, so overlapping labels send them down wrong paths. *Source:* Krug, *Don't Make Me Think*, "How we really use the Web".
- **Look for:** Rival pairs such as "Saved" and "Favourites" in a recipe app, or "Accounts" and "Connections"; catch-alls like "Manage" or "More".
- **Unless:** An expert tool whose users learn the map once; even there, renaming an overlap is cheap.

## What can I do

### Clickable looks clickable
- **Decision:** Can a person tell, without hovering, what they can tap, drag or edit?
- **Do:** Give every interactive element a visible signifier at rest (button shape, link styling, a chevron), the same one across the product, and keep that signal off anything static. Label icon buttons unless the icon is universal. Give each control a look for rest, hover, focus, pressed, selected, disabled and busy, each one visibly different from rest.
- **Why:** Controls nobody notices do not exist for them; static text that looks clickable wastes clicks and teaches distrust. *Source:* Krug, *Don't Make Me Think*, "Billboard Design 101"; Norman, *The Design of Everyday Things* (signifiers); WCAG 1.4.11 (what shows a state needs 3:1; disabled is exempt).
- **Look for:** Text buttons styled like labels; tappable cards with no cue; coloured static text; rows of unlabelled icons.
- **Unless:** Whole-row taps in a phone list are learned (a chevron is cue enough); dense repeated row actions may appear on hover or focus if a visible touch and keyboard path exists, such as an overflow menu.

### Follow conventions, then be consistent
- **Decision:** Should this control, word or placement follow the familiar pattern or be new?
- **Do:** Use the pattern people know from the web and from products in this category (search, navigation, tables, date input). Inside the product, one action keeps one name, one look and one place.
- **Why:** People spend most of their time in other products; a convention is free understanding, and breaking it charges everyone a learning cost. *Source:* Krug, *Don't Make Me Think*, "Billboard Design 101"; Nielsen, 10 usability heuristics (#4); Jakob's law (Laws of UX).
- **Look for:** "Remove" here and "Delete" there; the primary button switching sides; a novel icon for a familiar action; custom scrollbars; a profile photo changed through a bare "Upload" button or file field, where people expect to tap the round photo itself, marked with a small "+" or camera badge.
- **Unless:** The convention that counts may be the person's tool, not the web: a data grid for people who live in spreadsheets takes spreadsheet keys. A new pattern earns its place only when it is as self-evident as the one it replaces, and is tested.

### Keep knowledge on the screen
- **Decision:** What must the person remember from elsewhere, or guess, to finish this step?
- **Do:** Show what the step needs where it is needed: the item being changed, the options available, rules before typing, the unit or currency beside the value, earlier choices.
- **Why:** Memory is the scarcest resource on a screen and fails under interruption; what it drops comes back as avoidable errors. *Source:* Nielsen, 10 usability heuristics (#6); Norman, *The Design of Everyday Things* (knowledge in the world).
- **Look for:** A dialog that hides the item it changes; password rules shown only after a failure; a placeholder as the only label; a code to copy from a previous page.
- **Unless:** Frequent experts gain speed from knowledge in the head (shortcuts, typed commands, a command palette); offer these on top of visible options, never instead of them.

### Show the current state
- **Decision:** Can someone tell from a screenshot which mode, filter, sort and save state this screen is in?
- **Do:** Show active filters, sort, mode, selection and save or sync status where the eye already is.
- **Why:** Hidden state makes results look wrong ("where are my tickets?") and invites repeat actions. *Source:* Norman, *The Design of Everyday Things* (gulf of evaluation); Nielsen, 10 usability heuristics (#1, #6).
- **Look for:** A count of 12 with no visible filter; a toggle that does not show which side is on; an editor with no saved indicator.
- **Unless:** States almost nobody changes may live in settings rather than on the main surface.

### Built for scanning
- **Decision:** How will someone who reads a tenth of this screen find their thing?
- **Do:** Split the screen into clearly bounded areas, give each a heading that names what is beneath it, and put the answer before the explanation.
- **Why:** People scan and take the first reasonable option; text built for reading is skipped. *Source:* Krug, *Don't Make Me Think*, "How we really use the Web".
- **Look for:** Paragraphs of instructions; vague headings ("General", "Details", "Information"); the key figure buried mid-sentence.
- **Unless:** Content meant to be read in full (terms, a report, an article) needs readable prose, not chopped fragments.

### Do not drain goodwill
- **Decision:** What on this screen spends the person's trust?
- **Do:** Show what people came for (prices, how to cancel, how to reach a human), ask only for what you need and say why, and do the formatting work yourself. Never put a promotion, upsell or advert on a screen whose job is something else.
- **Why:** Each annoyance drains a "reservoir of goodwill" (Krug's term); once it is empty, people leave or stop believing you. *Source:* Krug, *Don't Make Me Think*, "Usability as common courtesy".
- **Look for:** Required fields with no reason; cancel or delete buried; phone or card numbers rejected for spaces; a promotional interstitial before the task; a premium or partner block in the middle of a working screen.
- **Unless:** Legally required steps (identity checks) cannot be skipped; explain them and say how long they take.

## Who it serves

### Design for a named person's goal
- **Decision:** Whose goal does this screen serve first?
- **Do:** Name the primary person and their end goal (not a task list), make the screen excellent for them, then fit secondary people in without diluting it.
- **Why:** Designing for everyone gives everything equal weight, so the person who uses it all day gets nothing faster. *Source:* Cooper et al., *About Face* (goal-directed design, personas).
- **Look for:** Every column, filter and action at the same visual weight; generic copy that could sit in any product.
- **Unless:** Commodity flows (sign-in, password reset), where people really are interchangeable.

### Serve the fiftieth visit
- **Decision:** Is the default built for the person who already knows the product?
- **Do:** Design for the perpetual intermediate: make fast paths visible (shortcuts shown in menus and tooltips, saved views, bulk actions, remembered last choices), and help beginners with inline hints that fade once used, not with tours.
- **Why:** Most people stop learning once competent; scaffolding that never leaves taxes the heaviest users, and expert-only paths are never found. *Source:* Cooper et al., *About Face* ("perpetual intermediate"); Nielsen, 10 usability heuristics (#7, #10).
- **Look for:** The same tour or tooltip on every visit; shortcuts that exist but are shown nowhere; a multi-step wizard for a daily task; no multi-select on a long list.
- **Unless:** A once-a-year task (renewing a licence, filing a tax return) stays guided every time; nobody remembers it.

### Judge by the task, not the polish
- **Decision:** Is this screen good because it works, or because it looks finished?
- **Do:** Check the main task, the states and the errors before visual polish.
- **Why:** Attractive screens are rated more usable than they are, so their failures go unnoticed until someone is stuck. *Source:* aesthetic-usability effect (Laws of UX).
- **Look for:** A refined screen with no error, empty or loading state.
- **Unless:** Know the evidence's limit: the original study (Kurosu and Kashimura, cash machine layouts) measured perceived usability, not performance. Polish raises tolerance; it fixes nothing.

## Tests a reviewer can run on screenshots

**Five seconds.** Look for five seconds, then away. Name what the screen is for, the most important thing on it, and the next step. Pass: all three come at once and match the intent.

**Trunk test (Krug).** Open any screen as if dropped there from a link. Name the product, the screen, your place in the navigation, what you can do, and the way back or home. Pass: each answer is visible without scrolling or hovering.

**First click.** Take a real task ("renew a loan", "change the delivery address") and mark where you would tap first. Pass: exactly one plausible target, and it is correct.

**States.** Name each region's state. Pass: one state per region, no message contradicting the data, anything that can go stale carries its time.

**Words.** Read every label and message aloud to someone outside the team. Pass: no code, internal name, filler or praise, and nothing could be cut without loss.
