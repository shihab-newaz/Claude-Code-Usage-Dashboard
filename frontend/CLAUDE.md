# CLAUDE.md

## Project Overview

Personal Claude Code usage analytics dashboard. Reads transcript data from
`~/.claude/` and displays aggregated metrics (tokens, cost, tool usage).

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS + shadcn/ui
- Recharts for charts
- TanStack Query for data fetching
- Zustand for UI state

## Data Source

Read-only access to Claude Code session logs at:
- `~/.claude/projects/*.jsonl` — per-project session JSONL files (primary data source)
- `~/.claude/usage-data/session-meta/*.json` — pre-aggregated per-session stats (alternative source)

## Key Conventions

- API routes go in `src/app/api/`
- Dashboard pages in `src/app/(dashboard)/`
- Custom hooks in `src/hooks/`
- Recharts components in `src/components/charts/`
- All API responses use NextResponse.json()
