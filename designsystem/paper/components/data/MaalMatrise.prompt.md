# MaalMatrise

Rutenett motorikk × miljø i den tekniske utviklingsplanen: reps gjennomført
av mål, per celle.

## Når den ikke skal brukes
Når det bare er to dimensjoner å vise som par (verdi + mål) uten rutenett —
da holder en enkel liste eller `ProgressBar`.

## Kontrakt
- «—» betyr ikke planlagt. Aldri grå ut som feil, aldri sperre utfylling —
  18.08.2026-beslutningen fjernet all regel-håndheving i planlegging.
- Nådd mål (`gjort >= mal`) farges `--up`. `--accent` (oransje) brukes aldri
  her — den er reservert «Én ting nå»-kortet og fokustilstander.
- Kolonneheader er MILJØ i UI-teksten. Ordet «belastning» skal aldri vises
  for spilleren, selv om det er datamodellens interne navn.
- Cellene har 44 px minstehøyde og er `role="cell"` med fullt lesbar
  `aria-label` — rutenettet formidles ikke av layout alene.

## Målt
Celle 44,0 px min-høyde. Radetikett og hjørnekolonne krymper til 10 px/6 px
padding under 420 px containerbredde.
