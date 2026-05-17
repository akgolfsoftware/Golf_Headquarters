# AK Golf Platform — Booking — Feil betaling

## Identitet

- **Produkt:** Booking
- **URL:** `/feil-betaling`
- **Arketype:** G — Wizard / steg 4 av 5 (failed-state)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/feil-betaling.html`
- **Audit:** `wireframe/audit/booking-feil-betaling.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Når Stripe avviser kortet (insufficient funds, card declined, 3DS-fail). Tydelig destructive-state, men IKKE skummelt — kunden skal kunne prøve igjen umiddelbart. 3 retry-alternativer: "Prøv kortet igjen", "Bytt til Vipps", "Bytt til faktura". Original booking-info synlig så de ikke mister kontekst.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "4. Betaling" (men i destructive-rød, ikke primary).

- **Error-hero (sentrert):**
  - Lucide AlertCircle 88px i destructive-circle (`rgba(231,76,60,0.12)` bg)
  - Mono caps destructive: "BETALING AVVIST"
  - H1 36px "Noe gikk *galt*" (italic på "galt", destructive)
  - Sub: "Stripe kunne ikke trekke beløpet. Pengene er ikke trukket — bookingen er ikke gjennomført."
- **Avvisnings-årsak-card:**
  - Lucide Info + "Stripes melding: 'Your card was declined.'"
  - "Vanlige årsaker: utløpt kort, dekning, eller 3DS-feil. Kontakt banken hvis det fortsetter."
- **Retry-handlinger-grid (3-kolonne):**
  - "Prøv kortet igjen" (primary) → 16-betaling med samme kort
  - "Bytt til Vipps" (ghost) → 17-betaling-vipps
  - "Bytt til faktura" (ghost) → faktura-flow
- **Booking-info-card (kompakt sammendrag av hva som skulle bookes):**
  - Tjeneste, dato/tid, sted, total
- **Avbryt-link nederst:** "Avbryt og start på nytt" (ghost, destructive tekst) → 01-index (rensker session)
- **Hjelp:** "Trenger du hjelp? Ring 90 12 34 56 eller e-post post@akgolf.no"

## Klikkbare elementer

| Element | States |
|---|---|
| "Prøv kortet igjen" | default, hover, active, klikk → 16-betaling |
| "Bytt til Vipps" | default, hover, klikk → 17-betaling-vipps |
| "Bytt til faktura" | default, hover, klikk → faktura-flow |
| "Avbryt" | default, hover (destructive underline) |

## Empty / loading / error

- Ingen empty (alltid en feil)
- **Tidsbestemt — booking utgår om 10 min:** Tidsteller "Din valgte tid holdes i 9:32 mer..." (warning)

## Ønsket output fra Claude Design

1. Lyst tema, full feil-side med 3 retry-knapper
2. Mørkt tema
3. Hover på "Prøv kortet igjen"
4. Tidsteller-state (warning)
5. Mobil ≤640px — retry-knapper stables vertikalt

## Ikke-mål

- Ikke designe Stripe 3DS-flow (Stripe håndterer)
- Ikke designe internal admin error-handling
- Ikke designe full refusjon (admin)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
