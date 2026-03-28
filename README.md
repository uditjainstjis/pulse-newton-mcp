# Pulse

Pulse is a Newton MCP-native student operating system built on Next.js.

The core thesis is simple: students do not need more dashboards. They need a system that decides what matters next, explains why, and adapts to the time they actually have.

## What makes this a strong Newton MCP project

Pulse is designed around real Newton surfaces, not generic student-product ideas.

It uses Newton data to power:

- a daily brief that explains what is going wrong before it compounds
- a friction radar that names deadline pressure, lecture drift, and weak-topic drag
- a week forecast that shows where the next five days become fragile
- a dynamic intervention planner where a student picks `30 / 60 / 120 / 180` minutes and gets a realistic action sequence
- a missed-class recovery engine
- an adaptive practice coach connected to weak modules and streak surfaces
- a hosted review mode with scenario switching for judges

## Newton MCP mapping

The product contract is intentionally aligned to these Newton MCP calls:

- `list_courses`
- `get_course_overview`
- `get_upcoming_schedule`
- `get_assignments`
- `get_recent_lectures`
- `get_question_of_the_day`
- `get_arena_stats`

Those signals are normalized into a shared student snapshot so the UI can stay stable while the provider moves from demo to live mode.

## Current build

The current app already includes:

- a differentiated landing/dashboard experience
- deterministic health and risk scoring
- a workload forecast for the next five days
- dynamic time-window planning
- deadline-aware recovery logic
- Newton data-source documentation in code
- a JSON demo API contract at `src/app/api/demo/brief/route.js`
- a standalone `/autopilot` concierge that orders assignments, highlights start/stop windows, and surfaces readiness metrics from `src/lib/autopilot.js`

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Live Newton path

Pulse now auto-detects local Newton MCP credentials from `~/.newton-mcp/credentials.json`.

1. Authenticate Newton once:

```bash
npx -y @newtonschool/newton-mcp@latest login
```

2. Run the app normally. If credentials are available, Pulse uses the live Newton API automatically.

3. For hosted deployments, set `NEWTON_ACCESS_TOKEN` and optionally `NEWTON_COURSE_HASH` on the server.

4. The adapter keeps the UI contract stable by normalizing live Newton responses into the shared Pulse snapshot shape in `src/lib/newton-live.js`.

5. Persist daily briefs and completed interventions so Pulse gets smarter over time.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEWTON_PROVIDER` / `NEXT_PUBLIC_NEWTON_PROVIDER` | Toggle live vs demo data; defaults to `auto`. Set to `demo` for reviewer builds and `live` when your token exists. |
| `NEWTON_ACCESS_TOKEN` | The token you get via `npx -y @newtonschool/newton-mcp@latest login`; the live adapter uses it or `~/.newton-mcp/credentials.json`. |
| `NEWTON_COURSE_HASH` | Optional override for the course the concierge and planner read. |

Setting these before a Vercel deploy ensures `/autopilot` and the dashboard both surface Newton feeds for scheduler confidence and scenario variance.

## Reviewer-friendly hosted flow

Hosted reviewers will usually not have Newton auth configured.

To make the product still evaluable, Pulse includes review scenarios:

- `Founder mode`
- `Deadline spiral`
- `Comeback week`

These scenarios visibly change:

- health score
- risk pressure
- backlog
- intervention plan
- recovery flow
- next-five-days forecast

That means judges can still test whether the product logic is genuinely adaptive.

## Submission docs

- project submission notes: `docs/SUBMISSION.md`
- demo/video script: `docs/DEMO_SCRIPT.md`

## Why this is useful to everyone

Most students know they are “behind”, but they cannot translate that feeling into a sequence.

Pulse solves that by answering:

- What should I do today?
- What will hurt me this week?
- How do I recover if I only have 30 minutes?
- Which missed lecture is actually dangerous?
- What practice move creates the most momentum right now?

That makes it broadly useful across semesters, not just as a personal dashboard.

## Repository

GitHub: `https://github.com/uditjainstjis/pulse-newton-mcp`
