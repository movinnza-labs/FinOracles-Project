#!/usr/bin/env bash
# FinOracles domain / HTTPS / security validation. Read-only: only GET/HEAD/OPTIONS requests, plus an
# optional single admin login + logout to inspect the auth cookie.
#
#   CANONICAL_HOST=example.com REDIRECT_HOST=www.example.com VPS_IP=203.0.113.10 \
#     bash deploy/scripts/check-domain.sh --pre-dns     # before the DNS switch: talks to VPS_IP directly
#   CANONICAL_HOST=... REDIRECT_HOST=... VPS_IP=... \
#     bash deploy/scripts/check-domain.sh               # after the switch: also checks public DNS
#
# Optional:
#   ADMIN_EMAIL=you@example.com   also log in once (password prompted, hidden) to check
#                                 the payload-token cookie flags, then log out
# Needs: curl, openssl; dig (dnsutils) optional. Runs on the VPS, Linux, macOS or Git Bash.
set -uo pipefail

: "${CANONICAL_HOST:?set CANONICAL_HOST (e.g. example.com)}"
: "${REDIRECT_HOST:?set REDIRECT_HOST (e.g. www.example.com)}"
: "${VPS_IP:?set VPS_IP (the VPS public IPv4)}"
PRE_DNS=0; [ "${1:-}" = "--pre-dns" ] && PRE_DNS=1
BASE="https://$CANONICAL_HOST"

pass=0; fail=0; warn=0
ok()   { echo "PASS  $*"; pass=$((pass + 1)); }
bad()  { echo "FAIL  $*"; fail=$((fail + 1)); }
note() { echo "WARN  $*"; warn=$((warn + 1)); }
section() { echo; echo "== $*"; }

# Before DNS changes, pin both host names to the VPS for every request.
R=()
if [ "$PRE_DNS" = 1 ]; then
  for h in "$CANONICAL_HOST" "$REDIRECT_HOST"; do R+=(--resolve "$h:80:$VPS_IP" --resolve "$h:443:$VPS_IP"); done
fi
c() { curl -sS --max-time 20 ${R[@]+"${R[@]}"} "$@"; }

# ── DNS ─────────────────────────────────────────────────────────────────────
section "DNS"
if [ "$PRE_DNS" = 1 ]; then
  note "DNS not checked (--pre-dns); requests are pinned to $VPS_IP"
