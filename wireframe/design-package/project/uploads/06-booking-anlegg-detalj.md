# AK Golf Platform — Booking — Anlegg-detalj

## Identitet

- **Produkt:** Booking
- **URL:** `/anlegg/mulligan-fredrikstad`
- **Arketype:** G — Wizard / steg 2 av 5 (detalj)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/anlegg-detalj.html`
- **Audit:** `wireframe/audit/booking-anlegg-detalj.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Anlegg-profil-side i booking-konteksten. Galleri av bilder, beskrivelse, fasiliteter (TrackMan, range-baller, kafé, parkering), åpningstider per ukedag, kart, og "Velg dato →" CTA som tar kunden til kalender (steg 3).

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "1. ✓ → 2. Anlegg" (primary).

- **Bilde-galleri:** 4 bilder i grid (1 stor + 3 små), klikk → lightbox
- **Hero-band under galleri:**
  - H1 "Mulligan *Fredrikstad*" (italic på by-navn)
  - Mono caps: "STABBURVEIEN 7 · 1617 FREDRIKSTAD · 2,4 KM"
  - Status-pill: "Åpent nå · stenger 22:00"
- **Beskrivelse:** 2 avsnitt brødtekst max-width 600px
- **Fasiliteter-grid:** 6 ikoner i 3-kolonne med tekst (TrackMan 4, Mulligan 1-4, Range-baller, Kafé, Parkering, Garderobe)
- **Åpningstider-tabell:** 7 rader (Man-Søn) med tider, dagens dag uthevet (lime accent)
- **Kart-card:** Mapbox 300px høy, pin på Mulligan
- **Anmeldelser:** 3 stjerne-ratings + sitater
- **Footer-actions:** "← Andre anlegg" (til 05) + "Velg dato →" (primary, til 07)

## Klikkbare elementer

| Element | States |
|---|---|
| Bilde-galleri | hover (zoom), klikk → lightbox med arrows |
| "Velg dato →" CTA | default, hover, active, focus, disabled (hvis stengt hele uka) |
| "← Andre anlegg" | default, hover |
| Kart-pin | klikk → åpner Google Maps i ny fane |
| Stjerne-rating | hover (full anmeldelse-popover) |

## Empty / loading / error

- **Loading:** Skeleton-galleri + skeleton-text
- **Error (anlegg ikke funnet):** 404-side med "Tilbake til anlegg →"
- **Empty (ingen anmeldelser):** "Ingen anmeldelser ennå"

## Ønsket output fra Claude Design

1. Lyst tema, full anlegg-side (Mulligan Fredrikstad)
2. Mørkt tema
3. Lightbox-state med ett bilde i full skjerm
4. Hover på "Velg dato →"-CTA
5. Mobil ≤640px — galleri blir karusell, fasiliteter 2-kolonne

## Ikke-mål

- Ikke designe kalender (pakke 07)
- Ikke designe admin (CoachHQ batch 2-locations)
- Ikke designe interaktivt 3D-kart

## Når du er ferdig

Lim design-link tilbake til Claude Code.
