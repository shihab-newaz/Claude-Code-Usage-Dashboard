# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Next.js 16 App Router dashboard for Claude Code usage analytics. **Self-contained** — reads `~/.claude/projects/*/*.jsonl` directly via its own API routes and local SQLite. No dependency on the backend service.

## Tech Stack

- Next.js 16 (App Router)
- Tailwind CSS v4 + shadcn/ui (`style: "base-nova"`)
- Recharts for charts
- TanStack Query for data fetching
- Zustand for UI state
- better-sqlite3 (native addon — requires Python + C++ build tools)

## Data Flow

API routes in `src/app/api/` read `~/.claude/projects/*/*.jsonl` → parse with `src/lib/db/parser.ts` → store in `.next/claude-usage.db` → return JSON to the client. Sync is debounced at 60s.

`NEXT_PUBLIC_API_URL` defaults to `""` so all fetches go to the local Next.js server. Set it to an external backend URL to switch to the NestJS backend instead.

## Key Conventions

- TanStack Query hooks in `src/hooks/` (`useClaudeUsage`, `useSession`)
- Dashboard pages under `src/app/(dashboard)/claude-usage/`
- Recharts wrappers in `src/components/charts/`
- shadcn/ui primitives in `src/components/ui/`

## Static Export

When built with `GITHUB_PAGES=true`, `next.config.ts` enables `output: "export"` with `basePath: "/claude-usage-dashboard"`. The static export has **no API routes** — they only work during `npm run dev` or in Docker.

## Design System

ClickHouse-inspired dark-only. Full token spec in `DESIGN.md`. Key: black canvas `#0a0a0a`, electric yellow primary `#faff69`, Inter font. Use `@import "tailwindcss"` (Tailwind v4 — no `@tailwind` directives).
