# AK Golf Platform — CoachHQ — Tjenester

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/services`
- **Arketype:** B — List + filter (CRUD)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/services.html`
- **Audit:** `wireframe/audit/coachhq-services.md`
- **Tilhørende modaler:** `NewServiceModal`, `ServiceDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Tjenester er den bookbare katalogen — alt en spiller eller ekstern kunde kan booke. Coach administrerer pris, varighet og aktiv-status. Endringer her påvirker booking.akgolf.no umiddelbart. Hver tjeneste hører til en kategori (Coaching / Studio / Greenfee / Gruppe / Event).

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec. Tabell-kolonner:

| Kolonne | Innhold | Bredde |
|---|---|---|
| Navn | Tjeneste-navn (Geist 14px) + kort-beskrivelse (muted 12px) | 320px |
| Varighet | f.eks. «60 min», JetBrains Mono | 100px |
| Pris | f.eks. «1 600 kr», JetBrains Mono, høyrejustert | 120px |
| Kategori | Pill (Coaching / Studio / Greenfee / Gruppe / Event) | 120px |
| Bookinger denne mnd | Tall + sparkline (siste 6 mnd) | 160px |
| Aktiv | Toggle-switch | 80px |
| ... | RowActionsMenu | 40px |

## KPI-strip (4 kort)

1. Aktive tjenester: 12 av 12
2. Snitt-pris: 1 240 kr
3. Mest bookede: «1:1 Coaching 60 min»
4. Inntekt MTD: 142 800 kr

## Filter-bar — UNIKT

- Søk: «Søk tjeneste»
- Chip: Kategori (Coaching / Studio / Greenfee / Gruppe / Event)
- Chip: Status (Aktiv / Inaktiv)
- Chip: Pris-range (slider eller diskret: <500 / 500–1500 / >1500)
- Sort: Navn / Pris / Bookinger
- Primary CTA: `+ Ny tjeneste` → `NewServiceModal`

## Eksempel-rader (5 første av 12)

| Navn | Varighet | Pris | Kategori | Bookinger mnd |
|---|---|---|---|---|
| 1:1 Coaching 60 min | 60 min | 1 600 kr | Coaching | 28 |
| 1:1 Coaching 30 min | 30 min | 900 kr | Coaching | 18 |
| Mulligan Studio 1 — leie | 60 min | 650 kr | Studio | 47 |
| Greenfee Bossum GK 18h | 4t | 720 kr | Greenfee | 12 |
| WANG gruppeøkt | 90 min | 0 kr | Gruppe | 24 |

## Klikkbare elementer

Se `wireframe/audit/coachhq-services.md`. UNIKT:

| Element | States |
|---|---|
| Tjeneste-rad (klikk på navn) | default, hover, klikk → `ServiceDetailModal` |
| Aktiv-toggle | on (accent), off (muted), loading (spinner i tracker) |
| Sparkline | default, hover (tooltip med tall per mnd) |
| Pris-celle | default, dobbeltklikk → inline-edit |
| Kategori-pill | default per kategori-farge |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty:** «Ingen tjenester ennå. Lag din første for å åpne booking →»
- **Loading:** 6 skeleton-rader
- **Toggle-error:** Inline rød tekst «Kunne ikke endre status» + revert toggle

## Ønsket output fra Claude Design

1. Lyst tema, 12 tjenester
2. Mørkt tema
3. Toggle aktiv-state på én rad (animasjon-frame)
4. Filter aktivt: Kategori=Coaching (viser «Viser 4 av 12»)
5. Empty
6. Mobil ≤640px — kort-layout per tjeneste

## Ikke-mål

- Ikke designe `NewServiceModal`, `ServiceDetailModal` (egen batch)
- Ikke designe pris-historikk
- Ikke designe sub-skjerm `/admin/services/:id`

## Når du er ferdig

Lim design-link tilbake til Claude Code.
