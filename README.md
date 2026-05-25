# Stone Cold Scissors — Unified Monorepo

World Championship Rock Paper Scissors. Serious Competition. Retro Glory.

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Database Setup:**
   ```bash
   # Sync schema with your PostgreSQL instance
   pnpm prisma db push
   ```

3. **Start Development:**
   ```bash
   pnpm dev
   ```
   - **Web Portal:** [http://localhost:3000](http://localhost:3000)
   - **Realtime Server:** [http://localhost:4000](http://localhost:4000)

## 🏗️ Project Structure

- `apps/web`: Next.js frontend with NextAuth.js.
- `apps/realtime`: Socket.io server with Redis integration.
- `packages/db`: Prisma client and Tournament business logic.
- `packages/game-engine`: Core RPS logic and bracket generation.
- `packages/types`: Shared TypeScript definitions.

## 🏆 Features
- **Realtime Arena:** Synchronized combat with move-locking.
- **Tournament System:** Automated brackets and player progression.
- **World Rankings:** ELO-based global leaderboard.
- **Arcade Polish:** CRT scanlines, arcade SFX, and global match ticker.

## 🛠️ Tech Stack
- **Next.js 15+**, **Socket.io**, **PostgreSQL**, **Prisma**, **Redis**, **Framer Motion**.
