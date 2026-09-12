# ─────────────────────────────────────────────
# Stage 1 — Build the Vite app
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — Serve with nginx
# ─────────────────────────────────────────────
FROM nginx:alpine AS runner

# Copy compiled assets
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA routing — redirect all 404s back to index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
