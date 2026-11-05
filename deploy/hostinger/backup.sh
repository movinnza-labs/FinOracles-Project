#!/usr/bin/env bash
# Backs up the database and uploaded media. Read-only on the source; never deletes data
# except backups older than KEEP_DAYS in BACKUP_DIR.
#
#   DATABASE_URL=postgresql://... MEDIA_DIR=/var/www/finoracles/shared/media ./backup.sh
#
# Works against any PostgreSQL (local, Hostinger VPS, or any other host). Restore with:
#   pg_restore --no-owner --no-privileges -d "$TARGET_URL" db-YYYYmmdd-HHMMSS.dump
set -euo pipefail

: "${DATABASE_URL:?Set DATABASE_URL to the database to back up}"
BACKUP_DIR="${BACKUP_DIR:-/var/www/finoracles/backups}"
MEDIA_DIR="${MEDIA_DIR:-/var/www/finoracles/shared/media}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"

echo "→ Database dump"
pg_dump --format=custom --no-owner --no-privileges --file="$BACKUP_DIR/db-$STAMP.dump" "$DATABASE_URL"

if [ -d "$MEDIA_DIR" ]; then
  echo "→ Media archive ($MEDIA_DIR)"
  # Relative archive name: GNU tar on Windows (Git Bash) reads "C:/..." as a remote host.
  media_parent="$(cd "$MEDIA_DIR/.." && pwd)"
  (cd "$BACKUP_DIR" && tar -czf "media-$STAMP.tar.gz" -C "$media_parent" "$(basename "$MEDIA_DIR")")
else
  echo "! Media directory $MEDIA_DIR not found; skipped (S3 storage needs its own backup)"
fi

find "$BACKUP_DIR" -maxdepth 1 -type f \( -name 'db-*.dump' -o -name 'media-*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete

echo "✓ Backup written to $BACKUP_DIR (stamp $STAMP)"
ls -lh "$BACKUP_DIR" | grep "$STAMP"
