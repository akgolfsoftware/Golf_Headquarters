# AK Golf Platform — CoachHQ — Treningsplaner

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/plans`
- **Arketype:** B — List + filter (kanban-variant)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/plans.html`
- **Audit:** `wireframe/audit/coachhq-plans.md`
- **Tilhørende modaler:** `NewPlanModal`, `AIPlanGeneratorModal`, `TemplateSelectorModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Eksakte token-navn — ikke hardkode hex.

## Spec — hva skjermen er for

Treningsplaner er hjertet i CoachHQ. Coach overvåker alle aktive planer på tvers av spillere. Hver plan har én ansvarlig coach, en spiller og en tidsperiode. Skjermen er coachens daglige verktøy for å se hvilke planer som er på sporet, hvilke som trenger omlegging, og hvilke som skal arkiveres etter ferdigstillelse.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec fra `README.md` (sidebar, hero, KPI-strip, filter-bar). I tillegg:

- **Toggle øverst-høyre:** `Liste / Kanban` segmentert kontroll. Kanban er default.
- **Kanban-kolonner (3):**
  - **Aktiv** (24 planer) — accent-prikk, bredeste kolonne
  - **Pause** (5 planer) — muted-bakgrunn på header
  - **Arkivert** (47 planer) — collapsed by default, klikk for å vise
- **Plan-kort (drag-target):**
  - Spillernavn + avatar (24px)
  - Plan-tittel italic Instrument Serif
  - Periode-pill: f.eks. `9. mai – 30. jun` (JetBrains Mono)
  - Progress-bar (4px tykk, accent-fyll), `% gjennomført`
  - Coach-avatar nederst-høyre
  - Tre vertikale prikker (RowActionsMenu)
- **Drag-drop:** kort kan dras mellom kolonner. Drop-zone får accent-border + bg ved hover.

## KPI-strip (4 kort)

1. Aktive planer: 24 (av 38 spillere)
2. Snitt-progress: 64%
3. Forfaller denne uka: 3
4. AI-genererte: 12

## Filter-bar — UNIKT

- Søk: «Søk plan eller spiller»
- Chip: Coach (Anders K · Sara · Tom)
- Chip: Periode (Aktiv nå / Snart / Forfalt)
- Chip: Type (AI-generert / Manuell / Mal)
- Sort: Sist endret / Forfaller først / A–Å
- Primary CTA: `+ Ny plan` → åpner `NewPlanModal`. Sekundær: `AI-generer →` (lime accent).

## Klikkbare elementer

Se `wireframe/audit/coachhq-plans.md`. UNIKT:

| Element | States |
|---|---|
| Liste/Kanban-toggle | default, hover, active per side |
| Plan-kort | default, hover (lift + accent border), drag-active (rotert 2°), drop-target |
| Kanban-kolonne-header | default, hover, count-badge |
| Progress-bar | 0%, 25%, 50%, 75%, 100% (accent når fullført) |
| Periode-pill | aktiv, snart-utløpt (warning), forfalt (destructive) |
| Arkivert-kolonne | collapsed (default), expanded |

## Empty / loading / error

Bruker arketype-B-felles. UNIKT:
- **Empty per kolonne:** «Ingen planer i {kolonne}» + dempet ikon `ClipboardList`
- **Empty totalt:** «Lag din første plan» med 2 CTAs: `+ Manuell` og `AI-generer →`
- **Loading:** Skeleton plan-kort (5 stk i Aktiv-kolonnen)
- **Drag-drop error:** Toast «Kunne ikke flytte plan. Prøv igjen.»

## Ønsket output fra Claude Design

1. Kanban-view i lyst tema (default)
2. Liste-view i lyst tema (samme data)
3. Mørkt tema (kanban)
4. Drag-state — ett kort midt i å bli flyttet fra Aktiv → Pause
5. Empty totalt
6. Mobil ≤768px — kanban blir scrollbar horisontalt, kort blir 280px brede

## Ikke-mål

- Ikke designe `NewPlanModal`, `AIPlanGeneratorModal`, `TemplateSelectorModal` (egen pakke)
- Ikke designe plan-detalj-skjerm (`/admin/plans/:id` — egen batch)
- Ikke endre kolonne-rekkefølge (Aktiv → Pause → Arkivert er fast)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
