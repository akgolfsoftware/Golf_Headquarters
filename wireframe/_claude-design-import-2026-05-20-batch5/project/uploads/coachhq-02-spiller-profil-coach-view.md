# CoachHQ — Spiller-profil (coach-view)

**Rute:** `/admin/elever/[id]` eller `/admin/spillere/[id]`.

## Kontekst
Anders klikker Markus Røinås Pedersen fra stalllisten. Lander på coach-view av Markus' workbench — alt Markus ser pluss coach-spesifikke verktøy.

## Formål
- Full innsikt i én spillers status, plan, fremgang
- Verktøy: godkjenn økt, send melding, tildel plan, logg notat
- Sammenligne med team-snitt

## Layout

**Header (sticky):**
- Avatar 64px + navn "Markus Røinås Pedersen" Inter Tight 700 28px
- Mono small caps: "HCP 4.2 · GFGK PRO · COACH SIDEN 2023-08"
- Pille "AKTIV" lime
- Høyre: "Send melding", "Tildel plan", "Coach-notat" + MoreHorizontal

**Tab-bar:**
Oversikt (default) | Plan | Økter | Runder | Statistikk | Meldinger | Notater | Faktura

### Oversikt-tab (default)
**KPI-kort (4):**
- Hcp 4.2 (↓0.3 30d)
- Treningsvolum 14:30/uke
- SG-trend +0.4
- Energi 7.2/10

**Coach-snapshot:**
Forest-card med Anders' notat-feltet, tekstområde "Hva vil jeg jobbe med Markus med?":
Tekst Anders har skrevet: "Trenger volum på fairway-iron. Vi reduserer putt-tid neste 4 uker."

**Dagens flyt for Markus:**
Liste av hans neste 3 økter med "Godkjenn"/"Endre"-knapper per økt.

**Sammenligning med team-snitt:**
Liten radial-chart eller bar: Markus vs AK Academy-snitt på Drive, Iron, Short, Putt.

**Bunn — varsler relatert til Markus:**
"Markus har ikke logget økt på 6 dager" (warning gul)
"Skade-rapport: lett rygg-issue 18. mai" (info)

## Branding
Cream side, hvit innholdspanel, forest accents, lime trend-indikatorer. Tabular nums.
