# AK Golf Platform — CoachHQ — Lokasjoner

## Identitet

- **Produkt:** CoachHQ
- **URL:** `/admin/locations`
- **Arketype:** B — List + filter (kart + liste split-view)
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/coachhq/locations.html`
- **Audit:** `wireframe/audit/coachhq-locations.md`
- **Tilhørende modaler:** `NewLocationModal`, `LocationDetailModal`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Lokasjoner er parent-anlegg (klubb, simulatorhall, drivingrange). Hver lokasjon har én eller flere fasiliteter (Performance Studio 1–4, Range, Putting green, etc.) — booking går mot fasilitet. Coach bruker denne skjermen for å se alle anlegg på et kart, åpningstider og kapasitet i ett blikk, og for å åpne lokasjon-detalj for fasilitet-administrasjon.

## Layout — UNIKT for denne skjermen

Bruker arketype-B-felles-spec, men med **split-layout**:

- **Venstre 50% — Kart (placeholder)**
  - Norgeskart med 5 markører (Fredrikstad-området + Drøbak)
  - Markør = lime accent-prikk med klubb-initial
  - Klikk markør → highlight tilsvarende rad i listen + popover
  - Zoom-kontroller bunn-høyre
- **Høyre 50% — Liste (kort, ikke tabell)**
  - 5 lokasjon-kort stablet vertikalt
  - Per kort: navn (Geist 16px bold), adresse (muted), åpningstider, kapasitet, antall fasiliteter, mini-pyramid med fasilitet-typer
  - Hover på kort → tilsvarende kart-markør pulserer

## De 5 lokasjonene (alle synlige som default)

| Lokasjon | Adresse | Fasiliteter | Åpningstider |
|---|---|---|---|
| Mulligan Indoor Fredrikstad | Storgata 12, Fredrikstad | 4 (Studio 1–4) | 06:00–23:00 alle dager |
| Bossum GK | Bossum, Borge | Range, 18h bane, putting | 07:00–21:00 (sesong) |
| Gamle Fredrikstad GK | Solli, Fredrikstad | Range, 18h bane, kortspill | 07:00–22:00 (sesong) |
| Drøbak GK | Drøbak | 18h bane, range | 07:00–21:00 (sesong) |
| Fredrikstad GK | Fredrikstad | Range, 9h bane | 08:00–20:00 (sesong) |

## KPI-strip (3 kort, mindre fordi kart tar plass)

1. Aktive lokasjoner: 5
2. Totale fasiliteter: 12
3. Snitt-belegg denne uka: 67%

## Filter-bar — UNIKT

- Søk: «Søk lokasjon eller adresse»
- Chip: Type (Indoor / Bane / Range / Hybrid)
- Chip: Region (Fredrikstad-området / Drøbak / Annet)
- Sort: Navn / Belegg / Fasilitet-antall
- Primary CTA: `+ Ny lokasjon` → `NewLocationModal`

## Klikkbare elementer

Se `wireframe/audit/coachhq-locations.md`. UNIKT:

| Element | States |
|---|---|
| Kart-markør | default, hover (skala 1.2x + label), aktiv (lime ring) |
| Lokasjon-kort | default, hover (lift + accent border), klikk → `LocationDetailModal` |
| Zoom-kontroller | default, hover, disabled (zoom-grense) |
| Mini-pyramid på kort | static info-grafikk (4 fasilitet-typer som ikoner) |
| Filter-chip | default, hover, selected, disabled |

## Empty / loading / error

Felles arketype-B + UNIKT:
- **Empty:** «Ingen lokasjoner ennå. Legg til din første →» med stort `MapPin`-ikon
- **Loading kart:** Grått skimmer-rutenett
- **Loading liste:** 3 skeleton-kort
- **Kart-error:** «Kart kunne ikke lastes. Vis kun liste →» fallback

## Ønsket output fra Claude Design

1. Split-layout lyst tema, kart med 5 markører + 5 kort
2. Mørkt tema
3. Hover-state: én markør aktiv, tilsvarende kort highlighted
4. Mobil ≤768px — kart kollapses til toppbanner (180px høyde), liste går full bredde under
5. Empty
6. Loading

## Ikke-mål

- Ikke designe `NewLocationModal`, `LocationDetailModal` (egen batch)
- Ikke designe `/admin/locations/:id`-skjerm (sub-skjerm)
- Ikke designe ekte kart-integrasjon (Mapbox/Google Maps) — placeholder kun

## Når du er ferdig

Lim design-link tilbake til Claude Code.
