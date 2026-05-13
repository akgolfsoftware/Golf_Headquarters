#!/usr/bin/env bash
# QA — verifiser at alle prod-ruter svarer (200 eller 307 redirect)
# Bruk: ./scripts/qa-links.sh [BASE_URL]  (default: http://localhost:3000)

BASE="${1:-http://localhost:3000}"
echo "== QA-lenkesjekk mot $BASE =="
echo ""

# Marketing (offentlige)
MARKETING_RUTER=(
  "/"
  "/coaching"
  "/treningsfilosofi"
  "/playerhq"
  "/om-oss"
  "/personvern"
  "/vilkar"
  "/booking"
  "/booking?lokasjon=gfgk"
  "/booking?lokasjon=gfgk&trener=alle"
)

# Portal (krever auth, forventer 307 til /auth/login)
PORTAL_RUTER=(
  "/portal"
  "/portal/tren"
  "/portal/tren/kalender"
  "/portal/tren/ovelser"
  "/portal/tren/tester"
  "/portal/mal"
  "/portal/mal/runder"
  "/portal/mal/baner"
  "/portal/mal/trackman"
  "/portal/mal/leaderboard"
  "/portal/coach"
  "/portal/coach/plans"
  "/portal/coach/melding"
  "/portal/coach/notes"
  "/portal/coach/ai"
  "/portal/meg"
  "/portal/meg/bookinger"
  "/portal/meg/abonnement"
  "/portal/meg/dokumenter"
  "/portal/meg/help"
  "/portal/meg/helse"
  "/portal/meg/innstillinger"
  "/portal/booking/ny"
  "/portal/ny-okt"
  "/portal/onskeligokt"
  "/portal/agent-pipeline"
)

# Admin (krever ADMIN/COACH, forventer 307)
ADMIN_RUTER=(
  "/admin"
  "/admin/brief"
  "/admin/calendar"
  "/admin/bookings"
  "/admin/queue"
  "/admin/approvals"
  "/admin/elever"
  "/admin/groups"
  "/admin/talent"
  "/admin/messages"
  "/admin/plans"
  "/admin/plans/templates"
  "/admin/board"
  "/admin/recording"
  "/admin/services"
  "/admin/facilities"
  "/admin/locations"
  "/admin/availability"
  "/admin/tournaments"
  "/admin/analytics"
  "/admin/reports"
  "/admin/finance"
  "/admin/audit"
  "/admin/agents"
  "/admin/email-templates"
  "/admin/team"
  "/admin/settings"
)

# Auth
AUTH_RUTER=(
  "/auth/login"
  "/auth/signup"
  "/auth/forgot-password"
  "/auth/onboarding"
)

OK=0
WARN=0
FAIL=0

sjekk() {
  local rute="$1"
  local forventet="$2"
  local code=$(curl -s -o /dev/null -w "%{http_code}" "${BASE}${rute}")
  local status="?"
  if [ "$code" = "200" ] || [ "$code" = "$forventet" ]; then
    status="✓"
    OK=$((OK+1))
  elif [ "$code" = "307" ] && [ "$forventet" = "307" ]; then
    status="✓"
    OK=$((OK+1))
  elif [ "$code" = "404" ]; then
    status="✗ 404"
    FAIL=$((FAIL+1))
  elif [ "$code" = "500" ]; then
    status="✗ 500"
    FAIL=$((FAIL+1))
  else
    status="⚠ $code"
    WARN=$((WARN+1))
  fi
  printf "  %-50s [%s]\n" "$rute" "$status"
}

echo "-- Marketing (forventer 200) --"
for r in "${MARKETING_RUTER[@]}"; do sjekk "$r" "200"; done

echo ""
echo "-- Portal (forventer 307 redirect) --"
for r in "${PORTAL_RUTER[@]}"; do sjekk "$r" "307"; done

echo ""
echo "-- Admin (forventer 307 redirect) --"
for r in "${ADMIN_RUTER[@]}"; do sjekk "$r" "307"; done

echo ""
echo "-- Auth (forventer 200) --"
for r in "${AUTH_RUTER[@]}"; do sjekk "$r" "200"; done

echo ""
echo "== Resultat: $OK OK · $WARN advarsler · $FAIL feilende =="
exit $FAIL
