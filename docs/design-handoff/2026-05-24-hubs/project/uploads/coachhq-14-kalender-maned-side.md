# CoachHQ — Kalender måned-visning (side)

**Rute:** `/admin/calendar/maned`.

## Kontekst
Anders vil se hele mai i ett blikk. Sjekke fordeling av belastning, finne hull.

## Formål
- Måned-view med tetthet-indikator per dag
- Klikk dag → uke-view
- Stempel for ferier, turneringer, sesong-events

## Layout

**Header:**
- "Mai 2026" Inter Tight 700 32px
- Måneds-navigasjon
- "Belastning" toggle (viser heat-map)
- "Ny økt" forest

**Måned-grid:**
- Ukenavn topp (ma-sø)
- Datoer i celler 100×120px
- Hver dag:
  - Dato stort venstre
  - Antall økter mono "12 økter"
  - 3-4 mini-blokker (fargekodet) under
  - Tetthet-indicator: vertikal stripe høyre (lime tom → forest full)
- Markert "i dag" lime ring
- Helger dempet bg

**Events-bånd:**
Hvis turnering / ferie: full-bredde-bånd over flere dager med tekst "Sørlandsåpent" lime fill.

**Sidebar:**
- Måneds-statistikk: "248 økter totalt · snitt 8/dag · høyest 18 (mandag 12. mai)"
- "Spillere uten økt denne måneden": 2 navn
- "Lag færre overlapp" AI-forslag

## Branding
Cream bg, hvit grid, lime/forest tetthet, full-bredde event-bånd.
