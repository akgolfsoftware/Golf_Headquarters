# AK Golf Web — Anlegg-detalj

## Identitet

- **Produkt:** Web
- **URL:** `/anlegg/[slug]` (eks. `/anlegg/mulligan-indoor`)
- **Arketype:** Web — long-form anlegg-side
- **HTML-referanse:** `wireframe/screen-deck/web/anlegg-detalj.html`
- **Audit:** `wireframe/audit/web-anlegg-detalj.md`

## Designsystem

Bruk `branding-style-guide.html` + `design-system-v2.md` + `web/_shared.css`.

## Spec — hva siden er for

Detalj-side for ett anlegg. Bruker Mulligan Indoor som referanse-template.
Konverterer fra "interessant" til "kommer på besøk" eller "booker time".

## Layout — UNIKT

### 1. Hero (mørk #0A0A0A, 96px, asymmetrisk)

Venstre (50%):
- Eyebrow (mono lime): `MULLIGAN INDOOR · FREDRIKSTAD`
- H1: `Innendors *premium-golf*. Hele aret.`
- Sub: `Fire TrackMan-simulatorer, kafe, lounge og coaching i sentrum av Fredrikstad.`
- Specs-rad (mono): `4 SIMULATORER · APENT 09:00-22:00 · 7 DAGER/UKE`
- CTAs: `Book time →` (lime) + `Se priser →` (outline)

Hoyre (50%): Stort fasilitet-bilde (rounded-2xl)

### 2. Galleri (lys, 64px, grid-3)

6 bilder i grid (hover -> lightbox modal):
- Simulator-bay
- Lounge-omrade
- Kafe-disk
- TrackMan-skjerm
- Coaching-okt
- Eksterior

### 3. Hva tilbyr vi (lys, 96px, grid-3)

6 facility-cards:
- **4 TrackMan-simulatorer** — Track 4 + Performance Studio
- **Coaching-rom** — Privat 1:1 med Anders eller Markus
- **Kafe** — Kaffe, toast, smoothies
- **Lounge** — Sofakroker, stor TV, gratis WiFi
- **Pro shop** — Mizuno-utstyr, fitting
- **Treningsstudio** — Vekter, mobility, golf-spesifikk

### 4. Pris-tabell (lys-sand, 64px)

Kompakt pris-oversikt:

| Tjeneste | Pris |
|---|---|
| Sim-leie 1 time | 350 kr |
| Sim-leie 2 timer | 600 kr |
| Sim-pakke (10 timer) | 2 800 kr |
| 1:1 coaching | 1 600 kr/time |
| TrackMan-analyse | 800 kr/30 min |
| Aarskort sim (ubegrenset) | 12 000 kr |

CTA: `Se alle priser →`

### 5. Hvordan komme hit (lys, 64px, asymmetrisk)

Venstre (40%):
- Adresse: Storgata 12, 1607 Fredrikstad
- Apningstider:
  - Man-Fre: 09:00-22:00
  - Lor-Son: 10:00-20:00
- Telefon: +47 482 35 700
- Epost: hei@mulligangolf.no
- Kollektiv: 5 min gange fra Fredrikstad stasjon
- Parkering: Gratis i Storgata-parken (10 min)

Hoyre (60%): Embedded Google Maps eller statisk kart-bilde med pin

### 6. Mørkt CTA-band

`Vil du komme innom?` -> `Book time →` (lime) + `Bestill omvisning →` (outline)

### 7. Footer

## Klikkbare elementer

| Element | States |
|---|---|
| Galleri-bilde | default, hover (slight zoom), klikk -> lightbox |
| Pris-rad | default, hover (subtle bg-shift) |
| Telefon/epost-link | default, hover (lime), klikk -> tel:/mailto: |
| Hero CTA | default, hover, active, focus |

## Empty / loading / error

- **Galleri-loading:** Skeleton 16:9-kort
- **Kart-loading:** Skeleton

## Ønsket output fra Claude Design

1. Mulligan Indoor full side i lyst tema
2. Mobil <=640px — hero stables, galleri 1-kol
3. Lightbox åpen pa et galleri-bilde
4. Variant: GFGK Range (annerledes facilities, bare sommer)

## Ikke-mål

- Ikke designe online booking-kalender
- Ikke include live-belegg (sjekk paa /booking)

## Når du er ferdig

Lim design-link tilbake.
