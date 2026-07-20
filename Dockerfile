FROM node:22-slim AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# System deps for sharp (image AI) + native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Copy workspace files
COPY pnpm-workspace.yaml package.json .npmrc ./
COPY pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/

# Install ALL deps including optional (rollup linux binaries, sharp binaries)
# --no-frozen-lockfile because lockfile may drift between local and CI
RUN pnpm install --no-frozen-lockfile --prod=false

# Explicitly install rollup linux binary (Vite 6 needs it on linux)
RUN pnpm add -w @rollup/rollup-linux-x64-gnu --no-save 2>/dev/null || true

# Build API
RUN pnpm --filter @workspace/api-server build

# Build frontend
RUN pnpm --filter future-jaano build

# ─── Production runner ────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apt-get update && apt-get install -y --no-install-recommends libvips \
  && rm -rf /var/lib/apt/lists/*

COPY pnpm-workspace.yaml package.json .npmrc ./
COPY pnpm-lock.yaml ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/

RUN pnpm install --no-frozen-lockfile --prod

# Copy built files from builder stage
COPY --from=base /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=base /app/artifacts/future-jaano/dist ./artifacts/future-jaano/dist

EXPOSE 8080

CMD ["sh", "-c", "pnpm --filter @workspace/db run push-force || echo 'db push skipped'; node --enable-source-maps artifacts/api-server/dist/index.mjs"]
