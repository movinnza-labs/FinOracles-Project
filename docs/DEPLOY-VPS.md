# Deploying FinOracles to a Hostinger VPS

The site runs as two Docker Compose services on the VPS: **app** (the existing `Dockerfile`:
Next.js + Payload, port 3000 on loopback) and **db** (PostgreSQL). Nginx runs on the host and
terminates HTTPS with a Let's Encrypt certificate. Nothing in the application code changes.

```
Internet ─▶ Nginx :443 (host, Certbot) ─▶ 127.0.0.1:3000 app container ─▶ db container (internal only)
                                              └ /app/media ◀─ /srv/finoracles/media (host)
```

| Item | Location on the VPS |
| --- | --- |
| Code checkout | `/srv/finoracles/app` |
| Secrets / config | `/srv/finoracles/app/.env` (chmod 600, from `.env.production.example`) |
| Uploaded media | `/srv/finoracles/media` (owned by uid/gid 1001) |
| Database data | Docker volume `finoracles_pgdata` |
| Backups | `/var/backups/finoracles` |
| Nginx site | `/etc/nginx/sites-available/finoracles.conf` |

Placeholders used below and in the config files:

| Placeholder | Replace with |
| --- | --- |
| `CANONICAL_HOST` | the host the live site uses today (`example.com` or `www.example.com`), see DOMAIN-SSL.md §0 |
| `REDIRECT_HOST` | the other variant, redirected to `CANONICAL_HOST` |
| `YOUR_EMAIL` | address for Let's Encrypt expiry notices |
| `<VPS_IP>` | the VPS public IPv4 from hPanel |
| `<owner>/<repo>` | the GitHub repository |
| empty values in `.env` | secrets (`PAYLOAD_SECRET`, `POSTGRES_PASSWORD`, `SMTP_PASS`, …) |

Commands are run as a sudo user; `sudo -i` is assumed where root is needed.

---

## 1. Server setup (once)

Recommended plan: KVM 2 (2 vCPU, 8 GB RAM) or larger, Ubuntu 24.04 LTS. The build needs ~4 GB RAM.

```bash
# 1.1 Admin user + SSH keys (from your computer: ssh-copy-id deploy@<VPS_IP>)
adduser deploy && usermod -aG sudo deploy

# 1.2 Updates, timezone, base packages
apt update && apt -y upgrade
timedatectl set-timezone Asia/Kolkata
apt -y install git ufw fail2ban unattended-upgrades nginx certbot
dpkg-reconfigure -plow unattended-upgrades

# 1.3 Docker Engine + Compose plugin (official repository)
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
apt update && apt -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
usermod -aG docker deploy

# 1.4 Swap (helps the 4 GB build on smaller plans)
fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# 1.5 Firewall (also mirror these rules in hPanel → VPS → Firewall)
ufw default deny incoming && ufw default allow outgoing
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw enable
```

SSH hardening — `/etc/ssh/sshd_config.d/hardening.conf` (test a key login in a second window first):

```
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
```
`systemctl restart ssh`. fail2ban protects sshd with its default jail once installed.

## 2. Code, config and folders

```bash
mkdir -p /srv/finoracles/media /var/backups/finoracles /var/www/letsencrypt
chown 1001:1001 /srv/finoracles/media && chmod 750 /srv/finoracles/media
chmod 700 /var/backups/finoracles
chown deploy:deploy /srv/finoracles

# As deploy: clone with a read-only GitHub deploy key
git clone git@github.com:<owner>/<repo>.git /srv/finoracles/app
cd /srv/finoracles/app
cp .env.production.example .env && chmod 600 .env
nano .env
```

Fill in `.env`:
- `POSTGRES_PASSWORD` — `openssl rand -hex 32`.
- `PAYLOAD_SECRET` — `openssl rand -hex 32` (generate once, then never change it).
- `NEXT_PUBLIC_SERVER_URL` — `https://CANONICAL_HOST` (your domain, see DOMAIN-SSL.md §0).
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — the first admin login (strong password).
- `SMTP_*`, `EMAIL_FROM_*`, `ENQUIRY_NOTIFY_TO` — your mail provider, if you want enquiry emails.
- Keep `SEED_ON_INIT=true` for the first start and every `S3_*` empty.

## 3. Build and first start

```bash
cd /srv/finoracles/app
bash deploy/scripts/deploy.sh      # builds the image, starts db + app, waits for /healthz
docker compose ps                  # db: healthy, app: healthy
curl -s http://127.0.0.1:3000/healthz   # {"status":"ok"}
docker compose logs app | grep -E 'Migrat|Seed'
```

On the first start the empty database gets its tables from the committed migrations, and the seed
loads the website's built-in content and images and creates the admin login from
`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (log lines `Migrated: …`, `Seed complete.`).

Then turn the seed off and remove the password from the file:

```bash
nano .env                          # SEED_ON_INIT=false, SEED_ADMIN_PASSWORD= (empty)
docker compose up -d app           # restarts the app with the new settings
```

The seed only ever runs on an empty database, so it can never overwrite content, but it is not
needed again.

## 4. Certificate, virtual host and test before DNS changes

Follow [DOMAIN-SSL.md](DOMAIN-SSL.md) section 4, **Path A**: it issues the HTTPS certificate before
DNS points at the VPS and installs `deploy/nginx/finoracles.conf`. Then validate:

```bash
CANONICAL_HOST=example.com REDIRECT_HOST=www.example.com VPS_IP=<VPS_IP> \
  bash deploy/scripts/check-domain.sh --pre-dns
