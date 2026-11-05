# Deploying FinOracles on Hostinger

The site is one Node.js app (Next.js 16 + Payload CMS 3) that needs **PostgreSQL** and a
place to keep **uploaded images**. Nothing in the website itself changes for Hostinger; only
where it runs, which database it uses and where uploads are stored.

## 1. Which Hostinger plan?

| Plan | Node.js | PostgreSQL | Uploads | Verdict |
|---|---|---|---|---|
| **VPS** (KVM 1 or higher, Ubuntu 24.04) | You install it | You install it on the same server | Server disk | **Recommended.** Everything on one server, full control. |
| **Business / Cloud** web hosting | Yes (managed Node.js apps, Node 22/24) | **No** (MySQL only) | Disk is not guaranteed across redeploys | Works only with an **external PostgreSQL** (Neon, Supabase, …) and an **S3 bucket** (Cloudflare R2, etc.) for images. |
| Premium / Single shared hosting | No | No | — | Cannot run this site. |

Payload CMS has no MySQL adapter for this project's schema, so switching to Hostinger's MySQL
is not an option without rebuilding the data layer.

Minimum for the VPS: 2 GB RAM (the build needs ~1.5 GB). On KVM 1 add the 2 GB swap from step 2.

## 2. Prepare the VPS (once)

SSH in as root (`ssh root@YOUR_SERVER_IP`) and run:

```bash
apt update && apt upgrade -y
apt install -y git nginx postgresql postgresql-contrib certbot python3-certbot-nginx ufw

# Node.js 22 LTS (the project requires ^22.23.4 or >=24.22.1)
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g pm2

# Firewall: SSH + web only (PostgreSQL stays private on 127.0.0.1)
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# Swap, if the server has 2 GB RAM or less
fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab

# App user and folders
adduser --disabled-password --gecos "" finoracles
mkdir -p /var/www/finoracles/{shared/media,backups,logs}
chown -R finoracles:finoracles /var/www/finoracles
```

## 3. Create the database

```bash
sudo -u postgres psql <<'SQL'
CREATE ROLE finoracles LOGIN PASSWORD 'CHOOSE_A_STRONG_PASSWORD';
CREATE DATABASE finoracles OWNER finoracles;
SQL
```

Use the same password in `DATABASE_URL` in step 4. If you use the ready-made
`deploy/hostinger/.env.production` from your computer, take the password from its
`DATABASE_URL` (the part between `finoracles:` and `@`).

## 4. Get the code and settings

```bash
sudo -iu finoracles
git clone https://github.com/movinnza-labs/FinOracles-Project.git /var/www/finoracles/app
cd /var/www/finoracles/app
cp deploy/hostinger/env.production.example .env
nano .env      # fill in DATABASE_URL, secrets, NEXT_PUBLIC_SERVER_URL=https://your-domain
chmod 600 .env
```

Or upload the ready-made file from your computer instead of editing on the server (it is
git-ignored, so it is not in the clone). After the `git clone` above, from the project folder
on your computer:

```bash
scp deploy/hostinger/.env.production root@YOUR_SERVER_IP:/var/www/finoracles/app/.env
ssh root@YOUR_SERVER_IP "chown finoracles:finoracles /var/www/finoracles/app/.env && chmod 600 /var/www/finoracles/app/.env"
```

## 5. First install

```bash
npm ci --no-audit --no-fund
npm run migrate        # creates all tables from src/migrations (non-destructive)
npm run build
pm2 start deploy/hostinger/ecosystem.config.cjs
pm2 save
exit                   # back to root
pm2 startup systemd -u finoracles --hp /home/finoracles   # start on boot
```

Check: `curl http://127.0.0.1:3000/healthz` should return `{"status":"ok"}`.

## 6. Move existing content (no data is changed at the source)

