# CoachHQ — Analyse stall (side)

**Rute:** `/admin/analyse` (også `/admin/analytics`).

## Kontekst
Anders vil se hele stallen samlet — SG-trender, hcp-utvikling, hvor stallen som helhet gjør fremgang eller stagnerer.

## Formål
- Aggregert dashbord
- Bryt ned per team / hcp-segment
- Sammenligne tidsperioder

## Layout

**Header:**
- "Analyse · 38 spillere" Inter Tight 700 32px
- Periode-velger 30d/90d/sesong/år
- Sammenlign-toggle: "vs forrige periode" lime når aktiv

**KPI-rad (5 kort):**
- Snitt-hcp 9.4 (↓0.6)
- Aktivitet 87% (uendret)
- SG-total stall +0.3 (lime trend)
- Nye spillere siste 30d: 3
- Churn-risk-spillere: 4 (destructive light pill)

**Hoved-graf (full bredde):**
Linje-chart over SG-trend per segment (Junior, Senior, Pro). Forest, lime, accent-lila linjer. Hover viser eksakt verdi.

**Heatmap-grid (under graf):**
38 spillere × 5 KPI (Drive, Iron, Short, Putt, Mental). Hver celle fargekodet (lime grønn → forest dyp). Klikk spiller → detalj.

**Insights-card (forest light):**
AI-genererte funn:
- "Putt-utvikling sterkest 30 dager: Markus, Sofie, Emil"
- "3 spillere stagnerer på iron — vurder ny drill-plan"
- "Junior-gruppa har 12% høyere fremmøte enn senior"

**Bunn-bar:**
"Eksporter rapport" outline + "Del med team" outline

## Branding
Cream bg, hvit dashbord-card, lime/forest grafer. JetBrains Mono i alle tall.
