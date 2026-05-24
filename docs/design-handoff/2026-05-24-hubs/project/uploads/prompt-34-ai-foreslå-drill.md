# Prompt 34 — AI foreslå drill

## Hensikt
AI bruker spillerens svakheter (fra statistikk, coach-notater og tester) til å foreslå spesifikke drillsekvenser.

## Trigger
CTA `Få drill-forslag` på `/portal/tren/ovelser` eller i kontekst av en svakhet (klikk på "lavt FIR" → "AI foreslår drill"). URL: `/portal/tren/ovelser/ai-foreslå`.

## Layout
Standard portal-page, maks-bredde 880px. Header med tittel + sparkles. Body: svakhets-analyse + 3 drill-forslag.

## Komponenter
- Analyse-banner topp: lime accent — "Basert på siste 30 dager ser vi at FIR har sunket fra 78% til 71%, og du misser oftest mot venstre."
- 3 drill-forslag-kort (vertikal stack, prominent):
  - Tittel + ikon (Lucide target)
  - Match-score-bar (95%, 87%, 76%)
  - Beskrivelse 2-3 linjer
  - Stikkord-chips: utstyr, varighet, sted, vanskelighet
  - Hvorfor denne drillen: 2 punkter
  - Forventet effekt: "Bedre alignment · korriger venstre-miss-tendens"
  - CTAer: `Legg til i økt` (primary) + `Se demo-video` (ghost) + `Lagre til senere` (ghost)
- "Hvorfor disse 3?"-link åpner drawer som forklarer AI-resonnement
- "Vis flere alternativer"-knapp nederst

## Eksempel-drills
1. **Gate Drill — Driver alignment** (match 95%)
   - Beskrivelse: "Sett to alignment sticks som port 30cm fremfor ballen. Treff 10 baller uten å treffe sticks."
   - Utstyr: Driver, 2 alignment sticks · Varighet: 15 min · Sted: range · Vanskelighet: Lett
   - Forventet effekt: korrigerer venstre-miss, bedre face-control
2. **9-shot challenge — Wedge** (match 87%)
   - Beskrivelse: "Slå 9 forskjellige shots med PW: 50/65/80m × low/mid/high. Score gates."
3. **One-handed driver swings** (match 76%)
   - Beskrivelse: "30 swings kun med høyre hånd, fokus på release timing."

## Eksempel-data
- Markus R.P.
- Svakhet: Driver FIR 71% (ned fra 78%), 12% misser venstre
- Datakilde: siste 12 runder + 4 range-økter
- Coach-notat referert: "P3-posisjon — hoftene roterer for sent"

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (tall/match-score), Instrument Serif italic (sparsom — analysebanner)
- Lucide-ikoner stroke 1.75 (sparkles, target, play, save, plus, info)
- Norsk bokmål, ingen emojier

## Form-felter
Ingen — kun forslag.

## Submit / actions
- "Legg til i økt" → modal "Hvilken økt?" (velg dato/økt eller opprett ny)
- "Se demo-video" → åpner video-spiller-modal (batch 1 prompt-15)
- "Lagre til senere" → legg til i "Mine drills"-bibliotek

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG sparkles + Lucide
- Progress-bar med tabular-nums prosent
- A11y: heading-struktur, button-aria-label
- Norsk bokmål
