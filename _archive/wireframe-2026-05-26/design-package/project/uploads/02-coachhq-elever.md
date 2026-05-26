# AK Golf Platform — CoachHQ — Elever

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/elever`
- **Arketype:** B — List + filter (primary list)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/elever.html`
- **Audit:** `wireframe/audit/coachhq-elever.md`
- **Tilhørende modaler:** `NewPlayerModal`, `ChangeCategoryModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Spillerlisten er CoachHQs primære navigasjonsflate — herfra går coach inn på alle spiller-detaljer. 38 aktive spillere fordelt på kategorier (A til K), tier (Free/Pro/Elite) og status (aktiv/inaktiv/skadet). Skjermen brukes daglig for å finne spillere, sjekke hvem som ikke har trent på lenge, og kjøre bulk-handlinger på tvers av grupper.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec. Tabell-kolonner (8):

| Kolonne | Innhold | Bredde |
|---|---|---|
| ☐ Bulk | checkbox | 40px |
| Spiller | Avatar (32px) + navn (Geist 14px) + e-post under (muted 12px) | 280px |
| Kategori | Pill A–K (lime for A, mer dempet jo lavere) | 80px |
| Tier | Pill: Free (muted) / Pro (primary) / Elite (accent) | 80px |
| HCP | JetBrains Mono, høyrejustert, f.eks. `+2.4` `8.7` `24.1` | 80px |
| Status | Aktiv (accent-prikk) / Inaktiv (muted) / Skadet (destructive) | 100px |
| Siste økt | f.eks. «for 3 dager siden», forfalt (>14d) i destructive | 140px |
| Aksjoner | «...»-meny (RowActionsMenu) | 40px |

## KPI-strip (4 kort)

1. Aktive spillere: 38
2. Pro+Elite: 14 av 38
3. Inaktive >30d: 4
4. Skadet: 2

## Filter-bar — UNIKT

- Søk: «Søk spiller, e-post eller HCP»
- Chip: Kategori (multi: A B C D E F G H I J K)
- Chip: Tier (Free / Pro / Elite)
- Chip: Status (Aktiv / Inaktiv / Skadet)
- Chip: Coach (Anders K / Sara / Tom)
- Sort: Navn / HCP / Sist trent / Tier
- Primary CTA: `+ Ny spiller` → `NewPlayerModal`

## Bulk-actions (vises når ≥1 valgt)

Sticky bar over tabellen: «{N} valgt» + 4 knapper:
- `Send melding`
- `Endre coach`
- `Endre kategori` → `ChangeCategoryModal`
- `Eksporter CSV`

## Eksempel-rader (4 første)

| Spiller | Kat | Tier | HCP | Status | Siste økt |
|---|---|---|---|---|---|
| Markus Roinås Pedersen | A | Elite | +2.4 | Aktiv | i dag |
| Emma Solberg | B | Pro | 8.7 | Aktiv | for 2 dager siden |
| Joachim Tangen | C | Pro | 14.2 | Skadet | for 18 dager siden |
| Lina Hellesund | A | Elite | 4.1 | Aktiv | i går |

## Klikkbare elementer

Se `wireframe/audit/coachhq-elever.md`. UNIKT:

| Element | States |
|---|---|
| Spiller-rad (klikk på navn) | default, hover, klikk → `/admin/elever/:id` |
| Kategori-pill | default, klikk → ChangeCategoryModal |
| Tier-pill | default (info-popover på hover) |
| Bulk-checkbox | uvalgt, valgt, partial (header-checkbox) |
| Bulk-action-bar | hidden, slide-in når selection ≥1 |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty totalt:** «Ingen spillere ennå. Inviter din første →» CTA
- **Empty filter:** «Ingen treff for filteret. Tilbakestill →»
- **Loading:** 8 skeleton-rader (avatar-sirkel + tekst-bars)

## Ønsket output fra Claude Design

1. Lyst tema med 38 spillere, ingen filter aktiv
2. Mørkt tema, samme data
3. Filter aktivt: Kategori=A,B + Tier=Pro,Elite (viser «Viser 9 av 38»)
4. Bulk-state: 3 spillere valgt, action-bar synlig
5. Loading-state
6. Mobil ≤640px — kort-layout, hver spiller som card med avatar venstre + 4 datapunkter stablet

## Ikke-mål

- Ikke designe `NewPlayerModal`, `ChangeCategoryModal` (egen pakke)
- Ikke designe spiller-detalj-skjerm
- Ikke designe import-flyt fra GolfBox

## Når du er ferdig

Lim design-link tilbake til Claude Code.
