# Tells: what reads as machine-made

A tell is a choice made by default instead of from the content. People spot them in a second and stop trusting the
screen, even when they cannot say why. Each one below can be right when the content asks for it; when you use one,
know the reason. Everything under "Never" is the owner's ruling, and `scripts/render.mjs` reports it.

## Never

- **A coloured stripe on one edge** of a nav item, card, callout or row, however it is drawn (border, inset shadow,
  pseudo-element). Mark a selected item with a filled tint and a stronger weight or text colour; mark a warning
  with its words and an icon.
- **Em dashes in interface copy.** Use a full stop, comma, colon or parentheses.
- **Labels set in capitals** by styling ("CURRENT PLAN", "NEXT INVOICE"), however short. Write labels in sentence
  case; real abbreviations (PDF, VAT) stay as they are.

## The current template

Eyebrow pills, two-colour headlines, decorative grids and glows, proof stats, floating bubbles, the same call to
action twice, centred paragraphs, boxes in boxes, ambient motion on working screens and fake product shots. They read as generated
because they arrive by default. The list, why, and what to do instead: `modern.md`.

## Only with a reason from the content

| Tell | What it costs | What a person does instead |
|---|---|---|
| Every section in the same bordered, shadowed card whatever its role; cards inside cards | no structure, ambiguous depth | a container for each unit the person reads or acts on as one; nothing nested |
| A grid of equal tiles, each a label, a big number and a green arrow | claims equal importance; no context | the exception first, then routine figures in a compact list, each against its target or last period |
| Upper case as running text (every list row, all the navigation, half the labels), or monospace capitals as a "technical" flavour | reads as shouting, as dated, or as a template | sentence case everywhere (see "Never" above) |
| Several systems on one screen: 3D, photo, line and filled icons together; cards then divider rows then tiles; two languages | nothing reads as one product | one icon language, one grouping method, one language per screen |
| A promotion, upsell or advert inside a task screen | the screen becomes a shop window and spends trust | sell on a screen whose job is choosing a plan, never on one whose job is something else |
| A coloured pill for every status in a column | the one status that needs action is lost | plain text for the normal state; colour and an icon only for the exception |
| Gradients, glass and glows; the default purple-to-blue look | decoration that ages fast and fights the content | one accent colour (the brand's, when there is one), used for action and selection |
| The same 12 to 16 px radius and soft shadow on every box | everything floats at one depth | flat surfaces; elevation only for what sits above the page (menus, dialogs) |
| An icon in a coloured circle beside every heading or figure | noise, and meaning nobody asked for | icons where they speed recognition (a source's logo, a file type, the row that needs action) |
| A chart that compares nothing; a sparkline per tile | space spent, nothing answered | a number in context; a chart only when it shows a comparison |
| Invented figures, sample names, testimonials or trends | false information, often believed | real content from the brief or the data; a visible placeholder when you have none |
| Welcome lines, praise, "Unlock", "Seamless", "Oops!" (`words.md`) | hides the point, signals nobody wrote it | the next step, in the person's words |
| Two or more filled buttons in one view | no first action | one primary action; the rest quieter |
| A centred hero layout on a working screen | a marketing page where a tool should be | left-aligned content in reading order, starting with what the person came for |
| Emoji as icons or decoration | reads as a template and as unserious near money or data | a proper icon set, or the word |

## The opposite failure: bare

Avoiding tells is not the goal; a screen stripped of them can fail the other way, and people choose the busier
screen over the bare one. Bare looks like this:

- **A document, not a product:** headings and grey sentences in one wide column, large empty areas, no containers,
  no icons, no visual that summarises anything.
- **Explaining instead of designing:** a sentence added for every doubt, where a label, a list or a bar would do.
- **A first screen that holds half the decision:** the action is visible, the items it decides on are not.

The fix is in `hierarchy.md` (group by unit, finished not bare, the first screen holds the decision) and
`words.md` (structure before sentences).

## The opposite of a tell

A screen made by a person carries decisions you can trace to this product: the one figure this audience checks
first is the biggest thing on the page; the labels use this team's words; the density fits how often people come;
something unusual is there because the content needed it. When a screen could belong to any product, it is not
finished.
