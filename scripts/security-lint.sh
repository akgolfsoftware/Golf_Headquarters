#!/usr/bin/env bash
# security-lint.sh — statisk sikkerhets-sjekk for akgolf-hq
#
# Kjøres lokalt:  bash scripts/security-lint.sh
# Kjøres i CI:    se .github/workflows/security-lint.yml
#
# Avslutter med kode 1 hvis NOEN kritisk sjekk feiler.

set -euo pipefail

SRC="src"
ERRORS=0

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
warn()  { printf '\033[33m%s\033[0m\n' "$*"; }

fail() {
  red "FEIL: $1"
  ERRORS=$((ERRORS + 1))
}

pass() {
  green "OK:   $1"
}

echo ""
echo "=== AK Golf HQ — Security Lint ==="
echo ""

# ---------------------------------------------------------------------------
# 1. Dobbel as-unknown-cast (as unknown as X) utenom legitime unntak
#
# Godkjente unntak:
#   - InvoiceWebhookCompat         — Stripe v22 legacy webhook-felt (eksplisitt dokumentert)
#   - Prisma.InputJson*            — Prisma JSON-felt trenger cast til JsonValue-typer
#   - globalForPrisma              — Prisma singleton-pattern (Next.js cache)
#   - generated/                   — autogenerert kode (Prisma client internals)
#   - __tests__ / .test. / .spec.  — test-filer
#   - caddie/                      — AI SDK tool-typer uten eksakt TS-support
#   - turneringer/sync.ts           — Prisma JSON stats-felt
#   - transcribe.ts                — tredjeparts Whisper-SDK respons
#   - notion/                      — Notion SDK respons-typer
#   - ai-plan/json-schemas.ts      — legacy-kommentar
# ---------------------------------------------------------------------------
DOUBLE_CAST=$(grep -rn "as unknown as" "$SRC" \
  --include="*.ts" --include="*.tsx" \
  | grep -v \
    -e "InvoiceWebhookCompat" \
    -e "Prisma\.InputJson" \
    -e "as unknown as object\b" \
    -e "as unknown as object\[\]" \
    -e "globalForPrisma" \
    -e "generated/" \
    -e "__tests__\|\.test\.\|\.spec\." \
    -e "caddie/" \
    -e "turneringer/sync" \
    -e "transcribe\.ts" \
    -e "notion/" \
    -e "ai-plan/json-schemas" \
    | wc -l | tr -d ' ' || true)

if [ "$DOUBLE_CAST" -gt 0 ]; then
  fail "Fant $DOUBLE_CAST forekomst(er) av 'as unknown as' utenom godkjente unntak:"
  grep -rn "as unknown as" "$SRC" \
    --include="*.ts" --include="*.tsx" \
    | grep -v \
      -e "InvoiceWebhookCompat" \
      -e "Prisma\.InputJson" \
      -e "as unknown as object\b" \
      -e "as unknown as object\[\]" \
      -e "globalForPrisma" \
      -e "generated/" \
      -e "__tests__\|\.test\.\|\.spec\." \
      -e "caddie/" \
      -e "turneringer/sync" \
      -e "transcribe\.ts" \
      -e "notion/" \
      -e "ai-plan/json-schemas"
else
  pass "Ingen ulovlige dobbel-cast (as unknown as)"
fi

# ---------------------------------------------------------------------------
# 2. javascript: i href-attributter (XSS via URL-injeksjon)
#    data: er tillatt KUN for blob/download-mønstret (audit-log eksport).
# ---------------------------------------------------------------------------
UNSAFE_HREF=$(grep -rn 'href=.\{0,30\}javascript:' "$SRC" \
  --include="*.tsx" --include="*.ts" \
  | wc -l | tr -d ' ' || true)

if [ "$UNSAFE_HREF" -gt 0 ]; then
  fail "Fant $UNSAFE_HREF usikre href-verdier (javascript:):"
  grep -rn 'href=.\{0,30\}javascript:' "$SRC" \
    --include="*.tsx" --include="*.ts"
else
  pass "Ingen javascript:-href-verdier"
fi

# ---------------------------------------------------------------------------
# 3. DB-originerte URL-felt brukt direkte i href uten safeUrl()
#    Matcher spesifikt felt-navn som vanligvis hentes fra Prisma-queries:
#    .videoUrl, .externalUrl, .body (linkformat), .htmlUrl
#    IKKE nav-config-felt (.href, .url i hardkodede arrays).
# ---------------------------------------------------------------------------
UNSAFE_DB_HREF=$(grep -rn 'href={\w\+\.\(videoUrl\|externalUrl\|htmlUrl\)}' "$SRC" \
  --include="*.tsx" \
  | grep -v "safeUrl" \
  | wc -l | tr -d ' ' || true)

