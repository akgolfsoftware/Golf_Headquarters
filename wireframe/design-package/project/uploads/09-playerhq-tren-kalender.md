# AK Golf Platform — PlayerHQ — Treningskalender

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/tren/kalender`
- **Arketype:** G — Other (uke-kalender, spillerens egen)
- **Tier-gating:** Free får uke-view, Pro får måned-view + iCal-eksport
- **HTML-referanse:** `wireframe/screen-deck/playerhq/tren-kalender.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `SessionDetailModal`, `RescheduleSessionModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Treningskalender er Markus' visuelle oversikt over alle planlagte og gjennomførte økter. Forskjellig fra `/tren` (treningsplan-detalj for én plan) — denne aggregerer **alt** Markus har: planlagte økter fra Anders, selvtrenings-økter, gruppe-økter med WANG, turneringer, fysio-time. Kombineres med GolfBox-data for runder.

## Layout — UNIKT for denne skjermen

### Toggle øverst-høyre

`Uke / Måned / Liste` (Free har Uke + Liste; Måned er Pro-låst).

### Uke-view (default)

- 7 kolonner (Mandag–Søndag), 06:00–22:00 grid
- Event-blokker:
  - **Coaching-økt** (lime accent) — pyramide-stripe venstre
  - **Selvtrening** (border-only, dashed) — pyramide-stripe venstre
  - **Gruppe** (primary) — fylt med ikon `Users`
  - **Runde** (gold) — ikon `Flag`
  - **Turnering** (secondary, full bredde)
  - **Fysio/restitusjon** (muted) — ikon `Heart`
- Status-prikk på blokk:
  - Planlagt — accent
  - Gjennomført — success-grønn
  - Hoppet over — destructive
  - Forsinket — gold
- Klikk → `SessionDetailModal` med "Start →" eller "Marker ferdig"

### Pro-låst måned-view

Hvis Free: vis hele måned-view som blurred ut + sentrert tier-gate-card "Få måned-oversikt med Pro · Oppgrader →" (lime CTA).

### Right-rail: Ukens fokus

- "Ukens pyramide": donut med FYS/TEK/SLAG/SPILL/TURN-fordeling
- "Volum: 8t 30m planlagt · 5t 12m gjennomført"
- "Streak: 23 dager"
- Knapp: `Eksporter til iCal →` (Pro-låst)

## KPI-strip (4 kort)

1. Økter denne uka: 6 (4 coaching, 2 selvtrening)
2. Volum: 8t 30m
3. Gjennomført: 4 av 6
4. Neste opp: "Onsdag 14:00 — 1:1 med Anders"

## Filter-bar — UNIKT

- Chip: Type (Coaching / Selvtrening / Gruppe / Runde / Turnering)
- Chip: Status (Planlagt / Gjennomført / Hoppet over)
- Naviger: `← Forrige uke / I dag / Neste uke →`

## Klikkbare elementer

| Element | States |
|---|---|
| Event-blokk | default, hover (lift + ring), klikk → `SessionDetailModal` |
| Pyramide-stripe | tooltip på hover |
| Status-prikk | tooltip "Gjennomført 14:32" |
| Måned-toggle (Free) | default, hover viser "Pro-låst", klikk → tier-gate-modal |
| Eksporter til iCal | Pro-knapp (default), Free viser låst-state med oppgrader-CTA |

## Empty / loading / error

- **Empty (ingen økter denne uka):** "Ingen planlagte økter. Snakk med coachen din eller logg en selvtrening →"
- **Loading:** Skeleton tids-grid
- **Sync-error (GolfBox):** Banner "Kunne ikke hente runder fra GolfBox. Viser cached →"

## Ønsket output fra Claude Design

1. Lyst tema, uke-view (uke 19, 11.–17. mai 2026)
2. Mørkt tema, samme
3. Måned-view med tier-gate (Free-bruker ser blurred + oppgrader-CTA)
4. SessionDetailModal åpen på en coaching-økt
5. Mobil ≤640px — 1-dag-view, swipe mellom dager, right-rail blir bottom-sheet

## Ikke-mål

- Ikke designe `SessionDetailModal`, `RescheduleSessionModal` (egen batch)
- Ikke designe iCal-eksport-flyten
- Ikke designe selvtrenings-logging-wizard

## Når du er ferdig

Lim design-link tilbake til Claude Code.
