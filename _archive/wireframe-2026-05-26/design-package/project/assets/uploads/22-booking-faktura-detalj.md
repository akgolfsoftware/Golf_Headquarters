# AK Golf Platform — Booking — Faktura-detalj

## Identitet

- **Produkt:** Booking (kunde-portal)
- **URL:** `/min-side/fakturaer/F-2026-0094`
- **Arketype:** G — Kunde-portal detalj
- **Tier-gating:** Krever innlogging
- **HTML-referanse:** `wireframe/screen-deck/booking/faktura-detalj.html`
- **Audit:** `wireframe/audit/booking-faktura-detalj.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Per-faktura. Viser fakturalinjer, MVA-spec, total, betalingsmetode, betalingsdato, lenke tilbake til original booking, og PDF-knapp. Designet skal speile PDF-versjonen så kunden ser samme layout som i .pdf-en.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec uten progress-stripe.

- **Tilbake-link:** "← Fakturaer"
- **Hero:**
  - Mono caps: "FAKTURA-NR · F-2026-0094"
  - H1 "Personlig *coaching*" (italic på "coaching")
  - Status-pill stor: Betalt (success) / Venter / Forfalt
- **Faktura-card (paper-stil — lys bg, subtil shadow):**
  - Topp: AK Golf-logo venstre, "AK GOLF GROUP AS" + org.nr 932 456 789 + adresse höyre
  - "Faktura til:" — Markus Rønning + adresse
  - Dato: 12.05.2026 · Forfall: 12.05.2026 · Betalt: 12.05.2026
  - Linje-tabell:
    - "Personlig coaching · 12.05.2026 09:00 · Anders K · Mulligan" — 1 stk · 1 440 kr · 1 440 kr
    - "Video-analyse" — 1 stk · 360 kr · 360 kr
  - Sub-totalt: 1 800 kr eks. MVA
  - MVA 25 %: 360 kr (NB: idrettstjenester normalt MVA-fritt, men eksempel-data viser 25 % for visuell konsistens — Anders justerer reelle satser ved implementasjon)
  - **Total inkl. MVA**: 1 800 kr (Instrument Serif 24px primary)
- **Betalings-info:**
  - Metode: Visa **** 4242 (eller Vipps)
  - Stripe payment ID: `pi_3OqXY...` (mono, små tegn)
- **Lenke tilbake:** "Se booking BK-2026-0512-0094 →"
- **Footer-actions:** "← Tilbake" + "Last ned PDF ↓" (primary) + "Send på e-post"

## Klikkbare elementer

| Element | States |
|---|---|
| "Last ned PDF ↓" | default, hover, loading, klikk → fil-nedlasting |
| "Send på e-post" | default, hover, loading, success ("Sendt ✓") |
| "Se booking → " | klikk → 20-min-booking-detalj |
| "← Tilbake" | default, hover |

## Empty / loading / error

- **Loading:** Skeleton card
- **Error (faktura ikke funnet):** "Faktura ikke funnet. Tilbake →"

## Ønsket output fra Claude Design

1. Lyst tema, Betalt-status, alle felt fyllt
2. Lyst tema, Forfalt-status (destructive bånd + "Betal nå →"-CTA)
3. Mørkt tema
4. Loading PDF
5. Mobil ≤640px — full bredde, paper-card 100%

## Ikke-mål

- Ikke designe PDF-malen selv (intern fakturering)
- Ikke designe admin faktura-CRUD
- Ikke implementer ekte PDF-generering

## Når du er ferdig

Lim design-link tilbake til Claude Code.
