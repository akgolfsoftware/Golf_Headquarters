# CoachHQ — Talent-kohort (side)

**Rute:** `/admin/talent/kohort`.

## Kontekst
Anders har grupper av spillere født samme år (kohort). Vil se hvordan en kohort utvikler seg sammenlignet med tidligere kohorter eller nasjonalt snitt.

## Formål
- Kohort-analyse over tid
- Identifisere når kohorten "stagnerer"
- Benchmark mot historiske kohorter

## Layout

**Header:**
- "Talent · Kohort 2010" Inter Tight 700 28px
- "8 spillere · alder 15-16 · aktiv siden 2022" mono
- Kohort-velger dropdown

**Kohort-stat-strip (4 KPI):**
- Snitt-hcp 8.4
- Snitt-utvikling siste år: −2.3
- Topp 3: hcp 4.2, 5.1, 6.8 (lime pill)
- Bunn 3: hcp 12.4, 13.1, 14.8

**Linjegraf hcp-utvikling:**
8 linjer (en per spiller) over 4 år. Hovedlinje = kohort-snitt (forest tykk).
Sammenligningslinje: "Kohort 2008" (forest stiplet) på samme alder.

**Spiller-rad-tabell:**
Hver kohort-spiller med:
- Avatar + navn
- Start-hcp / nåværende / endring
- WAGR-rank
- Aktiv? badge
- "Åpne radar"-link

**Insights:**
"Markus er 18 mnd foran kohorten på samme alder." (lime-card)
"Sofie har stagnert 6 mnd — anbefal sportspsykolog." (forest-card)

## Branding
Cream bg, hvit graf-bakgrunn, lime forrest-linjer.
