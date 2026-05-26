# Prompt 19 — Avbryt mål (med grunn)

## Hensikt
La spilleren avbryte et mål de ikke kommer i mål med, men registrere hvorfor — slik at coach og AI kan bruke informasjonen til å foreslå bedre mål.

## Trigger
Tre-prikker-meny på mål-kort → "Avbryt mål". URL/modal: `/portal/mal/goal/[id]/avbryt`.

## Layout
Sentrert modal 480px. Header med "Avbryte målet?" og X. Body: mål-summary + grunn-velger + fri-tekst. Footer: Behold mål (primary) + Bekreft avbryt (destructive outline).

## Komponenter
- Mål-summary-kort øverst: tittel, frist, nåværende progress, hvor mye som gjenstår
- "Hvorfor avbryter du?" — radio-liste:
  - For ambisiøst — ikke realistisk på tiden
  - Prioriteter endret seg
  - Skade/sykdom
  - Mistet motivasjon
  - Mål dekkes av et annet mål
  - Annet
- Conditional textarea: "Fortell mer (valgfritt)" — vises alltid
- "Coach blir varslet"-info-banner (cream bg, info-icon Lucide info)
- Footer: Behold mål (primary lime) + Bekreft avbryt (destructive outline)

## Eksempel-data
- Mål-ID: g_4471
- Tittel: "Spille under par på Bossum 18-hull før 1. juli"
- Frist: 01.07.2026
- Progress: 35% (best score så langt 73 = +1)
- Gjenstår: 41 dager
- Valgt grunn: "Prioriteter endret seg"
- Notat: "Fokuserer fullt på Junior-NM i juni nå — kommer tilbake til dette etterpå."

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843, destructive #A32D2D)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tall/dato), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (info, x, target)
- Norsk bokmål, ingen emojier

## Form-felter
- `grunn` enum required
- `notat` text optional max 300

## Submit / actions
- "Behold mål" → lukk modal
- "Bekreft avbryt" → POST `/api/portal/goals/[id]/cancel` → toast "Målet er avbrutt" + redirect til mål-side
- Coach mottar varsel automatisk i sin tråd

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG Lucide
- A11y: focus på "Behold mål" ved åpning (default-handling = trygt valg)
- Trap focus
- Norsk dato/tall
