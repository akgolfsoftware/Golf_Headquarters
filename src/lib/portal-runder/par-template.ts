/**
 * Nøytral par-fordeling for 18 hull utledet fra banens totale par.
 * Banedata har ikke per-hull-par, så dette er kun et startpunkt spilleren
 * justerer i hurtig-skjemaet — ikke fabrikkerte banetall presentert som
 * ekte data. Delt mellom klient (RundeNyForm, viser/justerer) og server
 * (logRoundManual, avleder HoleScore.par ved lagring — samme deterministiske
 * funksjon, aldri tastet inn separat).
 */
const HOLES = 18;

export function parTemplate(coursePar: number): number[] {
  // Modellen mangler per-hull-par. Bruk fasitens realistiske 18-hulls miks
  // (3/4/5) og juster siste hull(ene) mot banens totalpar — aldri flat.
  // Anker mot MIKS' EGEN sum (72), ikke en hardkodet konstant — en tidligere
  // versjon antok feilaktig at miksen summerte til 71 (den summerer til 72),
  // som ga par-summen ett hull feil for enhver bane (oppdaget av par-template.test.ts).
  const MIKS = [4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 4, 3, 5, 4, 4, 5, 3, 4];
  const holes = MIKS.slice();
  let diff = coursePar - MIKS.reduce((a, b) => a + b, 0);
  for (let i = HOLES - 1; i >= 0 && diff !== 0; i--) {
    const justert = holes[i] + Math.sign(diff);
    if (justert >= 3 && justert <= 5) {
      holes[i] = justert;
      diff -= Math.sign(diff);
    }
  }
  return holes;
}
