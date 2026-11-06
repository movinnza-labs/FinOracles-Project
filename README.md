# FinOracles Website

Next.js 16 website for **Hostinger**. No admin panel and no database: all content is in the
code and every page is prerendered to static HTML. Two ways to host the same code:

```
A. Hostinger Node.js Web App (GitHub):  npm run build → .next   npm start → next start
B. Plain web hosting (public_html):     npm run package → finoracles-site.zip (static files + PHP form)
```

The contact / call-back forms post to `/contact.php`: a Next.js route in option A
(`src/app/contact.php/route.node.ts`, emails via SMTP) or a PHP file in option B
(`hosting/contact.php`, PHP `mail()`). Both also save every enquiry to a CSV file.

## Tech stack

| Layer    | Choice                                                                    |
| -------- | ------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router, React 19), prerendered pages, `next/font`         |
| Styling  | Plain CSS: tokens/primitives in `src/styles`, CSS Modules per component   |
| Content  | Typed data in `src/content/content.ts` (no CMS)                           |
| Forms    | `/contact.php`: Next.js route (Node) or `hosting/contact.php` (PHP)        |
| Hosting  | Hostinger Node.js Web App, or any Hostinger web hosting plan (static)     |

## Project structure

```
src/
├─ app/(frontend)/     Pages: home, about, products, services, tools, blog, contact, login, [slug]
├─ app/sitemap.ts      sitemap.xml (generated at build)
├─ app/robots.ts       robots.txt
├─ app/contact.php/    Contact form handler for the Node.js app
├─ content/            ALL website text, products, team, blog posts, pages  ← edit here
├─ components/         Layout, homepage sections, forms, UI
├─ lib/                Data access (queries.ts), SEO, JSON-LD, helpers
├─ styles/             Design system CSS
└─ types/content.ts    Types for the content
public/images/         Site images (WebP)
hosting/               Added to the static upload only (npm run package):
├─ contact.php         PHP enquiry form handler
└─ .htaccess           HTTPS redirect, security + cache headers, 404 page
```

## Local development

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev          # http://localhost:3000
```

## Changing content

All text lives in **`src/content/content.ts`**: site settings (phones, emails, address,
ARN, socials, disclaimer), header menu, footer, every homepage section, products (with
FAQs and highlights), team, services, blog posts and the Privacy Policy / Disclaimer pages.

- Images: put a WebP file in `public/images/finoracles/` and register it in `src/content/images.ts`.
- Blog posts and pages use simple blocks — see `src/content/lexical.ts` (`'paragraph'`, `{ h2 }`, `{ h3 }`, `{ ul: [...] }`, `{ quote }`).
- After any change: build and upload again (below).

> The three blog posts and the Privacy Policy are sample text. Have them reviewed before launch.

## Deploying to Hostinger

Two ways; pick one.

### Option A — Node.js Web App from GitHub (hPanel → Websites → Add website → Node.js app)

| Setting | Value |
| --- | --- |
| Repository / branch | this repo, `main` |
| Framework / application type | Next.js |
| Node version | 22 (or 20 / 24) |
| Root directory | `/` (leave empty) |
| Build command | `npm run build` |
| Start command | `npm start` (`next start`) |
| Output directory | `.next` (Hostinger's default for Next.js) |

These are Hostinger's defaults for a Next.js app, so usually nothing needs changing.

Environment variables for contact-form email (create the mailbox in hPanel → Emails first):

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=no-reply@finoracles.com
SMTP_PASS=<mailbox password>
ENQUIRY_NOTIFY_TO=connect@finoracles.com
```

Without them the form still works and saves leads to `../finoracles-enquiries/enquiries.csv`,
but that file may be lost on redeploy — set up SMTP.

### Option B — upload static files to public_html

Works on any Hostinger **web hosting** plan (Premium, Business, Cloud). No Node.js app,
database or VPS is needed.

#### 1. Build the upload file (on your computer)

```bash
npm install
npm run package
```

This builds the static site into `out/`, adds `hosting/.htaccess` and `hosting/contact.php`, and creates **`finoracles-site.zip`**.
Canonical URLs and the sitemap use `https://finoracles.com` (set in `.env.production`;
change it there if the domain is different, then rebuild).

#### 2. Upload

1. hPanel → **Websites → Manage → File Manager** → open **`public_html`**.
2. First time only: delete or move away old files there (e.g. the default `default.php`,
   or an old WordPress install — take a backup first).
3. **Upload** `finoracles-site.zip` into `public_html`, right-click it → **Extract** → extract
   into `public_html` itself (not a sub-folder). Then delete the zip.
4. Check that `public_html` now directly contains `index.html`, `.htaccess`, `contact.php`,
   `_next/`, `images/`, `about/` … (enable *Show hidden files* to see `.htaccess`).

Updating later: repeat steps 1 and 3. Delete the old `_next` folder before extracting so old
build files don't pile up (the CSV of enquiries is outside `public_html`, so it is safe).

### Domain and HTTPS

- hPanel → **Security → SSL** → install the free SSL for the domain.
- `.htaccess` redirects `http://` → `https://` and `www.` → the bare domain.

### Contact form email (Option B)

1. hPanel → **Emails** → create the mailbox **`no-reply@finoracles.com`** (the sender address).
   Mail sent "from" an address that is not on your domain is often rejected.
2. Enquiries are sent to **`connect@finoracles.com`**. To change either address, edit the
   constants at the top of `hosting/contact.php` and rebuild/upload (or edit the file
   directly in File Manager).
3. Every enquiry is also saved to `finoracles-enquiries/enquiries.csv` **one level above
   `public_html`** (not reachable from the web). Download it from File Manager and open it
   in Excel / Google Sheets.
4. Test: submit the form on `/contact/` and check the inbox (and the spam folder).

### Troubleshooting

| Problem | Fix |
| --- | --- |
| Pages show 403 / directory listing | Files were extracted into a sub-folder; move them directly into `public_html`. |
| Old site still shows | Clear the cache in hPanel (**Performance → Cache Manager**) and the browser. |
| Form says "something went wrong" | Check PHP is ≥ 7.4 (hPanel → **Advanced → PHP Configuration**) and that `contact.php` is in `public_html`. |
| Emails not arriving | Create the `no-reply@` mailbox, check spam; the lead is still in `enquiries.csv`. |

## SEO and performance

- Per-page title, description, canonical URL, Open Graph and Twitter tags (`src/lib/seo.ts`)
- JSON-LD: FinancialService/LocalBusiness, WebSite, BreadcrumbList, BlogPosting, Service, FAQPage
- `/sitemap.xml` and `/robots.txt` generated at build time
- Fully static HTML: fast, cacheable, nothing to crash or run out of memory
- Self-hosted Plus Jakarta Sans via `next/font`; animations respect `prefers-reduced-motion`
