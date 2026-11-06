# FinOracles — domain, DNS, HTTPS and security on the Hostinger VPS

Covers pointing the domain at the VPS, the DNS records, the Nginx virtual host, the Let's Encrypt
certificate, HTTP→HTTPS redirects, proxy headers, cookies/auth, CORS, and a cutover with no
downtime. Server setup and first start are in [DEPLOY-VPS.md](DEPLOY-VPS.md).

## 0. Placeholders

| Placeholder | Meaning | Example |
| --- | --- | --- |
| `APEX` | the registered domain | `example.com` |
| `CANONICAL_HOST` | the host visitors should see (see below) | `example.com` or `www.example.com` |
| `REDIRECT_HOST` | the other variant, redirected to `CANONICAL_HOST` | `www.example.com` or `example.com` |
| `VPS_IP` | VPS public IPv4 (hPanel → VPS → Manage → Overview) | `203.0.113.10` |
| `VPS_IPV6` | VPS IPv6, only if you use it | `2001:db8::10` |
| `YOUR_EMAIL` | Let's Encrypt expiry notices | `it@example.com` |

**Choosing `CANONICAL_HOST`:** decide whether the site lives at `APEX` or `www.APEX`. If the
domain already has a website and search engines know it, keep the same choice so links and search
results stay valid; check which one answers directly:

```bash
curl -sI https://APEX/ | grep -i '^location|^HTTP'
curl -sI https://www.APEX/ | grep -i '^location|^HTTP'
```

The one that answers `200` is `CANONICAL_HOST`; the other is `REDIRECT_HOST`. For a new domain the
apex is the usual choice. Set `NEXT_PUBLIC_SERVER_URL=https://CANONICAL_HOST` in `.env`.

## 1. Where the DNS is managed

```bash
dig +short NS APEX
```

- `ns1.dns-parking.com` / `ns2.dns-parking.com` → Hostinger DNS: hPanel → **Domains** → APEX →
  **DNS / Nameservers** → **DNS records**.
- Anything else (Cloudflare, GoDaddy, …) → edit the records at that provider. Do not change the
  nameservers while going live; only the records below.

**Before editing, record the current values** (screenshot or copy) of the `@` and `www` records —
they are the rollback.

## 2. DNS records

Final state:

| Type | Name | Value | TTL | Notes |
| --- | --- | --- | --- | --- |
| `A` | `@` | `VPS_IP` | 300 during the switch, 3600 after | replaces any existing ALIAS/CNAME/A for `@` |
| `A` | `www` | `VPS_IP` | same | replaces any existing CNAME for `www` (a name cannot have both CNAME and A: delete the CNAME, then add the A immediately) |
| `AAAA` | `@`, `www` | `VPS_IPV6` | same | **only** if IPv6 is enabled on the VPS and allowed in the firewall; otherwise make sure no `AAAA` exists for `@`/`www` |
| `CAA` | `@` | `0 issue "letsencrypt.org"` | 3600 | optional; required only if CAA records already exist |
| `TXT` | `_acme-challenge`, `_acme-challenge.www` | values shown by certbot | 300 | temporary (section 4, Path A); delete afterwards |

Remove any old `@`/`www` CNAME/ALIAS/A records that point to a previous host, and TXT records a
previous host asked you to add only for its own domain verification.

**Do not touch** `MX`, `TXT` (SPF, DKIM, DMARC, site verifications) or other subdomains: email
and other services keep working as before.

## 3. Firewall

Ports 80 and 443 must be open in UFW (`sudo ufw allow 'Nginx Full'`) and in hPanel → VPS →
**Firewall**. Port 80 stays open permanently: it serves the HTTP→HTTPS redirect and certificate
renewals.

## 4. Certificate and virtual host

One certificate named `finoracles`, covering both hosts, at `/etc/letsencrypt/live/finoracles/`.

### Path A (recommended, no downtime): DNS-01 before the DNS switch

The certificate is issued before DNS points at the VPS, so HTTPS works on the VPS the moment
visitors arrive.

```bash
sudo mkdir -p /var/www/letsencrypt
sudo certbot certonly --manual --preferred-challenges dns --cert-name finoracles \
  -d CANONICAL_HOST -d REDIRECT_HOST -m YOUR_EMAIL --agree-tos --no-eff-email
```

Certbot shows one TXT record per host (`_acme-challenge.APEX` and `_acme-challenge.www.APEX`).
Add each in the DNS panel (name `_acme-challenge` / `_acme-challenge.www`, TTL 300). **Before**
pressing Enter, check that it is visible:

