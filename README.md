# FinOracles Website

Next.js 16 site exported as **plain static files** and hosted on **Hostinger** web hosting.
There is no admin panel, no database and no Node.js server in production.

```
npm run build  ──▶  out/  (HTML, CSS, JS, images, .htaccess, contact.php)  ──▶  Hostinger public_html
```

The contact / call-back forms post to `contact.php` (PHP, which every Hostinger web
hosting plan runs). It emails each enquiry and also saves it to a CSV file.

## Tech stack

| Layer    | Choice                                                                    |
| -------- | ------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router, React 19), `output: 'export'`, `next/font`        |
| Styling  | Plain CSS: tokens/primitives in `src/styles`, CSS Modules per component   |
| Content  | Typed data in `src/content/content.ts` (no CMS)                           |
| Forms    | `public/contact.php` (PHP `mail()` + CSV backup)                          |
| Hosting  | Hostinger web hosting (Premium / Business / Cloud) — Apache/LiteSpeed     |

## Project structure

```
src/
├─ app/(frontend)/     Pages: home, about, products, services, tools, blog, contact, login, [slug]
├─ app/sitemap.ts      sitemap.xml (generated at build)
├─ app/robots.ts       robots.txt
├─ content/            ALL website text, products, team, blog posts, pages  ← edit here
├─ components/         Layout, homepage sections, forms, UI
├─ lib/                Data access (queries.ts), SEO, JSON-LD, helpers
├─ styles/             Design system CSS
└─ types/content.ts    Types for the content
public/
├─ images/             Site images (WebP)
├─ contact.php         Enquiry form handler
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

Works on any Hostinger **web hosting** plan (Premium, Business, Cloud). No Node.js app,
database or VPS is needed.

### 1. Build the upload file (on your computer)

```bash
npm install
npm run package
```

This builds the site into `out/` and creates **`finoracles-site.zip`**.
Canonical URLs and the sitemap use `https://finoracles.com` (set in `.env.production`;
change it there if the domain is different, then rebuild).

### 2. Upload

1. hPanel → **Websites → Manage → File Manager** → open **`public_html`**.
2. First time only: delete or move away old files there (e.g. the default `default.php`,
   or an old WordPress install — take a backup first).
3. **Upload** `finoracles-site.zip` into `public_html`, right-click it → **Extract** → extract
   into `public_html` itself (not a sub-folder). Then delete the zip.
4. Check that `public_html` now directly contains `index.html`, `.htaccess`, `contact.php`,
   `_next/`, `images/`, `about/` … (enable *Show hidden files* to see `.htaccess`).

Updating later: repeat steps 1 and 3. Delete the old `_next` folder before extracting so old
build files don't pile up (the CSV of enquiries is outside `public_html`, so it is safe).

### 3. Domain and HTTPS

- hPanel → **Security → SSL** → install the free SSL for the domain.
- `.htaccess` redirects `http://` → `https://` and `www.` → the bare domain.

### 4. Contact form email

1. hPanel → **Emails** → create the mailbox **`no-reply@finoracles.com`** (the sender address).
   Mail sent "from" an address that is not on your domain is often rejected.
2. Enquiries are sent to **`connect@finoracles.com`**. To change either address, edit the
   constants at the top of `public/contact.php` and rebuild/upload (or edit the file
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
