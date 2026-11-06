#!/usr/bin/env bash
# FinOracles deploy on the VPS: backup -> pull -> build -> restart -> wait for /healthz.
#
#   bash deploy/scripts/deploy.sh             # normal deploy (git pull + rebuild)
#   NO_PULL=1 bash deploy/scripts/deploy.sh   # rebuild current checkout (e.g. after editing .env)
#   bash deploy/scripts/deploy.sh --rollback  # restart the previous image (no rebuild)
#
# Payload applies pending migrations when the new container first connects (the healthcheck).
# Migrations are forward-only: a rollback of the image does NOT undo them; restore the
# pre-deploy dump (deploy/scripts/restore.sh) if a migration must be reverted.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$APP_DIR"

log() { echo "[$(date '+%F %T')] deploy: $*"; }

[ -f .env ] || { log "ERROR: $APP_DIR/.env not found (copy .env.production.example)"; exit 1; }

wait_healthy() {
  local id status i
  id="$(docker compose ps -q app)"
  for i in $(seq 1 60); do
    status="$(docker inspect --format '{{.State.Health.Status}}' "$id" 2>/dev/null || echo unknown)"
    if [ "$status" = "healthy" ]; then log "app is healthy"; return 0; fi
    if [ "$status" = "unhealthy" ]; then break; fi
    sleep 5
  done
  log "ERROR: app did not become healthy (status: $status). Recent logs:"
  docker compose logs --tail 80 app || true
  return 1
}

if [ "${1:-}" = "--rollback" ]; then
  docker image inspect finoracles-web:previous > /dev/null 2>&1 || { log "ERROR: no finoracles-web:previous image"; exit 1; }
  log "rolling back to finoracles-web:previous"
  docker image tag finoracles-web:latest finoracles-web:failed 2>/dev/null || true
  docker image tag finoracles-web:previous finoracles-web:latest
  docker compose up -d --no-build app
  wait_healthy
  exit $?
fi

# 1. Pre-deploy database backup (only if the db is already running).
if [ -n "$(docker compose ps -q --status running db 2>/dev/null)" ]; then
  log "pre-deploy database backup"
  LABEL=predeploy SKIP_MEDIA=1 bash deploy/scripts/backup.sh
fi

# 2. Update code.
if [ "${NO_PULL:-0}" != "1" ] && [ -d .git ]; then
  log "git pull"
  git pull --ff-only
fi
rev="$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)"

# 3. Keep the current image for rollback, then build.
if docker image inspect finoracles-web:latest > /dev/null 2>&1; then
  docker image tag finoracles-web:latest finoracles-web:previous
fi
log "building image ($rev)"
docker compose build app
docker image tag finoracles-web:latest "finoracles-web:$rev"

# 4. Start / replace containers.
log "starting containers"
docker compose up -d

# 5. Wait for the healthcheck (runs migrations on first connect).
if ! wait_healthy; then
  log "deploy FAILED. Roll back with: bash deploy/scripts/deploy.sh --rollback"
  exit 1
fi

docker image prune -f > /dev/null
log "deploy of $rev complete"
