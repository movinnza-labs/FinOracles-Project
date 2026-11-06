# FinOracles website: Next.js standalone server + Payload CMS.
# Debian slim, not Alpine: sharp on Alpine (musl) holds on to freed memory, so the container keeps growing.

FROM node:24-slim AS base
WORKDIR /app

# ---- Dependencies --------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ---- Build ---------------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are compiled into the build, and next.config.ts reads both of these to
# allow image origins. docker-compose.yml passes them as build args from the server's .env.
ARG NEXT_PUBLIC_SERVER_URL
ARG S3_PUBLIC_URL
ENV NEXT_TELEMETRY_DISABLED=1

# The build never connects to the database (every page renders per request). payload.config.ts
# refuses to load in production without a secret, so give the build a placeholder; the real
# PAYLOAD_SECRET is read at runtime and is not stored in the image.
RUN PAYLOAD_SECRET=build-placeholder npm run build

# ---- Runtime -------------------------------------------------------------
FROM base AS runner
# MALLOC_ARENA_MAX=2: fewer glibc malloc arenas, which limits native memory growth from sharp.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    MALLOC_ARENA_MAX=2 \
    HOSTNAME=0.0.0.0 \
    PORT=3000

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# public/ is served by Next and read by the first-boot seed (public/images/finoracles).
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Default upload folder (MEDIA_DIR=media). On the VPS docker-compose.yml bind-mounts the host's
# /srv/finoracles/media here so uploads persist across rebuilds.
RUN mkdir -p media && chown nextjs:nodejs media

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
