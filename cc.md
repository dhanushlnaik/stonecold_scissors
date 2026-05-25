# Stone Cold Scissors — Development Summary

This project is a high-stakes, competitive Rock Paper Scissors platform.

## Summary of Completed Work

### 🏗️ Infrastructure & Auth
- **Pnpm Monorepo:** Clean separation of concerns.
- **NextAuth v5:** Discord and Google social login integrated with PostgreSQL.
- **Prisma Integration:** Robust database layer with automated migrations.
- **Redis Sync:** Upstash Redis used for secure move-locking in matches.

### ⚔️ Real-Time Gameplay
- **Socket.io Arena:** Frame-perfect synchronization between players.
- **Synchronized Countdown:** Server-controlled match starts.
- **Move Reveal:** Simultaneous hand reveal with "LOCKED" states for tension.

### 🏆 Tournament & Competitive
- **Bracket View:** Live, interactive single-elimination tournament visualization.
- **Auto-Progression:** Intelligent winner promotion through tournament rounds.
- **ELO Rankings:** Persistent global leaderboard with real-time rating updates.
- **Social Ticker:** Homepage marquee broadcasting global combat results.

### 🎨 Visual & UI
- **CRT Aesthetics:** Scanline effects and pixel-perfect layouts.
- **Thematic UI:** "Fake-serious" esports presentation using Press Start 2P font.
- **Audio Feedback:** Arcade sound effects integrated for all key match events.

## 🚀 Deployment & Testing
- Run `pnpm dev` to start both the Web Portal and Realtime Server.
- Use `lsof -i :3000` or `lsof -i :4000` to troubleshoot port conflicts.
- Environment variables are shared via symlinks to the root `.env`.
