#!/usr/bin/env bash
# FinOracles restore: load a pg_dump (custom format) and optionally a media archive.
#
#   bash deploy/scripts/restore.sh <db.dump> [media.tar.gz]
#       Disaster recovery: puts a backup in place of the LIVE database (and media). Stops the app.
#       The current database is RENAMED aside (<db>_before_restore_<ts>), never dropped.
#   RESTORE_DB=restore_test bash deploy/scripts/restore.sh <db.dump>
#       Restores into a separate scratch database (restore test); the live site is untouched.
#
# Set ASSUME_YES=1 to skip the confirmation prompt.
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$APP_DIR"

log() { echo "[$(date '+%F %T')] restore: $*"; }
env_value() { grep -E "^$1=" .env 2>/dev/null | tail -n 1 | cut -d= -f2- | sed -e "s/^['\"]//" -e "s/['\"]$//"; }

DUMP="${1:-}"
MEDIA_ARCHIVE="${2:-}"
[ -n "$DUMP" ] && [ -f "$DUMP" ] || { echo "Usage: $0 <db.dump> [media.tar.gz]"; exit 1; }
[ -z "$MEDIA_ARCHIVE" ] || [ -f "$MEDIA_ARCHIVE" ] || { log "ERROR: $MEDIA_ARCHIVE not found"; exit 1; }
[ -f .env ] || { log "ERROR: .env not found"; exit 1; }

LIVE_DB="$(env_value POSTGRES_DB)"
TARGET_DB="${RESTORE_DB:-$LIVE_DB}"
MEDIA_HOST_DIR="$(env_value MEDIA_HOST_DIR)"
MEDIA_HOST_DIR="${MEDIA_HOST_DIR:-/srv/finoracles/media}"
IS_LIVE=0; [ "$TARGET_DB" = "$LIVE_DB" ] && IS_LIVE=1

if [ "${ASSUME_YES:-0}" != "1" ]; then
  if [ "$IS_LIVE" = "1" ]; then
    echo "This REPLACES the live database '$TARGET_DB'${MEDIA_ARCHIVE:+ and the media in $MEDIA_HOST_DIR}."
  else
    echo "This restores into scratch database '$TARGET_DB' (live site untouched)."
  fi
  read -r -p "Type RESTORE to continue: " answer
  [ "$answer" = "RESTORE" ] || { echo "Aborted."; exit 1; }
fi

docker compose up -d db
for i in $(seq 1 30); do
  docker compose exec -T db sh -c 'pg_isready -U "$POSTGRES_USER" -q' && break
  sleep 2
done

if [ "$IS_LIVE" = "1" ]; then
  log "stopping app"
  docker compose stop app || true
fi

# Nothing is dropped: an existing database is renamed aside and kept.
SET_ASIDE="${TARGET_DB}_before_restore_$(date +%Y%m%d_%H%M%S)"
exists="$(docker compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d postgres -At' <<< "SELECT count(*) FROM pg_database WHERE datname = '$TARGET_DB';")"
if [ "$exists" = "1" ]; then
  log "renaming existing database '$TARGET_DB' -> '$SET_ASIDE' (kept)"
  docker compose exec -T db sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -q' <<SQL
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$TARGET_DB' AND pid <> pg_backend_pid();
ALTER DATABASE "$TARGET_DB" RENAME TO "$SET_ASIDE";
SQL
else
  SET_ASIDE=""
fi
docker compose exec -T -e TARGET_DB="$TARGET_DB" db sh -c 'createdb -U "$POSTGRES_USER" "$TARGET_DB"'

log "loading $DUMP (single transaction, stops on first error)"
if ! docker compose exec -T -e TARGET_DB="$TARGET_DB" db sh -c \
  'pg_restore -U "$POSTGRES_USER" -d "$TARGET_DB" --no-owner --no-acl --single-transaction --exit-on-error' < "$DUMP"; then
  log "ERROR: pg_restore failed and was rolled back; '$TARGET_DB' is empty."
  if [ -n "$SET_ASIDE" ]; then
    log "Previous data is intact in '$SET_ASIDE'. To put it back:"
    log "  docker compose exec db psql -U <POSTGRES_USER> -d postgres -c 'DROP DATABASE \"$TARGET_DB\"' -c 'ALTER DATABASE \"$SET_ASIDE\" RENAME TO \"$TARGET_DB\"'"
  fi
  exit 1
fi
[ -z "$SET_ASIDE" ] || log "previous database kept as '$SET_ASIDE' (drop it manually once you are satisfied)"

log "row counts in '$TARGET_DB':"
docker compose exec -T -e TARGET_DB="$TARGET_DB" db sh -c 'psql -U "$POSTGRES_USER" -d "$TARGET_DB" -At -F " | "' <<'SQL' || log "WARNING: could not count rows"
SELECT 'users', count(*) FROM users UNION ALL
SELECT 'pages', count(*) FROM pages UNION ALL
SELECT 'posts', count(*) FROM posts UNION ALL
SELECT 'services', count(*) FROM services UNION ALL
SELECT 'products', count(*) FROM products UNION ALL
SELECT 'team_members', count(*) FROM team_members UNION ALL
SELECT 'media', count(*) FROM media UNION ALL
SELECT 'enquiries', count(*) FROM enquiries UNION ALL
SELECT 'payload_migrations', count(*) FROM payload_migrations;
SQL

if [ -n "$MEDIA_ARCHIVE" ] && [ "$IS_LIVE" = "1" ]; then
  if [ -d "$MEDIA_HOST_DIR" ]; then
    bak="$MEDIA_HOST_DIR.before-restore-$(date +%Y%m%d-%H%M%S)"
    log "moving current media to $bak"
    mv "$MEDIA_HOST_DIR" "$bak"
  fi
  mkdir -p "$(dirname "$MEDIA_HOST_DIR")"
  tar -xzf "$MEDIA_ARCHIVE" -C "$(dirname "$MEDIA_HOST_DIR")"
  # The archive's top folder is the media folder's basename (see backup.sh).
  chown -R 1001:1001 "$MEDIA_HOST_DIR"
  log "media restored to $MEDIA_HOST_DIR"
fi

if [ "$IS_LIVE" = "1" ]; then
  log "starting app"
  docker compose up -d app
  log "check health with: docker compose ps   (app should become 'healthy')"
fi
log "done"
