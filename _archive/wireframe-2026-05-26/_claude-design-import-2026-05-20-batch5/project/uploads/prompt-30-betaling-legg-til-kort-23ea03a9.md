# Prompt 30 — Legg til betalingskort

## Hensikt
La spilleren registrere et nytt bankkort via Stripe Card Element for fremtidige fakturaer og abonnement-betaling.

## Trigger
"Legg til kort" på `/portal/meg/abonnement` eller `/portal/betaling`. URL/modal: `/portal/betaling/ny-kort`.

## Layout
Sentrert modal 480px. Header med "Legg til betalingskort" + X. Body: Stripe-Card-Element-placeholder + faktureringsadresse. Footer: Avbryt + Lagre kort (primary).

## Komponenter
- Trygghets-banner øverst: Lucide lock + "Sikker betaling via Stripe — kortet lagres aldri hos oss"
- Stripe Card Element:
  - Kortnummer (med kort-merke-ikon som detekteres real-time: Visa, MC, Amex)
  - Utløp (MM/YY)
  - CVC (3 siffer)
- Navn på kort (text)
- Faktureringsadresse (kollapsbar — "Bruk samme som profil"-toggle default på, expandable for ny adresse)
- "Sett som standard"-checkbox (default på hvis første kort)
- Footer: Avbryt + Lagre kort

## Eksempel-data
- Markus R.P.
- Navn på kort: Markus Roenas Pedersen
- Faktureringsadresse: samme som profil (Storgata 14, 1606 Fredrikstad)
- Sett som standard: ja (har ingen andre kort)

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (kortnummer-input — tabular), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (lock, credit-card, check)
- Kort-merke-ikoner (Visa/MC/Amex) som inline SVG-monogrammer
- Norsk bokmål, ingen emojier

## Form-felter
- `kortnummer` Stripe Element required
- `utlop` MM/YY required
- `cvc` 3 siffer required
- `navn` text required
- `adresse` text optional
- `postnummer`, `poststed` text optional
- `standard` boolean

## Submit / actions
- Lagre: Stripe `confirmSetupIntent()` → POST `/api/portal/payment-methods` → toast "Kortet er lagret"
- Feil: rød inline banner med Stripe-feilkode → "Kortet ble avvist. Prøv et annet kort."

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Stripe Elements er placeholders — riktig styling, ikke ekte JS-integrasjon
- Mono-font på kortnummer-felt for jevn lesbarhet
- A11y: aria-describedby for hvert felt med format-hint
- Norsk feilmelding-tekst
