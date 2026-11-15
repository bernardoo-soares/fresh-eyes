---
tags: [fresh-eyes]
max_turns: 60
timeout_seconds: 1800
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash, Agent]
---

New users of our product-analytics tool land on an empty workspace right after sign-up: no data source connected, no dashboards, no teammates. They can connect Postgres, Stripe, Google Sheets or upload a CSV, and there is a sample dataset to explore. Build that first screen. Build it as one self-contained HTML file named welcome.html (inline CSS and JS, no network requests, no external fonts). It has to work on desktop and on a phone, in light and in dark mode.
