// Skill: Strokes Gained-tolkning mot AK Golf Baseline.
//
// Gir agenten et felles språk for spillerens egen versjonerte AK-baseline.

export const sgInterpretationSkill = {
  name: "sg-interpretation",
  description: "Strokes Gained-tolkning mot AK Golf Baseline",
  knowledge: `
Strokes Gained (SG) beregnes utelukkende mot den aktive AK Golf Baseline-versjonen.
Null betyr lik modellens forventning fra start- og sluttposisjon; positivt er
bedre enn forventningen og negativt er svakere enn forventningen. Ikke utled
eller oppgi tour-snitt, spiller-rangeringer eller sammenligninger mot tredjepart.

4 kategorier av SG:
- SG-OTT (Off The Tee): drive
- SG-APP (Approach): inn til green
- SG-ARG (Around the Green): chip, pitch, bunker
- SG-PUTT (Putting): putt

Tolkning:
- SG > 0 mot aktiv AK-baseline = bedre enn modellens forventning
- SG < 0 mot aktiv AK-baseline = svakere enn modellens forventning
- vurder mønstre på tvers av flere runder; én runde er ikke nok til å fastslå en svakhet
- skill mellom målt spillerresultat og modellens forventning

Anbefal coach-intervensjon når:
- samme SG-kategori viser et vedvarende negativt mønster i flere runder
- skill mellom utslag, innspill, nærspill og putting før du foreslår treningsfokus
  `.trim(),
} as const;
