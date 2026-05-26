# Prompt 12 — Meldingstråd-detalj (chat-view)

## Hensikt
Vise hele samtalen mellom spiller og coach kronologisk, med mulighet for å svare i kontekst.

## Trigger
`/portal/coach/melding/[id]` — fra meldings-liste eller varsel.

## Layout
Standard portal-page med tre soner: (1) Topp-bar med coach-info (avatar, navn, status), (2) Scrollende meldingsliste, (3) Compose-bar sticky bunn.

## Komponenter
- Topp-bar: avatar 40px + navn (Inter Tight 16) + status-prikk (forest "online") + meta "Hovedcoach · GFGK" + tre-prikker-meny (rediger tråd, arkiver, varsel-pause)
- Meldingsbobler: spiller høyre (forest bg, cream text), coach venstre (cream bg, ink text, line-border). Maks-bredde 70%.
- Hver melding: avatar 24px, navn, tidsstempel mono, body, vedlegg-thumbnails inline
- Dato-skille mellom dager: tynn linje med dato-label sentrert
- "Coach skriver..." indikator nederst (tre prikker animert)
- Compose-bar: paperclip-ikon, textarea (auto-grow til 4 linjer), send-knapp lime (Lucide send)
- Hurtig-replies som chips over compose: "Mottatt" · "Takk" · "Sees i morgen"

## Eksempel-data
- Tråd ID: msg_47291
- Mellom: Markus R.P. ↔ Hans Brennum
- Emne: "Spørsmål om gårsdagens videoanalyse"
- 6 meldinger over 2 dager
- Eksempel:
  - Markus 18.05 kl 19:24: "Hei Hans, så på videoen..."
  - Hans 18.05 kl 21:02: "God observasjon. Se på P2-P3, hoftene roterer..."
  - Markus 19.05 kl 08:14: "Aha, da skjønner jeg."
  - Hans 19.05 kl 08:30: "Prøv 20 swings i morgen med fokus på dette."

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (body), JetBrains Mono (tid), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Bobler radius 16px, "lese-bekreftet"-haker i mono (Lucide check-check forest når lest)
- Norsk bokmål, ingen emojier

## Form-felter
- `body` text required min 1
- `vedlegg` files optional

## Submit / actions
- Send melding: POST `/api/portal/messages/[id]/reply` → optimistisk i UI
- Vedlegg: åpner velger
- Tre-prikker-meny: rediger, arkiver, pause varsel

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Scroll-til-bunn ved nye meldinger
- Sticky compose-bar med safe-area-inset på mobil
- A11y: aria-live="polite" på meldings-liste for nye meldinger
- Norsk tidsformat
