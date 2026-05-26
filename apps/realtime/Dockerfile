# Build context must be the repo root:
#   docker build -f apps/realtime/Dockerfile .

FROM node:20-alpine
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# ── Monorepo manifests ────────────────────────────────────────────────────────
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# ── Only the packages the realtime server needs ───────────────────────────────
COPY packages/db/          packages/db/
COPY packages/game-engine/ packages/game-engine/
COPY packages/types/       packages/types/
COPY apps/realtime/        apps/realtime/

# ── Install (devDeps included — ts-node is a devDep) ─────────────────────────
RUN pnpm install --frozen-lockfile

# ── Prisma client (postinstall is blocked in pnpm-workspace.yaml) ─────────────
RUN pnpm exec prisma generate --schema=packages/db/prisma/schema.prisma

ENV NODE_ENV=production
EXPOSE 4000

# ts-node executes TypeScript natively, so @stonecold/db and other workspace
# packages (which have main: "src/index.ts") work without a compile step.
CMD ["node_modules/.bin/ts-node", \
     "--project", "apps/realtime/tsconfig.json", \
     "--transpile-only", \
     "apps/realtime/src/index.ts"]
