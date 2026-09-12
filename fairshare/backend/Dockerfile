# ─────────────────────────────────────────────
# Stage 1 — Install dependencies
# ─────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

# Copy only lockfiles first for layer caching
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# ─────────────────────────────────────────────
# Stage 2 — Production image
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -S fairshare && adduser -S fairshare -G fairshare

WORKDIR /app

# Copy production node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY src ./src
COPY package.json ./

USER fairshare

EXPOSE 5000

# Health check — verifies the /api/health endpoint responds
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