else
  resolve_a() {
    if command -v dig > /dev/null; then dig +short A "$1" @1.1.1.1 | grep -E '^[0-9.]+$'
    else getent ahostsv4 "$1" 2> /dev/null | awk '{print $1}' | sort -u; fi
  }
  for h in "$CANONICAL_HOST" "$REDIRECT_HOST"; do
    a="$(resolve_a "$h" | tr '\n' ' ' | sed 's/ $//')"
    if [ "$a" = "$VPS_IP" ]; then ok "$h A -> $a"
    else bad "$h A -> '${a:-none}' (expected only $VPS_IP; wait for propagation or fix the record)"; fi
    if command -v dig > /dev/null; then
      aaaa="$(dig +short AAAA "$h" @1.1.1.1 | tr '\n' ' ')"
      [ -z "$aaaa" ] || note "$h has AAAA $aaaa — it must be the VPS IPv6, or remove it"
    fi
  done
  if command -v dig > /dev/null; then
    caa="$(dig +short CAA "${CANONICAL_HOST#www.}" @1.1.1.1)"
    if [ -n "$caa" ] && ! grep -q letsencrypt.org <<< "$caa"; then
      bad "CAA records exist but do not allow letsencrypt.org: $caa"
    fi
  fi
fi

# ── Redirects ───────────────────────────────────────────────────────────────
section "Redirects (one hop to $BASE, path and query preserved)"
check_redirect() {
  local url="$1" expect="$2" out
  out="$(c -o /dev/null -w '%{http_code} %{redirect_url}' "$url" 2>&1)" || { bad "$url: request failed: $out"; return; }
  if [ "$out" = "301 $expect" ]; then ok "$url -> 301 $expect"; else bad "$url -> '$out' (expected 301 $expect)"; fi
}
check_redirect "http://$CANONICAL_HOST/about?check=1" "$BASE/about?check=1"
check_redirect "http://$REDIRECT_HOST/about?check=1"  "$BASE/about?check=1"
check_redirect "https://$REDIRECT_HOST/about?check=1" "$BASE/about?check=1"
check_redirect "http://$CANONICAL_HOST/"              "$BASE/"

# ── Certificate ─────────────────────────────────────────────────────────────
section "Certificate"
cert="$(echo | openssl s_client -connect "$VPS_IP:443" -servername "$CANONICAL_HOST" 2> /dev/null)"
if [ -z "$cert" ]; then
  bad "no TLS answer from $VPS_IP:443 for $CANONICAL_HOST"
else
  pem="$(sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' <<< "$cert" | sed '/-----END CERTIFICATE-----/q')"
  if grep -q 'Verify return code: 0 ' <<< "$cert"; then ok "chain verifies"; else note "openssl could not verify the chain locally ($(grep -o 'Verify return code: .*' <<< "$cert")); curl results below are authoritative"; fi
  san="$(openssl x509 -noout -ext subjectAltName <<< "$pem" 2> /dev/null | tail -n +2)"
  for h in "$CANONICAL_HOST" "$REDIRECT_HOST"; do
    if grep -q "DNS:$h\(,\|$\)" <<< "$san"; then ok "certificate covers $h"; else bad "certificate does not cover $h (SAN: $san)"; fi
  done
  echo "      issuer: $(openssl x509 -noout -issuer <<< "$pem" | sed 's/^issuer=//')"
  echo "      expires: $(openssl x509 -noout -enddate <<< "$pem" | cut -d= -f2)"
  if openssl x509 -noout -checkend $((20 * 86400)) <<< "$pem" > /dev/null; then ok "valid for 20+ days"; else bad "expires within 20 days — check certbot renew"; fi
fi

# ── Site, health, headers ───────────────────────────────────────────────────
section "Site and headers"
body="$(c "$BASE/healthz" -w '\n%{http_code}' 2>&1)"
if [ "$(tail -n 1 <<< "$body")" = 200 ] && grep -q '"ok"' <<< "$body"; then ok "/healthz 200 ok (app + database)"; else bad "/healthz -> $(tr '\n' ' ' <<< "$body")"; fi

hdr="$(c -o /dev/null -D - "$BASE/" 2>&1)"
grep -qi '^strict-transport-security:' <<< "$hdr" && ok "HSTS header present" || bad "HSTS header missing"
grep -qi '^x-content-type-options: nosniff' <<< "$hdr" && ok "app security headers present (nosniff)" || bad "X-Content-Type-Options missing"
grep -qi '^x-frame-options: SAMEORIGIN' <<< "$hdr" && ok "X-Frame-Options SAMEORIGIN" || bad "X-Frame-Options missing"
grep -qi '^x-powered-by:' <<< "$hdr" && bad "X-Powered-By is exposed" || ok "no X-Powered-By"
if grep -i '^server:' <<< "$hdr" | grep -q '[0-9]'; then bad "Server header exposes a version"; else ok "Server header has no version"; fi

# ── Catch-all (IP / unknown host) ───────────────────────────────────────────
section "Unknown hosts are refused"
curl -sS --max-time 10 -o /dev/null -H 'Host: unknown.invalid' "http://$VPS_IP/" > /dev/null 2>&1
[ $? -eq 52 ] && ok "http://$VPS_IP/ with unknown Host: connection closed (444)" || bad "http://$VPS_IP/ with unknown Host was answered"
if curl -sS --max-time 10 -k -o /dev/null "https://$VPS_IP/" > /dev/null 2>&1; then
  bad "https://$VPS_IP/ (no SNI) was answered"
else ok "https://$VPS_IP/ (no SNI): TLS handshake rejected"; fi

# ── Existing URLs ───────────────────────────────────────────────────────────
section "Existing URLs"
sitemap_source="$BASE/sitemap.xml"
sm="$(c "$sitemap_source")"
locs="$(grep -o '<loc>[^<]*</loc>' <<< "$sm" | sed -e 's#<loc>##' -e 's#</loc>##')"
n="$(grep -c . <<< "$locs")"
echo "      $n URLs in $sitemap_source"
foreign="$(grep -v "^https://$CANONICAL_HOST\(/\|$\)" <<< "$locs" | grep . | head -n 3)"
[ -z "$foreign" ] && ok "every sitemap URL uses https://$CANONICAL_HOST" || bad "sitemap has URLs on another host, e.g. $foreign (check NEXT_PUBLIC_SERVER_URL)"

paths="$( (echo /; echo /about; echo /products; echo /services; echo /tools; echo /blog; echo /contact; echo /login; \
  echo /sitemap.xml; echo /robots.txt; echo /admin/login; sed -e 's#^https\?://[^/]*##' -e 's#^$#/#' <<< "$locs") | grep . | sort -u)"
failed_paths=0
while IFS= read -r p; do
  code="$(c -o /dev/null -w '%{http_code}' "$BASE$p" 2> /dev/null)"
  if [ "$code" != 200 ]; then
    bad "$p -> $code"
    failed_paths=$((failed_paths + 1))
  fi
done <<< "$paths"
[ "$failed_paths" = 0 ] && ok "all $(grep -c . <<< "$paths") URLs return 200"

canon="$(c "$BASE/" | grep -o '<link rel="canonical" href="[^"]*"' | head -n 1 | sed 's/.*href="//; s/"$//')"
case "$canon" in
  "$BASE"|"$BASE/") ok "homepage canonical tag: $canon" ;;
  "") note "no canonical tag found on the homepage (check SEO settings)" ;;
  *) bad "homepage canonical tag is $canon (expected $BASE)" ;;
