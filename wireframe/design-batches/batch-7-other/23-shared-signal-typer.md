# AK Golf Platform — Shared — Signal-typer-katalog

## Identitet

- **Produkt:** Shared / cross-cutting (intern dokumentasjon)
- **URL:** `/admin/signals`
- **Arketype:** G — Other (katalog-grid)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/signal-typer.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `SignalTypeDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Signal-typer er Lego-klossene i Signal→Skill→Agent-pipelinen. Hver signal-type er en strukturert datapunkt-kategori: `round.completed`, `session.logged`, `hcp.changed`, `volume.spike`, `injury.flagged`, `subjective.fatigue.high`, etc. Denne katalogen viser alle 28 typer med beskrivelse, kilde, schema og hvilke agents som konsumerer dem.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Signal-vokabularet."*
- Subtitle: `28 signal-typer · 5 kategorier · 1 247 events siste 24t`

### Filter-bar
- Søk: "Søk signal-type"
- Chip: Kategori (Round / Session / Health / Booking / Subjective)
- Chip: Hyppighet (Real-time / Daglig / Ukentlig)
- Sort: Volum / A-Å / Sist endret

### Katalog-grid (3-kolonne)

Hvert kort:
- **Signal-navn** (Geist Mono 14px): `round.completed`
- **Kategori-pill** øverst-høyre
- **1-setning-beskrivelse** (muted): "Avgis når en spiller fullfører en runde i GolfBox"
- **Schema-snippet** (mini, kollapset):
  ```json
  { playerId, courseId, score, date, ... }
  ```
- **Konsumenter** (avatar-stack): viser hvilke agents som lytter
- **Volum-stat** (Mono): "47 events siste 7d"

28 signal-typer dekkes:
- `round.completed`, `round.cancelled`
- `session.logged`, `session.cancelled`, `session.live.started`
- `hcp.changed`, `hcp.confirmed`
- `volume.spike`, `volume.drop`
- `injury.flagged`, `injury.resolved`
- `subjective.fatigue.high`, `subjective.energy.low`
- `booking.created`, `booking.cancelled`, `booking.no-show`
- `payment.received`, `payment.failed`, `payment.refunded`
- `agent.recommendation.created`, `agent.recommendation.approved`
- `plan.published`, `plan.archived`, `plan.deviation.detected`
- `tournament.scheduled`, `tournament.result.entered`
- `coach.note.added`
- `parent.message.received`

### Right-rail: Stats
- Top-5 mest hyppige signal-typer
- Top-5 minst hyppige
- Sist lagt til

## KPI-strip (4 kort)

1. Aktive signal-typer: 28
2. Events siste 24t: 1 247
3. Mest hyppig: `session.logged` (412 i går)
4. Sist endret: `agent.recommendation.created` (2 dager siden)

## Klikkbare elementer

| Element | States |
|---|---|
| Signal-card | default, hover (lift), klikk → `SignalTypeDetailModal` (full schema + eksempler) |
| Kategori-pill | klikk → filter |
| Schema-snippet | klikk → expand til full JSON |
| Konsument-avatar | hover (tooltip "Periodiserings-agent"), klikk → agent-detalj |

## Empty / loading / error

- **Empty (filter null):** "Ingen signal-typer matcher. Tilbakestill →"
- **Loading:** Skeleton-grid

## Ønsket output fra Claude Design

1. Lyst tema, full katalog 28 typer
2. Mørkt tema, samme
3. Hover på en card med expanded schema-snippet
4. Filter aktivt: Kategori=Health
5. Mobil ≤640px — 1-kolonne grid

## Ikke-mål

- Ikke designe `SignalTypeDetailModal` (egen batch)
- Ikke designe signal-emit-API-dokumentasjon (egen sub-flow)
- Ikke implementere live event-tail

## Når du er ferdig

Lim design-link tilbake til Claude Code.
