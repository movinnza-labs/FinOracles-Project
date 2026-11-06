# FinOracles Website

Next.js 16 frontend + Payload CMS 3 + PostgreSQL, deployed on a Hostinger VPS (Docker Compose + Nginx).

```
Next.js (App Router) ──Local API──▶ Payload CMS ──▶ PostgreSQL
        └──────────── app container ──────────────────┘   └ db container (VPS)
```

Payload runs inside the same Next.js app, so the site reads content through Payload's
Local API with no HTTP hop. The admin panel is at **`/admin`**.

## Tech stack

| Layer    | Choice                                                                   |
| -------- | ------------------------------------------------------------------------ |
| Frontend | Next.js 16 (App Router, React 19, Turbopack), `next/image`, `next/font`  |
| Styling  | Plain CSS: global tokens/primitives in `src/styles`, CSS Modules per component |
| CMS      | Payload 3 (Lexical rich text, SEO plugin, drafts + preview)              |
| Database | PostgreSQL via `@payloadcms/db-postgres`, versioned migrations           |
| Hosting  | Hostinger VPS: Docker Compose (`docker-compose.yml`) + Nginx (`deploy/`)  |

## Project structure

```
src/
├─ app/
│  ├─ (frontend)/          Public site: home, [slug] pages, services, blog, preview, healthz
│  ├─ (payload)/           Payload admin + REST API (/admin, /api)
│  ├─ sitemap.ts           Dynamic XML sitemap (pages, posts, services; respects noindex)
│  └─ robots.ts
├─ collections/            Pages, Posts, Categories, Services, Products, TeamMembers, Media, Enquiries, Users
├─ globals/                HomePage, Header, Footer, SiteSettings
├─ blocks/                 Page-builder blocks for the Pages collection
├─ fields/                 Reusable field configs (slug, link, icon, SEO tab)
├─ hooks/revalidate.ts     Expires cached content when editors save
├─ components/
│  ├─ layout/              Header, Footer, disclaimer, WhatsApp button, scroll reveal
│  ├─ home/                Homepage sections (hero, products explorer, team…)
│  ├─ sections/            Shared sections (services grid, contact, stats, page hero)
│  ├─ blocks/              Renders CMS page blocks
│  ├─ blog/  forms/  ui/
├─ lib/                    Data layer (queries.ts), SEO metadata, JSON-LD schema, helpers
├─ styles/                 tokens.css · base.css · ui.css (design system)
├─ seed/                   Default content + seed script
└─ migrations/             Database migrations (committed)
```

## Local development

Requires Node `^22.23.4 || >=24.22.1` and a PostgreSQL database.

```bash
cp .env.example .env          # set DATABASE_URL and PAYLOAD_SECRET
npm install
npm run dev                   # http://localhost:3000; admin at /admin
npm run seed                  # loads the FinOracles content and images into the CMS
```

In development Payload syncs the schema automatically. Before the site is seeded it
renders the bundled default content (`src/seed/content.ts`), so it never appears empty.

### Project-local database (optional)

Instead of a system-wide PostgreSQL login, you can keep a database cluster inside the
project (`./.pgdata`, ignored by git) on port 5433, using the installed PostgreSQL binaries:

```bash
initdb -D .pgdata -U postgres -W -A scram-sha-256 -E UTF8   # once; choose a password
npm run db:start                                            # after every reboot
createdb -h localhost -p 5433 -U postgres finoracles        # once
# .env: DATABASE_URL=postgresql://postgres:<password>@localhost:5433/finoracles
```

`npm run db:stop` and `npm run db:status` stop it and report whether it is running.

### Changing the schema

After editing a collection, global or block:

```bash
npm run generate:types        # refresh src/payload-types.ts
npm run migrate:create -- my-change
```

Commit the new file in `src/migrations/`. Production applies it on the next deploy.
If you add custom admin components, also run `npm run generate:importmap`.

## Deploying to the Hostinger VPS (Docker Compose)

