# AK Golf Platform — Shared — Datakilder-matrise

## Identitet

- **Produkt:** Shared / cross-cutting (admin-flate + dokumentasjon)
- **URL:** `/admin/datakilder`
- **Arketype:** G — Other (kilde × konsument matrise)
- **Tier-gating:** Admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/datakilder-matrise.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `DataSourceDetailModal`, `SyncNowModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Datakilder-matrisen viser hvilke eksterne data-systemer plattformen henter fra (GolfBox, Trackman, Stripe, Google Calendar, Mevo+, Wearable-API) og hvilke skjermer/agents som konsumerer dem. Brukes for: identifisere brudd-kilder ved data-feil, planlegge migreringer, dokumentere data-flyt for compliance.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hvor data kommer fra."*
- Subtitle: `7 datakilder · 23 konsumenter · siste sync 2 min siden`
- Aksjons-rad: `Synk alle nå →`

### Matrise-grid

- **Rader:** 7 datakilder (GolfBox, Trackman, Stripe, Google Calendar, Mevo+, Wearable-API, Manuell input)
- **Kolonner:** 23 konsumenter (skjermer, agents) — gruppert: PlayerHQ / CoachHQ / Agents / Reports
- **Celler:** Status-prikk:
  - Healthy — accent
  - Stale (>24t siden sync) — gold
  - Error — destructive
  - N/A — muted

### Per kilde: status-card (over matrise)

Horisontal rad med 7 cards, hver:
- Logo/ikon
- Navn + sist sync (Mono)
- Status-pill
- Sync-knapp (`Sync nå →`)

### Right-rail: integration-helse

- "API-kall siste 24t: 12 472"
- "Feilrate: 0,8%"
- "Snitt-respons: 240ms"
- "Top-error: GolfBox 503 (12 ganger)"

## KPI-strip (4 kort, øverst)

1. Healthy kilder: 6 av 7
2. Stale kilder: 1 (Mevo+ — ikke synket på 32t)
3. Total sync-events siste 24t: 1 247
4. Snitt-API-respons: 240ms

## Filter-bar — UNIKT

- Søk: "Søk kilde eller konsument"
- Chip: Kilde-status (Healthy / Stale / Error)
- Chip: Konsument-type (Skjerm / Agent / Report)

## Klikkbare elementer

| Element | States |
|---|---|
| Status-card | default, hover (lift), klikk → `DataSourceDetailModal` |
| Sync nå-knapp | default, hover, loading (spinner), success, error |
| Matrise-celle | default per status, hover (tooltip), klikk → vis konsument-detaljer |
| Synk alle | default, hover, loading (progress per kilde), success |

## Empty / loading / error

- **Empty (ingen kilder):** "Ingen datakilder konfigurert. Koble til GolfBox →"
- **Loading:** Skeleton matrise
- **Sync-error:** Inline destructive + retry

## Ønsket output fra Claude Design

1. Lyst tema, full matrise + status-cards + right-rail
2. Mørkt tema, samme
3. Sync-loading-state på en card
4. Error-state på Mevo+-card (destructive)
5. Mobil ≤640px — status-cards 1-kolonne, matrise scrollbar

## Ikke-mål

- Ikke designe `DataSourceDetailModal`, `SyncNowModal` (egen batch)
- Ikke designe credential-management (egen sub-flow)
- Ikke designe webhook-konfig

## Når du er ferdig

Lim design-link tilbake til Claude Code.
