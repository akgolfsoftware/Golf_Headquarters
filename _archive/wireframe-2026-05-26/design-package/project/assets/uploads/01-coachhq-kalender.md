# AK Golf Platform — CoachHQ — Kalender

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/kalender`
- **Arketype:** G — Other (uke/måned-kalender med pyramide-stripes)
- **Tier-gating:** Pro+ for parallelle coaches
- **HTML-referanse:** `wireframe/screen-deck/coachhq/kalender.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `NewSessionModal`, `BookSessionModal`, `EventDetailPopover`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Kalender er Anders' fugleperspektiv på alt han har på timeplanen — coaching-økter, bookinger, gruppe-økter, turneringer, og personlige sperre-blokker. Forskjellig fra `/admin/sessions` (kun trenings-økter) og `/admin/bookings` (kun bookinger): denne aggregerer alt, inkludert eksterne kalendere (Google Calendar via OAuth). Anders bruker den hver morgen for å se "hva har jeg i dag".

## Layout — UNIKT for denne skjermen

### Toggle øverst-høyre

Segmentert kontroll: `Dag / Uke / Måned / Agenda`. Uke er default.

### Uke-view (default)

- 7 kolonner (Mandag–Søndag), datoer i header med ukenummer (`Uke 19, 11.–17. mai 2026`)
- Tidsblokker fra 06:00 til 22:00, 30-min slots
- Event-blokker fargekodet etter type:
  - **1:1 coaching** (lime accent) — pyramide-stripe venstre
  - **Gruppe-økt** (primary green) — pyramide-stripe venstre
  - **Booking** (gold) — ikke pyramide
  - **Turnering** (secondary) — full bredde, høyere blokk
  - **Sperret** (muted, diagonal stripes) — "ikke tilgjengelig"
  - **Ekstern (Google)** (border-only, dashed) — leses fra Google Calendar
- "Naa"-linje (rød horisontal, 1px) på dagens dato
- Klikk event → `EventDetailPopover` med 3 aksjoner: `Åpne` / `Omplanlegg` / `Avlys`
- Klikk tom slot → `NewSessionModal` eller `BookSessionModal` (basert på event-type-velger i popover)

### Måned-view

- Standard kalender-grid (6 uker × 7 dager)
- Hver dag-celle viser maks 3 events som pills + `+N flere`
- Klikk dag → bytter til Dag-view for den datoen

### Agenda-view

- Vertikal liste, gruppert per dato med sticky dato-header
- Hver event som en rad med tid + type-pill + tittel + spiller/gruppe + lokasjon

### Sidebar-panel (collapse-able)

Høyre side, 280px bredt:
- **Mini-kalender** (måned-overview) for navigering
- **Kalender-toggles** (checkbox per kalender): "Coaching" / "Bookinger" / "Turneringer" / "Privat" / "Google Calendar"
- **Knapp:** `Synk Google Calendar` (loading-spinner ved klikk)

## KPI-strip (4 kort)

1. Events i dag: 6 (3 coaching, 2 bookinger, 1 gruppe)
2. Events denne uka: 38
3. Free-tid i kveld: 2t 30m
4. Konflikter: 0 (eller "1 — Markus R 14:00 dobbel-booket")

## Filter-bar — UNIKT

Liten filter-rad over kalender:
- Chip: Type (Coaching / Booking / Gruppe / Turnering / Privat)
- Chip: Coach (Anders / Sara / Tom) — kun for hovedcoach
- Naviger-knapper: `← Forrige / I dag / Neste →` + datepicker

## Klikkbare elementer

| Element | States |
|---|---|
| Day/Uke/Måned/Agenda-toggle | default, hover, active per visning |
| Event-blokk | default, hover (lift + ring), klikk → popover, drag (omplanlegg) |
| Pyramide-stripe | tooltip på hover (viser fokus-fordeling) |
| Tom slot | default, hover (dotted accent border + "+"), klikk → modal-velger |
| "Naa"-linje | static, alltid synlig på dagens dato |
| Sidebar collapse-knapp | default, hover, expanded/collapsed states |
| Mini-kalender dag-celle | default, hover, today (accent ring), selected |
| Synk Google Calendar | default, hover, loading (spinner), success (toast), error |

## Empty / loading / error

- **Empty (ingen events i visning):** Subtil tekst sentrert "Ingen events denne uka. Klikk en slot for å lage en →"
- **Loading:** Skeleton tids-grid med pulserende blokker
- **Sync-error:** Toast bunn "Kunne ikke synke Google Calendar. Prøv igjen →"
- **Konflikt-state:** Event-blokken får destructive-border + tooltip "Konflikt: Markus R har samtidig booking på Studio 1"

## Ønsket output fra Claude Design

1. Uke-view lyst tema (uke 19, 11.–17. mai 2026, ~38 events)
2. Mørkt tema, samme
3. Måned-view lyst tema (mai 2026)
4. Agenda-view lyst tema
5. EventDetailPopover åpen på en gruppe-økt
6. Mobil ≤640px — 1-dag-view, sidebar blir bottom-sheet, events stables vertikalt

## Ikke-mål

- Ikke designe `NewSessionModal`, `BookSessionModal` (egen batch)
- Ikke designe Google Calendar OAuth-flyten
- Ikke designe sperre-blokk-editor (egen sub-flow)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
