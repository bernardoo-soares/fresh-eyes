# Craft

The visual details that make a screen read as made by a person: type, space, surfaces, colour, motion and input, with starting values. Read it when setting or reviewing styles, tokens and CSS.

- [A short type ladder](#a-short-type-ladder)
- [One way to emphasise](#one-way-to-emphasise)
- [Line length](#line-length)
- [Long content has a plan](#long-content-has-a-plan)
- [Line height by role](#line-height-by-role)
- [Capitals and tracking](#capitals-and-tracking)
- [Space shows grouping](#space-shows-grouping)
- [One leading edge](#one-leading-edge)
- [Depth by role](#depth-by-role)
- [Radius from size](#radius-from-size)
- [Glass only on chrome](#glass-only-on-chrome)
- [Current item without a stripe](#current-item-without-a-stripe)
- [One accent, one job](#one-accent-one-job)
- [Colour never alone](#colour-never-alone)
- [Contrast, measured](#contrast-measured)
- [Dark mode, retuned](#dark-mode-retuned)
- [Care at moments](#care-at-moments)
- [Should it move](#should-it-move)
- [How it moves](#how-it-moves)
- [Reduced motion means gentler](#reduced-motion-means-gentler)
- [A focus ring that survives](#a-focus-ring-that-survives)
- [Targets and density](#targets-and-density)
- [A phone held in one hand](#a-phone-held-in-one-hand)
- [Starting values](#starting-values)

## Type

### A short type ladder
- **Decision:** How many text styles does the screen need, and how do they differ?
- **Do:** Four to six styles named by role. Size separates levels; weight and colour rank within a level. Make each size step clearly distinct, and for emphasis within a level raise the weight at the same size rather than add a one-off size.
- **Why:** One-pixel steps look like mistakes, and the structure stops reading at a glance. *Source:* Apple HIG (Typography); Bringhurst, *The Elements of Typographic Style*.
- **Look for:** More than six sizes on a page; a heading that differs from body only by colour; a 15 px label made "to pop".
- **Unless:** Long documents with deep heading levels need more styles; keep them on one scale.

### One way to emphasise
- **Decision:** How do I make a word or value stand out within text?
- **Do:** One method at a time: semibold in UI text, italic in reading text. Never underline for emphasis, and never stack bold, italic, colour and caps.
- **Why:** Stacked emphasis shouts and means nothing; underlined non-links get clicked. *Source:* Butterick, *Practical Typography*.
- **Look for:** Bold coloured uppercase words; underlines that do not navigate; whole sentences in bold.
- **Unless:** A destructive confirmation may pair weight with the danger colour on the object's name, since both carry meaning.

### Line length
- **Decision:** How wide should running text be?
- **Do:** Cap prose (help, descriptions, empty states) at `max-width: 65ch`; spend extra width on a second column or a detail pane, not a longer line. `text-wrap: balance` on headings, `pretty` on prose (unsupported browsers wrap normally).
- **Why:** On long lines the eye loses the start of the next one. *Source:* Bringhurst (45 to 75 characters); Butterick (45 to 90); CSS Text Module Level 4 (`text-wrap`).
- **Look for:** Help text spanning a wide window; a one-column form stretched across 1,600 px; a heading that leaves one word alone on its last line.
- **Unless:** Tables, grids, charts and controls take the width they need.

### Long content has a plan
- **Decision:** What happens when a name, label or value is longer than its space?
- **Do:** Wrap labels, headings and buttons. Use an ellipsis only where the full value is one hover, focus or tap away; never cut a number or the part that tells two items apart, and cut file names in the middle ("site-survey-…-v3.pdf"). `min-width: 0` on flex and grid children, `overflow-wrap: anywhere` on long strings; render once with the longest real values.
- **Why:** A flex item does not shrink below its content by default, so one long name breaks the row; a cut that hides the difference makes two items look alike. *Source:* CSS Flexible Box Layout (automatic minimum size); WCAG 1.4.10, 1.4.12.
- **Look for:** Two rows both reading "Annual report 2025 fin…"; a label spilling out of its button; a pasted link pushing the page sideways.
- **Unless:** A dense table cell may cut secondary text when the row opens to the full record.

### Line height by role
- **Decision:** What line height does each style get?
- **Do:** Body 1.45 to 1.5, headings 1.15 to 1.25 (tighter as size grows), table cells about 1.3; unitless, set per style.
- **Why:** One global 1.5 splits headings into separate-looking lines; one global 1.2 makes paragraphs hard to track. *Source:* Butterick (120 to 145% of size). Body at 1.5 sits just above his range: it is the web's habit, and the spacing WCAG 1.4.12 lets people force.
- **Look for:** A two-line heading whose inner gap matches the gap to the next block.
- **Unless:** User spacing overrides (WCAG 1.4.12) must not clip, so never fix a text box's height.

### Capitals and tracking
- **Decision:** Should labels be uppercase, and when do I change letter-spacing?
- **Do:** Sentence case for every label, heading, button and tab; never set a label in capitals by styling. Leave text at the font's spacing; tighten large headings by -0.01 to -0.02em; add 0.05em only to a real abbreviation set in capitals.
- **Why:** Capitals read slower, and tracked caps over every group flatten the hierarchy into a kit look. *Source:* Butterick (all caps); Apple HIG (Typography).
- **Look for:** Small grey uppercase tracked labels above every section.
- **Unless:** A real abbreviation (PDF, VAT) or a brand wordmark.

## Space and surfaces

### Space shows grouping
- **Decision:** How much space goes between elements?
- **Do:** A 4 px based scale; the gap between groups about double the gap within one; a heading closer to its content than to the block above. Cards and boxes: `hierarchy.md`.
- **Why:** Proximity is how people tell what belongs together. *Source:* Apple HIG (Layout).
- **Look for:** A heading floating midway between blocks; 12, 18 and 24 px between equivalent sections.
- **Unless:** Dense data views shrink every step; the ratio still holds.

### One leading edge
- **Decision:** Where does each element's text start?
- **Do:** Align title, toolbar, first column and content to one gutter; reserve a fixed icon slot in list and menu rows so labels share one x; let backgrounds and hovers run wider than the text inset.
- **Why:** Shared edges make scanning fast; wandering ones look assembled. *Source:* Apple HIG (Layout).
- **Look for:** Title, filters and table at three left offsets; labels that shift only on rows with icons.
- **Unless:** Numeric columns align to their right edge.

### Depth by role
- **Decision:** Which surfaces get a shadow?
- **Do:** Content flat; elevation only for what floats (menus medium, dialogs deepest); one edge treatment per surface, hairline or shadow. A sticky header gains its edge only once content scrolls under it.
- **Why:** A shadow says "this sits above"; on every box it says nothing. *Source:* Apple HIG (Materials) separates layers by material, not by shadow; elevation only for what floats is this skill's reading of it.
- **Look for:** The same soft shadow and 12 to 16 px radius on every box; shadowed cards in shadowed panels; a header with border, shadow and blur.
- **Unless:** A card being dragged may lift, because the depth is true.

### Radius from size
- **Decision:** What corner radius does each element get?
- **Do:** Two or three radii by size (controls 4 to 6 px, containers 8 to 12 px, a pill only for chips or one large call to action), nested concentrically: inner radius = outer minus padding.
- **Why:** One large radius everywhere looks generic; mismatched nested corners look pinched. *Source:* this skill's convention; the nesting rule is plain geometry.
- **Look for:** An inset image with its card's radius; table cells rounded like dialogs.
- **Unless:** A square-cornered brand keeps its corners.

### Glass only on chrome
- **Decision:** Where can I use translucency or blur?
- **Do:** Only on one or two pieces of navigation chrome, with text at 4.5:1 over the busiest content beneath and with the blur off. Add an opaque fallback under `prefers-reduced-transparency` where supported; the default must be legible without it.
- **Why:** Glass on content muddies legibility and costs rendering. *Source:* Apple HIG (Materials).
- **Look for:** `backdrop-filter` on cards or tables; thin grey text on frosted panels.
- **Unless:** Controls over full-bleed media, with a dimming layer behind.

## Colour

### Current item without a stripe
- **Decision:** How do I mark the current page, the selected row or option, or an important callout?
- **Do:** Change the whole item: a quiet fill across its full hit area (a neutral step darker, or the accent at 10 to 15%), the label in primary text at weight 600, the filled icon if the family ships one, and `aria-current="page"` or `aria-selected`. One selection style for navigation, rows and options. Mark a callout with its words and an icon. Never a coloured stripe on one edge (the owner's ruling).
- **Why:** People find where they are by shape and weight; a filled region reads as one figure against the ground, while a thin edge line is easy to miss, repeats until it means nothing and reads as machine-made. *Source:* Apple HIG (Color); Gestalt figure-ground and common region.
- **Look for:** `border-left` or `box-shadow: inset 3px 0 0` on a nav item, card, row or alert; selection by colour alone; rows and sidebar selected in two styles.
- **Unless:** Horizontal tabs, where an underline beneath the selected label is the convention people read.

### One accent, one job
- **Decision:** Where does the accent colour go?
- **Do:** Neutral chrome; accent only on the primary action, links, selection and focus; status colours only for status. Define colours as role tokens, redefined per theme.
- **Why:** When headings, icons and bars are tinted, the accent stops pointing at what people can do. *Source:* Apple HIG (Color).
- **Look for:** Accent headings or inert accent icons; a multicoloured sidebar; a decorative two-hue gradient.
- **Unless:** Charts need several hues, from a separate data palette.

### Colour never alone
- **Decision:** How do I show gain and loss, status or category?
- **Do:** Pair colour with a sign (+/-), an icon, a word or a position; check the screen in greyscale.
- **Why:** About one man in twelve has a colour vision deficiency, and red versus green is the pair most often lost. *Source:* Apple HIG (Color); WCAG 1.4.1.
- **Look for:** Gains and losses told apart only by hue; a status dot without a label.
- **Unless:** Red means up in mainland China; follow the locale's financial convention.

### Contrast, measured
- **Decision:** Is this grey readable?
- **Do:** Text 4.5:1, large text 3:1, control boundaries and focus 3:1, measured after opacity and backgrounds composite, in every theme. Solid secondary text colours, not alpha.
- **Why:** Faint secondary text is where dates, amounts and hints vanish. *Source:* Apple HIG (Color); WCAG 1.4.3, 1.4.11.
- **Look for:** Light grey metadata on white; barely visible input borders; `opacity: 0.5` on readable text.
- **Unless:** Disabled controls are exempt; keep them distinct from secondary text.

### Dark mode, retuned
- **Decision:** How do I build the dark theme?
- **Do:** Redefine tokens, never invert: a dim base, raised surfaces lighter than it, off-white text, and every accent and status colour retuned (lighter, a little less saturated) and checked on base and raised surfaces.
- **Why:** Shadows barely show on dark, so layers merge; light-mode colours turn muddy or glare. *Source:* Apple HIG (Dark Mode: dimmer base, brighter elevated surfaces); Material Design 2 (dark theme: shadows fade on dark, so raised surfaces lighten; saturated colours vibrate).
- **Look for:** Dialogs the same colour as the page; navy vanishing on black; vibrating saturated accents; a white flash while a preview loads.
- **Unless:** Media viewers may stay dark in both themes.

## Motion and input

### Care at moments
- **Decision:** Where does this product show personality?
- **Do:** Spend illustration, motion and warmth at the moments a person is learning, waiting or arriving: onboarding, explaining a new concept, an empty state, a success, the opening. Use one illustration style that belongs to the product, show the concept rather than describe it (a lock and a key for a PIN, the route for a navigation setting), and keep the working screens calm. An arrival (first run, a landing page's first paint, a success) may take up to a second, once: one object on one path, made of the product's own parts (its button shape, its action's symbol), becomes the next screen (a `clip-path` or View Transitions reveal), then a short crossfade to a still screen. One background from the waiting screen to the first, so nothing flashes, and nothing spins while it waits. An illustration at such a moment may move gently: small, slow, away from text, buttons and numbers, never on a working screen, off under reduced motion, and done within five seconds or given a pause control.
- **Why:** A small, well-placed moment makes people feel looked after and explains faster than a paragraph; the same effort spread over every screen becomes noise that slows the daily task. *Source:* Norman, *The Design of Everyday Things* (conceptual models); peak-end rule (Laws of UX); Apple HIG (Launching: a first screen that differs from the launch screen flashes); MDN, View Transition API; WCAG 2.2.2. The durations and the one-object path are this skill's guidance.
- **Look for:** A new concept explained in three paragraphs of text; illustrations or motion on a screen people use all day; a generic stock illustration that could belong to any product.
- **Unless:** A tool for experts at work (a trading screen, a queue) keeps even its moments brief: a single line and an icon.

### Should it move
- **Decision:** Does this change need an animation?
- **Do:** Animate only feedback, a state change or a link between two places; nothing triggered dozens of times a day or opened by keyboard (typing, sorting, filtering, tabs, command palettes).
- **Why:** What charms once costs a wait on every later use. *Source:* Apple HIG (Motion).
- **Look for:** Cards staggering in on load; numbers counting up; a Ctrl+K palette that scales in.
- **Unless:** The one figure that changed may animate once to show what moved.

### How it moves
- **Decision:** Which duration, easing and properties?
- **Do:** Ease-out, no overshoot, for what answers a press; an exit or a hand-over to the next screen may accelerate out. Menus scale from their trigger starting near 0.95, never 0; a pressed control shrinks to about 0.97. Animate `transform` and `opacity` only, never `transition: all`; every transition interruptible, leaving the way it came, faster than it arrived. Tooltips wait 300 to 600 ms for the first, then none while one is open.
- **Why:** Bounce feels slow, layout animation shoves neighbours, and blocked input makes people click twice. *Source:* Apple HIG (Motion: let people cancel motion). The easing, scale and property values are this skill's starting values for the web.
- **Look for:** Bouncy dropdowns; a sidebar animating its width; hover that changes padding or weight and shifts content.
- **Unless:** Drag-and-release carries momentum into a spring. Colour and background may transition, since nothing moves; spinners and progress run linear.

### Reduced motion means gentler
- **Decision:** What happens under `prefers-reduced-motion: reduce`?
- **Do:** Swap slides, scales and parallax for a short crossfade or an instant change (an arrival reveal becomes the crossfade alone), stop autoplay and motion inside illustrations, keep spinners and progress running.
- **Why:** Movement causes real discomfort; a blanket zero that freezes loaders hides state. *Source:* Apple HIG (Accessibility: under Reduce Motion, fades in place of movement); WCAG 2.3.3.
- **Look for:** No reduced-motion rule while panels slide; `animation: none !important` everywhere.
- **Unless:** Motion the person started as content (a chart replay) may run.

### A focus ring that survives
- **Decision:** How do I show keyboard focus?
- **Do:** `:focus-visible` with a 2 px solid `outline` and 2 px offset, one style everywhere, 3:1 against its surroundings; a negative offset inside `overflow: hidden`, `:focus-within` on compound fields.
- **Why:** Forced-colours mode drops `box-shadow` rings, and clipped rings strand keyboard users. *Source:* Apple HIG (Focus and selection); WCAG 2.4.7 (visible), 1.4.11 (AA: 3:1 against what is next to it), 2.4.13 (AAA: a 2 px perimeter).
- **Look for:** `outline: none` with no replacement; a ring cut off at a card edge.
- **Unless:** The browser's default ring passes; restyle only for consistency.

### Targets and density
- **Decision:** How big are controls and rows?
- **Do:** Touch targets 44 px square (24 px floor); grow small icons' hit areas with padding, not the glyph. Desktop data rows 36 to 40 px, enlarged under `@media (pointer: coarse)`.
- **Why:** Small targets cause mis-taps on money actions; touch-sized rows on desktop hide most of the data. *Source:* Apple HIG (Accessibility); WCAG 2.5.8.
- **Look for:** 28 px icon buttons on a phone; 64 px table rows on desktop; hover-only actions with no touch path.
- **Unless:** Inline links in a paragraph are exempt.

### A phone held in one hand
- **Decision:** What changes when the screen is a phone in one hand?
- **Do:** The three to five top destinations at the bottom, visible, not behind a menu icon. The main action stays where the reading starts, under what it acts on (`hierarchy.md`, One first thing per view); a bar fixed at the bottom suits a screen that ends in one decision (approve, pay, send). `env(safe-area-inset-bottom)` on fixed bars; `dvh`, not `vh`; the keyboard never covers the focused field or its action. Input text 16 px or more (iOS Safari zooms on focus below it: observed behaviour, not a standard). Hover styles inside `@media (hover: hover)`; pinch zoom never disabled.
- **Why:** About half the people Hoober watched held the phone in one hand, and hidden navigation is used less than visible. *Source:* Hoober, "How Do Users Really Hold Mobile Devices?" (UXmatters, 2013); Nielsen Norman Group, "Hamburger Menus and Hidden Navigation Hurt UX Metrics" (Pernice and Budiu, 2016); WCAG 1.4.4.
- **Look for:** A menu icon as the only navigation; a fixed bar under the home indicator; a field under the keyboard; `user-scalable=no`.
- **Unless:** Over five destinations: the top few visible, the rest under "More".

## Starting values

`scripts/tokens.mjs` generates these values. They are this skill's own starting point, not a published standard.

- Type, six styles (size / line height / weight): caption 0.75rem / 1.35 / 400; small 0.875rem / 1.45 / 400; body 1rem / 1.5 / 400; heading 1.375rem / 1.25 / 600; title 1.75rem / 1.2 / 600; display 2.25rem / 1.15 / 600. Nothing read below 0.75rem.
- Weights: 400 body, 600 headings and emphasis, 700 rarely; nothing under 400 below 1.375rem.
- Line height: table cells 1.3.
- Line length: `max-width: 65ch` on prose.
- Tracking: 0 on text; -0.01 to -0.02em on headings from 1.75rem; +0.05em on abbreviations in capitals.
- Figures: `tabular-nums` wherever numbers are compared or update (`hierarchy.md`, Number columns).
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Radius: 4 to 6 px controls (tokens sm 4, md 6), 8 to 12 px containers (token lg 10).
- Contrast: 4.5:1 text, 3:1 large text, borders and focus.
- Dark: background #121212, surface #1c1c1e, elevated #2c2c2e, text #f5f5f7.
- Motion: 120 ms feedback, 200 ms menus, 280 ms dialogs, 400 ms drawers at most; `cubic-bezier(0.2, 0, 0, 1)`. Reduced motion keeps short fades and removes movement.
- Targets: 44 px touch, 24 px floor, 36 to 40 px desktop rows.
