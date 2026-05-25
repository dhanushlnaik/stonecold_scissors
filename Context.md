# Stone Cold Scissors — Project Context

## Overview
Stone Cold Scissors is "A childhood game treated with absurd world championship seriousness." It is a high-performance, realtime competitive platform built for the web.

## Tech Stack
- **Monorepo:** `pnpm`
- **Frontend:** Next.js 15+ (App Router, Turbopack)
- **Realtime Server:** Node.js + Socket.io
- **Styling:** Tailwind CSS + Framer Motion
- **Database:** PostgreSQL (Aiven)
- **ORM:** Prisma
- **Cache/Realtime State:** Redis (Upstash)
- **Auth:** NextAuth.js (v5 Beta)
- **Asset Pipeline:** Nano Banana (Pixel Art Generation)

## Architecture
```bash
stone-cold-scissors/
├── apps/
│   ├── web/           # Next.js Frontend
│   └── realtime/      # Socket.io Server
├── packages/
│   ├── ui/            # Shared UI Components
│   ├── db/            # Prisma Client & Tournament Services
│   ├── game-engine/   # Winner logic & Bracket generation
│   ├── types/         # Unified TypeScript interfaces
│   └── utils/         # Helper functions
└── prisma/            # Database schema
```

## Core Systems
1. **Matchmaking:** Handled via Socket rooms and Redis move-locking.
2. **Tournaments:** Managed by `TournamentService`, featuring auto-progression.
3. **ELO:** Standard competitive rating system updated via database transactions.
4. **Sync:** Bi-directional realtime updates using `RealtimeSync`.