The `Dockerfile` (Debian slim, multi-stage, only the Next.js standalone server in the final image)
runs under `docker-compose.yml` together with PostgreSQL. Nginx on the host serves HTTPS
(Let's Encrypt) and proxies to `127.0.0.1:3000`. Uploads are stored in `/srv/finoracles/media`
on the host. Pending migrations run when the app first connects to the database, which the
container health check (`/healthz`) triggers.

```bash
cp .env.production.example .env      # on the server; fill in, chmod 600
bash deploy/scripts/deploy.sh        # backup, build, start, wait for /healthz
```

| File | Purpose |
| ---- | ------- |
| `docker-compose.yml` | `app` + `db` services, healthchecks, restart policy, log rotation |
| `.env.production.example` | Production variables for the VPS |
| `deploy/nginx/` | Nginx site (`finoracles.conf`) and the HTTP-only bootstrap used before the first certificate |
| `deploy/scripts/deploy.sh` | Pre-deploy backup, pull, build, restart, health wait, `--rollback` |
| `deploy/scripts/backup.sh` / `restore.sh` | Nightly database + media backups and restores |
| `deploy/scripts/healthcheck.sh` + `deploy/cron/finoracles-healthcheck` | Restarts the app if it stays unhealthy |
| `deploy/scripts/check-domain.sh` | Read-only validation of DNS, redirects, HTTPS, headers, cookies, CORS and URLs |
| `deploy/systemd/nginx-restart.conf` | Restarts Nginx if it exits unexpectedly |
| `deploy/cron/finoracles-backup` | Nightly backup schedule |

Runbooks: [`docs/DEPLOY-VPS.md`](docs/DEPLOY-VPS.md) (server, first start, operations) and
[`docs/DOMAIN-SSL.md`](docs/DOMAIN-SSL.md) (domain, DNS, HTTPS, security).

Optional: set `SMTP_*` and `ENQUIRY_NOTIFY_TO` to get an email for each contact-form enquiry.
Enquiries are always saved under **Admin → Enquiries**.

All secrets are environment variables in the server's `.env`. None are hard-coded.

The production image contains only the standalone server, so `npm run seed` and `npm run migrate`
cannot run inside it. The first start on the empty VPS database loads the default content and the
first admin login with `SEED_ON_INIT=true`; set it to `false` afterwards.

Memory is kept low and flat by Debian slim (sharp leaks memory on Alpine), `MALLOC_ARENA_MAX=2`
(set in the Dockerfile), WebP-only image optimisation cached for a year, a database pool of 5
(`DATABASE_POOL_MAX`), at most 4 build workers, and a container memory limit (`APP_MEM_LIMIT`).
Optional: put **Cloudflare** in front to cache `/_next/static/*`, `/_next/image*` and `/images/*`;
never cache `/admin`, `/api` or `/preview` (see `docs/DOMAIN-SSL.md`).

## Managing content

| What                                         | Where in `/admin`                 |
| -------------------------------------------- | --------------------------------- |
| Every homepage section (hero carousel, stats, logins…) | Globals → Homepage, one tab per section |
| Logo, phones, emails, address, socials, ARN, regulators, disclaimer, default SEO | Globals → Site Settings |
| Navigation menu and header button            | Globals → Header & Navigation     |
| Footer text and link columns                 | Globals → Footer                  |
| Products: homepage explorer + landing pages at /products/[slug] (highlights, FAQs, SEO) | Content → Products |
| Menu, top bar (phone, email, ARN, Client Login), Free Consultation button | Globals → Header & Navigation |
| Consultation banner above the footer, legal links | Globals → Footer |
| Leads from the website (name, phone, product, callback time, status, notes) | Admin → Enquiries |
| Team                                         | Content → Team (tick *Featured leader* for the large card) |
| Services (homepage grid + `/services/[slug]`) | Content → Services               |
| Blog                                         | Blog → Posts / Categories         |
| Standalone pages (`/privacy-policy`, `/disclaimer`, etc.) | Content → Pages (block builder) |

Pages, posts, services and the homepage each have an **SEO** tab for the meta title,
description, social image, canonical URL and noindex. Pages and posts support drafts.
Use **Preview** to view a draft on the live site while logged in.

Site pages: `/`, `/about`, `/products`, `/products/[slug]`, `/services`, `/services/[slug]`, `/tools` (SIP, lumpsum and goal calculators), `/blog`, `/contact`, `/login`, plus CMS pages such as `/privacy-policy`.

The three seeded blog posts and the Privacy Policy are drafts. Have them reviewed before launch.

## SEO and performance

- Per-page `<title>`, meta description, canonical URL, Open Graph and Twitter tags, built
  from CMS fields with site-wide fallbacks (`src/lib/seo.ts`)
- JSON-LD: FinancialService/LocalBusiness, WebSite, BreadcrumbList, BlogPosting, Service, FAQPage
- `/sitemap.xml` and `/robots.txt` generated from live content
- Semantic landmarks, one `h1` per page, a skip link, accessible tabs and forms
- `next/image` with AVIF/WebP, responsive `sizes`, lazy loading below the fold, and
  `priority` on the hero
- Self-hosted Plus Jakarta Sans via `next/font` (no layout shift)
- Content is cached by tag and expired when an editor saves, so pages are fast and edits
  go live immediately
- Animations respect `prefers-reduced-motion`
