# AK Golf Platform — Booking — Klippekort

## Identitet

- **Produkt:** Booking (kunde-portal)
- **URL:** `/min-side/klippekort`
- **Arketype:** G — Kunde-portal saldo
- **Tier-gating:** Krever innlogging
- **HTML-referanse:** `wireframe/screen-deck/booking/klippekort.html`
- **Audit:** `wireframe/audit/booking-klippekort.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Klippekort-saldo + transaksjons-historikk. Stort sentrert kort som viser "7 / 10 brukt" med progress-ring, gyldig-dato, og knapp "Bruk klipp på neste booking →". Under: liste over alle bruk (dato, hvilken booking).

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec uten progress-stripe.

- **Tilbake-link:** "← Min side"
- **Hero:** Mono "MARKUS RØNNING" + H1 "Mine *klippekort*"
- **Aktivt klippekort-card (stor, sentrert):**
  - Pakke-tittel: "10-pakke Personlig coaching" (Instrument Serif 24px)
  - Progress-ring 160px diameter (lime accent stroke 8px) — "7 / 10" sentrert (Instrument Serif 36px)
  - Sub-info: "3 klipp igjen" (mono caps)
  - Gyldig til: "12. mars 2027" (mono)
  - CTA: "Bruk klipp på neste booking →" (primary)
- **Bruks-historikk (8 rader):**
  - Tabell: Dato, Coach, Sted, Booking-nr-link
  - Eksempel: "28. apr 2026 · Anders K · Mulligan · BK-2026-0428-0078 →"
- **Andre klippekort-card (collapsed):**
  - "Tidligere klippekort (1 brukt opp)" — accordion
- **Kjøp nytt-CTA:** "Kjøp nytt klippekort →" (ghost, sender til 10-pakke)

## Eksempel-data

- Aktivt: 10-pakke, 7/10 brukt, gyldig til 12.03.2027
- Tidligere brukt opp: 5-pakke (5/5 brukt, mars 2025)

## Klikkbare elementer

| Element | States |
|---|---|
| "Bruk klipp →" | default, hover, klikk → 01-index med klippekort pre-valgt |
| Bruks-rad | klikk → 20-min-booking-detalj |
| Accordion "Tidligere" | collapsed, expanded |
| "Kjøp nytt →" | default, hover, klikk → 10-pakke |

## Empty / loading / error

- **Empty (ingen klippekort):** Stort sentrert "Du har ingen aktive klippekort. Kjøp ditt første →" (CTA → 10-pakke)
- **Empty utløpt klippekort:** "Klippekortet utløp 12.03.2026 med 2 klipp ubrukt. Kontakt oss for refusjon →"
- **Loading:** Skeleton card + 8 rader
- **Error:** "Kunne ikke laste klippekort."

## Ønsket output fra Claude Design

1. Lyst tema, 7/10 brukt + 8 transaksjons-rader
2. Lyst tema, fullt brukt (10/10) — progress-ring 100% lime, "Kjøp nytt →" prominent
3. Mørkt tema
4. Empty (ingen klippekort)
5. Mobil ≤640px — progress-ring 120px, full bredde

## Ikke-mål

- Ikke designe pakke-velger (pakke 10)
- Ikke designe admin klippekort
- Ikke designe refusjons-flow

## Når du er ferdig

Lim design-link tilbake til Claude Code.