if [ "$UNSAFE_DB_HREF" -gt 0 ]; then
  fail "Fant $UNSAFE_DB_HREF DB-URL-felt brukt direkte i href uten safeUrl():"
  grep -rn 'href={\w\+\.\(videoUrl\|externalUrl\|htmlUrl\)}' "$SRC" \
    --include="*.tsx" | grep -v "safeUrl"
else
  pass "Alle DB-URL-felt (videoUrl/externalUrl/htmlUrl) bruker safeUrl()"
fi

# ---------------------------------------------------------------------------
# 4. import "server-only" mangler i kritiske lib-filer (ikke "use server"-filer)
# ---------------------------------------------------------------------------
CRITICAL_SERVER_FILES=(
  "src/lib/supabase/admin.ts"
  "src/lib/payments/record.ts"
  "src/lib/audit.ts"
)

for f in "${CRITICAL_SERVER_FILES[@]}"; do
  if [ -f "$f" ]; then
    if grep -q 'import "server-only"' "$f"; then
      pass "server-only: $f"
    else
      fail "Mangler 'import \"server-only\"' i $f"
    fi
  else
    warn "Hopper over (ikke funnet): $f"
  fi
done

# ---------------------------------------------------------------------------
# 5. E-post-enumeration: avslørende feilmeldinger
# ---------------------------------------------------------------------------
ENUM_MSGS=$(grep -rn \
  -e '"En bruker med denne e-posten finnes allerede' \
  -e '"E-post er allerede i bruk"' \
  -e '"Bruker med denne e-posten eksisterer' \
  "$SRC" --include="*.ts" \
  | wc -l | tr -d ' ' || true)

if [ "$ENUM_MSGS" -gt 0 ]; then
  fail "Fant $ENUM_MSGS avslørende e-post-enumeration-meldinger:"
  grep -rn \
    -e '"En bruker med denne e-posten finnes allerede' \
    -e '"E-post er allerede i bruk"' \
    -e '"Bruker med denne e-posten eksisterer' \
    "$SRC" --include="*.ts"
else
  pass "Ingen avslørende e-post-enumeration-meldinger"
fi

# ---------------------------------------------------------------------------
# 6. Hemmeligheter direkte i kode — mistenkte mønstre
#    Unntak: test-filer, demo-sider, sk_test_dummy (enhetstester)
# ---------------------------------------------------------------------------
HARDCODED_SECRETS=$(grep -rn \
  -e 'sk_live_[a-zA-Z0-9]' \
  -e 'rk_live_[a-zA-Z0-9]' \
  -e 'whsec_[a-zA-Z0-9]' \
  "$SRC" --include="*.ts" --include="*.tsx" \
  | grep -v \
    -e '__tests__\|\.test\.\|\.spec\.' \
    -e 'settings-api-demo' \
    -e 'sk_test_dummy' \
    -e 'whsec_test_secret\|whsec_wrong_secret' \
    | wc -l | tr -d ' ' || true)

if [ "$HARDCODED_SECRETS" -gt 0 ]; then
  fail "Mulige hardkodede live-hemmeligheter funnet — sjekk manuelt:"
  grep -rn \
    -e 'sk_live_[a-zA-Z0-9]' \
    -e 'rk_live_[a-zA-Z0-9]' \
    -e 'whsec_[a-zA-Z0-9]' \
    "$SRC" --include="*.ts" --include="*.tsx" \
    | grep -v \
      -e '__tests__\|\.test\.\|\.spec\.' \
      -e 'settings-api-demo' \
      -e 'sk_test_dummy' \
      -e 'whsec_test_secret\|whsec_wrong_secret'
else
  pass "Ingen hardkodede live-hemmeligheter funnet"
fi

# ---------------------------------------------------------------------------
# 7. console.log med PII-felt — advarsel (ikke feil)
# ---------------------------------------------------------------------------
CONSOLE_PII=$(grep -rn 'console\.log.*email\|console\.log.*token\|console\.log.*password' \
  "$SRC" --include="*.ts" --include="*.tsx" \
  | grep -v '__tests__\|\.test\.\|\.spec\.' \
  | wc -l | tr -d ' ' || true)

if [ "$CONSOLE_PII" -gt 0 ]; then
  warn "Advarsel: $CONSOLE_PII console.log-kall som kan logge PII (ikke feil — sjekk manuelt)"
fi

# ---------------------------------------------------------------------------
# Oppsummering
# ---------------------------------------------------------------------------
echo ""
if [ "$ERRORS" -eq 0 ]; then
  green "=== Alle security-sjekker bestått ==="
else
  red "=== $ERRORS security-sjekk(er) FEILET ==="
  exit 1
fi