```bash
dig +short TXT _acme-challenge.APEX @8.8.8.8
dig +short TXT _acme-challenge.www.APEX @8.8.8.8
```

Install the virtual host:

```bash
cd /srv/finoracles/app
sudo cp deploy/nginx/finoracles.conf /etc/nginx/sites-available/finoracles.conf
sudo sed -i -e 's/REDIRECT_HOST/www.example.com/g' -e 's/CANONICAL_HOST/example.com/g' \
  /etc/nginx/sites-available/finoracles.conf          # use YOUR two hosts
grep -n 'CANONICAL_HOST\|REDIRECT_HOST' /etc/nginx/sites-available/finoracles.conf   # must print nothing
sudo ln -sf /etc/nginx/sites-available/finoracles.conf /etc/nginx/sites-enabled/finoracles.conf
sudo rm -f /etc/nginx/sites-enabled/default        # finoracles.conf has its own default_server
sudo install -D -m 644 deploy/systemd/nginx-restart.conf /etc/systemd/system/nginx.service.d/restart.conf
sudo systemctl daemon-reload
sudo nginx -t && sudo systemctl reload nginx
```

A manually issued certificate **cannot renew by itself**. Right after the DNS switch (section 5,
step 6) switch it to automatic HTTP-01 renewal:

```bash
sudo certbot certonly --webroot -w /var/www/letsencrypt --cert-name finoracles \
  -d CANONICAL_HOST -d REDIRECT_HOST --force-renewal
sudo certbot renew --dry-run                       # must succeed
grep authenticator /etc/letsencrypt/renewal/finoracles.conf   # authenticator = webroot
```

Then delete the two `_acme-challenge` TXT records.

### Path B (fallback): HTTP-01 after the DNS switch

Simpler, but visitors who already resolve to the VPS get no HTTPS for the few minutes until the
certificate exists.

```bash
sudo mkdir -p /var/www/letsencrypt
sudo cp deploy/nginx/finoracles-bootstrap.conf /etc/nginx/sites-available/finoracles.conf
sudo sed -i -e 's/REDIRECT_HOST/www.example.com/g' -e 's/CANONICAL_HOST/example.com/g' /etc/nginx/sites-available/finoracles.conf
sudo ln -sf /etc/nginx/sites-available/finoracles.conf /etc/nginx/sites-enabled/finoracles.conf
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
# switch DNS (section 5), wait until `dig +short A CANONICAL_HOST @8.8.8.8` shows VPS_IP, then:
sudo certbot certonly --webroot -w /var/www/letsencrypt --cert-name finoracles \
  -d CANONICAL_HOST -d REDIRECT_HOST -m YOUR_EMAIL --agree-tos --no-eff-email
# then install finoracles.conf exactly as in Path A
```

### Renewal

`certbot.timer` (installed with certbot) renews automatically. Reload Nginx after each renewal:

```bash
printf '#!/bin/sh\nsystemctl reload nginx\n' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
systemctl list-timers certbot.timer
```

## 5. Go live without downtime

| When | Step |
| --- | --- |
| T-48 h | 1. If `@`/`www` records already exist, lower their TTL to 300 s and wait at least the *old* TTL. |
| T-24 h | 2. VPS running and content reviewed ([DEPLOY-VPS.md](DEPLOY-VPS.md) steps 1–4). Certificate via Path A, `finoracles.conf` installed. |
| | 3. `bash deploy/scripts/check-domain.sh --pre-dns` passes (section 9). Browser test via hosts file: `VPS_IP CANONICAL_HOST REDIRECT_HOST` in `C:\Windows\System32\drivers\etc\hosts` — full HTTPS test including `/admin` login, edit, upload, preview, contact form. Remove the hosts entry afterwards. |
| T0 | 4. `check-domain.sh --pre-dns` again. |
| | 5. Change the DNS records (section 2). The VPS already has a valid certificate, so visitors who reach it get HTTPS immediately. |
| T0 + minutes | 6. When `dig +short A CANONICAL_HOST @8.8.8.8` and `@1.1.1.1` return `VPS_IP`: run `check-domain.sh` (without `--pre-dns`), switch renewal to webroot (Path A), delete the `_acme-challenge` TXT records. |
| T+1 week | 7. Raise TTLs to 3600; raise HSTS to `max-age=31536000` in `finoracles.conf`, `nginx -t`, reload. |

**Rollback:** put the recorded old `@`/`www` values back (if there were any). With TTL 300 visitors
return to the previous host within about 5 minutes.

**Cloudflare:** if the domain is proxied through Cloudflare, keep the records "DNS only" (grey
cloud) until step 6. If you then enable the proxy, set SSL/TLS mode to **Full (strict)** and
uncomment the `real_ip` lines in `finoracles.conf`.

