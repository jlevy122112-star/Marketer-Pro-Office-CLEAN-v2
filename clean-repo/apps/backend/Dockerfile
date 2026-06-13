# ─────────────────────────────────────────────────────────────────────────────
# BACKEND DOCKERFILE
# Multi-stage: builder compiles TypeScript, runner is minimal Node.js image.
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
RUN npm install -g pnpm
WORKDIR /app

# ── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ── Builder ───────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm db:generate
RUN pnpm build

# ── Runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 marketer
USER marketer

COPY --from=builder --chown=marketer:nodejs /app/dist      ./dist
COPY --from=builder --chown=marketer:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=marketer:nodejs /app/prisma    ./prisma
COPY --from=builder --chown=marketer:nodejs /app/package.json ./package.json

EXPOSE 3001

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "dist/server.js"]
