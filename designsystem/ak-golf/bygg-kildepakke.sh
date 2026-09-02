#!/usr/bin/env bash
# Bygger kildepakken som lastes opp i Claude Design-prosjektet.
# Kjøres fra repo-rot: bash designsystem/ak-golf/bygg-kildepakke.sh [ut-mappe]
#
# Prompten refererer til filer designeren ellers ikke har tilgang til — uten
# denne pakken peker den i tomme luften. Opprettet 01.09.2026.
set -euo pipefail
UT="${1:-/tmp/ak-golf-kildepakke}"
rm -rf "$UT" && mkdir -p "$UT"/{logo,tokens,retningslinjer,foto,tekst}

cp public/logos/ak-golf-*.svg              "$UT/logo/"
cp designsystem/ak-golf/tokens/*.css       "$UT/tokens/"
cp designsystem/ak-golf/guidelines/*.md    "$UT/retningslinjer/"
cp designsystem/ak-golf/foto/katalog.md    "$UT/foto/"
cp docs/merkevare/ak-golf-tekstkonsept-*.md "$UT/tekst/tekstkonsept.md"
cp docs/merkevare/ak-golf-merkeplattform-*.md "$UT/tekst/merkeplattform.md"

# Bestillingen uten instruksjonshodet — kun selve prompten
awk 'f{print} /^---$/{f=1}' designsystem/ak-golf/prompt-claude-design.md \
  | awk 'NF||n{n=1;print}' > "$UT/BESTILLING.md"

# Foto nedskalert til 1600px. Krever cwebp (brew install webp).
for n in $(seq 1 44); do
  [ "$n" = "40" ] && continue          # slettet 01.09.2026
  # retusjert utgave vinner der den finnes (PUMA-logo fjernet)
  f="public/brand/foto/renset/AK-Golf-Academy-$n.jpg"
  [ -f "$f" ] || f="public/brand/foto/AK-Golf-Academy-$n.jpg"
  [ -f "$f" ] || continue
  cwebp -quiet -q 80 -resize 1600 0 "$f" -o "$UT/foto/ak-golf-$(printf %02d "$n").webp"
done

cp designsystem/ak-golf/kildepakke-les-meg.md "$UT/LES-MEG.md"
echo "Kildepakke i $UT — $(find "$UT" -type f | wc -l | tr -d ' ') filer, $(du -sh "$UT" | cut -f1)"