```

Then test in a browser over real HTTPS: add `<VPS_IP> CANONICAL_HOST REDIRECT_HOST` to the hosts
file (`C:\Windows\System32\drivers\etc\hosts`) and check every page, images, `/admin` login,
editing and saving, a draft **Preview**, an image upload, the contact form (and its email),
`/sitemap.xml`, `/robots.txt`. Review the content in `/admin` (the three seeded blog posts and the
Privacy Policy are drafts). Remove the hosts entry afterwards.

## 5. Go live (DNS switch)

1. **48 h before** (only if the domain already points somewhere): lower the TTL of the `@` and
   `www` DNS records to 300 s.
2. Change the DNS records as in [DOMAIN-SSL.md](DOMAIN-SSL.md) section 2. The certificate already
   exists, so HTTPS works as soon as visitors reach the VPS.

## 6. After the DNS switch: certificate renewal and checks

DOMAIN-SSL.md section 5: once public DNS returns the VPS IP, run `check-domain.sh` without
`--pre-dns`, switch the certificate to automatic webroot renewal, add the Nginx reload hook, and
delete the `_acme-challenge` TXT records.

## 7. Backups

```bash
sudo install -m 644 -o root -g root deploy/cron/finoracles-backup /etc/cron.d/finoracles-backup
sudo bash deploy/scripts/backup.sh          # run once now
ls -lh /var/backups/finoracles
journalctl -t finoracles-backup             # nightly run output
```

Nightly at 02:30: database dump + media archive, 14 daily and 8 weekly copies; each deploy also
keeps a pre-deploy dump (last 10). Also enable Hostinger's VPS backups/snapshots in hPanel, and
copy `/var/backups/finoracles` off the server regularly, e.g. from your computer:
`scp -r deploy@<VPS_IP>:/var/backups/finoracles ./finoracles-backups`.

**Monthly restore test** (live site untouched):

```bash
RESTORE_DB=restore_test sudo -E bash deploy/scripts/restore.sh /var/backups/finoracles/db-daily-<ts>.dump
# afterwards remove the scratch copy only (never the live 'finoracles' database):
docker compose exec db dropdb -U finoracles restore_test
```

## 8. Database safety rules

- Never run `payload migrate:fresh`, `migrate:reset`, `migrate:down` or `SEED_FORCE=true npm run seed`
  against production; they drop tables or wipe content. (The production image has no Payload CLI.)
- Never point `npm run dev` at the production database: in development Payload *pushes* the
  schema automatically and can alter or drop columns.
- Keep `SEED_ON_INIT=false` in `.env` after the first start.
- `restore.sh` never drops a database; it renames the current one aside
  (`*_before_restore_*`). List them with
  `docker compose exec db psql -U finoracles -d postgres -c '\l'`.

## 9. Day-to-day operations

| Task | Command (in `/srv/finoracles/app`) |
| --- | --- |
| Deploy latest code | `bash deploy/scripts/deploy.sh` |
| Apply `.env` changes | `NO_PULL=1 bash deploy/scripts/deploy.sh` (rebuild needed for `NEXT_PUBLIC_*`) |
| Roll back the app image | `bash deploy/scripts/deploy.sh --rollback` |
| Undo a bad migration | `sudo bash deploy/scripts/restore.sh /var/backups/finoracles/db-predeploy-<ts>.dump` |
| Status | `docker compose ps` |
| Logs | `docker compose logs -f --tail 200 app` |
| Memory/CPU | `docker stats` |
| Restart app | `docker compose restart app` |
| Restore DB + media | `sudo bash deploy/scripts/restore.sh <db.dump> <media.tar.gz>` |

Schema changes work as before: create the migration locally (`npm run migrate:create`), commit
it, deploy. The new container applies it on first connect.

## 10. Monitoring

- Add an HTTP monitor for `https://CANONICAL_HOST/healthz` (UptimeRobot / Better Stack free tier,
  5-minute interval) with email or SMS alerts. It returns 503 if the database is unreachable.
- hPanel → VPS shows CPU, RAM, disk and bandwidth graphs.
- Containers restart automatically when they crash (`restart: unless-stopped`) and after a reboot
  (Docker is enabled at boot). Nginx restarts on failure via the systemd drop-in installed in 4.3.
- A *hung* app (running but `/healthz` failing) is not restarted by Docker; the watchdog does it:

  ```bash
  sudo install -m 644 -o root -g root deploy/cron/finoracles-healthcheck /etc/cron.d/finoracles-healthcheck
  journalctl -t finoracles-health        # entries only when the app was unhealthy / restarted
  ```

## 11. Logs

| Log | Where | Rotation |
| --- | --- | --- |
| App (Next.js + Payload) | `docker compose logs -f app` | 10 MB × 5 files (docker-compose.yml) |
| PostgreSQL | `docker compose logs -f db` | 10 MB × 5 files |
| Nginx | `/var/log/nginx/finoracles.access.log`, `finoracles.error.log` | daily, `/etc/logrotate.d/nginx` |
| Backups / watchdog | `journalctl -t finoracles-backup`, `journalctl -t finoracles-health` | journald |

## 12. Permissions

| Path / item | Owner | Mode | Notes |
| --- | --- | --- | --- |
| `/srv/finoracles/app` | `deploy` | 755 | code checkout |
| `/srv/finoracles/app/.env` | `deploy` | 600 | secrets; never committed, never in the image |
| `/srv/finoracles/media` | `1001:1001` | 750 | only the app container (user `nextjs`) writes here |
| `/var/backups/finoracles` | `root` | 700 | dumps contain all data |
| app container | uid 1001, all capabilities dropped, no-new-privileges | | port 3000 on 127.0.0.1 only |
| db container | no published port, no-new-privileges | | reachable only from the app |

Membership of the `docker` group is equivalent to root: give it only to `deploy`.
