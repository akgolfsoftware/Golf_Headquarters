# AK Golf Platform — Shared — CBAC-matrise

## Identitet

- **Produkt:** Shared / cross-cutting (admin-flate)
- **URL:** `/admin/cbac`
- **Arketype:** G — Other (rolle × capability matrise)
- **Tier-gating:** Super-admin
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/cbac-matrise.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `EditCapabilityModal`, `NewRoleModal`, `RolePreviewModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

CBAC = Capability-Based Access Control. Denne siden viser hele tilgangs-matrisen: rader er roller (Hovedcoach / Coach / Junior-coach / Foreldre / Spiller / Admin), kolonner er capabilities (`plan.create`, `plan.publish`, `audit.read`, `finance.view`, …). Hver celle viser om rollen har capability-en. Anders bruker dette for å tildele/justere tilgang.

## Layout — UNIKT for denne skjermen

### Header
- Italic: *"Hvem har lov til hva."*
- Subtitle: `6 roller · 38 capabilities · 4 endringer siste 30d`
- Aksjons-rad: `+ Ny rolle →` (RoleNewModal), `Eksporter matrise (CSV)`

### Matrise-grid

- **Rader:** 6 roller (sticky venstre)
- **Kolonner:** 38 capabilities (sticky topp), gruppert med headers (Plan, Booking, Finance, Settings, Audit, Agents, …)
- **Celler:** Tre states:
  - **Granted** — accent-bakgrunn med Lucide `Check`
  - **Inherited** — primary-bakgrunn med Lucide `ArrowDown` + tooltip "Arvet fra Hovedcoach"
  - **Denied** — tom celle (muted)

Klikk celle → toggle (granted ↔ denied), eller `EditCapabilityModal` for inherited.

### Right-rail: Endrings-historikk
- "Sist endret 2 dager siden av Anders K"
- "Inherited cells: 47 av 228"
- "Most-changed capability: `audit.read`"

## KPI-strip (4 kort, øverst)

1. Aktive roller: 6
2. Capabilities: 38
3. Granted-celler: 142 av 228
4. Sist endret: For 2 dager siden

## Filter-bar — UNIKT

- Søk: "Søk capability eller rolle"
- Chip: Kategori (Plan / Booking / Finance / Settings / Audit / Agents)
- Toggle: "Skjul denied" (kun granted vises)
- Toggle: "Vis inherited"

## Klikkbare elementer

| Element | States |
|---|---|
| Celle | default per state, hover (ring), klikk → toggle eller modal |
| Rolle-rad-header | default, hover, klikk → `RolePreviewModal` (vis hva rollen kan) |
| Capability-kolonne-header | default, hover, klikk → vis dokumentasjon |
| Ny rolle-CTA | default, hover, klikk → `NewRoleModal` |

## Empty / loading / error

- **Empty (ingen roller):** "Ingen roller definert. Lag standard-roller fra mal →"
- **Loading:** Skeleton matrise
- **Endre-error:** Inline rød tekst + revert celle

## Ønsket output fra Claude Design

1. Lyst tema, full matrise (6 × 38)
2. Mørkt tema, samme
3. Hover på en celle med tooltip
4. Filter aktivt: Kategori=Finance (kun ~6 kolonner synlig)
5. Mobil ≤640px — matrise blir scrollbar horisontalt + vertikalt, sticky headers bevart

## Ikke-mål

- Ikke designe `EditCapabilityModal`, `NewRoleModal`, `RolePreviewModal` (egen batch)
- Ikke designe rolle-tildeling per bruker (egen flate)
- Ikke implementere live capability-validering

## Når du er ferdig

Lim design-link tilbake til Claude Code.
