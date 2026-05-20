# Prompt 31 — Faktura-detalj side

## Hensikt
Vise full faktura med linjer, mva, betalingstatus og PDF-nedlasting. Norsk-kompatibel (KID-nummer, MVA-nedbrytning).

## Trigger
Klikk på faktura-rad i `/portal/meg/abonnement` (drawer) eller varsel. URL: `/portal/faktura/[id]`.

## Layout
Standard portal-page, maks-bredde 800px. Header med faktura-nummer + status-badge + "Last ned PDF"-CTA. Body: 4 seksjoner. Print-stylesheet for utskrift.

## Komponenter
- Topp-bar: Faktura #2026-0247 + Status-badge (Betalt / Forfalt / Ubetalt)
- Faktura-meta-grid 2-kolonne:
  - Fakturert til (navn, adresse)
  - Fakturert fra (AK Golf Academy AS, Org.nr 999 888 777, adresse)
  - Fakturadato, forfallsdato, KID-nummer (mono)
- Linjer-tabell:
  - Beskrivelse / Antall / Stk-pris / MVA% / Sum
  - Eks: "Pro-abonnement mai 2026 · 1 · 240,00 · 25% · 240,00"
- Summering høyre:
  - Netto: 240,00 kr
  - MVA (25%): 60,00 kr
  - Total: 300,00 kr
- Betalings-info (hvis betalt): metode (Visa **** 4242), betalingsdato
- Action-row: Last ned PDF · Send som e-post · Betal nå (kun hvis ubetalt)
- Print-friendly: skjul navigasjon og knapper i `@media print`

## Eksempel-data
- Faktura: #2026-0247
- Status: Betalt
- Til: Markus Roenas Pedersen, Storgata 14, 1606 Fredrikstad
- Fra: AK Golf Academy AS, Org.nr 999 888 777
- Fakturadato: 19.05.2026
- Forfallsdato: 02.06.2026
- KID: 1234 5678 90123
- Linjer:
  - "Pro-abonnement mai 2026" · 1 · 240,00 · 25% · 240,00
- Netto: 240,00, MVA: 60,00, Total: 300,00 kr
- Betalt: 19.05.2026 via Visa **** 4242

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall + KID + faktura-nr), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (download, mail, credit-card, printer)
- Norsk bokmål, ingen emojier
- Tabell med tabular-nums + høyrejustert tall

## Form-felter
Ingen.

## Submit / actions
- "Last ned PDF" → presigned URL til PDF-versjon
- "Send som e-post" → POST `/api/portal/invoices/[id]/email`
- "Betal nå" → routes til Stripe Checkout

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Print-stylesheet (skjul header/nav)
- Norsk MVA-format, kr-suffiks
- Tabular-nums hele veien
- A11y: korrekt tabell-struktur (caption, th, scope)
