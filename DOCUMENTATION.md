# Stone Cold Scissors — Technical Documentation

## 1. Project Vision
> *"A childhood game treated with absurd world championship seriousness."*

Stone Cold Scissors is a high-performance, real-time multiplayer esports platform for Rock Paper Scissors. It combines retro arcade aesthetics with modern competitive infrastructure, including automated brackets, persistent ELO ratings, and frame-perfect synchronization.

---

## 2. Technical Stack
| Layer | Technology |
| :--- | :--- |
| **Monorepo** | `pnpm` Workspaces |
| **Frontend** | Next.js 15+ (App Router, Turbopack) |
| **Realtime** | Socket.io + Node.js (dedicated server) |
| **Styling** | Tailwind CSS + Framer Motion (animations) |
| **Database** | PostgreSQL (Aiven) |
| **ORM** | Prisma |
| **Cache/State** | Redis (Upstash) |
| **Auth** | NextAuth.js v5 (Beta) |
| **Audio** | Custom `useSoundFX` Arcade System |

---

## 3. Architecture Overview
The project follows a modular monorepo structure to ensure high reusability and type safety.

### Directory Structure
- `apps/web`: The Next.js frontend, handling UI, authentication, and SSR.
- `apps/realtime`: The Socket.io server, acting as the game's "Referee" and ELO engine.
- `packages/db`: Unified database client and `TournamentService` for business logic.
- `packages/game-engine`: Pure logic for winner determination and bracket generation.
- `packages/types`: Shared TypeScript interfaces across all apps/packages.

---

## 4. Core Systems & Mechanics

### 4.1. The Realtime Arena (Multiplayer)
- **Room Logic:** Players join specific `match:[id]` socket rooms.
- **Move Locking:** When a player submits a move (Rock/Paper/Scissors), it is stored in **Redis** with a 1-hour expiry.
- **Simultaneous Reveal:** Moves are hidden from opponents until *both* players have submitted. The server then calculates the winner and broadcasts a `reveal_results` event.
- **Security:** Formal tournament matches verify `player1Id` and `player2Id` in the database before accepting moves.

### 4.2. Tournament Engine
- **Lifecycle:** `REGISTRATION` → `IN_PROGRESS` → `COMPLETED`.
- **Bracket Generation:** Uses `generateSingleEliminationBracket` to create a power-of-2 tree with "BYE" slots for uneven participants.
- **Auto-Progression:** Upon match conclusion, the winner is automatically promoted to the next round slot in the database.
- **Live Updates:** Pages use the `RealtimeSync` component to listen for `tournament_refresh` events, updating the bracket UI instantly via `router.refresh()`.

### 4.3. ELO Rating System
- **Formula:** Standard competitive ELO with a K-factor of 32.
- **Implementation:** Calculated server-side in `apps/realtime` post-match.
- **Persistence:** ELO updates, win/loss increments, and match finalization occur in a single atomic **Prisma Transaction**.

---

## 5. Data Schema (Prisma)
Key entities in the PostgreSQL database:
- **User:** Stores `username`, `elo`, `wins`, `losses`, and linked Auth accounts.
- **Tournament:** Tracks `status`, `hostId`, and linked `participants`.
- **Match:** Defines a bracket slot with `player1Id`, `player2Id`, and `winnerId`.
- **MatchRound:** Persistent log of every move made in a sanctioned match.

---

## 6. UI Reference Guide
The visual language is **"Retro Arcade Esport."**

### Key Components:
- **CRT Effects:** A `scanlines` CSS overlay applied globally.
- **Typography:** `Press Start 2P` for headings; `Inter` for readability.
- **HUDs:** High-contrast, pixel-bordered headers tracking participant counts.
- **Social Ticker:** A marquee on the homepage broadcasting global match results in real-time.
- **Bracket View:** A horizontal-scrolling tree showing the path to the championship.

### Main Routes:
- `/`: The Hub (Landing + Social Ticker + Auth).
- `/tournaments`: Live Events Dashboard.
- `/tournaments/[id]`: Championship Detail & Live Bracket.
- `/arena`: multiplayer combat (context-aware via `matchId` query param).
- `/arena/bot`: Solo training simulator vs. ES-AI v1.0.
- `/rankings`: Global ELO Leaderboard.

---

## 7. Operational Workflow

### Local Development:
1. `pnpm install` — Sync all monorepo dependencies.
2. `pnpm dev` — Starts both Web (3000) and Realtime (4000) servers concurrently.
3. `pnpm prisma db push` — Syncs local schema with PostgreSQL.

### Environment Management:
The root `.env` is symlinked to `apps/web/.env.local` to ensure NextAuth and Prisma share a single source of truth for credentials.
