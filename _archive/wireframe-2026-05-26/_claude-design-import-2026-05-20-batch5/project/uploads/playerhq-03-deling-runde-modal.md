# PlayerHQ — Del runde-modal

**Trigger:** "Del"-knapp på runde-detalj-siden eller leaderboard-card.

## Kontekst
Markus har spilt en runde 73 (-1) på Bossum GK 19. mai. Han vil dele resultatet med en venn, på Instagram, eller sende lenke til coach Anders.

## Formål
- Eksportere/dele rundeoppsummering i flere formater
- Generere shareable lenke med valgfritt offentlighetsnivå
- Lage Instagram-story-bilde med branded grafikk

## Layout
Modal 560px bredde, 16px radius, hvit panel.

**Header:**
- Tittel "Del runde" (Inter Tight 600, 22px)
- Lucide X høyre
- Underlinje "Bossum GK · 19. mai · 73 (-1)" (muted, JetBrains Mono)

**Forhåndsvisning (preview-card):**
Stor card 100% bredde, 200px høy, viser:
- Forest-gradient bg med subtle linjer
- Markus' avatar + navn øverst venstre
- Stor "73" tall (Inter Tight 700, 64px) i lime
- "−1 · Bossum GK · 19. mai" i mono
- SG-strip nederst: PUTT +2.1, IRON +0.8, etc. (mini-mono-pills)
- AK Golf wordmark nederst høyre (small caps, lime)

**Format-velger:**
Radiokort horisontalt:
- "Bilde 1080×1920" (Instagram story) — default valgt, lime border
- "Bilde 1080×1080" (post)
- "PDF-rapport" (full SG-data)
- "Lenke" (delbar URL)

**Synlighet:**
Toggle-gruppe:
- Privat (bare lenke-mottakere)
- Coach kan se (default)
- Offentlig (vises på AK Golf-leaderboard)

**Footer:**
- Outline-knapp "Kopier lenke" venstre
- Filled forest "Last ned" høyre (med Lucide Download-ikon)

## Interaksjon
- Bytte format oppdaterer preview live
- "Kopier lenke" → toast "Lenke kopiert"
- "Last ned" → genererer bilde/PDF i bakgrunnen, viser progress-bar

## Tomtilstand / feil
"Kunne ikke generere bilde. Prøv igjen." med retry-knapp.

## Branding
Forest preview-bg, lime SG-pills, cream modal-overlay 60%.
