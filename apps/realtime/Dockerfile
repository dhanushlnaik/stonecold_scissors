# Build context must be the repo root:
#   docker build -f apps/realtime/Dockerfile .

FROM node:20-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate && \
    npm install -g esbuild

# ── Monorepo manifests ────────────────────────────────────────────────────────
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# ── Only the packages the realtime server needs ───────────────────────────────
COPY packages/db/          packages/db/
COPY packages/game-engine/ packages/game-engine/
COPY packages/types/       packages/types/
COPY apps/realtime/        apps/realtime/

RUN pnpm install --frozen-lockfile

# Generate Prisma client for Alpine Linux
RUN pnpm exec prisma generate --schema=packages/db/prisma/schema.prisma

# Bundle: esbuild follows workspace symlinks and inlines @stonecold/* TypeScript.
# npm packages (@prisma/client, ioredis, socket.io, etc.) stay as external requires.
RUN esbuild apps/realtime/src/index.ts \
    --bundle \
    --platform=node \
    --target=node20 \
    --outfile=apps/realtime/dist/index.js \
    --external:@prisma/client \
    --external:ioredis \
    --external:express \
    --external:socket.io \
    --external:cors \
    --external:dotenv

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "apps/realtime/dist/index.js"]
