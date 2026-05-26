# Prompt 03 — Endelig avbestilling-bekreftelse (modal)

## Hensikt
Siste skritt før Pro-abonnement avbestilles. Tydelig konsekvens-visning og siste sjanse til å beholde abonnementet.

## Trigger
Etter brukeren har svart på avbestillingsgrunn-skjema (batch 1 prompt-06). Lander på denne bekreftelsen som steg 2.

## Layout
Sentrert modal 480px. Header med rød AlertTriangle-ikon (Lucide, 32px destructive). Tittel `Avbestille Pro?`. Body med konsekvens-liste. Footer: `Behold Pro` (primary, lime) og `Ja, avbestill` (destructive outline).

## Komponenter
- Top-ikon i sirkel: rød ring 64px, Lucide AlertTriangle 32px destructive
- Konsekvens-liste: 5 punkter med X-ikoner (Lucide x-circle)
- Beholde-til-dato-blokk: "Du har Pro til 19. juni 2026"
- Tilbud-banner: "Vil du heller pause i 1 måned?" med pause-CTA
- Footer: to knapper, primary lime venstre (anbefalt), destructive outline høyre

## Eksempel-data
- Markus R.P. — Pro siden 19.01.2026
- Forfaller: 19. juni 2026 kl 23:59
- Tap ved avbestilling:
  - AI-coach ubegrenset → låst etter 1 mnd
  - 4 coaching-credits/mnd → 0
  - Videoanalyse → låst
  - Komplett historikk → 30 dager
  - Familiekonto → utløper

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843, destructive #A32D2D)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (dato), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75
- Norsk bokmål, ingen emojier

## Form-felter
Ingen — kun bekreftelses-knapper.

## Submit / actions
- `Behold Pro` → lukk modal, toast "Pro fortsetter — godt valg"
- `Ja, avbestill` → POST `/api/portal/subscriptions/cancel` → ny modal "Avbestilling bekreftet" med dato + tilbakekommer-tilbud
- `Pause 1 måned` (sekundær CTA) → åpne pause-flyt

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide-ikoner
- Maks-bredde 480px, mobile full-bleed sheet
- Norsk datoformat: `19. juni 2026`
- A11y: focus på `Behold Pro` ved åpning (default-handling = trygt valg)
- Backdrop: `rgba(10,31,23,0.6)` med blur(8px)