Back up the source first (your local database, or the old host's database):

```bash
DATABASE_URL="postgresql://...source..." MEDIA_DIR=/path/to/source/media \
  BACKUP_DIR=~/finoracles-backups bash deploy/hostinger/backup.sh
```

Copy the database rows into the new, migrated, still-empty database. The script refuses to
run if the target already has content:

```bash
SOURCE_URL="postgresql://...source..." \
TARGET_URL="postgresql://postgres@/finoracles?host=/var/run/postgresql" \
  sudo -u postgres -E bash /var/www/finoracles/app/deploy/hostinger/transfer-data.sh
```

(The target is reached as the `postgres` superuser so foreign keys can be loaded in any order.
For a database on another host, use its public connection URL.)

Copy the uploaded images (from your computer, in the project folder):

```bash
scp -r media/* root@YOUR_SERVER_IP:/var/www/finoracles/shared/media/
ssh root@YOUR_SERVER_IP chown -R finoracles:finoracles /var/www/finoracles/shared/media
```

Image files keep the same names, so every existing image URL keeps working.
User accounts (admin logins) are copied with the rows; passwords stay the same.

## 7. Domain and HTTPS

1. In Hostinger hPanel → **Domains → DNS**, point `A @` and `A www` to the VPS IP.
2. On the server (as root):

```bash
cp /var/www/finoracles/app/deploy/hostinger/nginx.conf /etc/nginx/sites-available/finoracles
sed -i 's/finoracles.com/YOUR-DOMAIN/g' /etc/nginx/sites-available/finoracles
ln -s /etc/nginx/sites-available/finoracles /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
certbot --nginx -d YOUR-DOMAIN -d www.YOUR-DOMAIN --redirect -m you@example.com --agree-tos
```

Certbot renews automatically. `NEXT_PUBLIC_SERVER_URL` must be the exact address people use
(e.g. `https://finoracles.com`): the admin only accepts logins from that origin, so if the site
is also reachable on `www`, redirect one to the other.

## 8. Updating the site later

```bash
sudo -iu finoracles bash /var/www/finoracles/app/deploy/hostinger/deploy.sh
```

It backs up the database and media, pulls `main`, installs, migrates, builds, reloads PM2 and
checks `/healthz`. The build replaces `.next` in place, so for the last few seconds of the build
a visitor may see an error; deploy outside busy hours.

Nightly backups (as the `finoracles` user, `crontab -e`):

```
30 2 * * * cd /var/www/finoracles/app && set -a && . ./.env && set +a && bash deploy/hostinger/backup.sh >> /var/www/finoracles/logs/backup.log 2>&1
```

## Business / Cloud plan instead of VPS

1. Create the PostgreSQL elsewhere (e.g. Neon free tier) and an R2/S3 bucket.
2. hPanel → **Websites → Add website → Node.js app** → import the GitHub repository, or upload a
   ZIP of the project. Make the ZIP from committed code so it never contains `.env`,
   `node_modules`, `.next`, `media` or `.pgdata`:
   `git archive --format=zip -o finoracles-hostinger.zip HEAD`
3. Settings: Node **22.x** (22.23.4 or newer, required by `sharp`), build command `npm run build`,
   start command `npm run start:production` (runs migrations, then starts), entry/output as
   detected for Next.js.
4. Add every variable from `env.production.example` (with `S3_*` filled in, `MEDIA_DIR` unused)
   **before the first build**: `NEXT_PUBLIC_SERVER_URL` is baked into the build.
5. Move content with `transfer-data.sh` (step 6) from any machine that can reach both databases,
   and upload the `media/` files to the bucket keeping the same file names.

The build needs neither the database nor `PAYLOAD_SECRET` (every page renders on request), so
it succeeds even before the variables are set, and before migrations. The running site needs
`PAYLOAD_SECRET` (without it every page returns 500) and `DATABASE_URL` (without it the site
shows its built-in default content, `/healthz` returns 503 and the admin cannot log in).

**Do not upload the whole project folder.** `node_modules`, `.next`, `.pgdata`, `media` and
`.env` must stay out of the upload; Hostinger installs and builds from the source itself.

## Checks after go-live

- `https://YOUR-DOMAIN/healthz` → `{"status":"ok"}`
- Home, About, Services, Products, Blog, Contact open; images load
- `/admin` → log in with the existing admin account; edit a test field and see it on the site
- Upload an image in Media; it appears and survives `deploy.sh`
- Send the contact form; the enquiry appears under Admin → Enquiries
- `/sitemap.xml` and `/robots.txt` show the live domain

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `/healthz` returns 503, or the site shows default content instead of your edits | The app cannot reach PostgreSQL. `systemctl status postgresql`; test the URL with `psql "$DATABASE_URL" -c 'select 1'`; check user, password and database name in `.env`, then `pm2 restart finoracles`. After a database outage the app retries every 30 s. |
| `PAYLOAD_SECRET is not set` in `pm2 logs` | `.env` is missing or not in `/var/www/finoracles/app`. PM2 runs from that folder and Next.js reads `.env` there. |
| 502 Bad Gateway from Nginx | The app is not running or not on port 3000: `pm2 status`, `pm2 logs finoracles --lines 100`. |
| Build killed / `JavaScript heap out of memory` | Not enough RAM. Add the swap from step 2, or stop the app during the build (`pm2 stop finoracles`). |
| `npm ci` warns `EBADENGINE` or `sharp` fails to load | Node is older than 22.23.4: `node -v`, reinstall Node 22 from NodeSource (step 2), `rm -rf node_modules && npm ci`. |
| `npm run migrate` asks "dev mode … continue?" | The production database was created by `npm run dev` or copied in full. Production must be built by `npm run migrate` on an empty database, with content moved by `transfer-data.sh`. |
| Admin login fails or loops, or "Invalid CSRF" | `NEXT_PUBLIC_SERVER_URL` differs from the address in the browser (http vs https, www vs no www). Fix it, `npm run build`, `pm2 reload finoracles`. |
| Images from the CMS 404 | Files were not copied to `MEDIA_DIR` (step 6), or `MEDIA_DIR` in `.env` points elsewhere. Check `ls $MEDIA_DIR`. File names must match the `media` table. |
| Image upload fails with 413 | `client_max_body_size` in the Nginx site (25 MB by default). |
| `transfer-data.sh` refuses: target already has content | It never overwrites. Only for a database you mean to wipe: drop and recreate it, `npm run migrate`, run the script again. |
| Contact form shows "Too many requests" | Built-in limit per IP. Make sure Nginx sends `X-Forwarded-For` (it does with the provided `nginx.conf`). |
| Enquiry emails don't arrive | `SMTP_*` not set (enquiries are still saved under Admin → Enquiries). For Hostinger mail use `smtp.hostinger.com`, port 465, the full mailbox address as `SMTP_USER`. |

Logs: `pm2 logs finoracles`, `/var/www/finoracles/logs/`, `/var/log/nginx/error.log`.

## Testing a production build on your own computer

```bash
npm run build
npm run start            # http://localhost:3000, uses .env
```

The build was verified this way against a freshly migrated database with the content copied by
`transfer-data.sh`: all pages, images, the admin, `/healthz` and the contact form work, and the
pages render the same as in development.
