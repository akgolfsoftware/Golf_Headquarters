# CoachHQ — Kapasitet (side)

**Rute:** `/admin/kapasitet` (også `/admin/capacity`).

## Kontekst
Anders trenger oversikt over hvor full kalenderen blir framover — kan han ta inn flere spillere? Hvor er flaskehalsen?

## Formål
- Visualisere kapasitet over neste 8 uker
- Identifisere bottlenecks
- Foreslå optimalisering

## Layout

**Header:**
- "Kapasitet" Inter Tight 700 32px
- "78% snitt utnyttelse · 6 av 38 kunne fått mer plass" mono
- Periode-velger: 4 uker | 8 uker | Sesong

**Heatmap (full bredde):**
8 uker × 14 fasiliteter grid. Hver celle viser belegg % som farge:
- 0-30% cream
- 30-60% lime-light
- 60-85% lime
- 85-100% forest
- >100% (overbooking) destructive

Hover viser: "Performance Studio bay 2 · Uke 22 · 92% belegg · 4 bookinger ledig"

**Innsikt-card (under heatmap):**
- "Flaskehals: Tirsdag kveld 16-19" forest-light card
- "Kan ta inn 4-6 nye spillere ved å spre om mandagskveldene"
- "Sesongmønster: 25% høyere belegg juli enn nå" — mini-trend-linje

**Filter:**
Per coach / per lokasjon / per tjeneste

**Forslag-bunn:**
AI-forslag: "Åpne lørdag 09-12 for bay 1" + "Aktiver"-knapp

## Branding
Cream bg, lime-til-forest heatmap, destructive for overbooking, mono i tall.
