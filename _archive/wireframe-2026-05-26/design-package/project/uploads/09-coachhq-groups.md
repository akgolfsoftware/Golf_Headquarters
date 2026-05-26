# AK Golf Platform — CoachHQ — Grupper

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/groups`
- **Arketype:** B — List + filter (large card-grid)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/groups.html`
- **Audit:** `wireframe/audit/coachhq-groups.md`
- **Tilhørende modaler:** `NewGroupModal`, `GroupDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Grupper samler spillere som trener sammen — WANG Toppidrett, GFGK Junior, Talent A1, etc. Hver gruppe har én primary-coach, en fellesøkt-frekvens og medlemsliste. Coach bruker denne skjermen for å se alle gruppene sine på én flate, planlegge fellesøkter, og raskt åpne gruppe-detalj for medlems- og program-administrasjon.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec, men med **store kort (3 kort per rad på desktop)**.

### Gruppe-card

- Hero-bilde øverst (180px høyt, gradient-overlay) — placeholder med stort gruppe-initial
- Navn (Instrument Serif italic 24px) + sub (Geist 14px muted)
- 4 datapunkter i grid:
  - Medlemmer: «8»
  - Primary-coach: avatar + navn
  - Neste fellesøkt: «Ons 13. mai · 08:00»
  - Snitt-HCP: «12.4» (JetBrains Mono)
- Avatar-stack (overlapping circles, viser opptil 5 medlemmer + «+3»)
- 2 knapper nederst: `Åpne →` (primary), `Planlegg økt` (secondary)

### De 6 gruppene

| Navn | Type | Medl | Primary-coach | Neste fellesøkt |
|---|---|---|---|---|
| WANG Toppidrett | Skole | 6 | Anders K | Man 11. mai · 08:00 |
| GFGK Junior | Klubb | 14 | Sara H | Tirs 12. mai · 17:00 |
| GFGK Damer | Klubb | 8 | Tom J | Tors 14. mai · 18:00 |
| Talent A1 | Selektert | 4 | Anders K | Ons 13. mai · 16:00 |
| Talent A2 | Selektert | 5 | Sara H | Lør 16. mai · 10:00 |
| Talent A3 | Selektert | 5 | Tom J | Lør 16. mai · 12:00 |

## KPI-strip (4 kort)

1. Aktive grupper: 6
2. Totale medlemmer: 42 (noen i flere grupper)
3. Fellesøkter denne uka: 8
4. Snitt-progress: 71%

## Filter-bar — UNIKT

- Søk: «Søk gruppe eller medlem»
- Chip: Type (Skole / Klubb / Selektert / Annet)
- Chip: Coach (Anders K / Sara / Tom)
- Chip: Status (Aktiv / Pauset / Arkivert)
- Sort: Navn / Medlemmer / Neste økt
- Primary CTA: `+ Ny gruppe` → `NewGroupModal`

## Klikkbare elementer

Se `wireframe/audit/coachhq-groups.md`. UNIKT:

| Element | States |
|---|---|
| Gruppe-card | default, hover (lift + accent border), klikk → `GroupDetailModal` |
| Avatar-stack | hover på en avatar → mini-popover med navn |
| Avatar-stack «+3» | klikk → popover med full medlemsliste |
| `Planlegg økt` | klikk → `NewSessionModal` med gruppe pre-fyllt |
| Hero-bilde | default, hover (subtil parallax / zoom 1.05x) |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty:** «Ingen grupper ennå. Lag din første for å samle spillere →»
- **Loading:** 3 skeleton-kort med pulserende hero
- **Hero-image-error:** Fallback til ren accent-gradient med gruppe-initial

## Ønsket output fra Claude Design

1. Lyst tema, 6 grupper i 3×2 grid (3 kort per rad)
2. Mørkt tema
3. Hover-state på WANG Toppidrett-card
4. Avatar-stack «+3»-popover åpen
5. Empty
6. Mobil ≤640px — 1-kolonne, hero-bilde 120px høyt

## Ikke-mål

- Ikke designe `NewGroupModal`, `GroupDetailModal` (egen batch)
- Ikke designe `/admin/groups/:id`-skjerm (sub-skjerm)
- Ikke designe `GroupCompareModal`

## Når du er ferdig

Lim design-link tilbake til Claude Code.
