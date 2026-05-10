# AK Golf Platform — Modal — BookingConfirmationModal

## Identitet

- **Produkt:** PlayerHQ + CoachHQ (delt — kunden ser denne, coach ser variant)
- **Trigger:** Etter "Reserver →" i Ny økt-wizard (pakke 9), Bookinger-list (batch 2), Booking via fasilitet-detalj (batch 3)
- **Type:** Single-step confirmation-modal med Stripe-link hvis betaling påkrevd
- **Tier-gating:** Ikke relevant
- **HTML-referanse:** `wireframe/screen-deck/shared/modals/booking-confirmation.html`
- **Audit:** `wireframe/audit/booking-confirmation.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst. Maks 3 lime per modal. Inkluderer Stripe-knapp hvis betaling kreves — ellers ren confirmation.

## Spec — hva modalen er for

Etter at Markus har valgt fasilitet og tid (i Ny økt-wizard pakke 9 eller Bookinger-list batch 2), åpner BookingConfirmationModal for å vise alle detaljer, sjekke at tid fortsatt er ledig, og kreve betaling hvis fasiliteten ikke er gratis (Mulligan Studio koster 350 kr/time, GFGK Range er gratis for medlemmer). Etter bekreftelse opprettes booking + sendes kalenderinvitasjon.

## Layout — UNIKT for modal

- **Modal-container:** Sentrert, max-width 560px, `rounded-xl` (12px), bakdrop standard
- **Header (sticky, 80px):**
  - Tittel italic Instrument Serif 24px: «Bekreft booking»
  - Lukk-X
- **Body (variabel, max 70vh):**

### Seksjon 1 — Booking-detalj-card

- Fasilitet-bilde topp (200px høyt, full bredde, `rounded-t-lg`)
- Fasilitet-navn + adresse: "Mulligan Indoor Studio 1 · Tomtegata 12, Fredrikstad"
- Booking-detaljer i to-kolonne layout:
  - Dato: "Onsdag 11. mai 2026"
  - Tid: "14:00 – 15:00 (60 min)"
  - Type: "1:1 Coaching"
  - Coach: avatar + "Anders K." (hvis coaching-booking)
  - Spiller: avatar + "Markus R Pedersen" (hvis coach-init)

### Seksjon 2 — Pris-tabell (kun hvis betaling)

- Rad: "Studio-leie 1 time" — `kr 280,00`
- Rad: "MVA (25%)" — `kr 70,00`
- Rad: **"Totalt"** — `kr 350,00`
- Hvis abonnement dekker: "✓ Dekkes av AK Golf Pro · kr 0,00"

### Seksjon 3 — Avlysning-policy (mini-info)

- Liten info-boks: "Avlysning >24t før: gratis. Mindre enn 24t: 50% gebyr. Ikke møtt: full pris."

### Seksjon 4 — Tilleggsalternativer

- Sjekkbokser:
  - "Send påminnelse 30 min før" (default ✓)
  - "Legg til i Google Kalender" (default ✓)
  - "Notifiser coach Anders" (default ✓ hvis ikke allerede)

### Footer (sticky, 80px)

- Venstre: `Avbryt`
- Høyre:
  - Hvis gratis: `Bekreft booking →` (primary, accent)
  - Hvis betaling: `Bekreft og betal kr 350 →` (primary, accent — åpner PaymentModal pakke 17 etter klikk)

## Klikkbare elementer

| Element | States |
|---|---|
| Fasilitet-bilde | static (ev. klikk → fasilitet-detalj batch 3) |
| Coach-avatar | klikkbar → Coach-detalj (batch 3) |
| Sjekkbokser | uvalgt, valgt, focus |
| `Avbryt`-knapp | default, hover, klikk → lukker uten booking |
| `Bekreft booking →` (gratis) | default, hover, active, loading ("Reserverer …"), success (accent flash + redirect) |
| `Bekreft og betal kr X →` (betalt) | default, hover, active, loading → åpner PaymentModal pakke 17 |
| Lukk-X | default, hover |

## Empty / loading / error / success-states

- **Idle:** Alle detaljer pre-fyllt fra parent-flow
- **Tid ikke lenger ledig:** Bytter modal til error-state: "Tiden er ikke lenger ledig — noen booket den nettopp." + 3 alternativ-tids-chips + `Velg ny tid →`-knapp
- **Bekreft loading:** Hele footer disabled, CTA spinner
- **Bekreft success (gratis):** Full-modal accent-flash + tittel endres til "Booking bekreftet!", sub: "Kalenderinvitasjon sendt til markus@email.no" + CTA `Til kalender →` (auto-close 3 sek)
- **Bekreft → betaling:** Modal lukker → PaymentModal (pakke 17) åpnes
- **Bekreft error:** Toast: "Kunne ikke bekrefte. Prøv igjen."
- **Etter PaymentModal-success:** Tilbake til denne med success-state

## Mobile (≤640px)

Full-screen modal. Fasilitet-bilde 160px høyt. To-kolonne layout blir én kolonne. Footer-knapper fyller bredden.

## Ønsket output fra Claude Design

1. Lyst tema, gratis-booking (GFGK Range, kr 0)
2. Lyst tema, betalt booking (Mulligan Studio, kr 350)
3. Lyst tema, abonnement-dekket (kr 0 + ✓-badge)
4. Lyst tema, "Tid ikke lenger ledig"-error med alternativ-tids-chips
5. Lyst tema, bekreft-loading
6. Lyst tema, bekreft success ("Booking bekreftet!")
7. Mørkt tema
8. Mobil ≤640px (full-screen)

## Ikke-mål

- Ikke designe PaymentModal (pakke 17 — åpnes etter denne)
- Ikke designe Bookinger-list (batch 2)
- Ikke designe Ny økt-wizard (pakke 9 — åpner denne)
- Ikke designe RescheduleBookingModal (egen pakke)
- Ikke designe Avlysning-flyt (egen pakke)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
