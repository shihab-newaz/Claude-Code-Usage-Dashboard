# CLAUDE.md

## Project Overview

Personal Claude Code usage analytics dashboard. Displays aggregated metrics
(tokens, cost, tool usage) by fetching data from the backend API.

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS + shadcn/ui
- Recharts for charts
- TanStack Query for data fetching
- Zustand for UI state

## Data Source

All data comes from the backend API (NestJS). Configure the backend URL via:
- `NEXT_PUBLIC_API_URL` — base URL of the backend (e.g. `http://localhost:3000`)

## Key Conventions

- No frontend API routes — the backend is the source of truth
- TanStack Query hooks in `src/hooks/` call the backend directly
- Dashboard pages in `src/app/(dashboard)/`
- Recharts components in `src/components/charts/`
