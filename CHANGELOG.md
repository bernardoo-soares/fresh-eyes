# Changelog

## 1.0.0 (2026-11-15)

The first public release.

- One loop for creating and reviewing web product UI: understand the job, decide before styling, write the words
  first, build, render and look, get a first look from fresh eyes, then fix and stop.
- Reviews change only what costs the person something, build the improved version as a copy beside the original,
  and name every change.
- References, one per question: hierarchy, structure, clarity, states, words, craft, the accessibility floor
  (WCAG 2.2 AA), modern without the template, tells, landing pages, reviews, the project's design context, and
  React with shadcn/ui.
- `scripts/render.mjs`: desktop and phone screenshots in light and dark, the problems a script can measure, and a
  list of things to check by eye.
- `scripts/tokens.mjs`: a colour and type token set from one accent colour, with every colour pair checked for
  contrast.
- `scripts/snapshot.mjs`: a live page frozen into one self-contained HTML file for offline review.
- The `first-look` brief for the fresh-eyes subagent, loaded as a plugin agent in Claude Code.
- Installs as a Claude Code plugin or as a personal skill.
