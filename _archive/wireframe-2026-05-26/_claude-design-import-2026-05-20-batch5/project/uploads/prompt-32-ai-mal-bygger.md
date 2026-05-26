# Prompt 32 — AI mål-bygger (SMART)

## Hensikt
AI-assistert dialog som hjelper spilleren formulere et SMART-mål (Spesifikt, Målbart, Aktualisert, Realistisk, Tidsbestemt) basert på data om spilleren.

## Trigger
CTA `Bruk AI til å bygge mål` på `/portal/mal/ny`. URL: `/portal/mal/ny-ai`.

## Layout
Full-page route som ligner en chat-flate. Maks-bredde 720px. Header med "AI mål-bygger" + tilbake. Body: chat-meldinger fra AI + brukerens svar. Footer: input-bar med Sparkles-ikon.

## Komponenter
- AI-meldingsboble: cream bg, line-border, lime accent-ikon (Lucide sparkles) til venstre
- Brukerens svar: forest bg, cream tekst, høyre-aligned
- Chip-svar-forslag under hver AI-melding: 3-4 chips med raske svar
- Progress-indikator topp: "Steg 3 av 5 — Tidsramme"
- Stedhalder-mål-kort som bygges live nederst: viser hva som er fylt inn så langt
- Final-modal etter steg 5: "Slik blir målet ditt" + Bekreft-knapp

## AI-flyt (5 steg)
1. "Hva vil du forbedre?" — chips: Handicap · Driver-distanse · Putts · Konkurranse-resultat · Mental robust · Annet
2. "Hva er dagens nivå?" — auto-fylt fra data, bekreftes
3. "Hva er ditt drømme-mål?" — fri-tekst + AI-validering "Det er ambisiøst — vurder X som realistisk delmål"
4. "Innen når?" — chips: 30 dager · 90 dager · Før sesong-slutt · Før Junior-NM
5. "Hvor mye vil du jobbe?" — chips: 2 økter/uke · 4 økter/uke · 6 økter/uke · Det jeg har tid til
- Sluttbekreftelse: vis SMART-mål oppsummert

## Eksempel-data
- Markus R.P., HCP +3,5
- Valgt: Handicap
- Nivå: +3,5
- Drømme-mål: +5,0
- AI-tilbakemelding: "Realistisk innen 60 dager med 5 økter/uke"
- Tidsramme: 60 dager
- Innsats: 5 økter/uke
- Endelig mål: "Senke HCP fra +3,5 til +5,0 innen 19. juli 2026 — 5 økter/uke med fokus på putting og kortspill"

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (chat-tekst), JetBrains Mono (tall/datoer), Instrument Serif italic (AI-tonefall sparsom)
- Lucide-ikoner stroke 1.75 (sparkles, send, target, calendar)
- AI-avatar: lime sirkel 32px med sparkles-ikon
- Norsk bokmål, ingen emojier

## Form-felter
- Per steg en chip-velger eller fri-tekst
- Slutt: alle stegene konsolidert til mål-objekt

## Submit / actions
- Hvert chip-trykk: animert til neste steg
- Bekreft: POST `/api/portal/goals` med AI-generert SMART-mål → redirect til mål-side
- "Start på nytt"-link i header

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG sparkles + Lucide
- Auto-scroll til ny melding
- A11y: chat-meldinger har aria-live="polite"
- Norsk bokmål med varm men profesjonell tone
