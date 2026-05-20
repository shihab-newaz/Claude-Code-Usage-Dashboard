# AGENTS.md

## Project layout

Two independent packages — no workspace, no root `package.json`. Run commands from the package directory.

- `frontend/` — Next.js 16 App Router dashboard, statically exported to GitHub Pages
- `backend/` — NestJS REST API reading Claude Code session logs from `~/.claude/projects/`

## Commands

All commands must run in their package directory (`frontend/` or `backend/`):

**Frontend** (`frontend/`):
```
npm run dev          # start dev server (localhost:3000)
npm run build        # production build → out/ (static export)
npm run lint         # ESLint
```

**Backend** (`backend/`):
```
npm run start:dev    # start with hot reload (default port 3000)
npm run build        # nest build → dist/
npm run start:prod   # node dist/main
```

There are no test commands. TypeScript is checked by the editor/build but there is no `tsc --noEmit` script.

## CI/CD

`.github/workflows/deploy.yml` builds and deploys only the **frontend** to GitHub Pages:
- Runs from repo root but `npm ci && npm run build` in the job — ensure it runs in `frontend/` if the workflow is ever updated
- Builds with `next.config.ts` → `output: "export"`, `basePath: "/claude-usage-dashboard"`
- No backend deployment exists; the backend is a local/self-hosted service

## Architecture notes

- **The frontend does NOT call the backend.** The frontend has its own embedded data pipeline using `better-sqlite3` that reads the same `~/.claude/` source locally. API routes (`src/app/api/`) run on the Next.js dev server and query SQLite directly.
- **The backend is a separate REST API** meant for deployment elsewhere (e.g. a VPS). It reads the same `~/.claude/projects/*.jsonl` source, syncs to SQLite, and exposes `GET /api/claude-usage`.
- The frontend `env.NEXT_PUBLIC_API_URL` exists but is `""` by default — the frontend is self-contained.

## Data pipeline

1. Source: `~/.claude/projects/*/.jsonl` files (Claude Code session logs)
2. Parser: `frontend/src/lib/db/parser.ts` / `backend/src/sync/parser.service.ts` — both parse JSONL and extract token counts, tool calls, languages, models
3. Sync: debounced at 60s. Called before every API response to keep data fresh.
4. Storage: `better-sqlite3` SQLite (frontend: `.next/claude-usage.db`, backend: `.data/claude-usage.db`)

## Gotchas

- **`better-sqlite3` is a native C++ addon.** Requires Python + C++ build tools (`node-gyp`) at install time. If `npm install` fails, install Windows Build Tools or Xcode CLI tools.
- **Next.js 16 has breaking changes** vs Next.js 13/14/15. Read `node_modules/next/dist/docs/` before writing Next.js–specific code. The `AGENTS.md` in `frontend/` reinforces this.
- **Static export (`output: "export"`)** means no SSR, no middleware, no `next/headers`/`next/cookies` in production. API routes work in dev only (they run on the dev server, not in the static output).
- **Tailwind CSS v4** uses `@import "tailwindcss"` in CSS and the `@tailwindcss/postcss` PostCSS plugin. It does NOT use the old `@tailwind base/components/utilities` directives.
- **shadcn/ui v4** with `"style": "base-nova"` in `components.json`. Components live in `src/components/ui/`.
- **Design system** is ClickHouse-inspired: near-black canvas (`#0a0a0a`), electric yellow primary (`#faff69`), Inter font, dark-only. See `frontend/DESIGN.md` and `src/styles/globals.css` for tokens.
- No authentication is enforced anywhere. The backend has a stub `ApiKeyGuard` that returns `true` unconditionally.
