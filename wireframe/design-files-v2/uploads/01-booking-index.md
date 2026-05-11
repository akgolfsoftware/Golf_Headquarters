# AK Golf Platform — Booking — Forside

## Identitet

- **Produkt:** Booking (`booking.akgolf.no`)
- **URL:** `/`
- **Arketype:** G — Wizard / public-entry
- **Tier-gating:** Ingen (alt er public)
- **HTML-referanse:** `wireframe/screen-deck/booking/index.html`
- **Audit:** `wireframe/audit/booking-index.md`
- **Tilhørende modaler:** `LoginPopupModal` (pakke 28)

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Eksakte token-navn — ikke hardkode hex.

## Spec — hva skjermen er for

Booking-forsiden er det første kunden møter når de klikker "Book time" fra `akgolf.no` eller går direkte til `booking.akgolf.no`. Det er en kategori-velger: "Hva slags time vil du booke?" Tre tydelige kategorier (Personlig coaching / TrackMan-økt / Junior-time) som hver leder inn i wizard-flyten. Ingen progress-stripe ennå — den vises først fra steg 1 (Tjeneste-velger). Forsiden skal redusere "valg-paralyse" — kunden må kunne velge på under 5 sekunder.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec (top-nav, ingen sidebar). I tillegg:

- **Hero-band:** Lys gradient (`linear-gradient(180deg, #FAFAF7 0%, #F0F2F0 100%)`), 80px+64px padding
  - Mono caps: "VÅR 2026 · LEDIGE TIDER NESTE 4 UKER"
  - H1 56px Instrument Serif: "Book din neste *økt*" (italic på "økt", color: primary)
  - Sub: "Personlig coaching, TrackMan-økt eller junior-time. Velg hva du vil bestille — vi finner ledig tid sammen med en av våre coacher."
- **3 kategori-cards** (grid-template-columns: repeat(3, 1fr), gap 20px, max-width 1100px, margin-top -32px så de overlapper hero-band)
  - Card 1: Personlig coaching (icon "1:1" i primary-tint, fra 1 600 kr)
  - Card 2: TrackMan-økt (icon "TM" i accent-tint, fra 800 kr)
  - Card 3: Junior-time (icon "JR" i gold-tint, fra 600 kr)
- **Tillit-bånd under cards:** "PGA-coacher · Sikker betaling med Stripe og Vipps · Fri avbestilling 24t før"
- **FAQ-strip nederst:** 4 vanlige spørsmål, expandable (klikk → drawer ned)

## Top-nav

- Venstre: "AK Golf · Booking"
- Høyre: "Min side →" (link)

## Ingen progress-stripe

Forsiden er pre-wizard. Stripe vises først på `02-booking-tjenester`.

## Klikkbare elementer

| Element | States |
|---|---|
| Kategori-card | default, hover (lift -3px + accent border), klikk → `02-booking-tjenester.md` med kategori pre-filtrert |
| "Min side →" | default, hover (underline), klikk → enten `19-booking-min-side.md` eller `28-modal-login-popup.md` |
| FAQ-rad | collapsed, expanded (chevron roterer 180°) |

## Empty / loading / error

- **Loading:** Skeleton-band 80px høyde for hero + 3 grå card-skeletons
- **Error (server nede):** Sentrert "Kunne ikke laste tjenester. Prøv igjen om litt." + retry-CTA
- Ingen empty-state (forsiden har alltid 3 kategorier)

## Ønsket output fra Claude Design

1. Lyst tema (default), full forside med hero + 3 cards + tillit-bånd + FAQ
2. Mørkt tema (samme)
3. Hover-state på Card 1 (Personlig coaching)
4. FAQ åpen på første spørsmål "Hvor mye koster en time?"
5. Mobil ≤640px — cards stables vertikalt, hero-tekst 36px, padding 24px

## Ikke-mål

- Ikke designe `02-booking-tjenester` (egen pakke)
- Ikke designe `28-modal-login-popup` (egen pakke)
- Ikke designe akgolf.no-marketing (batch 8)
- Ikke vise progress-stripe (forsiden er pre-wizard)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
