# AK Golf Platform — Booking — EndreBookingModal

## Identitet

- **Produkt:** Booking (modal)
- **Åpnes fra:** 20-min-booking-detalj ("Endre tid")
- **Arketype:** Modal — full-screen flyt (mini-wizard i modal)
- **Tier-gating:** Krever innlogging
- **HTML-referanse:** `wireframe/screen-deck/booking/modals/endre-booking.html`
- **Audit:** `wireframe/audit/booking-modal-endre-booking.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Endre-tid-modal. Kunden ser nåværende booking, velger "Bytt til ny tid" → mini-kalender (samme coach + tjeneste, neste 14 dager), velger ny tid, ser sammendrag av endring (gammel → ny), bekrefter. Ingen ekstra kostnad hvis innenfor 24t-vindu, ellers gebyr 100 kr.

## Layout — UNIKT for denne modalen

- **Modal-overlay:** rgba(10,31,23,0.6) backdrop
- **Modal-card:** Stor — 720px bredde, padding 32px, max-height 90vh scrollbar
- **Header:**
  - H2 "Endre *tid*"
  - Original tid: "Tirsdag 12. mai 09:00 · Anders K"
  - Lukk-X
- **Mini-kalender (14 dager):**
  - 7-kolonne grid, dato-celler med ledig-status (samme som 07-kalender-måned, kompakt)
  - Klikk dag → vis tider for den dagen i side-panel
- **Tider-side-panel:** 4–8 tids-pills for valgt dag
- **Endring-sammendrag-card:**
  - "FRA: 12. mai 09:00 → TIL: 13. mai 14:00"
  - Gebyr-info: "Ingen gebyr (mer enn 24t før original tid)" eller "Gebyr 100 kr (mindre enn 24t)"
- **Footer-actions:** "Avbryt" (ghost) + "Bekreft endring" (primary, disabled hvis ingen ny tid valgt)
- **Sub-info:** "Endring sendes på e-post umiddelbart."

## Klikkbare elementer

| Element | States |
|---|---|
| Dato-celle | default, hover, valgt (lime fill), disabled |
| Tids-pill | default, hover, valgt (accent ring) |
| "Avbryt" | default, hover (lukker modal) |
| "Bekreft endring" | disabled, default, hover, loading, success |

## Empty / loading / error

- **Empty (ingen ledige tider neste 14 dager):** "Coachen har ingen ledige tider neste 14 dager. Kontakt oss direkte →"
- **Loading:** Skeleton kalender
- **Race-condition error:** "Tiden ble booket av en annen. Velg en annen tid."

## Ønsket output fra Claude Design

1. Default — kalender åpen, ingen ny tid valgt
2. Ny tid valgt (13. mai 14:00) — sammendrag-card vises
3. Gebyr-state (< 24t) — warning-bånd
4. Loading "Bekreft endring"
5. Mobil ≤640px — modal full skjerm, kalender + tider stables vertikalt

## Ikke-mål

- Ikke designe full kalender (pakke 07)
- Ikke designe avbestilling (pakke 26)
- Ikke designe admin reschedule-handling

## Når du er ferdig

Lim design-link tilbake til Claude Code.
