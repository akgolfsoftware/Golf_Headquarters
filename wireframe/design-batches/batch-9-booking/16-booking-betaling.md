# AK Golf Platform — Booking — Betaling (Stripe Elements)

## Identitet

- **Produkt:** Booking
- **URL:** `/betaling`
- **Arketype:** G — Wizard / steg 4 av 5 (Stripe-betaling)
- **Tier-gating:** Ingen
- **HTML-referanse:** `wireframe/screen-deck/booking/betaling.html`
- **Audit:** `wireframe/audit/booking-betaling.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva skjermen er for

Steg 4 — Stripe Elements for kort. 3 betalingsmetoder som tabs (Kort default / Vipps / Faktura). Stripe Elements er en iframe med kort-input, MM/ÅÅ, CVC, kortholdernavn. Ved "Betal nå →" trekker Stripe beløpet og redirecter til 18-bekreftelse. Sikker-tillit-bånd nederst (Stripe-logo, SSL).

## Layout — UNIKT for denne skjermen

Bruker arketype-G-felles-spec. Progress-stripe: "4. Betaling" (primary).

- **Hero:** Mono "STEG 4 AV 5 · 1 800 KR" + H1 "Sikker *betaling*"
- **Sub:** "Vi bruker Stripe — pengene reserveres på kortet ditt og trekkes etter økten."
- **Metode-tabs (3-kolonne segmentert):**
  - "Kort" (default, primary fill)
  - "Vipps" (klikk → 17-betaling-vipps)
  - "Faktura" (kun B2B, viser tooltip "Krever org.nr")
- **Stripe Elements-card (Kort valgt):**
  - Kortnummer-felt (16 sifre, format `XXXX XXXX XXXX XXXX`)
  - 2-kolonne: Utløp (MM/ÅÅ) + CVC (3 sifre)
  - Kortholdernavn (1 felt full bredde)
  - Stripe-styling: Geist-font, 16px, primary border på focus
- **Lagre-toggle (innlogget):** "Lagre dette kortet for fremtidige bookinger" (default på)
- **Pris-oppsummering (kompakt, høyrejustert):** "Total: 1 800 kr inkl. MVA"
- **Tillit-bånd:** Lucide Lock + "256-bit SSL · Stripe-sikker betaling · ingen kortdata lagres på vår server" + Stripe + Visa + Mastercard logoer
- **Footer-actions:** "← Tilbake" + "Betal 1 800 kr →" (primary, large)

## Stripe Elements-styling

Stripe genererer iframe med egen styling — overstyr KUN disse:
- `fontFamily: 'Geist'`
- `fontSize: '16px'`
- `color: 'var(--text)'`
- `'::placeholder': { color: 'var(--text-secondary)' }`
- `:focus`: ingen ekstra styling (vi gjør det utenfor iframen via card-border)

## Klikkbare elementer

| Element | States |
|---|---|
| Metode-tab | default, hover, active per metode |
| Stripe-felt | default, focus (card border accent), filled, error (destructive border + tekst) |
| Lagre-toggle | av/på |
| "Betal X kr →" | default, hover, active, loading (spinner + "Behandler..."), disabled (Stripe sier nei) |

## Empty / loading / error

- **Loading (kort under prosessering):** Knapp "Behandler betaling..." + dempet skjema
- **Error (kort avvist):** Inline destructive bånd "Kortet ble avvist. Prøv et annet →" → går til 24-feil-betaling
- **Error (3DS-redirect):** Stripe håndterer sin egen 3DS-flow — ikke design det

## Ønsket output fra Claude Design

1. Lyst tema, Kort-tab default, tomt Stripe-skjema
2. Lyst tema, kort fyllt klart for betaling
3. Mørkt tema
4. Loading-state ("Behandler betaling...")
5. Mobil ≤640px — full bredde, sticky "Betal X kr →"

## Ikke-mål

- Ikke designe Vipps-flow (pakke 17)
- Ikke designe bekreftelse (pakke 18)
- Ikke designe failed-payment (pakke 24)
- Ikke implementer ekte Stripe-integrasjon (visuell prototype)

## Når du er ferdig

Lim design-link tilbake til Claude Code.
