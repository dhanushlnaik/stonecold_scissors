# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stone Cold Scissors is a multiplayer Rock Paper Scissors tournament platform with an overdramatic esports presentation. It is a pnpm monorepo with two apps and several shared packages.

## Commands

Run from the repo root unless otherwise noted.

```bash
pnpm dev                              # starts web + realtime concurrently
pnpm --filter @stonecold/web dev      # web only (Next.js)
pnpm --filter @stonecold/realtime dev # realtime only (Socket.io / nodemon)
pnpm build                            # build all packages and apps
pnpm --filter @stonecold/web lint     # ESLint on the web app
```

Prisma (run from `packages/db/`):
```bash
pnpm exec prisma migrate dev          # apply migrations
pnpm exec prisma generate             # regenerate client after schema changes
pnpm exec prisma studio               # open GUI browser
```

## Architecture

```
apps/
  web/        – Next.js 16 / React 19 frontend + API routes (port 3000)
  realtime/   – Express + Socket.io game server (separate process)
  workers/    – background jobs (placeholder)

packages/
  db/          – PrismaClient singleton + helpers (@stonecold/db)
  game-engine/ – pure RPS/bracket logic (@stonecold/game-engine)
  types/       – shared TypeScript types (@stonecold/types)
  ui/          – shared UI components (@stonecold/ui)
  utils/       – shared utilities (@stonecold/utils)
  config/      – shared config (@stonecold/config)
```

### Data flow

```
Browser → Next.js (auth, tournaments, profiles, history)
        ↕ Socket.io client
Realtime server → Redis (live match state, countdowns, moves)
               → PostgreSQL via Prisma (persistent records after match ends)
```

**Realtime-only events**: countdowns, move submission, opponent-moved signals, result reveals.  
**REST/server-action path**: auth, tournament CRUD, standings, match history.

### Key files

| File | Purpose |
|------|---------|
| `apps/web/src/auth.ts` | NextAuth v5 config (Discord + Google, PrismaAdapter) |
| `apps/web/src/hooks/use-game-store.ts` | Zustand store — Socket.io client + all match UI state |
| `apps/realtime/src/index.ts` | Socket.io event handlers; reads/writes Redis for match state |
| `packages/db/src/index.ts` | PrismaClient singleton (dev-safe global) |
| `packages/db/prisma/schema.prisma` | Database schema (User, Tournament, Match, MatchRound…) |
| `packages/game-engine/index.ts` | `determineWinner()`, `generateBracket()` — no side effects |
| `packages/types/index.ts` | Canonical types: `Move`, `MatchResult`, `TournamentStatus`, etc. |

### Environment variables

Copy `.env.example` to `.env` at the repo root. The realtime server reads from the root `.env`. The web app reads `apps/web/.env.local`. Required vars:

```
DATABASE_URL        # PostgreSQL connection string
REDIS_URL           # Redis (default: redis://localhost:6379)
NEXTAUTH_SECRET / AUTH_SECRET
DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
FRONTEND_URL        # used by realtime server for CORS (default: http://localhost:3000)
```

## Important Notes

- **Next.js 16 has breaking changes** from earlier versions. Before writing any Next.js code, check `node_modules/next/dist/docs/` for current API conventions (per `apps/web/AGENTS.md`).
- The `pnpm-workspace.yaml` blocks postinstall scripts for Prisma/esbuild/sharp — run `prisma generate` manually after schema changes.
- All game logic (winner determination, bracket generation) belongs in `packages/game-engine`, not in the app layers.
- Realtime match state lives in Redis/memory; only finalized match results are persisted to PostgreSQL.
- The `@stonecold/db` package uses explicit named exports (no `export *`) to avoid Turbopack CJS interop issues.
