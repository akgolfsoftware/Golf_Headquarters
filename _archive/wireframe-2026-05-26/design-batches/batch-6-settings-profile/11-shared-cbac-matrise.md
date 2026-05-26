# AK Golf Platform — Shared — CBAC matrise

## Identitet

- **Produkt:** Shared / cross-cutting (admin-flate)
- **URL:** `/admin/cbac` (CoachHQ-bare, men sett som tverrgående mønster)
- **Arketype:** F — Settings + profile (rettighets-matrise)
- **Tier-gating:** Kun super-admin (Anders) ser hele matrisen
- **HTML-referanse:** `wireframe/screen-deck/shared/cross-cutting/cbac-matrise.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `EditCapabilityModal`, `NewRoleModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

CBAC = Capability-Based Access Control. Matrisen viser hvilke roller (Coach, Hovedcoach, Admin, Spiller, Forelder, Klubb-ansvarlig) har hvilke capabilities (`plan.create`, `plan.publish`, `player.invite`, `billing.read` osv). Anders bruker denne når han skal gi en ny coach-assistent tilgang, eller når en forelder skal få utvidet innsyn. Endringer her propagerer umiddelbart til hele plattformen.

## Layout — UNIKT for denne skjermen

Matrise-tabell-layout (mer som spreadsheet enn vanlig form). Sticky kolonne-headers og rad-headers.

### Topp: Kontekst-velger

3 segmenterte knapper:
- **Per rolle** (default) — vis matrisen som rolle x capability
- **Per capability** — invertert (capability x rolle, brukes for audit)
- **Per bruker (override)** — viser brukere som har eksplisitte overstyringer av rolle-default

### Hovedmatrisen (per rolle)

Tabell med rader = capabilities (gruppert i seksjoner: Plans / Players / Bookings / Billing / Settings / Audit), kolonner = roller (Coach, Hovedcoach, Admin, Spiller, Forelder, Klubb-ansvarlig).

| Capability | Coach | Hovedcoach | Admin | Spiller | Forelder | Klubb |
|---|---|---|---|---|---|---|
| **Plans** | | | | | | |
| `plan.read.own` | ✓ | ✓ | ✓ | ✓ | – | – |
| `plan.read.all` | – | ✓ | ✓ | – | – | – |
| `plan.create` | ✓ | ✓ | ✓ | – | – | – |
| `plan.publish` | – | ✓ | ✓ | – | – | – |
| `plan.delete` | – | – | ✓ | – | – | – |
| **Players** | | | | | | |
| `player.read.own` | ✓ | ✓ | ✓ | ✓ | ✓ (egne barn) | – |
| `player.read.club` | ✓ | ✓ | ✓ | – | – | ✓ |
| `player.invite` | ✓ | ✓ | ✓ | – | – | ✓ |
| `player.delete` | – | – | ✓ | – | – | – |
| **Billing** | | | | | | |
| `billing.read.own` | – | – | ✓ | ✓ | ✓ | – |
| `billing.write` | – | – | ✓ | – | – | – |
| **Settings** | | | | | | |
| `settings.cbac.write` | – | – | ✓ | – | – | – |
| `settings.api.create` | – | – | ✓ | – | – | – |

Cell-content:
- ✓ (accent-farge) = capability granted
- – (muted) = ikke granted
- ✓ med stjerne = override fra default
- Hover viser tooltip "Default: ja" eller "Override: gitt 12. mar av Anders K"

### Filter-bar

- Søk: "Søk capability" (filter rader)
- Chip: Seksjon (multi-select)
- Chip: Vis kun granted / kun ikke-granted
- Sort: Alfabetisk / Etter risiko (delete-actions øverst)

### Aksjoner

- Klikk på en cell → toggle (men confirm-modal hvis det er destructive capability)
- "Eksporter matrise (CSV)" — ghost-knapp
- "+ Ny rolle" → `NewRoleModal`
- "+ Ny capability" — kun for utvikler-mode

### Audit-link

Under matrisen: "Se siste 100 endringer i CBAC →" → audit-log

## Klikkbare elementer

UNIKT:

| Element | States |
|---|---|
| Kontekst-velger | default, hover, active per modus |
| Cell (✓/–) | default, hover (lift + tooltip), klikk → toggle (med confirm hvis destructive) |
| Capability-rad-header (klikk) | default, hover, klikk → `EditCapabilityModal` (vis bruker-overrides) |
| Rolle-kolonne-header (klikk) | default, hover, klikk → modal "Hvilke brukere har denne rollen?" |
| "+ Ny rolle" | default, hover, klikk → `NewRoleModal` |
| Capability med stjerne (override) | tooltip viser "Override: hvem + når" |

## Empty / loading / error

Felles arketype-F + UNIKT:
- **Lasting:** Matrise med skeleton-cells (animert pulserende)
- **Toggle-error:** Cell flasher rød + revert + toast "Kunne ikke endre. Du mangler `settings.cbac.write`."
- **Konflikt-warning:** "Denne endringen påvirker 14 brukere — bekreft →"

## Ønsket output fra Claude Design

1. Lyst tema, full matrise med ~14 capabilities synlig
2. Mørkt tema
3. Cell-hover med tooltip (default vs override)
4. Filter aktivt: kun granted, viser bare ✓-celler
5. Per-bruker-modus aktiv (vis liste over brukere med overrides)
6. Mobil ≤640px — matrise blir vertikal liste: hver capability er ekspanderbart kort med roll-toggles inni

## Ikke-mål

- Ikke designe `EditCapabilityModal`, `NewRoleModal` (egen batch)
- Ikke implementere bakenforliggende RLS-policies (det er kode-jobb)
- Ikke designe per-organisasjon-matrise (multi-klubb-fase)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
