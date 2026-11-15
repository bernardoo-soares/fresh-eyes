---
tags: [fresh-eyes]
max_turns: 60
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash, Agent]
---

Our operations managers open the dashboard of our field-service app first thing every morning. ops.json has today's data. Build it as one self-contained HTML file named dashboard.html (inline CSS and JS, no network requests, no external fonts). It has to work on desktop and on a phone, in light and in dark mode. Desktop first.

Input files: ops.json
