# DESIGN-CONTEXT.md

What a project tells the skill once, so every screen starts from its people and its content instead of from a
default kit. It lives at the root of the project (or next to the UI code) and belongs to the project, not to
the skill.

**When there is none:** infer what you can from the code, the copy and the request, build the screen, and list
your assumptions in the reply. Then offer to write the file from them. Never stop to interview the user before
the first screen.

**When there is one:** read it first. When the request contradicts it, follow the request and say so.

## Template

```markdown
# Design context: <product>

## People and jobs
| Who | The job they come for | How often | Where |
|---|---|---|---|
| <role, in their words> | <the task, as a verb phrase> | all day / daily / weekly / rarely | desk / phone / both |

## Content
- Real shapes: the longest name, the largest amount, the busiest list, an empty account, a failed state.
- Units, currencies, date and number formats, languages.

## Voice
- Three words for how the product speaks.
- Words we use, and words we never use.

## Brand and system
- Accent colour, type, existing tokens or components (with paths).
- Anything fixed by the brand that the design must keep.

## Constraints
- Stack, accessibility target (WCAG 2.2 AA unless stated), supported widths, density.

## Decisions
- <date>: <decision>, because <reason>.
```

Keep it short. A line that would not change a design decision does not belong in it.
