# Prompt 33 — AI foreslå turneringer

## Hensikt
AI analyserer spillerens HCP, alder, region, kalender og mål for å foreslå relevante turneringer å melde seg på.

## Trigger
CTA `La AI foreslå turneringer` på `/portal/tren/turneringer`. URL: `/portal/tren/turneringer/ai-foreslå`.

## Layout
Standard portal-page, maks-bredde 1000px. Header med "Foreslåtte turneringer" + sparkles-ikon. Body: filter-row + foreslåtte turneringer som kort.

## Komponenter
- AI-info-banner topp: cream bg, sparkles-ikon, tekst "Basert på HCP +3,5, alder 18, Østfold-region og dine 3 mål"
- Filter-justering: åpne drawer for å justere kriterier
- Sort-velger: Best match · Nærmest dato · Nærmest sted · Vanskelighetsgrad
- Turneringskort (3-6 stk):
  - Header: turneringsnavn + dato + sted (Lucide map-pin)
  - Match-score: 0–100% med progress-bar (lime fill)
  - Reason-pills: 2-3 grunner ("Passer ditt HCP-bånd", "Treningsmål: konkurranse-eksponering", "Kort reisetid")
  - Quick-stats: påmeldt antall · gjennomsnittlig HCP · format · pris
  - CTA: `Meld på` (primary) + `Mer info` (ghost)
- "Vil ikke ha forslag for X kategori"-toggle i footer

## Foreslåtte turneringer (eksempel)
1. **NM Junior 2026** — 12.–14.06 — Bogstad GK — match 96%
   - Reason: "Topp-prioritet mål: NM Junior · innen aldersklasse · på Østland"
   - 124 påmeldt, snitt HCP 4,2, stroke play, gratis
2. **Østfold Open Junior** — 28.05 — GFGK — match 92%
   - Reason: "Hjemmebane · kvalifiserende til regions-mesterskap · 2 uker unna"
   - 38 påmeldt, snitt HCP 6,5, stroke play, 350 kr
3. **Bossum Tour Stop** — 04.06 — Bossum — match 84%
   - Reason: "Nytt baneoppsett · øvelse før NM · kort reisetid"
   - 56 påmeldt, snitt HCP 5,1, stableford, 250 kr
4. **Larvik Junior Trophy** — 18.06 — Larvik GK — match 71%

## Eksempel-data
- Markus R.P., HCP +3,5, 18 år, Østfold
- Mål: NM Junior topp 10, sub-72 snitt
- Tilgjengelige datoer: hele juni unntatt 21.-23. (familie-tur)
- AI har 12 kandidater, viser 4 best matchende

## Branding
- AK Golf design system (cream #FAFAF7, forest #005840, lime #D1F843)
- Fonter: Inter Tight (turneringsnavn), Inter (UI), JetBrains Mono (dato/tall/score), Instrument Serif italic (sparsom — "Foreslåtte" i tittel)
- Lucide-ikoner stroke 1.75 (sparkles, map-pin, calendar, users, trophy)
- Norsk bokmål, ingen emojier

## Form-felter
Ingen — kun forslag og CTAs.

## Submit / actions
- "Meld på" → routes til `/portal/tren/turneringer/ny?turnering=id`
- "Mer info" → drawer med full turnerings-beskrivelse
- "Vil ikke ha forslag for X" → markerer som filter (sparer for fremtid)

## Tekniske krav
- Single HTML, inline CSS, Google Fonts
- Inline SVG (progress-bar + Lucide)
- Norsk dato `28. mai 2026`
- A11y: hvert kort er en `<article>` med korrekt heading-struktur
