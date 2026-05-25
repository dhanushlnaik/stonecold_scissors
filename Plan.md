# Stone Cold Scissors — Development Plan

## Status: MVP READY ✅

Stone Cold Scissors is a multiplayer retro arcade-inspired Rock Paper Scissors esports platform. The following phases have been successfully implemented.

---

### Phase 1: Foundation ✅
- **Monorepo Architecture:** Set up with `pnpm` workspaces.
- **Tech Stack:** Next.js (App Router), Socket.io, PostgreSQL, Prisma, Redis, NextAuth.js.
- **Database Schema:** User, Tournament, Match, MatchRound, and Session models defined.
- **Authentication:** Integrated NextAuth.js with Discord and Google providers.
- **Environment:** Unified `.env` management with monorepo symlinks.

### Phase 2: Core Gameplay ✅
- **Realtime Arena:** Socket.io room management for matches.
- **Move Locking:** Secure move submission to Redis to prevent peeking.
- **Simultaneous Reveal:** Synchronized reveal and winner determination via `@stonecold/game-engine`.
- **Match HUD:** Live participant count and battle status.
- **Countdown:** Server-side synchronized "3-2-1" countdown.

### Phase 3: Tournament System ✅
- **Tournament Service:** Create, Join, and Commence logic in `@stonecold/db`.
- **Bracket Engine:** Automatic single-elimination bracket generation.
- **Bracket View:** Visual round-by-round tournament pathing.
- **Auto-Progression:** Winners are automatically promoted to the next round upon match conclusion.

### Phase 4: Social & Competitive ✅
- **Global Leaderboard:** Live rankings based on ELO.
- **ELO System:** Mathematical skill calculation (K=32) per match.
- **Social Ticker:** Global marquee on home page broadcasting recent battle results.
- **Win/Loss Tracking:** Persistent stats for every combatant.

### Phase 5: Real-Time Synchronization ✅
- **Live Refreshes:** Socket-driven UI updates for brackets and rankings (no refresh needed).
- **Match Routing:** Direct links from tournament brackets into private Arena rooms.
- **Global Sync:** `RealtimeSync` component for effortless socket integration.

### Phase 6: Visual & Audio Polish (Operational) 🏗️
- **Audio System:** `useSoundFX` hook for arcade beeps, clicks, and victory jingles.
- **Pixel Art:** Aesthetic defined; placeholder icons ready for final sprite sheet swap.
- **UI Consistency:** "Fake-serious" esports broadcast theme applied across all pages.

---

## Future Roadmap 🚀
1. **Final Sprite Assets:** Replace SVG icons with generated horizontal sprite sheets.
2. **Spectator Mode:** Allow users to watch high-rank matches without participating.
3. **League System:** Multi-week divisions and seasons.
4. **Cosmetics:** Unlockable frames and badges based on ELO tiers.
