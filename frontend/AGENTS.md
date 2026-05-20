<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Quick reference

```
npm run dev            # dev server on localhost:3000
npm run build          # static export → out/
npm run lint           # ESLint
```

## Architecture

- **Static export** (`output: "export"` in `next.config.ts`) — no SSR, no middleware, no `next/cookies`/`next/headers` in production
- **Base path** is `/claude-usage-dashboard` — all routes, links, and asset URLs must include this prefix
- **API routes** (`src/app/api/`) work in dev only; they run on the Next.js dev server, not in the static output
- **Self-contained data pipeline** — the frontend reads `~/.claude/projects/*.jsonl` directly via `better-sqlite3`; it does NOT call the backend

## Data layer

- `src/lib/db/` — SQLite via `better-sqlite3` (sync API, native C++ addon)
- DB file: `.next/claude-usage.db`
- `src/lib/db/parser.ts` — parses JSONL files, extracts token counts, tool calls, languages
- `src/lib/db/sync.ts` — upserts parsed sessions into SQLite; idempotent (ON CONFLICT DO UPDATE)
- `src/lib/db/ensureSynced.ts` — 60s debounce; call before every API response
- Query functions in `src/lib/db/queries/`

## Design

- **Tailwind CSS v4** — `@import "tailwindcss"` in CSS; `@tailwindcss/postcss` PostCSS plugin
- **shadcn/ui v4** — `"style": "base-nova"`, components in `src/components/ui/`
- **ClickHouse-inspired dark theme** — canvas `#0a0a0a`, primary `#faff69` (electric yellow), Inter font
- Design tokens in `src/styles/globals.css`; component specs in `DESIGN.md`

## State management

- **TanStack React Query** — all server state; custom hooks in `src/hooks/` (`useClaudeUsage`, `useSession`)
- **No Zustand** — `src/store/` is empty
- **ThemeProvider** (React context) in `src/components/providers/` for light/dark toggle
