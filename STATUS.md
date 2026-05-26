# Stone Cold Scissors — Current Functional Status

This document tracks what is **actually built and working** vs. what is planned or currently using placeholders.

## 🏁 1. End-to-End Tournament Lifecycle
**Status:** ✅ FULLY FUNCTIONAL (LOCAL)

- **Create:** Host can create a tournament via the Dashboard. (Works in DB)
- **Register:** Users can "Initialize ES-ID" (Auth) and join the roster. (Works in DB)
- **Commence:** Host can trigger bracket generation. (Single-elimination logic verified)
- **Battle:** Players can join specific matches from the bracket view.
- **Progression:** Winners are automatically advanced to the next round upon match conclusion. (Logic verified in Realtime Server)
- **Persistence:** All results, rounds, and winners are saved to PostgreSQL.

## ⚔️ 2. The Realtime Arena
**Status:** ✅ FUNCTIONAL (LOCAL)

- **Synchronization:** Two players in the same room see a shared "3-2-1" countdown.
- **Move Locking:** Player 1 cannot see Player 2's move until both are locked. (Verified via Redis state)
- **Result Reveal:** Simultaneous reveal with animated win/loss/draw messages.
- **Security:** Tournament matches verify assigned players (unauthorized users cannot throw moves).

## 🌍 3. Infrastructure & Deployment
**Status:** ⚠️ LOCAL DEVELOPMENT ONLY

- **Web:** Runs on `localhost:3000`.
- **Realtime:** Runs on `localhost:4000`.
- **Database:** Connected to live **Aiven PostgreSQL** instance.
- **Cache:** Connected to live **Upstash Redis** instance.
- **Auth:** Working locally (Requires `AUTH_SECRET` and social provider IDs in `.env`).
- **Deployment:** **NOT DEPLOYED**. Current state requires local `pnpm dev` environment.

## 🎨 4. Visuals & Audio
**Status:** 🏗️ OPERATIONAL (PLACEHOLDERS)

- **UI Framework:** Tailwind + Framer Motion is fully integrated.
- **CRT Aesthetics:** Scanlines and pixel-borders are live.
- **Fonts:** "Press Start 2P" integrated.
- **Hands Assets:** ⚠️ **PLACEHOLDERS**. Currently using `lucide-react` SVG icons (Circle/Square/Scissors). Real pixel-art sprite sheets are pending quota reset.
- **Audio:** ⚠️ **LOGIC ONLY**. The `useSoundFX` hook is integrated and triggering, but the actual `.mp3` files do not yet exist in the `/public/sounds` directory.

## 🤖 5. Practice Mode
**Status:** ✅ FULLY FUNCTIONAL (LOCAL)

- **Bot Logic:** `/arena/bot` allows solo play vs. ES-AI v1.0.
- **Logic:** Instant feedback, non-ranked (no ELO impact).

---

## 🛠️ Summary: What's Missing?
1. **Actual Audio Files:** We need to source or generate the `.mp3` assets for the sound hook to work.
2. **Real Pixel Art:** We need to replace SVGs with horizontal sprite-sheets once Nano Banana is available.
3. **Deployment:** The monorepo needs to be pushed to Vercel (Web) and Railway/Render/DigitalOcean (Realtime server).
4. **ELO Feedback:** While ELO updates in the DB, we need a "You gained +25 ELO" pop-up in the post-match Arena UI.
