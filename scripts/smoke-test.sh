#!/usr/bin/env bash
# Smoke-test for AK Golf HQ produksjon.
# Bruk: bash scripts/smoke-test.sh   (eller: BASE=https://akgolf.no bash scripts/smoke-test.sh)
set -u

BASE="${BASE:-https://akgolf.no}"
fail=0

check() {
  local forventet="$1" sti="$2" beskrivelse="$3"
  local kode
  kode="$(curl -s -o /dev/null -w '%{http_code}' "${BASE}${sti}")"
  if [ "$kode" = "$forventet" ]; then
    printf '  \033[32mPASS\033[0m  %-28s %s (%s)\n' "$sti" "$beskrivelse" "$kode"
  else
    printf '  \033[31mFAIL\033[0m  %-28s %s (fikk %s, ventet %s)\n' "$sti" "$beskrivelse" "$kode" "$forventet"
    fail=1
  fi
}

echo "Smoke-test mot ${BASE}"
echo ""
echo "Offentlige ruter (forventer 200):"
for r in / /stats /turneringer /booking /priser /coaching /om-oss /auth/login /auth/signup /robots.txt /sitemap.xml /manifest.webmanifest; do
  check 200 "$r" "offentlig"
done

echo ""
echo "Gated ruter (forventer 307 → login):"
check 307 /portal "spillerportal"
check 307 /admin "coach-admin"
check 307 /intern "intern"
check 307 /hull-demo "demo gated"

echo ""
echo "API / infrastruktur:"
check 405 /api/stripe/webhook "stripe webhook (GET avvist)"

echo ""
echo "www-redirect (skal IKKE gå til Acuity):"
www="$(curl -s -o /dev/null -w '%{redirect_url}' https://www.akgolf.no/)"
if echo "$www" | grep -qi "as.me\|acuity"; then
  printf '  \033[31mFAIL\033[0m  www.akgolf.no peker fortsatt til Acuity: %s\n' "$www"
  fail=1
elif echo "$www" | grep -qi "akgolf.no"; then
  printf '  \033[32mPASS\033[0m  www.akgolf.no → %s\n' "$www"
else
  printf '  \033[33mNB\033[0m    www.akgolf.no → %s\n' "${www:-(ingen redirect)}"
fi

echo ""
if [ "$fail" = "0" ]; then
  echo -e "\033[32mAlle sjekker passerte.\033[0m"
else
  echo -e "\033[31mNoen sjekker feilet — se over.\033[0m"
fi
exit "$fail"
