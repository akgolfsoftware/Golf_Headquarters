# AK Golf Platform — Booking — Anlegg-velger

## Identitet

- **Produkt:** Booking
- **URL:** `/anlegg`
- **Arketype:** G — Wizard / steg 2 av 5 (anlegg-variant)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/anlegg.html`
- **Audit:** `wireframe/audit/booking-anlegg.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Steg 2 når tjenesten er fasilitet-basert (TrackMan-økt selvspill, gruppetrening). Viser tre anlegg med kart-snapshot, åpningstider, distanse fra kundens posisjon (hvis tillatt), og pris-info. Kart kan toggle mellom liste og kart-view.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "1. ✓ → 2. Anlegg" (primary).

- **Hero:** Mono "TRACKMAN-ØKT SELVSPILL · 60 MIN · 800 KR" + H1 "Velg *anlegg*"
- **Sub:** "3 anlegg å velge mellom. Avstander beregnet fra din posisjon."
- **View-toggle:** Liste / Kart (segmentert)
- **Filter-bar:** `Avstand: Alle ▾`, `Åpent nå`, `Med TrackMan`
- **Liste-view:** 1-kolonne, gap 12px
  - Kort: anleggsbilde 120×120px venstre, info høyre (navn, adresse, åpningstider, distanse)
  - Status-pill: "Åpent nå" (success) / "Stenger 22:00" (warning) / "Stengt" (muted)
- **Kart-view:** Mapbox-snapshot 600px høy med 3 pin (lime accent), klikk pin → side-panel med anleggsinfo
- **Footer-actions:** "← Tilbake" + ingen "Fortsett" (kort-klikk = videre)

## Eksempel-anlegg (3)

| Anlegg | Adresse | Distanse | Åpningstider | Status |
|---|---|---|---|---|
| Mulligan Fredrikstad | Stabburveien 7, 1617 Fredrikstad | 2,4 km | 06:00–22:00 | Åpent nå |
| Bossum GK | Bossumveien 14, 1640 Råde | 12,8 km | 08:00–20:00 | Åpent nå |
| GFGK Range | Sportsveien 3, 1611 Fredrikstad | 4,1 km | 09:00–21:00 | Åpent nå |

## Filter-bar — UNIKT

- Avstand: < 5 km / < 15 km / Alle
- Åpent nå: toggle
- Med TrackMan: toggle (kun Mulligan har)

## Klikkbare elementer

| Element | States |
|---|---|
| Anlegg-card | default, hover (lift + accent border), klikk → `06-booking-anlegg-detalj` |
| View-toggle Liste/Kart | default, hover, active per side |
| Kart-pin | default, hover (større), klikk → side-panel |
| Filter-chip | default, hover, open, selected |

## Empty / loading / error

- **Empty (filter gir 0):** "Ingen anlegg matcher filteret."
- **Loading:** 3 skeleton-cards
- **Error (geo-permission denied):** "Distanser ikke tilgjengelig — slå på posisjon i nettleseren"
- **Error (kart):** Fallback til liste-view + "Kunne ikke laste kart"

## Ønsket output fra Claude Design

1. Liste-view, lyst tema, 3 anlegg
2. Mørkt tema (liste)
3. Kart-view (samme data, Mulligan-pin valgt med åpent side-panel)
4. Empty filter
5. Mobil ≤640px — 1-kolonne, kart-view 100vh full-screen

## Ikke-mål

- Ikke designe anlegg-detalj (pakke 06)
- Ikke designe admin lokasjoner (CoachHQ batch 2-locations)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
