# ─────────────────────────────────────────────
# Root Dockerfile for Render Backend Deployment
# ─────────────────────────────────────────────

# Stage 1 — Install dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package definitions from fairshare/backend
COPY fairshare/backend/package.json fairshare/backend/package-lock.json* ./
RUN npm ci --omit=dev

# Stage 2 — Production image
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -S fairshare && adduser -S fairshare -G fairshare

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy backend source
COPY fairshare/backend/src ./src
COPY fairshare/backend/package.json ./

USER fairshare

EXPOSE 5000

ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
