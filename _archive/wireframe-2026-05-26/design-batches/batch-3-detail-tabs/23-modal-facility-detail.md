# AK Golf Platform — Modal — FacilityDetailModal

## Identitet

- **Type:** Modal (sentrert, 720px bred)
- **Åpnes fra:** Lokasjon-detalj kortliste · Booking-flyt fasilitet-velger · 360-profil "neste økt"-link
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/facility-detail.html`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Vise alt om en fasilitet (Mulligan Studio 2, GFGK Bossum Range, etc.): adresse, åpningstider, utstyr, bilder, neste ledige tider, og rask-bok-knapp. Brukes når spiller eller coach trenger å sjekke fasilitet før booking.

## Layout

### Header
- Hero-bilde øverst (16:9, full bredde)
- Tittel-overlay nederst på bilde: `Mulligan Studio 2` (Geist 24px hvit)
- Sub-overlay: `Indoor TrackMan · Sandefjord`
- `×`-lukk høyre topp (på bilde, hvit med skygge)

### Body (asymmetrisk)

#### Stat-pills-rad (12-col)
- `Åpningstider 06:00-22:00` · `4,9 ★ (124 reviews)` · `268 kr/time` · `Neste ledige: i kveld 19:00`

#### Venstre kolonne (8-col)

**Beskrivelse:**
*"Studio 2 har TrackMan 4, Foresight QuadMAX, og 4K-kamera-rigg for visualisering. Egnet for både fitting og analyse-økter."*

**Utstyr-liste:**
- TrackMan 4 (oppdatert v18.3)
- Foresight QuadMAX
- 4K-kamera (top + side)
- Klubbe-utvalg: Driver til SW
- Utskriftsklar A4-rapport

**Adresse:**
- Industriveien 12, 3216 Sandefjord
- Lucide `MapPin`-ikon + "Åpne i Maps →"

**Åpningstider per dag:**
- Mandag-fredag: 06:00 – 22:00
- Lørdag: 09:00 – 20:00
- Søndag: 10:00 – 18:00

#### Høyre kolonne (4-col)

**Neste ledige tider (i dag):**
- 19:00 - 20:00 (lime accent — 1t)
- 20:30 - 22:00 (1,5t)

Klikk på time = `BookSessionModal` med pre-fyllt fasilitet + tid.

**Reviews (3 nyeste):**
- ★★★★★ "Topp utstyr, god veiledning" — Markus R, 7. mai
- ★★★★★ "Perfekt for fitting" — Henrik N, 4. mai
- ★★★★☆ "Mangler bedre belysning" — Emma S, 1. mai
- Link: `Se alle 124 reviews →`

### Footer
- `Lukk` (ghost, venstre)
- `Veibeskrivelse` (secondary, midt) — åpner Maps
- `Book denne →` (lime CTA, høyre)

## States

| State | Beskrivelse |
|---|---|
| Default | Pre-fyllt med fasilitet-data |
| Loading | Skeleton hero + body |
| Stengt-state | Banner "Stengt nå — åpner 06:00 i morgen" |
| Fullbooket-state | "Ingen ledige tider i dag. Se i morgen →" |
| Maintenance-state | Banner "Vedlikehold 14.05 — stengt" |
| Map-pin-hover | Tooltip med koordinater |

## Klikkbare elementer

| Element | States |
|---|---|
| `×`-lukk | default, hover |
| Hero-bilde | klikk → utvid til fullskjerm |
| `Åpne i Maps →` | default, hover, klikk → maps-link |
| Tid-rad (ledige) | default, hover (lift), klikk → BookSessionModal |
| Review-rad | default, hover, klikk → full review-modal |
| `Se alle 124 reviews →` | default, hover (underline) |
| `Veibeskrivelse` | default, hover, loading (mens GPS-link åpnes) |
| `Book denne →` | default, hover, loading |

## Eksempel-data

- **Fasilitet:** Mulligan Studio 2
- **Adresse:** Industriveien 12, 3216 Sandefjord
- **Pris:** 268 kr/time
- **Åpningstider:** Man-fre 06-22, lør 09-20, søn 10-18
- **Neste ledige:** 19:00 (i dag), 20:30 (i dag)
- **Reviews:** 4,9/5 (124 reviews)

## Ønsket output fra Claude Design

1. Lyst tema, default state
2. Mørkt tema, samme
3. Stengt-state (banner topp)
4. Fullbooket-state ("ingen ledige")
5. Hero utvidet til fullskjerm
6. Loading-state
7. Mobil ≤640px — modal full-screen, kolonner stables

## Ikke-mål

- Ikke designe `BookSessionModal` (egen pakke i fase 4)
- Ikke designe lokasjon-list (i batch 2)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
