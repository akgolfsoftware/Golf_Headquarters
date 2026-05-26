# AK Golf Platform — Booking — Betaling (Vipps)

## Identitet

- **Produkt:** Booking
- **URL:** `/betaling?metode=vipps`
- **Arketype:** G — Wizard / steg 4 av 5 (Vipps-flow)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/betaling-vipps.html`
- **Audit:** `wireframe/audit/booking-betaling-vipps.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Vipps-betaling. Kunden skriver inn telefonnummeret, klikker "Send Vipps-betaling →", og lander på en waiting-state hvor de instrueres til å åpne Vipps-appen og bekrefte. Polling i bakgrunnen — når Vipps melder OK, redirecter vi til bekreftelse. Timeout etter 5 minutter.

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "4. Betaling" (primary).

### State 1 — Telefon-input

- **Hero:** Mono "STEG 4 AV 5 · 1 800 KR" + H1 "Betal med *Vipps*"
- **Metode-tabs:** "Kort | **Vipps** | Faktura" (Vipps active)
- **Vipps-card:**
  - Vipps-logo (orange, 80×40px)
  - Telefon-felt (8 sifre, format `XXX XX XXX`, placeholder "90 12 34 56")
  - Pre-fylt for innlogget kunde
- **CTA:** "Send Vipps-betaling →" (Vipps-orange `#FF5B24`, white tekst, large)

### State 2 — Waiting

- Sentrert ikon — Vipps-logo orange + pulserende ring
- H2 "Åpne Vipps-appen på *mobilen*"
- Sub: "Vi sendte en betalingsforespørsel til 90 12 34 56. Bekreft i Vipps-appen for å fullføre."
- Tidsteller: "Utløper om 4:32" (mono)
- "Send på nytt" link (kun aktiv etter 1 minutt)
- "← Velg annen betalingsmetode" ghost-knapp

## Klikkbare elementer

| Element | States |
|---|---|
| Telefon-felt | default, focus, filled, error (ugyldig nummer) |
| "Send Vipps-betaling →" | default, hover, active, loading |
| "Send på nytt" | disabled (i 60 sekunder), default, hover |
| "← Velg annen metode" | default, hover (avbryter Vipps-session) |

## Empty / loading / error

- **Loading state 1 → 2:** Knapp viser spinner, deretter waiting-state vises
- **Error (Vipps avviser):** "Vipps avviste betalingen. Prøv et annet nummer eller bruk kort."
- **Timeout (5 min):** "Tiden gikk ut. Klikk 'Send på nytt' eller velg annen metode."

## Ønsket output fra Claude Design

1. State 1: telefon-input, anonym (tomt felt)
2. State 1: telefon-input, innlogget (pre-fylt)
3. State 2: waiting med pulserende ring + tidsteller
4. Mørkt tema (state 1)
5. Mobil ≤640px — full bredde, Vipps-CTA sticky-bunn

## Ikke-mål

- Ikke designe Stripe-betaling (pakke 16)
- Ikke implementer ekte Vipps API
- Ikke designe avansert Vipps-tilfeller (refund flow er admin-side)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
