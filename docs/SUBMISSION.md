# Pulse Submission Notes

## One-line pitch

Pulse is a Newton MCP-powered student operating system that converts raw semester data into daily decisions, recovery plans, and time-aware intervention flows.

## Why this project exists

Students usually do not fail because data is missing. They fail because the data is passive.

Newton already has the signals:

- classes
- missed lectures
- assignments
- XP
- QOTD
- practice surfaces

Pulse turns those signals into:

- a daily brief
- risk scoring
- a five-day workload forecast
- a missed-class recovery engine
- a dynamic "what should I do in the next 30/60/120/180 minutes?" planner

## Why this is more than a dashboard

Most student dashboards answer "what exists?"

Pulse tries to answer:

- what will hurt me next?
- what should I do first?
- what can I realistically recover today?
- how does the answer change if I only have 30 minutes?

That is the core product difference.

## Newton MCP usage

Pulse is built around the Newton MCP data model and live Newton APIs.

Primary surfaces used:

- `list_courses`
- `get_course_overview`
- `get_upcoming_schedule`
- `get_assignments`
- `get_recent_lectures`
- `get_question_of_the_day`
- `get_arena_stats`

The live adapter normalizes those responses into a stable internal snapshot so the UI and planning engine stay consistent.

## Reviewer flow

Pulse supports two useful review modes:

1. Live mode on the developer machine
   It reads Newton MCP credentials from `~/.newton-mcp/credentials.json` and renders real semester data.

2. Hosted reviewer mode
   If live credentials are not configured on the host, Pulse falls back to curated review scenarios so judges can still test how the product adapts across very different student states.

## Review scenarios

- Founder mode
  Ambitious student with decent output but unstable recovery.

- Deadline spiral
  Stacked due dates, lower consistency, and rising risk pressure.

- Comeback week
  A recovering student with visible momentum improvement.

These scenarios exist so reviewers can see dynamic planning changes immediately without needing account-level login.

## Best things to test

- switch between review scenarios
- compare health score and risk score changes
- use the time-window planner with different durations
- inspect how the recovery engine changes
- see how the next-five-days forecast reacts to different student states

## Current limitation

Hosted live mode is not yet multi-user. A true production version would add secure per-user Newton account connection instead of a single server token.

## Why this should stand out

- real product thesis
- real Newton surface mapping
- not just chat, but action orchestration
- useful even for judges without login through review scenarios
