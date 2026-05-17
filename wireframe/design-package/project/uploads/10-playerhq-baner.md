# AK Golf Platform — PlayerHQ — Baner (utvidet, kart + liste)

## Identitet

- **Produkt:** PlayerHQ
- **URL:** `/baner`
- **Arketype:** G — Other (kart + liste-toggle, utvidet bane-detail)
- **Tier-gating:** Free får 5 baner, Pro får ubegrenset + bane-detail
- **HTML-referanse:** `wireframe/screen-deck/playerhq/baner.html`
- **Audit:** finnes ikke ennå
- **Tilhørende modaler:** `BaneDetailModal`, `BookGreenfeeModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Baner er Markus' bane-bibliotek — alle golfklubber han har spilt på, kan booke greenfee til, eller har lagret som favoritter. Hver bane har scorehistorikk (fra runder), bane-info (par, lengde, slope/CR), og bane-kart med per-hull-info. Synker med GolfBox.

Forskjellig fra batch-2-baner (kun list + filter) — dette er utvidet med kart og bane-detail.

## Layout — UNIKT for denne skjermen

### Toggle øverst-høyre

`Liste / Kart / Favoritter`

### Kart-view (default når geo-tilgang gitt)

- Mapbox/OpenStreetMap embed, full bredde
- Pins for hver bane (lime hvis spilt, primary hvis ikke spilt, gold hvis favoritt)
- Zoom-default: Sør-Norge
- Klikk pin → quick-popover med:
  - Bane-bilde (thumbnail)
  - Navn + par
  - Avstand fra Markus' lokasjon
  - "Åpne →" til `BaneDetailModal`
  - "Book greenfee →" til `BookGreenfeeModal` (hvis tilgjengelig)

### Liste-view

Tabell-kolonner:
| Kolonne | Innhold |
|---|---|
| Bane | Thumbnail + navn |
| Par | "72" |
| Lengde | "6 240 m" (Mono) |
| Slope/CR | "127 / 71,2" (Mono) |
| Avstand | "12 km" |
| Sist spilt | "for 23 dager siden" |
| Beste score | "+3" (Mono) |
| Aksjoner | Favoritt-stjerne · Book → · Detalj → |

### Favoritter-view

Grid 3-kolonne med store cards (bane-bilde + navn + 2-rad info).

### Tier-gate (Free)

Hvis Free: vis kun 5 baner, resten blurred ut med "Pro: ubegrenset bane-bibliotek + bane-detalj med per-hull-info →".

## KPI-strip (4 kort)

1. Baner spilt: 12
2. Favoritter: 4
3. Snitt-score (siste 10 runder): +5,2
4. Beste runde: +1 på Bossum (12. juni 2025)

## Filter-bar — UNIKT

- Søk: "Søk bane eller klubb"
- Chip: Region (Østfold / Oslo / Vestfold / …)
- Chip: Antall hull (9 / 18 / 27)
- Chip: Spilt? (Ja / Nei)
- Sort: Avstand / Sist spilt / Beste score / A-Å
- Primary CTA (Pro): `+ Legg til bane manuelt`

## Klikkbare elementer

| Element | States |
|---|---|
| Pin på kart | default, hover (lift + tooltip), klikk → quick-popover |
| Quick-popover Åpne | default, hover, klikk → `BaneDetailModal` |
| Quick-popover Book | default, hover, klikk → `BookGreenfeeModal` |
| Liste-rad | default, hover, klikk → `BaneDetailModal` |
| Favoritt-stjerne | tom (default), fylt (favoritt), hover, klikk → toggle |
| Tier-gate-card | default, hover på CTA, klikk → opg-flyt |

## Empty / loading / error

- **Empty (ingen baner):** "Ingen baner ennå. Logg en runde for å bygge biblioteket ditt →"
- **Loading kart:** Skeleton-kart med spinner sentrert
- **Geo-tilgang nektet:** Banner "Tillat plassering for å se baner i nærheten →" + fallback til liste-view
- **GolfBox-sync-error:** Banner "Kunne ikke synke fra GolfBox. Viser cached →"

## Ønsket output fra Claude Design

1. Lyst tema, kart-view med 8 pins (Sør-Norge)
2. Mørkt tema, samme
3. Quick-popover åpen på en bane
4. Liste-view lyst tema
5. Favoritter-view (4 cards)
6. Free-tier med tier-gate på 5+ baner
7. Mobil ≤640px — kart full skjerm, liste blir kort-layout

## Ikke-mål

- Ikke designe `BaneDetailModal`, `BookGreenfeeModal` (egen batch)
- Ikke designe per-hull-bane-kart (egen sub-flow)
- Ikke designe GolfBox-OAuth

## Når du er ferdig

Lim design-link tilbake til Claude Code.
