# AK Golf Platform — Shared — Plan-aksjon-typer

## Identitet

- **Produkt:** Shared / cross-cutting (intern dokumentasjon)
- **URL:** `/admin/plan-actions`
- **Arketype:** G — Other (katalog-grid)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/plan-aksjon-typer.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `PlanActionTypeDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Plan-aksjon-typer er det kontrollerte vokabularet av endringer en agent kan foreslå mot en plan. Eksempler: `changeVolume`, `addPauseWeek`, `swapPhase`, `escalateToHeadCoach`, `notifyParent`, `cancelSession`. Hver type har strict schema (hvilke parametre den krever), godkjennings-policy (hvem kan godkjenne), og rollback-mulighet.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hva agentene kan foreslå."*
- Subtitle: `15 aksjons-typer · 4 godkjennings-policyer · 47 anbefalinger siste 7d`

### Filter-bar
- Søk: "Søk aksjons-type"
- Chip: Godkjennings-policy (Auto / Coach / Hovedcoach / Foreldre)
- Chip: Reversibel? (Ja / Nei)
- Sort: Volum / A-Å

### Katalog-grid (2-kolonne, bredere cards enn signal-typer)

Hvert kort:
- **Aksjons-navn** (Geist Mono 14px): `changeVolume`
- **Policy-pill** øverst-høyre: "Coach godkjenner"
- **1-setning-beskrivelse**: "Endrer treningsvolum opp/ned med X% i Y uker"
- **Parameter-schema** (kollapset):
  ```json
  { planId, deltaPercent, durationWeeks, reason }
  ```
- **Eksempel-rendering** (hva godkjennings-card vil vise): Liten mockup
- **Reversible-pill**: "Ja, kan rulles tilbake innen 7 dager"
- **Volum-stat**: "12 anbefalinger siste 7d"

15 aksjons-typer:
- `changeVolume`, `addPauseWeek`, `removePauseWeek`
- `swapPhase`, `extendPhase`, `endPlanEarly`
- `escalateToHeadCoach`
- `notifyParent`, `notifyPlayer`
- `cancelSession`, `rescheduleSession`
- `markInjured`, `markRecovered`
- `lockPlanForReview`
- `mergePlans`

### Right-rail: Policy-oversikt
- "Auto-godkjent: 0 typer (krever alltid menneskelig godkjenning)"
- "Coach-godkjent: 8 typer"
- "Hovedcoach-godkjent: 5 typer"
- "Foreldre-godkjent: 2 typer"

## KPI-strip (4 kort)

1. Aktive aksjons-typer: 15
2. Anbefalinger siste 7d: 47
3. Godkjenningsrate: 84%
4. Snitt-respons-tid: 1t 24m

## Klikkbare elementer

| Element | States |
|---|---|
| Aksjon-card | default, hover (lift), klikk → `PlanActionTypeDetailModal` |
| Policy-pill | klikk → filter |
| Schema-snippet | klikk → expand |
| Eksempel-rendering | hover (tooltip "Slik vises godkjennings-card"), klikk → full preview |

## Empty / loading / error

- **Empty (filter null):** "Ingen aksjons-typer matcher. Tilbakestill →"
- **Loading:** Skeleton-grid

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 15 typer (2-kolonne)
2. Mørkt tema, samme
3. Hover på en card med eksempel-rendering synlig
4. Filter aktivt: Policy=Hovedcoach godkjenner
5. Mobil ≤640px — 1-kolonne grid

## Ikke-mål

- Ikke designe `PlanActionTypeDetailModal` (egen batch)
- Ikke designe rollback-flyten (egen sub-flow)
- Ikke implementere policy-editor

## Når du er ferdig

Lim design-link tilbake til Claude Code.
