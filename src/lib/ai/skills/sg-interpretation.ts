// Skill: Strokes Gained-tolkning mot PGA Tour-benchmarks.
//
// Gir agenten et felles språk for å vurdere SG-tall. Brukes når
// Caddie/coach-agenter skal forklare svakheter, anbefale fokus eller
// rapportere progresjon.

export const sgInterpretationSkill = {
  name: "sg-interpretation",
  description: "Strokes Gained-tolkning mot PGA Tour-benchmarks",
  knowledge: `
Strokes Gained (SG) måles mot PGA Tour Top 40 (benchmark = 0.0).

Hierarkiet:
- PGA Top 40: 0.0
- PGA Tour: ~-0.5
- Korn Ferry: ~-1.5
- European Tour: ~-1.0
- A1 Amatør (PRO-nivå): ~-3.0
- A2 Amatør: ~-5.0
- B1 Amatør: ~-8.0
- B2 Amatør: ~-12.0

4 kategorier av SG:
- SG-OTT (Off The Tee): drive
- SG-APP (Approach): inn til green
- SG-ARG (Around the Green): chip, pitch, bunker
- SG-PUTT (Putting): putt

Tolkning:
- SG > 0 mot benchmark = bedre enn benchmark
- SG < 0 mot benchmark = under benchmark
- SG totalt < -2.0 i én kategori over 5 runder = svakhet
- SG-PUTT er mest "trainable" (35% av kompetent-amatørs SG-total)
- SG-ARG er mest variabel (vær, lies, etc.)

Anbefal coach-intervensjon når:
- Én SG-kategori er konsekvent under -1.0 i siste 5 runder
- HCP øker samtidig som SG-OTT er positiv (problem ligger annet sted)
- Plutselig fall > 1.0 i SG-OTT (mulig drive-problem eller skade)
  `.trim(),
} as const;
