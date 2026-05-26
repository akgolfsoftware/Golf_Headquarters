# Prompt 24 — Sammenlign statistikk

## Hensikt
La spilleren sammenligne egen statistikk mot benchmark (HCP-band, alder, region) eller en spesifikk venn.

## Trigger
Knapp `Sammenlign` på `/portal/statistikk`. URL: `/portal/statistikk/sammenlign`.

## Layout
Standard portal-page, maks-bredde 1100px. Header med "Sammenlign deg med..." + sammenlignings-velger. Body: side-ved-side kort med tre kolonner: Markus / Benchmark / Diff.

## Komponenter
- Sammenlignings-velger (tabs): "Min HCP-gruppe" · "Min aldersgruppe" · "Topp 10% U18" · "Spesifikk spiller..."
- Når "Spesifikk spiller" velges: åpner søkbar autocomplete (kun venner / klubbmedlemmer)
- KPI-grid 3-kolonne med 8 rader:
  - Score per runde (snitt)
  - FIR%
  - GIR%
  - Putts per runde
  - Up-and-down %
  - Sand-save %
  - Drive-distanse
  - Birdies per runde
- Hver rad: din verdi | benchmark | diff (+/- med pil-ikon, lime hvis du er bedre, muted hvis like, destructive hvis dårligere)
- Radar-diagram øverst: 6-akser SVG (FIR, GIR, Putting, Short game, Driving, Mentalt)
- Insight-banner: "Du er sterkere enn snitt på FIR (+8%) men har et utviklingsområde i Putts (-1,2/runde)"
- Footer-link: "Vis bare data fra siste 30 dager"

## Eksempel-data
- Markus R.P. — U18 Gutter, HCP +3,5
- Benchmark: Topp 10% U18 Gutter (n=42)
- Tall:
  - Score: 71,4 vs 70,1 (-1,3)
  - FIR: 76% vs 68% (+8)
  - GIR: 71% vs 66% (+5)
  - Putts: 30,8 vs 29,6 (+1,2)
  - U/D: 52% vs 58% (-6)
  - Sand: 41% vs 47% (-6)
  - Drive: 264m vs 258m (+6m)
  - Birdies: 2,8 vs 3,1 (-0,3)

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (titler), Inter (UI), JetBrains Mono (alle tall — tabular-nums), Instrument Serif italic (sparsom)
- Lucide-ikoner stroke 1.75 (arrow-up, arrow-down, minus, users, target)
- Norsk bokmål, ingen emojier

## Form-felter
- Sammenlignings-velger
- Søkbar venn-velger (når aktuelt)

## Submit / actions
- Endring av sammenligning: oppdaterer alle KPI-er real-time
- Klikk på en KPI-rad → drill-down (re-bruk prompt-25 fra batch 1)

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG radar + piler + Lucide
- Tabular-nums for justering av tall i kolonner
- Norsk tallformat
- A11y: korrekt tabell-rolle (selv om det visuelt er 3-kolonne kort), aria-label på diff
