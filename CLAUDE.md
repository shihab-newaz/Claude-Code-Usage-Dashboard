# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Layout

Two independent packages — no workspace, no root `package.json`. Always run commands from the package directory.

- `frontend/` — Next.js 16 App Router dashboard (static export → GitHub Pages, or full server in Docker)
- `backend/` — NestJS REST API that reads Claude Code session logs

## Commands

**Frontend** (run in `frontend/`):
```
npm run dev        # dev server at localhost:3000
npm run build      # production build (static export if GITHUB_PAGES=true)
npm run lint       # ESLint
```

**Backend** (run in `backend/`):
```
npm run start:dev  # hot-reload dev server (default port 3000)
npm run build      # nest build → dist/
npm run start:prod # node dist/main
```

No test commands exist. TypeScript is validated by the build only — no standalone `tsc --noEmit` script.

## Architecture

### Two Separate Data Pipelines

The frontend and backend are **independent** — they do not talk to each other in production.

**Frontend (self-contained):**
- Reads `~/.claude/projects/*/*.jsonl` directly via Next.js API routes (`src/app/api/`)
- API routes call `src/lib/db/parser.ts` → stores to `.next/claude-usage.db` (better-sqlite3)
- `NEXT_PUBLIC_API_URL` is `""` by default — all requests go to `/api/claude-usage` on the same Next.js server
- Static GitHub Pages export has **no API routes** — the export is a read-only snapshot; API routes only work in `npm run dev` / Docker

**Backend (standalone REST API):**
- Reads the same `~/.claude/projects/*/*.jsonl` source
- `SyncService.ensureSynced()` is called before every response (debounced 60s)
- Stores to `.data/claude-usage.db`
- Exposes `GET /api/claude-usage` with optional `?dateFrom=&dateTo=` query params
- `POST /sync/upload` accepts a JSONL file upload for remote deployments that can't mount `~/.claude`

### Backend NestJS Module Structure

- `DbModule` — singleton `DbService` wrapping better-sqlite3, runs schema migrations on startup
- `SyncModule` — `ParserService` (JSONL parsing) + `SyncService` (upsert to SQLite)
- `ClaudeUsageModule` — `ClaudeUsageController` calls `SyncService.ensureSynced()` then queries `DbService`

### Frontend Key Conventions

- TanStack Query hooks in `src/hooks/` — `useClaudeUsage` and `useSession` call `/api/claude-usage`
- Dashboard pages under `src/app/(dashboard)/claude-usage/`
- Recharts wrappers in `src/components/charts/`
- shadcn/ui components in `src/components/ui/` (style: `"base-nova"` in `components.json`)
- Zustand for UI state only (not server data)

## Design System

ClickHouse-inspired dark-only design. See `frontend/DESIGN.md` for the full token spec.

Key tokens (defined in `src/styles/globals.css`):
- Canvas: `#0a0a0a`, Surface card: `#1a1a1a`
- Primary (electric yellow): `#faff69`, text on yellow: `#0a0a0a`
- Typography: Inter for everything, JetBrains Mono for code

## Deployment

- **GitHub Pages**: frontend only, built with `GITHUB_PAGES=true npm run build`. Configured in `.github/workflows/deploy.yml`. The static export has no backend — it's a frozen snapshot.
- **Docker**: `docker-compose.yml` runs both services. Frontend mounts `~/.claude` as read-only; backend persists SQLite in a named volume.
- Backend has a stub `ApiKeyGuard` (always returns `true` — not enforced). Set `API_KEY` and `ALLOWED_ORIGIN` in `backend/.env` (see `.env.example`).

## Gotchas

- **`better-sqlite3` is a native C++ addon.** Requires Python + C++ build tools (`node-gyp`) at install time. On Windows: install Windows Build Tools.
- **Static export limitations**: `output: "export"` means no SSR, no middleware, no `next/headers`/`next/cookies`. API routes (`src/app/api/`) are dev-only — they don't exist in the `out/` static build.
- **Next.js 16 breaking changes** vs prior versions — check release notes before writing Next.js–specific patterns.
- **Tailwind CSS v4** uses `@import "tailwindcss"` in CSS + `@tailwindcss/postcss` plugin. The old `@tailwind base/components/utilities` directives do NOT work.
- The frontend `CLAUDE.md` (`frontend/CLAUDE.md`) is **outdated** — it says "no frontend API routes" and "backend is source of truth", but the actual architecture is the opposite (frontend is self-contained with its own API routes). Trust `AGENTS.md` and this file.
