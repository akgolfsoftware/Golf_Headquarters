# AK Golf Platform — CoachHQ — Økter

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/sessions`
- **Arketype:** B — List + filter (uke-kalender, pyramide-fokus)
- **Tier-gating:** Pro-features for flere parallelle økter
- **HTML-referanse:** `wireframe/screen-deck/coachhq/sessions.html`
- **Audit:** `wireframe/audit/coachhq-sessions.md`
- **Tilhørende modaler:** `NewSessionModal`, `EditRecurringSessionModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Økter er konkrete trenings-events med pyramide-struktur (FYS / TEK / SLAG / SPILL / TURN). Forskjellig fra Bookinger som er ren tidsallokering — økter har coaching-innhold, øvelser, og blir gjennomført som «Live Session». Skjermen viser uke-kalender hvor hver økt er en blokk med pyramide-stripes som viser fokus-fordelingen.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec. Default uke-kalender-view (toggle for liste finnes også).

### Uke-kalender med pyramide-stripes

- 7 kolonner × tidsblokker (samme grid som Bookinger)
- Hver økt-blokk har en **pyramide-stripe** på venstre side (4px bred, full høyde):
  - **FYS** — `#16A34A` (grønn)
  - **TEK** — `#005840` (darker primary)
  - **SLAG** — `#D1F843` (lime accent)
  - **SPILL** — `#F4C430` (gold)
  - **TURN** — `#5E5C57` (grå)
- Hvis økta har flere fokusområder: stripene stables vertikalt med proporsjonal høyde
- Innhold i blokken: spillernavn (eller gruppe-navn), klokkeslett, antall øvelser
- Klikk → quick-popover med pyramide-fordeling som donut + «Rediger» / «Start live →»

### Tier-gating-toggle

Sticky banner over kalenderen for Free-tier coaches: «Pro: kjør parallelle live-økter med flere spillere → Oppgrader». Banner kan dismisses men kommer tilbake ved page-load.

## KPI-strip (4 kort)

1. Økter denne uka: 18
2. Snitt-pyramide: TEK 32% / SLAG 24% / FYS 18% / SPILL 14% / TURN 12%
3. Live nå: 0 (eller f.eks. «1 — Anders K + Markus R»)
4. Forfaller (ikke gjennomført): 2

## Filter-bar — UNIKT

- Søk: «Søk spiller, gruppe eller dato»
- Chip: Pyramide-fokus (FYS / TEK / SLAG / SPILL / TURN, multi)
- Chip: Coach (Anders K / Sara / Tom)
- Chip: Type (1:1 / Gruppe / Selvtrening)
- Sort: Nyeste / Etter dato / Etter pyramide-vekt
- Primary CTA: `+ Ny økt` → `NewSessionModal`

## Klikkbare elementer

Se `wireframe/audit/coachhq-sessions.md`. UNIKT:

| Element | States |
|---|---|
| Økt-blokk | default, hover (lift + ring), klikk → quick-popover |
| Pyramide-stripe | tooltip på hover (viser % per fokus) |
| Quick-popover | åpen, «Rediger» → `EditRecurringSessionModal`, «Start live →» → `/admin/live/:id` |
| Tier-banner | default, hover på CTA, dismiss-X |
| Tom slot | default, hover, klikk → `NewSessionModal` med tid pre-fyllt |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty (ingen økter):** «Ingen planlagte økter. Lag din første →»
- **Loading:** Skeleton-blokker med pulserende stripes
- **Live-konflikt:** Toast «En annen coach har allerede live-økt med denne spilleren» når man prøver å starte

## Ønsket output fra Claude Design

1. Uke-kalender lyst tema, 18 økter med varierte pyramide-stripes
2. Mørkt tema
3. Quick-popover åpen på en gruppe-økt (WANG Toppidrett, mandag 08:00)
4. Tier-banner synlig (Free-tier coach)
5. Empty
6. Mobil ≤640px — 1-dag-view, økt-blokker stables, pyramide-stripe blir bunn-bar

## Ikke-mål

- Ikke designe `NewSessionModal`, `EditRecurringSessionModal` (egen batch)
- Ikke designe Live Session-flyten (egen Fase 5-pakke)
- Ikke designe pyramide-konfig

## Når du er ferdig

Lim design-link tilbake til Claude Code.
