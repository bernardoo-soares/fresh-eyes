# Hierarchy

What the eye lands on first, how items group, and how numbers, statuses and charts carry meaning. Read it when a screen has no clear first thing, or when laying out figures, tables or charts.

- [One first thing per view](#one-first-thing-per-view)
- [Emphasis only when rare](#emphasis-only-when-rare)
- [Weight and colour before size](#weight-and-colour-before-size)
- [Colour last, and only as signal](#colour-last-and-only-as-signal)
- [Same job, same look](#same-job-same-look)
- [Labels as a last resort](#labels-as-a-last-resort)
- [One system per screen](#one-system-per-screen)
- [Group by unit](#group-by-unit)
- [Finished, not bare](#finished-not-bare)
- [The first screen holds the decision](#the-first-screen-holds-the-decision)
- [Status as text, badge for exceptions](#status-as-text-badge-for-exceptions)
- [Exceptions first](#exceptions-first)
- [No equal-tile grid](#no-equal-tile-grid)
- [One screen for monitoring](#one-screen-for-monitoring)
- [Every number in context](#every-number-in-context)
- [Precision fits the decision](#precision-fits-the-decision)
- [Number columns](#number-columns)
- [A long table that scans](#a-long-table-that-scans)
- [Every chart compares](#every-chart-compares)
- [Data-ink](#data-ink)
- [Bars, not gauges](#bars-not-gauges)
- [Sparklines beside the number](#sparklines-beside-the-number)
- [Small multiples over spaghetti](#small-multiples-over-spaghetti)
- [Words on the data](#words-on-the-data)

## Rank and group

### One first thing per view
- **Decision:** What should the eye land on first, and which action is primary?
- **Do:** Make the answer the person came for (their balance, the next departure, the result of what they did) the biggest thing on the screen, and allow one primary action per view, placed where the job starts: directly under or beside the thing it acts on, in the reading path (under the balance it adds to, under the result it fixes), never off in a side column. If it still does not stand out, turn down everything around it (lighter text, ghost or link-style secondary buttons, muted icons) rather than making it bigger or brighter.
- **Why:** When every element is pushed up, nothing reads as first; equal-weight choices slow the decision and blur the screen's purpose. *Source:* Krug, *Don't Make Me Think*, "Billboard Design 101"; Wathan and Schoger, *Refactoring UI*; Hick's law (Laws of UX).
- **Look for:** Two or three filled buttons side by side; a key figure no larger than its label; the destructive action as loud as the main one; the main action in a column beside the result, or only in a bar at the bottom while the number it acts on sits at the top.
- **Unless:** True peers share one weight: rows in a table, two equal choices (Accept and Decline on a shift swap). Hick's law predicts little for familiar menus; never hide frequent actions in overflow to cut the count.

### Emphasis only when rare
- **Decision:** What on this screen deserves to stand out, and what can leave?
- **Do:** Emphasise one or two things per view (the primary action, the anomaly that needs action) and keep the rest calm. Treat every extra element as competing: remove decoration and move rarely needed information behind a click.
- **Why:** When everything is highlighted, the warning that matters is lost, and noise makes the screen feel harder than the task. *Source:* von Restorff effect (Laws of UX); Nielsen, 10 usability heuristics (#8); Krug, *Don't Make Me Think*.
- **Look for:** Several "New" badges; an icon or badge beside every label; every card with a coloured accent; a summary repeating what sits just below.
- **Unless:** Dense data people compare (a table of stock levels) is content, not clutter: reduce the chrome around it, not the columns. Von Restorff was shown for memory of list items; applying it to visual emphasis is extrapolation.

### Weight and colour before size
- **Decision:** How do I make the one thing that matters stand out?
- **Do:** Size separates levels; weight and colour rank within a level. Rank the text inside a card or row with weight and colour (dark and semibold for primary, mid grey for secondary, lighter grey for tertiary, every one still at 4.5:1), and reach for a new size only where a new level starts.
- **Why:** Size-only hierarchy gives oversized headings and tiny metadata, so the page shouts and the useful detail is hard to read. *Source:* Wathan and Schoger, *Refactoring UI*.
- **Look for:** Three or more font sizes in one card; secondary text in the headline's black; a property listing whose asking price looks like the street name.
- **Unless:** A single hero figure (the balance owed, the queue length) earns a real size jump; one per view.

### Colour last, and only as signal
- **Decision:** Where does colour go on this screen?
- **Do:** Build the layout in greys until the hierarchy works without colour, then add one accent for action and reserve red and amber for what needs action.
- **Why:** If colour is decoration, an alert colour goes unnoticed; hue alone also fails colour-blind people. *Source:* Wathan and Schoger, *Refactoring UI* (greyscale first); Few, *Information Dashboard Design*.
- **Look for:** Coloured icon chips on every tile; green for "normal" everywhere; more than two saturated hues outside charts.
- **Unless:** Categorical charts need a hue per series; keep them muted.

### Same job, same look
- **Decision:** How should repeated elements be styled?
- **Do:** Give everything with the same function one treatment, and make different functions look different (clickable versus static, money versus counts).
- **Why:** People infer function from appearance; inconsistent styling makes them hover to find out what is clickable. *Source:* Gestalt similarity.
- **Look for:** Links in three colours; a status coloured like a link; one blue for both "selected" and "warning".
- **Unless:** Deliberate contrast to mark one exception (one overdue loan) is the point.

### One system per screen
- **Decision:** Does everything on this screen speak the same visual language?
- **Do:** Use one icon language (all line, all filled, or one illustrated set), one way of grouping (one kind of container, or lists without dividers inside one container), one accent, one case convention, one theme and one language for the words. Repeat the system; do not mix systems.
- **Why:** Mixed systems make a screen read as assembled from parts, and people stop trusting that similar-looking things behave alike. *Source:* Gestalt similarity; Nielsen, 10 usability heuristics (#4).
- **Look for:** 3D icons beside line icons beside photos; outlined cards, then divider rows, then round tiles on one screen; a dark band midway down a light page; English labels inside a screen in another language.
- **Unless:** Content images (logos, photos, flags) belong to the content, not the system; they can vary freely inside one consistent frame.

### Labels as a last resort
- **Decision:** Does this value need a label?
- **Do:** Let format carry meaning (an email looks like an email; "Due 3 Dec" needs no "Due date:") and fold the label into the value ("12 overdue"). Never set a label in capitals by styling (`tells.md`).
- **Why:** Label and value pairs double the text to scan and lift the label to the data's weight. *Source:* Wathan and Schoger, *Refactoring UI*.
- **Look for:** Uppercase tracked micro-labels above every number; "Status:" and "Name:" prefixes in a list.
- **Unless:** Dense forms and comparable specs (a property's floor area, bedrooms, energy rating) where readers scan labels to find a value.

### Group by unit
- **Decision:** How do I show which items belong together?
- **Do:** Group by proximity: tighter spacing inside a group, clearly more between groups. Give a container (a shared background or a card) to each unit the person reads or acts on as one thing: a summary, one source to connect, one group of problems, one plan. Never nest a card in a card, and do not box every section the same way regardless of its role.
- **Why:** Units with a visible edge are read and compared at a glance; a page with no containers reads as a document, and a page where everything is boxed alike has no structure at all. Nested cards make depth ambiguous. *Source:* Gestalt proximity and common region; Wathan and Schoger, *Refactoring UI*; Apple HIG (Layout).
- **Look for:** Related items floating in one long column with nothing to hold them; or the opposite, every section in an identical shadowed card; cards inside cards; equal gaps inside and between groups.
- **Unless:** A dense table or list the person scans all day: its rows are the units, so drop containers around them and keep the chrome thin.

### Finished, not bare
- **Decision:** Does this screen look like a finished product or like a document?
- **Do:** Give the eye anchors that carry meaning: recognisable icons and logos where they are faster than the word (sources, file types, the problem that needs action), a small visual that shows the shape of the answer (a split bar for done versus failed, a progress bar against a limit), the product's own header and navigation, and containers for the units above. Use colour to help recognition, not only to warn.
- **Why:** A wide column of grey text with large empty areas reads as unfinished and takes longer to scan; people trust and use a screen that looks cared for. Restraint means nothing extra, not nothing at all. *Source:* aesthetic-usability effect (Laws of UX); Wathan and Schoger, *Refactoring UI*.
- **Look for:** A first screen of headings and sentences with no icons, containers or visuals; half the width empty; a summary given as a sentence where a labelled bar would show it.
- **Unless:** An anchor that means nothing (an icon in a circle beside every heading, a chart that compares nothing) is decoration; see `tells.md`. A page for managing an account (billing, plan, payment method, profile) stays plain: each fact with the button that changes it, and no charts, strips or extra panels unless the person asked for history.

### The first screen holds the decision
- **Decision:** What must be visible before the person scrolls?
- **Do:** Fit everything needed to make the screen's main decision on the first screen, on desktop and on the phone: every item that is being decided on, the total, and the action. Use compact rows (one line per item, details on a second muted line), and avoid layouts that spend width on labels, such as a label column beside each section.
- **Why:** What sits below the fold is often never seen; deciding on half the facts produces wrong decisions or a scroll back and forth. *Source:* Few, *Information Dashboard Design* (one screen); Krug, *Don't Make Me Think*.
- **Look for:** On a phone, the action button reachable but half the items it decides on below it; an explanatory paragraph pushing the key list down.
- **Unless:** Long reference content (a full history, a document) whose first screen only needs the summary and a way in.

## Numbers and status

### Status as text, badge for exceptions
- **Decision:** How do I show the status of three hundred shipments?
- **Do:** Show the normal state as plain muted text, or nothing, and give a coloured badge or icon only to states that need action.
- **Why:** A pill on every row turns the column into wallpaper, and the one "Held at customs" is lost among "Delivered". *Source:* Few, *Information Dashboard Design* (highlight only the exceptions).
- **Look for:** A rainbow of pills in every row of a status column.
- **Unless:** A few states that are all equally actionable (a kanban stage) take one consistent neutral label.

### Exceptions first
- **Decision:** On a monitoring screen, or any screen where some items need checking, what goes first?
- **Do:** Put the exceptions that need action now at top left as a short list with counts and the next step; routine metrics go below, quieter and compact. When a few items must be checked before acting (flags on a claim, rows that failed), open with a short summary of them ("2 things to check"), then mark each one in place in the full list.
- **Why:** A monitoring screen exists so someone can see in seconds what is wrong; routine numbers placed first make them hunt. *Source:* Few, *Information Dashboard Design*.
- **Look for:** A hero row of healthy totals on a CI status page while "4 builds failing on main" sits lower down.
- **Unless:** Nothing needs action: say so plainly ("All builds passing") and let the routine metrics rise.

### No equal-tile grid
- **Decision:** How do I lay out eight metrics?
- **Do:** Size and place metrics by importance; put secondary ones in a compact list or small table with their comparisons, not a row of identical tiles.
- **Why:** Equal tiles claim equal importance and spend space on padding instead of context. *Source:* Few, *Information Dashboard Design*.
- **Look for:** Four or eight same-size cards, each a label, a big number and a green arrow.
- **Unless:** Peers compared side by side (wards, branches) where equal size is the honest encoding; then share one scale.

### One screen for monitoring
- **Decision:** Should a monitoring screen scroll or use tabs?
- **Do:** Fit what is monitored on one desktop screen; move detail and history to drill-down pages.
- **Why:** What sits below the fold or behind a tab is not monitored. *Source:* Few, *Information Dashboard Design*.
- **Look for:** Key alerts visible only after scrolling; tabs splitting the current status.
- **Unless:** At phone width, stack in priority order, exceptions first.

### Every number in context
- **Decision:** What should sit next to a key figure?
- **Do:** Pair each number with its comparison (target, previous period or normal range) plus the delta with its direction and the period it covers: "1,284 parcels shipped, 6% below last Tuesday".
- **Why:** A bare number cannot be judged good or bad, so it cannot drive a decision. *Source:* Few, *Information Dashboard Design*; Tufte (show comparisons).
- **Look for:** A big number with only a label; a percentage change with no base or period.
- **Unless:** Values with no meaningful comparison (an ID, a plan name).

### Precision fits the decision
- **Decision:** How many digits, and which units?
- **Do:** Round monitoring figures to what the decision needs (1.2M, 94%) and state units once. Keep exact values wherever money must reconcile.
- **Why:** Extra digits slow reading and imply false precision; rounded money on a statement erodes trust. *Source:* Few, *Information Dashboard Design*.
- **Look for:** "€1,234,567.89 revenue" on a monitoring screen; mixed decimals in one column.
- **Unless:** Statements, refunds and tax: exact to the cent, always.

### Number columns
- **Decision:** How do I set numbers in tables, totals and live values?
- **Do:** Right-align numbers and their headers, use `font-variant-numeric: tabular-nums`, keep one decimal count per column, and put the unit or currency in the header unless rows mix them. In a list of records that each carry an amount (transactions, payments, purchases), put the amount in the last column, at the right edge, as a bank statement does; row actions, if any, come after it.
- **Why:** Ragged or proportional digits make magnitudes impossible to compare down a column, and live values jitter as they update. *Source:* Wathan and Schoger, *Refactoring UI* (alignment); Tufte (tables); Bringhurst (figures in tables).
- **Look for:** Centred numbers; "€" repeated in every cell; decimal points that do not stack; a counter whose width wobbles; the amount sitting in the middle of a row with status or names after it.
- **Unless:** IDs and phone numbers are labels, not quantities: left-align them. A single hero figure or numbers in running text read better proportional.

### A long table that scans
- **Decision:** How dense should a long working table be?
- **Do:** Compact rows, hairline separators or none, no vertical rules, a sticky header, a visible row count, and sorting or filtering on the columns people act on; put secondary detail as a muted second line, not an extra column. Past a few hundred rows, page the table, with the total shown and the page in the URL; endless scroll suits feeds, not records people come back to.
- **Why:** Padding and boxes cut the rows on screen and force scrolling; endless scroll loses the person's place. *Source:* Tufte (data-ink); Wathan and Schoger, *Refactoring UI* (fewer borders); Nielsen Norman Group, "Infinite Scrolling Is Not for Every Website" (Loranger, 2014).
- **Look for:** Card-style rows with shadows; full grid borders; fifteen columns of equal weight.
- **Unless:** Touch-first or phone layouts need taller rows; collapse to a two-line list rather than shrink targets.

## Charts

### Every chart compares
- **Decision:** Should this be a chart at all?
- **Do:** Chart only when it shows a comparison (against a target, last period, peers or over time); otherwise show the number in context. Bars start at zero; a line may start elsewhere when its axis says so; time runs at even intervals; no second y-axis.
- **Why:** A decorative chart spends space and answers nothing (Tufte's chartjunk); a bar's length is its value, so a cut baseline lies. *Source:* Tufte, *The Visual Display of Quantitative Information*; Few, *Information Dashboard Design* and "Dual-Scaled Axes in Graphs" (Perceptual Edge, 2008).
- **Look for:** An unlabelled sparkline in every tile; a donut with two slices; a chart with no axis or reference line.
- **Unless:** The shape of a trend is the point; then a sparkline.

### Data-ink
- **Decision:** What can I remove from this chart or table?
- **Do:** Remove ink that encodes no data: heavy gridlines, plot borders, backgrounds, shadows, 3D, gradients. Keep faint reference lines.
- **Why:** Non-data ink competes with the data and hides small differences. *Source:* Tufte, *The Visual Display of Quantitative Information* ("data-ink").
- **Look for:** Dark gridlines, a framed plot area, gradient fills under lines, drop shadows on bars.
- **Unless:** A gridline that helps read exact values off a chart used for lookup.

### Bars, not gauges
- **Decision:** How do I show progress to a target?
- **Do:** A horizontal bar with a target tick and a few qualitative bands (Few's bullet graph), or the number with "of 500".
- **Why:** Dials, speedometers and traffic lights spend much space on one value and are hard to compare. *Source:* Few, *Information Dashboard Design*.
- **Look for:** Radial gauges, progress rings, thermometer graphics.
- **Unless:** One small completion ring in onboarding, where precision does not matter.

### Sparklines beside the number
- **Decision:** How do I show a trend without a full chart?
- **Do:** Put a word-sized line next to the figure, on the same scale across rows, with the latest point marked.
- **Why:** Trend and value read together, without a chart's space or a click. *Source:* Tufte, *Beautiful Evidence* (sparklines).
- **Look for:** Full-width charts repeating what each row could show inline; sparklines on mixed scales.
- **Unless:** Under five data points, or when exact values matter more than shape.

### Small multiples over spaghetti
- **Decision:** How do I compare many series?
- **Do:** One small chart per series, identical axes and scale, in a grid, instead of one chart with many coloured lines.
- **Why:** Tangled lines and a legend force colour matching; small panels show differences at once. *Source:* Tufte, *Envisioning Information*.
- **Look for:** More than four lines in one chart; a legend of six colours.
- **Unless:** Two or three series that must be read against each other at exact points.

### Words on the data
- **Decision:** Where do labels and explanations go?
- **Do:** Label lines and bars directly at their ends, and put the short explanation next to the number it explains.
- **Why:** Legends and footnotes force eye travel and memory. *Source:* Tufte (integrating words, numbers and images).
- **Look for:** A legend box under the chart; "see note 1"; a tooltip as the only route to the meaning.
- **Unless:** Many tiny points where direct labels collide.