## 6. Reverse-proxy headers (what `finoracles.conf` sends to the app)

| Header | Value | Why |
| --- | --- | --- |
| `Host`, `X-Forwarded-Host` | `$host` (always `CANONICAL_HOST`) | Next.js Server Actions (contact form) compare the browser `Origin` with these |
| `X-Forwarded-Proto` / `-Port` | `https` / `443` | the app knows the request was HTTPS |
| `X-Forwarded-For`, `X-Real-IP` | `$remote_addr` (client values discarded) | the enquiry rate limiter reads the last `X-Forwarded-For` entry; spoofing is impossible |
| `Proxy` | empty | httpoxy mitigation |
| `Connection` | empty | keep-alive to the app |

Also in `finoracles.conf`: TLS 1.2/1.3 only, session tickets off, HSTS, `server_tokens off`,
25 MB upload limit, login rate limit (10/min per IP), and a `default_server` that refuses the bare IP
and unknown host names (444 on HTTP, handshake rejected on HTTPS). The app itself already sends
`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN` and `Permissions-Policy`
(`next.config.ts`); Nginx does not duplicate them. A Content-Security-Policy is deliberately not
added: it would need testing against the admin panel and live preview.

## 7. Cookies and authentication (checked; no code change)

From `src/collections/Users.ts` and `src/payload.config.ts`:

| Setting | Value | Effect on the VPS |
| --- | --- | --- |
| Login cookie | `payload-token`, HttpOnly, SameSite=Lax, host-only (no Domain) | unchanged; valid only on `CANONICAL_HOST` |
| `Secure` flag | not set by Payload's defaults | **added by Nginx** (`proxy_cookie_flags ~ secure`) on every cookie the app sets |
| Session length | `tokenExpiration` 8 h | unchanged |
| Lockout | 5 failed logins → 10 min lock | unchanged; plus Nginx rate limit on `/api/users/login` |
| Token signing | `PAYLOAD_SECRET` | generated once; changing it later logs everyone out |
| Draft preview | `/preview` requires a logged-in CMS user; Next.js draft cookie | gets `Secure` from Nginx too |

Because the cookie is now `Secure`, admin login works only over HTTPS — which is why the browser
test in section 5 uses the real certificate (Path A), not plain HTTP.

## 8. CORS and allowed origins (checked; no change needed)

`src/payload.config.ts` sets `cors: [serverURL]` and `csrf: [serverURL]`, where `serverURL` is
`NEXT_PUBLIC_SERVER_URL`. So:

- only `https://CANONICAL_HOST` may call `/api/*` cross-origin, and cookie-authenticated API calls
  are accepted only from that origin;
- the admin panel, site and API share one origin, so no other origin is needed;
- `REDIRECT_HOST` never reaches the app (Nginx redirects it), so it needs no entry;
- GraphQL is disabled.

Add origins only if a *different* domain must call the API in future — then extend `cors`, not Nginx.

## 9. Validation

On the VPS (or any Linux/macOS/Git Bash machine with curl and openssl):

```bash
cd /srv/finoracles/app
export CANONICAL_HOST=example.com REDIRECT_HOST=www.example.com VPS_IP=203.0.113.10
bash deploy/scripts/check-domain.sh --pre-dns        # before the DNS switch
bash deploy/scripts/check-domain.sh                  # after the DNS switch
ADMIN_EMAIL=you@example.com bash deploy/scripts/check-domain.sh   # also checks the login cookie
```

It checks: DNS A/AAAA/CAA, the four redirect cases (one 301 hop, path and query kept), certificate
chain, names and expiry, `/healthz`, HSTS and the app's security headers, no version or
`X-Powered-By` leak, refusal of the bare IP and unknown hosts, every page and every sitemap URL
returning 200, sitemap/robots/canonical on
`https://CANONICAL_HOST`, CORS refusing foreign origins, and optionally the cookie flags. Exit code
0 means everything passed.

Manual checks:

```bash
sudo nginx -t
sudo certbot certificates                       # finoracles: both names, expiry date
sudo certbot renew --dry-run
curl -sI http://CANONICAL_HOST/blog?x=1        # 301 -> https://CANONICAL_HOST/blog?x=1
curl -sI https://REDIRECT_HOST/                # 301 -> https://CANONICAL_HOST/
sudo tail -f /var/log/nginx/finoracles.error.log
```

External: <https://www.ssllabs.com/ssltest/> on `CANONICAL_HOST` (expect A or A+ once HSTS is raised),
and Google Search Console → URL inspection / sitemap resubmission (same URLs, no action normally needed).
