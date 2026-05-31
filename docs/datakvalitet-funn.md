# Datakvalitets-funn — dyp sjekk (2026-05-31)

Tre parallelle dyp-sjekk-agenter gikk gjennom alle 343 sider (marketing, PlayerHQ,
CoachHQ) for å skille ekte Prisma-henting fra hardkodet/mock data. Hovedbilde:
**det aller meste henter ekte data.** Konkrete funn + tiltak under.

## ✅ Fikset denne runden

### P0 — offentlig fake personnavn (kredibilitet/GDPR)
- [x] **`/stats`** «Norske i aksjon» — fjernet `NORSKE_FALLBACK` (6 oppdiktede spillere). Erstattet med ekte CTA-kort + ekte DB-tall, lenker til `/stats/norske`.
- [x] **`/stats/aargang`** — fjernet hardkodede `topp3`-navn (alltid fake). Beholder ekte spiller-antall per årgang fra DB (`?? 0`, ikke hardkodet fallback).

### P1 — mock presentert som ekte
- [x] **`/portal/drills` + `/admin/drills`** — `MOCK_DRILLS` (ingen `Drill`-datamodell finnes ennå). Lagt til tydelig **«Pre-beta · demo-data»-banner** (samme ærlige mønster som `/portal/talent`).

## 🟡 Reassessert — akseptabelt for launch (ikke fake data)
- **`/portal/gjennomfore` + `/portal/coach`** hub-kort: viser «Ingen økter planlagt / kommer» — **konservative empty-state-teasere** med forklarende `sub`-tekst, ikke fabrikkerte positive tall. Navigasjons-hubs, ikke live-data-visning. OK å launche; kan wires til ekte tellinger senere (lav prio).
- **`/portal/talent`**: har allerede ærlig «PRE-BETA · demo-data»-banner.
- **`/portal/mal/leaderboard`**: feature-flagget av (`NEXT_PUBLIC_FEATURE_LEADERBOARD=false`).

## ⬜ Gjenstår — krever datamodell/beslutning (Fase D)
- **`/admin/workspace/prosjekter` + `oppgaver/[id]`**: 100% `SAMPLE_*` — internt Notion-verktøy, ingen prosjekt-datamodell. Anbefaling: bygg modell eller feature-flagg bort før bredere bruk.
- **Drills**: trenger ekte `Drill`-modell + seed for å erstatte `MOCK_DRILLS` (banner holder til da).
- **Fallback-når-DB-tom** (`/admin/bookinger`, `/admin/analyse`, `/admin/kalender`, `/portal/analyse`, `/portal/planlegge`, `/portal/talent/roadmap`): henter ekte data først, viser demo kun hvis tomt. Etablert konvensjon. Vurder empty-state i prod for de mest synlige.

## 🔴 STORT FUNN — marketing-/stats er i stor grad prototype (2026-05-31)
Dyp-sjekken undervurderte: grep-sveip fant **~15 offentlige stats-sider med 250+
hardkodede fabrikkerte spillernavn** (leaderboards 160, regions/[slug] 41,
aargang/[aar] 16, pga/spillere 15, klubber/[slug] 13, tour/[slug] 12, + ~10 pga-sider).
Offentlig fake navngitte personer = kredibilitets-/GDPR-risiko.

**Tiltak (valgt: skjul uwired sider):** `proxy.ts` redirecter i PRODUKSJON disse →
`/stats`: leaderboards, regions, klubber, pga, tour, spillere, verktoy, sok, **aargang**.
Lokalt/dev uendret. Ekte sider beholdt: `/stats` (hub), `/stats/norske`, `/stats/turneringer`.

**Pre-eksisterende bug FIKSET (2026-05-31):** `/stats/aargang` ga 500 ("Event handlers
cannot be passed to Client Component props") — årsak: et `<div>` med `onMouseEnter`/
`onMouseLeave` (JS-hover) i en server-komponent. Erstattet med CSS-hover-klasse
(`.stats-aargang-card:hover`). Hub-en re-aktivert (200). `/stats/aargang/[aar]`-detaljen
forblir redirected (fake roster + skal wires).

**PGA-sider er allerede wired (2026-05-31):** grep-en min telte feil — «navn:»-treffene
var RELATERTE kategori-labels, ikke fake spillere. PGA-sidene henter ekte DataGolf-data
via `getPgaTopN`/Prisma (1299 ekte Tour-spillere). MEN dataene er DataGolf skill-ratings:
- `sgTotal/sgOtt/sgApp/sgArg/sgPutt` = ekte + meningsfulle ✓
- `driveDist`/`fairwayPct` = relative ratings (−25…23), feilmerket som yds/% → misvisende
- `avgScore`/`girPct`/`puttsPerRound` = NULL → tomme sider

**Re-aktivert:** `/stats/pga` (hub) + `/stats/pga/sg-total` (ekte SG av ekte spillere).
**Fortsatt skjult:** drive-distance, fairway-pct, gir-pct, putts-per-round, scoring-avg,
putt-explorer, spillere — trenger rå-stats-data i ekte enheter (yds/%/score), eller
redesign rundt SG/skill-ratings.

Norske amatør-leaderboards (region/klubb/årgang-[aar]) trenger fortsatt datakilde.

## ✅ Bekreftet ekte data (mesteparten)
Dashboard, spillerliste, statistikk, mal/SG-hub, shot-by-shot, workbench, finance,
tournaments, økter, kalender/uke, talent/mitt-nivå, WAGR + alle marketing-stats-sidene
(turneringer, norske, coacher, anlegg, priser).
