# AK Golf Platform — Booking — AvbestillModal

## Identitet

- **Produkt:** Booking (modal)
- **Åpnes fra:** 20-min-booking-detalj ("Avbestill")
- **Arketype:** Modal — destructive-confirm
- **Tier-gating:** Krever innlogging
- **HTML-referanse:** `wireframe/screen-deck/booking/modals/avbestill.html`
- **Audit:** `wireframe/audit/booking-modal-avbestill.md`

## Designsystem

Bruk **`branding-style-guide.html`** + **`design-system-v2.md`** som lastet system-kontekst.

## Spec — hva modalen er for

Avbestillings-modal med refusjons-logikk. > 24t før økten = full refusjon (eller klipp tilbakeført). < 24t = 50 % refusjon. < 2t = ingen refusjon. Kunden ser tydelig hva de får tilbake, må velge avbestillings-årsak (dropdown), og bekrefte med "Avbestill booking" (destructive).

## Layout — UNIKT for denne modalen

- **Modal-overlay:** rgba(10,31,23,0.6) backdrop
- **Modal-card:** Max 520px, padding 32px
- **Header:**
  - Lucide AlertTriangle warning-amber 24px
  - H2 "Avbestill *booking?*"
  - Booking-info kompakt: "Tirsdag 12. mai 09:00 · Anders K · Mulligan"
  - Lukk-X
- **Refusjons-card (dynamisk basert på tid igjen):**
  - **> 24t:** Lucide CheckCircle success + "Du får full refusjon: 1 800 kr tilbake på kortet ditt innen 5 virkedager."
  - **2–24t:** Lucide AlertTriangle warning + "Du får 50 % refusjon: 900 kr (ihht. våre vilkår)"
  - **< 2t:** Lucide XCircle destructive + "Ingen refusjon (mindre enn 2 t før). Vi anbefaler å gjennomføre."
- **Årsak-dropdown (krav):**
  - "Sykdom"
  - "Endret plan"
  - "Vær"
  - "Annet" (avslører textarea)
- **Footer-actions:** "Behold booking" (ghost) + "Avbestill booking" (destructive primary)
- **Sub-info:** "Du får e-post med bekreftelse umiddelbart."

## Klikkbare elementer

| Element | States |
|---|---|
| Årsak-dropdown | closed, open, item-hover, selected |
| Textarea (annet) | default, focus, filled |
| "Behold booking" | default, hover (lukker modal) |
| "Avbestill booking" | disabled (årsak ikke valgt), default, hover, loading, success |

## Empty / loading / error

- **Loading:** "Avbestill"-knapp viser spinner + "Avbestiller..."
- **Success:** Modal viser "✓ Avbestilt — refusjon i prosess" 1 sek, deretter redirect til 19-min-side
- **Error:** "Kunne ikke avbestille. Prøv igjen eller kontakt oss."

## Ønsket output fra Claude Design

1. > 24t — success-grønn refusjons-card, full refusjon
2. 2–24t — warning-amber refusjons-card, 50 % refusjon
3. < 2t — destructive refusjons-card, ingen refusjon
4. Årsak "Annet" valgt med textarea synlig
5. Loading-state
6. Mobil ≤640px — full bredde

## Ikke-mål

- Ikke designe Stripe refusjons-handling (backend)
- Ikke designe admin avbestillings-oversikt

## Når du er ferdig

Lim design-link tilbake til Claude Code.