esac
robots="$(c "$BASE/robots.txt")"
grep -q "^Sitemap: $BASE/sitemap.xml" <<< "$robots" && ok "robots.txt points to $BASE/sitemap.xml" || bad "robots.txt sitemap line: $(grep -i sitemap <<< "$robots")"

# ── CORS ────────────────────────────────────────────────────────────────────
section "CORS (only $BASE allowed)"
evil="$(c -o /dev/null -D - -X OPTIONS -H 'Origin: https://evil.example' -H 'Access-Control-Request-Method: GET' "$BASE/api/users" 2>&1 | grep -i '^access-control-allow-origin:' | tr -d '\r')"
if grep -qiE 'evil\.example|\*' <<< "$evil"; then bad "foreign origin allowed: $evil"; else ok "foreign origin not allowed"; fi
own="$(c -o /dev/null -D - -X OPTIONS -H "Origin: $BASE" -H 'Access-Control-Request-Method: GET' "$BASE/api/users" 2>&1 | grep -i '^access-control-allow-origin:' | tr -d '\r')"
grep -qi "$BASE" <<< "$own" && ok "own origin allowed" || note "own origin not echoed in CORS preflight ($own); same-origin requests do not need it"

# ── Auth cookie (optional) ──────────────────────────────────────────────────
section "Auth cookie"
if [ -n "${ADMIN_EMAIL:-}" ]; then
  read -r -s -p "      password for $ADMIN_EMAIL (hidden; one login attempt): " ADMIN_PASSWORD; echo
  json="$(printf '{"email":"%s","password":"%s"}' "$ADMIN_EMAIL" "$(sed 's/\\/\\\\/g; s/"/\\"/g' <<< "$ADMIN_PASSWORD")")"
  unset ADMIN_PASSWORD
  lh="$(c -o /dev/null -D - -X POST -H 'Content-Type: application/json' -H "Origin: $BASE" --data "$json" "$BASE/api/users/login" 2>&1)"
  unset json
  ck="$(grep -i '^set-cookie: payload-token=' <<< "$lh" | head -n 1 | tr -d '\r')"
  if [ -z "$ck" ]; then
    bad "login did not set payload-token (status: $(head -n 1 <<< "$lh" | tr -d '\r'))"
  else
    for flag in Secure HttpOnly 'SameSite=Lax'; do
      grep -qi "; *$flag" <<< "$ck" && ok "payload-token has $flag" || bad "payload-token lacks $flag"
    done
    grep -qi '; *Domain=' <<< "$ck" && note "cookie has a Domain attribute (shared with subdomains)" || ok "cookie is host-only"
    token="$(sed -E 's/^[Ss]et-[Cc]ookie: payload-token=([^;]*).*/\1/' <<< "$ck")"
    c -o /dev/null -X POST -H "Origin: $BASE" -H "Cookie: payload-token=$token" "$BASE/api/users/logout" && echo "      logged out"
    unset token
  fi
else
  note "skipped (set ADMIN_EMAIL to check the login cookie flags)"
fi

echo
echo "Result: $pass passed, $fail failed, $warn warnings"
[ "$fail" = 0 ]
