#!/usr/bin/env bash
# FinOracles health watchdog, run every minute by cron (deploy/cron/finoracles-healthcheck).
#
# Docker restarts the app when it crashes, but not when it is running yet unhealthy (/healthz failing,
# e.g. hung or lost its database connection). This restarts it after THRESHOLD consecutive minutes
# of Docker reporting "unhealthy" (Docker itself needs ~90 s of failed checks to report that).
# A stopped app (deploy, restore, manual `docker compose stop`) or one still starting is left alone.
set -uo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$APP_DIR" || exit 1

THRESHOLD="${THRESHOLD:-2}"
STATE_FILE="/run/finoracles-health.failures"

# One run at a time.
exec 9> /run/finoracles-health.lock
flock -n 9 || exit 0

id="$(docker compose ps -q app 2>/dev/null)"
[ -n "$id" ] || exit 0

status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$id" 2>/dev/null || echo unknown)"

case "$status" in
  healthy|starting|none|unknown)
    rm -f "$STATE_FILE"
    exit 0
    ;;
  unhealthy)
    failures=$(( $(cat "$STATE_FILE" 2>/dev/null || echo 0) + 1 ))
    echo "$failures" > "$STATE_FILE"
    echo "app unhealthy ($failures/$THRESHOLD)"
    if [ "$failures" -ge "$THRESHOLD" ]; then
      echo "restarting app container; last health output:"
      docker inspect --format '{{range .State.Health.Log}}{{.ExitCode}} {{.Output}}{{end}}' "$id" | tail -n 3
      docker compose restart app
      rm -f "$STATE_FILE"
    fi
    ;;
esac
