# FinOracles Website

Next.js 16 frontend + Payload CMS 3 + PostgreSQL, deployed on Railway.

```
Next.js (App Router) ──Local API──▶ Payload CMS ──▶ PostgreSQL
        └──────────── one Railway service ────────────┘   └ Railway Postgres
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
| Hosting  | Railway (`railway.json`)                                                 |

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

## Deploying to Railway

1. Push this project to a GitHub repository.
2. In Railway, create a project and add a **PostgreSQL** database.
3. Add a service from the GitHub repo. `railway.json` sets the build command (`npm run build`),
   the start command (`npm run start:railway`, which runs migrations and then starts Next.js) and a
   health check on `/healthz`.
4. Set the service **Variables**:

   | Variable                 | Value                                                       |
   | ------------------------ | ----------------------------------------------------------- |
   | `DATABASE_URL`           | `${{Postgres.DATABASE_URL}}`                                |
   | `PAYLOAD_SECRET`         | a long random string                                        |
   | `NEXT_PUBLIC_SERVER_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` or your custom domain  |
   | `MEDIA_DIR`              | `/data/media` (see step 5)                                  |
   | `SEED_ON_INIT`           | `true` for the first deploy only, then remove it            |
   | `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | optional first admin login                |

5. **Media storage:** Railway's filesystem is wiped on every deploy. Choose one:
   - attach a **Volume** to the service mounted at `/data` and set `MEDIA_DIR=/data/media`, or
   - use a **Railway Bucket** (or any S3-compatible storage) and set `S3_BUCKET`, `S3_ENDPOINT`,
     `S3_REGION`, `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`. `MEDIA_DIR` is then ignored.
6. Generate a domain (Settings → Networking) and deploy. Open `/admin` and log in, or create the
   first user if you didn't set the `SEED_ADMIN_*` variables. Then remove `SEED_ON_INIT`.

Optional: set `SMTP_*` and `ENQUIRY_NOTIFY_TO` to get an email for each contact-form enquiry.
Enquiries are always saved under **Admin → Enquiries**.

All secrets are environment variables. None are hard-coded (see `.env.example`).

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
