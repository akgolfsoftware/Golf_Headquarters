# CoachHQ — Anlegg-liste (side)

**Rute:** `/admin/anlegg` (også speil `/admin/facilities`).

## Kontekst
AK Golf har flere lokasjoner (GFGK Pro Studio, Performance Studio Fredrikstad, Bossum Range). Hver lokasjon har flere fasiliteter (bay 1-4, range A-B, putting green).

## Formål
- Liste alle anlegg/fasiliteter
- Vise belegg %, omsetning, antall bookinger
- Rediger inline

## Layout

**Header:**
- "Anlegg" Inter Tight 700 32px
- "3 lokasjoner · 14 fasiliteter · 78% belegg snitt" mono
- "Nytt anlegg" forest fill

**Lokasjon-kort (per lokasjon, full bredde):**
- Cover-strip 80px (forest gradient med navn)
- Navn "Performance Studio Fredrikstad"
- Adresse mono muted
- KPI-strip: "4 fasiliteter · 84% belegg · 312k omsetning 30d"
- Ekspander/Kollaps-pil

Når ekspandert:
- Tabell over fasiliteter i lokasjonen: bay-navn, type, kapasitet, belegg, knapp "Rediger"

**Tomtilstand:**
"Ingen anlegg registrert. Legg til første for å aktivere booking."

## Branding
Cream bg, hvite lokasjon-kort med forest gradient-strip, lime belegg-pill.
