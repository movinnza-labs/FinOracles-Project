#!/usr/bin/env bash
# Copies all CMS content (pages, posts, products, team, media records, enquiries, users…)
# from an existing database into a new production database, without touching the source.
#
#   SOURCE_URL=postgresql://...  TARGET_URL=postgresql://...  ./transfer-data.sh
#
# Why data-only: a database created by `npm run dev` carries a "dev" row in
# payload_migrations. A full copy would make `payload migrate` stop at an interactive
# prompt on every deploy. Instead the target gets its schema from the project's
# migrations (`npm run migrate`), then this script copies only the rows.
#
# Requirements: the target must be freshly migrated and still empty (it refuses otherwise),
# and TARGET_URL must use a role that may disable triggers (the database owner/superuser
# on a VPS) so rows load regardless of foreign-key order.
set -euo pipefail

: "${SOURCE_URL:?Set SOURCE_URL to the database that has the content}"
: "${TARGET_URL:?Set TARGET_URL to the new, migrated production database}"
for tool in psql pg_dump pg_restore; do
  command -v "$tool" >/dev/null || { echo "✗ $tool not found. Install the PostgreSQL client (apt install postgresql-client)." >&2; exit 1; }
done
psql "$SOURCE_URL" -tAc "SELECT 1" >/dev/null || { echo "✗ Cannot connect to SOURCE_URL" >&2; exit 1; }
psql "$TARGET_URL" -tAc "SELECT 1" >/dev/null || { echo "✗ Cannot connect to TARGET_URL" >&2; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "→ Checking the target is migrated and empty"
migrated="$(psql "$TARGET_URL" -tAc "SELECT count(*) FROM payload_migrations WHERE batch > 0" 2>/dev/null || echo 0)"
if [ "${migrated:-0}" = "0" ]; then
  echo "✗ Target has no applied migrations. Run 'npm run migrate' against TARGET_URL first." >&2
  exit 1
fi
existing="$(psql "$TARGET_URL" -tAc "SELECT (SELECT count(*) FROM users) + (SELECT count(*) FROM pages) + (SELECT count(*) FROM products)")"
if [ "$existing" != "0" ]; then
  echo "✗ Target already has content ($existing rows in users/pages/products). Refusing to overwrite." >&2
  exit 1
fi

echo "→ Dumping data from source (read-only)"
pg_dump --data-only --no-owner --no-privileges --format=custom \
  --exclude-table-data=payload_migrations \
  --file="$WORK/data.dump" "$SOURCE_URL"

echo "→ Loading data into target"
pg_restore --data-only --no-owner --no-privileges --disable-triggers --single-transaction \
  -d "$TARGET_URL" "$WORK/data.dump"

echo "→ Row counts (source → target)"
for t in pages posts categories services products team_members media enquiries users; do
  s="$(psql "$SOURCE_URL" -tAc "SELECT count(*) FROM $t")"
  d="$(psql "$TARGET_URL" -tAc "SELECT count(*) FROM $t")"
  printf '  %-14s %6s → %6s %s\n' "$t" "$s" "$d" "$([ "$s" = "$d" ] && echo ✓ || echo '✗ MISMATCH')"
done
echo "✓ Done. Copy the media files too (see README: 'Move existing content')."
