# AK Golf Platform — Booking — Coach-velger

## Identitet

- **Produkt:** Booking
- **URL:** `/coaches`
- **Arketype:** G — Wizard / steg 2 av 5 (coach-variant)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/coaches.html`
- **Audit:** `wireframe/audit/booking-coaches.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Steg 2 av wizarden når kunden har valgt en coaching-tjeneste. Viser 6 coacher med tilgjengelighet i sanntid (grønn = ledig denne uka, gul = noen tider, rød = fullt). Kunden klikker en coach for å se detaljer eller hopper rett til kalender med coach pre-valgt. Avgjørende at "ledig vs. fullt" er øyeblikkelig synlig.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "1. Tjeneste ✓ → 2. Coach" (primary).

- **Hero:** Mono kontekst "PERSONLIG COACHING · 60 MIN · 1 600 KR" + H1 "Velg *coach*"
- **Sub:** "6 coacher tilgjengelig. Grønn prikk = ledig denne uka, gul = noen ledige tider, rød = fullt."
- **Filter-bar:** `Spesialitet: Alle ▾`, `Anlegg: Alle ▾`, `Kun ledige` (toggle)
- **Coach-grid:** 2-kolonne, gap 16px
  - Avatar 64px (sirkel, primary bg, accent tekst, initialer)
  - Navn (Instrument Serif 18px) + spesialitet (mono caps muted)
  - Tilgjengelighet-prikk (8px, grønn/gul/rød) + "12 ledige tider denne uka"
  - "Se profil →" link
- **Footer-actions:** "← Tilbake" (til 02-tjenester) + ingen "Fortsett" (kort-klikk = videre)

## Eksempel-coacher (6)

| Coach | Spesialitet | Anlegg | Status |
|---|---|---|---|
| Anders Kristiansen (AK) | PGA, scoring | Mulligan | Grønn — 12 ledige |
| Sara Hansen (SH) | Junior, teknikk | GFGK | Grønn — 8 ledige |
| Tom Eriksen (TE) | Putt, mental | Bossum | Gul — 3 ledige |
| Marius Lund (ML) | TrackMan-spesialist | Mulligan | Grønn — 14 ledige |
| Eva Bakke (EB) | Long game | Mulligan | Rød — fullt denne uka |
| Per Holm (PH) | Begynner | GFGK | Grønn — 9 ledige |

## Filter-bar — UNIKT

- Spesialitet: Scoring / Junior / Putt / TrackMan / Long game / Begynner
- Anlegg: Mulligan / Bossum / GFGK
- Kun ledige: toggle (skjuler røde)

## Klikkbare elementer

| Element | States |
|---|---|
| Coach-card | default, hover (lift + accent border), klikk → `04-booking-coach-detalj` |
| Tilgjengelighet-prikk | tooltip på hover ("12 ledige timer neste 7 dager") |
| "Se profil →" | default, hover (underline) |
| Filter-chip | default, hover, open, selected |

## Empty / loading / error

- **Empty (filter gir 0):** "Ingen coacher matcher filteret. Tilbakestill →"
- **Loading:** 6 skeleton-cards (avatar + tekst-bars)
- **Error:** "Kunne ikke laste tilgjengelighet. Prøv igjen."

## Ønsket output fra Claude Design

1. Lyst tema med 6 coacher
2. Mørkt tema (samme)
3. Filter "Kun ledige" aktiv (skjuler Eva Bakke)
4. Hover-state på Anders K-card
5. Mobil ≤640px — 1-kolonne

## Ikke-mål

- Ikke designe coach-detalj-side (pakke 04)
- Ikke designe anlegg-velger (pakke 05)
- Ikke designe admin (CoachHQ batch 2-team)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
