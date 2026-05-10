# AK Golf Platform — PlayerHQ — Coaching-plan-detalj (spiller-side)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/portal/coach/plans/:id`
- **Arketype:** C — Detail + tabs (5 tabs, plan fra coach-perspektiv)
- **Tier-gating:** **Pro**
- **HTML-referanse:** `wireframe/screen-deck/playerhq/coaching-detail.html`
- **Audit:** `wireframe/audit/playerhq-coaching-detail.md`
- **Tilhørende modaler:** `PhaseDetailModal`, `PeakReadinessModal`, `RequestPlanChangeModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spillerens dypere view av en coach-laget plan. Forskjellig fra `treningsplan` (pakke 07) — denne kommer fra coach-fanen og fokuserer på "hva coach har tenkt" (insight + peak-readiness + plan-endring-request). Mer dialog-rettet enn execution-rettet.

## Header-blokk — UNIKT

- **Avatar:** 64px med Anders K + lime accent ring (= aktiv coaching-plan)
- **H1:** `Sommer-toppform` (Instrument Serif italic)
- **Subtittel:** `Coachet av Anders K · 9. mai – 30. juni · Fase 3 av 5`
- **Stat-pills (4):** `13/19 ferdig` (klikk → tab Økter) · `I dag pitch 50-100m` (klikk → økt) · `3d til neste test` · `21d til peak` (klikk → PeakReadinessModal)
- **Primary CTA:** `Start dagens økt` (lime, → `/portal/live/:id`)
- **Sekundær:** `Be om endring` (åpner RequestPlanChangeModal)

## Tab-strip (5 tabs)

| Tab | Innhold |
|---|---|
| **Plan** (default) | Plan-overview + insight |
| **Faser** | 5 phase-cards |
| **Økter** | Ukens 5 økter |
| **Tester** | Tester planlagt |
| **Mål** | Plan-mål + delmål |

## Layout — Plan-tab (default)

### Foran/Bak-skjema-banner (12-col)
Insight-banner: "Du er **2 dager foran** skjema basert på adherence" (lime accent) — eller "Du er 1 dag bak" (warning).

### Plan-overview-card (8-col)
- Plan-tittel + coach
- Periode-stripe med fase-markører
- Progress-bar 64 %
- Primary i card: `Se hele planen →` (link til `/portal/tren/plan` = pakke 07)

### Coach-quote (4-col)
Italic Instrument Serif quote fra Anders: *"Markus, vi har tre uker til Sørlandsåpent. Konsentrer deg om pitch 50-100m — det er hovedforskjellen mellom 5. og 1. plass."*

### Hva du skal gjøre denne uka (12-col)
Tabell med 5 rader (TIL-DO-stil):
| Dag | Hva | Link |
|---|---|---|
| I dag | TEK 1:1 Pitch 50-100m | `/portal/sessions/:id` |
| Tirsdag | Sand-test 30m | `/portal/tren/tester/:id` |
| Onsdag | SPILL 9-hulls | `/portal/sessions/:id` |
| Torsdag | FYS 60min | `/portal/sessions/:id` |
| Fredag | TEK 1:1 Driver-baseline | `/portal/sessions/:id` |

## Layout — Faser-tab

5 phase-cards horisontalt (samme mønster som pakke 07 + 03), klikk → PhaseDetailModal.

## Klikkbare elementer

| Element | States |
|---|---|
| Tab-strip | default, hover, active |
| `Start dagens økt` CTA | default, hover, loading |
| `Be om endring` | default, hover, modal-trigger |
| `21d til peak` | klikk → PeakReadinessModal |
| Phase-card | default, hover, current (accent border), klikk → modal |
| Tabell-rad ukens-økt | default, hover, klikk → økt eller test-skjerm |
| `Send melding til Anders` (drawer) | klikk → compose-skjerm (pakke 15) |

## Empty / loading / error

- **Empty (ingen plan tildelt):** "Anders har ikke laget plan ennå. Be om plan →"
- **Plan-godkjenning-state:** Banner "⏳ Anders har sendt ny plan-versjon — godkjenn?" (åpner PlanApprovalModal)
- **Foran/bak-skjema:** Lime banner (foran) eller warning banner (bak)
- **Loading:** Skeleton coach-quote + tabell

## Eksempel-data

- **Plan:** "Sommer-toppform" av Anders K
- **Spiller:** Markus Roinås Pedersen
- **Status:** 2 dager foran skjema, 64 % gjennomført
- **I dag:** TEK 1:1 Pitch 50-100m
- **Peak:** 12. juni (Sørlandsåpent)

## Ønsket output fra Claude Design

1. Lyst tema, Plan-tab default (foran skjema)
2. Mørkt tema, samme
3. Bak-skjema-state (warning banner)
4. Tab-bytte til Faser
5. Plan-godkjenning-banner state
6. Empty: ingen plan
7. Mobil ≤640px — coach-quote stables, tabell blir kort

## Ikke-mål

- Ikke designe `RequestPlanChangeModal`, `PeakReadinessModal` (egne pakker)
- Ikke designe `treningsplan` (pakke 07)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
