#!/usr/bin/env bash
# FinOracles backup: PostgreSQL dump (custom format) + uploaded media archive.
#
#   bash deploy/scripts/backup.sh                 # nightly (cron): db + media, label "daily"
#   LABEL=predeploy SKIP_MEDIA=1 bash deploy/scripts/backup.sh   # used by deploy.sh
#
# Env overrides: BACKUP_DIR (default /var/backups/finoracles), KEEP_DAYS (14), KEEP_WEEKS (8),
# MAX_DISK_USED_PCT (85).
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$APP_DIR"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/finoracles}"
LABEL="${LABEL:-daily}"
SKIP_MEDIA="${SKIP_MEDIA:-0}"
KEEP_DAYS="${KEEP_DAYS:-14}"
KEEP_WEEKS="${KEEP_WEEKS:-8}"
MAX_DISK_USED_PCT="${MAX_DISK_USED_PCT:-85}"

env_value() { grep -E "^$1=" .env 2>/dev/null | tail -n 1 | cut -d= -f2- | sed -e "s/^['\"]//" -e "s/['\"]$//"; }
MEDIA_HOST_DIR="$(env_value MEDIA_HOST_DIR)"
MEDIA_HOST_DIR="${MEDIA_HOST_DIR:-/srv/finoracles/media}"

log() { echo "[$(date '+%F %T')] backup: $*"; }

[ -f .env ] || { log "ERROR: $APP_DIR/.env not found"; exit 1; }

umask 077
mkdir -p "$BACKUP_DIR"

used_pct="$(df -P "$BACKUP_DIR" | awk 'NR==2 {gsub("%", "", $5); print $5}')"
if [ "${used_pct:-0}" -ge "$MAX_DISK_USED_PCT" ]; then
  log "ERROR: disk ${used_pct}% used (limit ${MAX_DISK_USED_PCT}%). Backup skipped. Free space now."
  exit 1
fi

ts="$(date +%Y%m%d-%H%M%S)"
db_file="$BACKUP_DIR/db-$LABEL-$ts.dump"

log "dumping database -> $db_file"
docker compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$db_file.tmp"
# Verify the archive is readable before keeping it.
docker compose exec -T db pg_restore -l < "$db_file.tmp" > /dev/null
mv "$db_file.tmp" "$db_file"
log "database dump OK ($(du -h "$db_file" | cut -f1))"

if [ "$SKIP_MEDIA" != "1" ]; then
  if [ -d "$MEDIA_HOST_DIR" ]; then
    media_file="$BACKUP_DIR/media-$LABEL-$ts.tar.gz"
    tar -czf "$media_file.tmp" -C "$(dirname "$MEDIA_HOST_DIR")" "$(basename "$MEDIA_HOST_DIR")"
    mv "$media_file.tmp" "$media_file"
    log "media archive OK ($(du -h "$media_file" | cut -f1))"
  else
    log "WARNING: media dir $MEDIA_HOST_DIR not found; media not backed up"
  fi
fi

# Weekly copies (Sunday nightly run).
if [ "$LABEL" = "daily" ] && [ "$(date +%u)" = "7" ]; then
  cp -p "$db_file" "$BACKUP_DIR/db-weekly-$ts.dump"
  if [ -n "${media_file:-}" ]; then cp -p "$media_file" "$BACKUP_DIR/media-weekly-$ts.tar.gz"; fi
  log "weekly copy kept"
fi

# Retention.
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-daily-*' -o -name 'media-daily-*' \) -mtime +"$KEEP_DAYS" -delete
find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-weekly-*' -o -name 'media-weekly-*' \) -mtime +"$((KEEP_WEEKS * 7))" -delete
# Keep the 10 most recent pre-deploy dumps.
ls -1t "$BACKUP_DIR"/db-predeploy-*.dump 2>/dev/null | tail -n +11 | xargs -r rm -f || true
find "$BACKUP_DIR" -maxdepth 1 -type f -name '*.tmp' -mmin +120 -delete

log "done"
