# The accessibility floor

WCAG 2.2 AA, the essentials for product UI. The floor is not the design: a screen can pass every line and still
confuse people. But nothing ships below it. "Measured" means `scripts/render.mjs` reports it; everything else
you check by looking and by reading the code.

| Check | Criterion | Measured |
|---|---|---|
| Text contrast at least 4.5:1, or 3:1 for large text (24 px, or 18.5 px bold); placeholders count as text | 1.4.3 | yes (axe), in light and dark; axe does not check placeholders |
| Borders of inputs, focus rings, icons and chart marks people need at least 3:1 against their background | 1.4.11 | no: check field borders by eye and with a contrast check |
| Meaningful images have a text alternative; decorative ones `alt=""` | 1.1.1 | partly (axe finds a missing alt, not a useless one) |
| Colour is never the only way to tell states apart (status, errors, required, links in text) | 1.4.1 | no |
| Every control works with the keyboard, in a logical order, with no trap | 2.1.1, 2.1.2, 2.4.3 | partly (focus order is walked) |
| Single-key shortcuts can be turned off or remapped, or act only on focus | 2.1.4 | no |
| A way past repeated blocks: landmarks, headings or a skip link | 2.4.1 | partly (axe) |
| A visible focus indicator on every focusable element, not hidden under sticky headers | 2.4.7, 2.4.11 | yes (pixel check on desktop, light and dark; off-screen focus too) |
| Every control has a name, and the visible label is part of it; icon-only buttons get a label | 4.1.2, 2.5.3 | partly (axe misses a glyph used as the name, such as "↻") |
| Every field has a visible label; a placeholder is not a label | 1.3.1, 3.3.2 | partly |
| Fields about the person carry the right `autocomplete` | 1.3.5 | partly (axe finds an invalid value, not a missing one) |
| Errors say what is wrong in text, next to the field, and how to fix it | 3.3.1, 3.3.3 | no |
| Payments, legal commitments and data changes can be reversed, or checked and confirmed first | 3.3.4 | no |
| Changing a field never submits or navigates by itself | 3.2.2 | no |
| Session timeouts warn first and can be extended | 2.2.1 | no |
| Content reflows at 320 px wide with no sideways scroll (tables may scroll inside themselves) | 1.4.10 | yes (at 320 and 390 px) |
| Text survives line height 1.5, paragraph spacing 2, letter 0.12 and word spacing 0.16 times its size | 1.4.12 | no |
| Targets at least 24 × 24 px, or spaced so a 24 px circle fits | 2.5.8 | yes |
| Anything done by dragging also works with single taps | 2.5.7 | no |
| Content shown on hover or focus can be dismissed and hovered, and stays until dismissed | 1.4.13 | no |
| Text can grow to 200%: sizes in rem, no fixed heights on text containers | 1.4.4 | no |
| Every page has a title that names it | 2.4.2 | partly (axe finds a missing title, not a vague one) |
| Headings and landmarks describe the structure (one h1 is good practice, not a criterion) | 1.3.1, 2.4.6 | no |
| Link text, with its context, says where it goes | 2.4.4 | partly (axe finds empty links) |
| Status changes (saved, 3 results, error) are announced without moving focus | 4.1.3 | no: use a live region |
| Motion respects `prefers-reduced-motion`; nothing moves for more than 5 seconds without a pause | 2.3.3 (AAA, still expected), 2.2.2 | no |
| The page declares its language | 3.1.1 | yes (axe) |
| Information asked for once in a flow is not asked for again | 3.3.7 | no |
| Sign-in needs no memory or transcription test (allow paste and password managers) | 3.3.8 | no |

Both themes get the full check: a dark mode that fails contrast is a failure, not a variant.
