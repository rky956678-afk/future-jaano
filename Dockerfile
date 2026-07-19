FROM node:22-slim AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# ─── Install system libs (sharp needs libvips) ────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips-dev python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# ─── Install ALL deps (including devDeps needed to build) ─────────────────────
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/

RUN pnpm install --no-frozen-lockfile --prod=false

# ─── Build API server ─────────────────────────────────────────────────────────
RUN pnpm --filter @workspace/api-server build

# ─── Build React frontend ─────────────────────────────────────────────────────
RUN pnpm --filter future-jaano build

# ─── Production image ─────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apt-get update && apt-get install -y --no-install-recommends libvips && rm -rf /var/lib/apt/lists/*

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY lib/ ./lib/
COPY artifacts/ ./artifacts/
COPY scripts/ ./scripts/

# Install only production deps for runtime
RUN pnpm install --no-frozen-lockfile --prod

# Copy built artifacts from builder
COPY --from=base /app/artifacts/api-server/dist ./artifacts/api-server/dist
COPY --from=base /app/artifacts/future-jaano/dist ./artifacts/future-jaano/dist

EXPOSE 8080

CMD ["sh", "-c", "pnpm --filter @workspace/db run push-force || echo 'db push skipped'; node --enable-source-maps artifacts/api-server/dist/index.mjs"]
