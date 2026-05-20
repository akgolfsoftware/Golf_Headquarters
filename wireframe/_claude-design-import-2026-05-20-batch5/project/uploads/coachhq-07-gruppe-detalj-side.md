# CoachHQ — Gruppe-detalj (side)

**Rute:** `/admin/groups/[id]` / `/admin/grupper/[id]`.

## Kontekst
Anders har grupper i WANG (8 elever per gruppe). Gruppe-siden viser alle elever i en gruppe, planlagte felles-økter, gruppe-mål.

## Formål
- Sentral admin for én gruppe
- Tildele felles plan
- Sende gruppe-melding
- Vise gruppe-KPI (snitt-hcp, fremmøte, fremgang)

## Layout

**Header:**
- "WANG · Gruppe Mandag 17:00" Inter Tight 700 32px
- "8 elever · snitt hcp 12.4 · 92% fremmøte" mono
- Høyre: "Send melding", "Tildel plan", "Rediger gruppe", MoreHorizontal

**KPI-strip (4 kort):**
- Aktive elever 8/8
- Snitt hcp 12.4 (↓0.6 sesong)
- Fremmøte 92%
- Felles økter neste 7d: 3

**Elev-grid (3 kolonner):**
Hvert elev-kort:
- Avatar 56px
- Navn + hcp mono
- Sist aktiv-pille "I dag" / "2d siden"
- SG-mini-sparkline
- Hover: "Åpne profil"-link

**Felles-økt-tidslinje:**
Horisontal scroll av kommende økter. Hver økt-kort:
- Dato + tid stort i mono
- Fokusområde-pille (Putt, Iron, etc.)
- Lokasjon
- "8/8 påmeldt" eller "6/8 påmeldt"
- "Åpne økt"-link

**Gruppe-meldinger-feed:**
Siste 5 gruppemeldinger Anders har sendt. "Se alle"-link.

## Branding
Cream bg, hvite kort, lime fremmøte-pill, forest CTAs.
