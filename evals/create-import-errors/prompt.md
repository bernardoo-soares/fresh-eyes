---
tags: [fresh-eyes]
max_turns: 60
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash, Agent]
---

People import contacts into our CRM from a CSV. An import of contacts.csv just finished: 389 of 412 rows went in and 23 failed. import-result.json lists every error. Design the screen the person sees right after the import. Build it as one self-contained HTML file named import-result.html (inline CSS and JS, no network requests, no external fonts). It has to work on desktop and on a phone, in light and in dark mode.

Input files: import-result.json
