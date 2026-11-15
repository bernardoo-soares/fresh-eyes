# Structure

How content is organised, where controls live, and how density and flow fit a screen's use. Read it when grouping options or navigation, placing controls, or choosing posture.

- [Exact or ambiguous scheme](#exact-or-ambiguous-scheme)
- [One scheme per level](#one-scheme-per-level)
- [Split by whose settings they are](#split-by-whose-settings-they-are)
- [Broad, shallow, chunked](#broad-shallow-chunked)
- [Labels from the person's model](#labels-from-the-persons-model)
- [No catch-all buckets](#no-catch-all-buckets)
- [Search for big settings](#search-for-big-settings)
- [Walk the tree before shipping](#walk-the-tree-before-shipping)
- [Global, local, contextual](#global-local-contextual)
- [Configure where it shows](#configure-where-it-shows)
- [Map controls to what they change](#map-controls-to-what-they-change)
- [Order by frequency, disclose the rest](#order-by-frequency-disclose-the-rest)
- [Reveal options when they apply](#reveal-options-when-they-apply)
- [List and detail side by side](#list-and-detail-side-by-side)
- [Narrow is a re-ranking, not a shrink](#narrow-is-a-re-ranking-not-a-shrink)
- [Default view answers the standing question](#default-view-answers-the-standing-question)
- [Sovereign posture](#sovereign-posture)
- [Transient posture](#transient-posture)
- [Decide who absorbs the complexity](#decide-who-absorbs-the-complexity)
- [Strip excise](#strip-excise)
- [The simplest path first](#the-simplest-path-first)
- [Protect flow](#protect-flow)
- [The lightest layer that does the job](#the-lightest-layer-that-does-the-job)
- [The address holds the view](#the-address-holds-the-view)
- [One save model per page](#one-save-model-per-page)
- [Posture at a glance](#posture-at-a-glance)

## Organising content

### Exact or ambiguous scheme
- **Decision:** Order this list by name, date or number, or group it by topic or task?
- **Do:** Exact (alphabetical, chronological, numeric) when people arrive knowing the item's name or ID; ambiguous (topic, task, audience) when they browse to learn what exists.
- **Why:** An exact scheme makes browsers know the word; a topical one makes lookups guess. *Source:* Rosenfeld, Morville & Arango, *Information Architecture*.
- **Look for:** Settings sorted A to Z; warehouse stock grouped by topic when staff search by SKU.
- **Unless:** Long mixed-use sets offer both: a topical tree plus search.

### One scheme per level
- **Decision:** Do the siblings in this navigation or sidebar follow one logic?
- **Do:** Keep siblings on one organising principle (all topics, all audiences or all tasks); put a second principle in a separate zone.
- **Why:** A hybrid level makes people guess which logic owns their item. *Source:* Rosenfeld, Morville & Arango.
- **Look for:** "Profile, Shifts, Getting started, Admins, Advanced": object, task, stage, audience and difficulty side by side.
- **Unless:** A menu of four or five unmistakable items.

### Split by whose settings they are
- **Decision:** How should a settings page with personal and shared options be divided?
- **Do:** Split first by scope: what changes only for me versus for everyone. Show the shared section only to people who can change it, and say its changes affect everyone.
- **Why:** Mixed scope makes members hunt through controls they cannot use, and lets an admin change a shared setting believing it personal. *Source:* Rosenfeld, Morville & Arango (audience schemes); Tidwell et al., *Designing Interfaces*.
- **Look for:** In a household recipe app, "Metric or imperial units" beside "Who can edit the family meal plan".
- **Unless:** Single-user products; or a shared default with a personal override, shown beside the inherited value.

### Broad, shallow, chunked
- **Decision:** How many groups and levels for a large set of options?
- **Do:** Two levels at most; as many groups as the content has natural clusters, each small enough to scan; give a long page anchored headings rather than more depth.
- **Why:** Each extra level is another guess and another hop back; one undivided scroll hides what exists. *Source:* Rosenfeld, Morville & Arango; Hick's law (Laws of UX).
- **Look for:** Fifty controls in one column; three nested levels to reach a toggle.
- **Unless:** Sets of hundreds, where depth plus search is unavoidable.

### Labels from the person's model
- **Decision:** What should this section, setting or column be called?
- **Do:** Name things by what the person wants done, in their vocabulary, siblings parallel in form and grain. Never mirror the code, database or org chart. A menu is short labels only, never a line of explanation under each item: if a label needs explaining, it is the wrong label, so rename it.
- **Why:** Implementation labels make people learn how the system is built before they can use it. *Source:* Cooper et al., *About Face* (implementation versus mental models); Rosenfeld, Morville & Arango (labelling).
- **Look for:** "Sync tokens", "Tenants" for a non-technical audience; "Manage team" beside "Rota" beside "Configure your alerts"; a sidebar where every item carries a grey sentence about what it holds.
- **Unless:** Developer tools, where the implementation model is the audience's own.

### No catch-all buckets
- **Decision:** Where do the leftover options go?
- **Do:** Give every option a home by meaning. Never make "Advanced", "Other", "General" or "Misc" a group; leftovers mean the scheme is wrong.
- **Why:** A catch-all label predicts nothing, so people open it last. *Source:* Rosenfeld, Morville & Arango.
- **Look for:** A "General" tab holding a third of the options; "Advanced" holding a theme toggle and data retention.
- **Unless:** "Advanced" as a disclosure inside a named group, for that group's rare refinements.

### Search for big settings
- **Decision:** Does this page need its own search?
- **Do:** Past 20 to 30 options, add search matching synonyms and descriptions, showing each result's group.
- **Why:** People remember the effect ("stop emails"), not the label ("Notification digest"). *Source:* Rosenfeld, Morville & Arango (search systems).
- **Look for:** A long settings tree with no search.
- **Unless:** Under fifteen options, search is chrome.

### Walk the tree before shipping
- **Decision:** Will people find each option from the labels alone?
- **Do:** For each top task ("change my email alerts", "remove a member"), read only the top-level labels and pick the first click. Rename or regroup wherever it is ambiguous; with real users, run a card sort.
- **Why:** A structure can look right and still fail at the first click, invisibly on a screenshot. *Source:* Rosenfeld, Morville & Arango (card sorting); the label-only walk is an adaptation.
- **Look for:** A task whose first click splits between two groups.
- **Unless:** Sets visible whole.

## Where things live

### Global, local, contextual
- **Decision:** Where does this link or control belong?
- **Do:** Global navigation for the few product-wide destinations, local navigation for section items, contextual links where the related decision is made.
- **Why:** Overloaded global navigation buries destinations; missing contextual links force a detour through the tree. *Source:* Rosenfeld, Morville & Arango (navigation systems).
- **Look for:** A sidebar mixing destinations and actions; a "stock low" warning with no link to reorder.
- **Unless:** A product with three or four areas.

### Configure where it shows
- **Decision:** Should this option live in Settings or beside what it affects?
- **Do:** Options that tune one view (columns, density, sort) live on that view; Settings holds account-wide behaviour, linked from where the effect shows.
- **Why:** A preference far from its effect is hard to find, and its result is out of sight. *Source:* Cooper et al., *About Face*; Tidwell et al.
- **Look for:** "Table columns" under Settings, Display; "configure in Settings" with no link.
- **Unless:** Admin-enforced defaults belong in shared settings, still linked from the view.

### Map controls to what they change
- **Decision:** Where does this control go relative to the thing it affects?
- **Do:** Next to its object, in the same order and direction. Bulk actions sit by the selection; a column filter sits on its column.
- **Why:** Poor mapping makes people act on the wrong thing. *Source:* Norman, *The Design of Everyday Things* (mapping).
- **Look for:** A Save button far above the edited field; filters in a sidebar for a table across the page.
- **Unless:** Page-wide commits (a long form) sit in a sticky bar that is always reachable.

### Order by frequency, disclose the rest
- **Decision:** Which options go first, and which behind a disclosure?
- **Do:** Within each group, the most-changed options first; rare refinements one click away inside that group.
- **Why:** Rare options on top slow every visit; buried common ones force a hunt. *Source:* Cooper et al.; Tidwell et al. (progressive disclosure).
- **Look for:** The display name below a time zone picker and API keys.
- **Unless:** A rare option people must find (deleting an account) stays findable by name.

### Reveal options when they apply
- **Decision:** Should dependent options always be visible?
- **Do:** Show a dependent option only once its parent choice makes it meaningful, directly beneath that choice.
- **Why:** Always-visible dependent controls look broken and invite changes with no effect. *Source:* Tidwell et al. (responsive disclosure).
- **Look for:** Greyed fields with no reason; options that do nothing in the current state.
- **Unless:** The dependent options help choose the parent (picking a delivery method by its fees).

### List and detail side by side
- **Decision:** Should selecting an item replace the list or sit beside it?
- **Do:** For work that moves item to item (support tickets, a code review queue, settings categories), keep the list visible and show the detail in an adjacent pane.
- **Why:** Replacing the list makes every next item a round trip. *Source:* Tidwell et al. (two-panel selector).
- **Look for:** Opening a ticket navigates to a full page with a back link.
- **Unless:** Narrow screens stack the panes; detail that needs full width (a document editor) takes it.

### Narrow is a re-ranking, not a shrink
- **Decision:** What does this layout become on a phone?
- **Do:** Break where the content breaks, not at device widths; keep every function and re-rank it. A component used in panes of different widths answers to its container (`@container`). Write down what each multi-column block becomes at 390 px.
- **Why:** A squeezed layout buries the main action under detail, or drops functions phone users still need. *Source:* Marcotte, *Responsive Web Design*; Wroblewski, *Mobile First*; WCAG 1.4.10.
- **Look for:** Three columns squeezed into three thin ones; a desktop sidebar stacked above the content; a feature missing on the phone.
- **Unless:** A dense working tool may state a minimum width and scroll inside its own region.

### Default view answers the standing question
- **Decision:** What should an all-day table show by default?
- **Do:** Set default sort, filter and leading columns to answer the question people always bring (what is waiting on me, for how long); let them save views.
- **Why:** A neutral default (newest first, every column) makes people rebuild the view each session. *Source:* Tidwell et al. (tables); Cooper et al. (goal-directed design).
- **Look for:** Status in column seven; sort by creation date when age or priority drives the work.
- **Unless:** Audit or lookup tables, where a stable exact order is the point.

## Posture and flow

### Sovereign posture
- **Decision:** How dense should a screen used all day be?
- **Do:** For a tool open for hours (a support agent's ticket queue): high density, restrained visuals, persistent state, keyboard paths.
- **Why:** Airy, decorative layouts cost scrolling across thousands of glances a day. *Source:* Cooper et al., *About Face* ("sovereign posture").
- **Look for:** 64 px rows and summary cards above a working table; filters that reset on reload.
- **Unless:** New users get inline hints, not lower density for everyone.

### Transient posture
- **Decision:** How should a rarely visited screen (settings, invite, password change) behave?
- **Do:** Explain itself: a one-line description per option, clear current values, generous targets, a fast return to where the person came from.
- **Why:** Nobody remembers a page visited twice a year; terse labels make them guess. *Source:* Cooper et al. (transient posture).
- **Look for:** Bare toggles labelled in jargon; settings that lose the person's place.
- **Unless:** An admin console that is the admin's daily tool is sovereign.

### Decide who absorbs the complexity
- **Decision:** Should the system work this out, or ask the person?
- **Do:** Let the system absorb what it can know (locale, currency, defaults from existing data) and show what it inferred, so it can be changed.
- **Why:** Complexity pushed onto people returns as setup fatigue and wrong settings. *Source:* Tesler's law (Laws of UX).
- **Look for:** A wizard asking what the browser already reports; advanced options open by default.
- **Unless:** Where a wrong guess is costly (money, legal, deletion), ask; hiding all control frustrates experts.

### Strip excise
- **Decision:** Does this step serve the person's goal or the software?
- **Do:** Remove steps that serve only the machine: confirming reversible actions, a Save for one toggle, hops to a common task, re-entering known data.
- **Why:** Each such step taxes every use and teaches clicking through. *Source:* Cooper et al. ("excise").
- **Look for:** A dialog after archiving a ticket; three clicks to the most used action.
- **Unless:** The step guards an irreversible or shared consequence.

### The simplest path first
- **Decision:** Should this screen offer more capability (inline editing of every row, bulk tools, extra panels)?
- **Do:** Make the simplest complete path to the job the default: one action that works the moment the screen opens and finishes the job, or hands it on. Add a capability only when it removes a step most people would otherwise take, and put it one level down (a row action, an expanding row, a second screen), never in the first screen's way.
- **Why:** Every capability placed on the first screen competes with the main path and turns a glance into a chore; a main button that is disabled on arrival tells the person the screen wants work from them before it helps. *Source:* Cooper et al. (excise, the perpetual intermediate); Krug, *Don't Make Me Think*.
- **Look for:** A text field on every row of a result list; the main button greyed out until the person has done something; a first screen whose job reads as "fix twenty things" rather than "here is what happened, here is the next step".
- **Unless:** The editing is the job itself (a spreadsheet, a review queue, a form the person came to fill in).

### Protect flow
- **Decision:** Will this interaction interrupt someone mid-task?
- **Do:** Validate inline, keep people in place (edit in the row, detail in a side panel), preserve filters and scroll, and report errors without modals.
- **Why:** Each interruption costs re-orientation, multiplied over a working day. *Source:* Cooper et al. (flow).
- **Look for:** Modals on modals; opening a ticket resets the queue's filter.
- **Unless:** The person must stop and decide (two conflicting edits).

### The lightest layer that does the job
- **Decision:** Inline, popover, side panel or modal?
- **Do:** Inline first; a popover for a small choice tied to one control; a side panel for detail read beside the work; a modal only to stop and decide, or for a short standalone task; a bottom sheet on a phone. Every layer takes focus in, closes the top layer only on Escape or a visible close, and returns focus to its opener; a modal also keeps Tab inside and the page behind still.
- **Why:** A modal hides the work it is about and halts the task; a layer that drops focus strands keyboard users. *Source:* Nielsen Norman Group, "Modal & Nonmodal Dialogs" (Fessenden, 2017); WAI-ARIA Authoring Practices (dialog modal pattern); WCAG 2.4.3.
- **Look for:** A modal to rename one item; a dialog opened from a dialog; focus left at the top of the page after closing.
- **Unless:** An irreversible confirmation is the modal's proper use (`states.md`, Undo before confirm).

### The address holds the view
- **Decision:** What belongs in the URL?
- **Do:** The record, tab, filters, sort, page and search, so a link, a reload and Back restore the view. Back undoes the last navigation and never loses a filled form. What goes somewhere is a real link; what does something is a button.
- **Why:** People share, bookmark and reload views; a view that lives only in memory is lost when they do. *Source:* Nielsen, "URL as UI" (1999); Berners-Lee, "Cool URIs don't change" (W3C, 1998).
- **Look for:** A filtered list that resets on reload; a tab that Back skips past; a clickable `div` where a link belongs.
- **Unless:** Passing state (an open menu, unsaved field text) and anything secret stay out of the URL.

### One save model per page
- **Decision:** Do changes apply at once or on Save?
- **Do:** One model per page: instant and visibly confirmed for independent personal toggles; an explicit Save, with a warning on leaving, for linked fields or changes affecting everyone.
- **Why:** Mixed models leave people unsure what took effect. *Source:* Tidwell et al.; Cooper et al.
- **Look for:** Autosaving toggles beside a form with its own Save button.
- **Unless:** Clearly separated sections, each showing its own model.

## Posture at a glance

*Source:* Cooper et al., *About Face*.

| Posture | Example | Density | Navigation | Chrome |
|-|-|-|-|-|
| Sovereign | ticket queue, inbox, editor | high; compact rows | persistent, keyboard-driven, remembered state | minimal, quiet, no decoration |
| Transient | settings, invite, password change | low to medium; explained options | return to origin; one task per view | clear labels and descriptions, larger targets |
| Daemonic | background sync, notifications | none until needed | settings reached from one place | invisible; surfaces only on a problem or change |
