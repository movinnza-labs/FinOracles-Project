#!/usr/bin/env bash
# Deploys the latest code on a Hostinger VPS: backup → pull → install → migrate → build → reload.
# Run as the app user from anywhere:  bash /var/www/finoracles/app/deploy/hostinger/deploy.sh
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/finoracles/app}"
BRANCH="${BRANCH:-main}"
cd "$APP_DIR"

[ -f .env ] || { echo "✗ $APP_DIR/.env is missing (copy deploy/hostinger/env.production.example)"; exit 1; }
set -a; . ./.env; set +a

echo "→ Backup before deploying"
bash deploy/hostinger/backup.sh

echo "→ Updating code ($BRANCH)"
git fetch --prune origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "→ Installing dependencies"
npm ci --no-audit --no-fund

echo "→ Applying database migrations"
npm run migrate

echo "→ Building"
npm run build

echo "→ Restarting"
if pm2 describe finoracles >/dev/null 2>&1; then
  pm2 reload finoracles --update-env
else
  pm2 start deploy/hostinger/ecosystem.config.cjs
fi
pm2 save

echo "→ Health check"
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3000/healthz >/dev/null; then echo "✓ Live"; exit 0; fi
  sleep 2
done
echo "✗ App did not answer /healthz in 60s — check: pm2 logs finoracles" >&2
exit 1
