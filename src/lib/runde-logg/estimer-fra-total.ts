/**
 * Grovt SG-estimat fra kun totalscore («Bare totalen»-etterregistrering, RU-04).
 *
 * Uten hull-for-hull vet vi verken par, slag eller putt per hull — kun
 * totalene. For å kunne vise ET tall (i stedet for ingenting) fordeles
 * totalscoren over `parTemplate`s nøytrale 18-hulls par-fordeling, og hvert
 * syntetisk hull bygges med `syntetiserHurtigHull` — SAMME motor som
 * hurtigmodusen i live-føringen bruker, ikke en ny SG-beregning. Resultatet
 * er derfor aldri mer presist enn input: `sgSource` skal ALLTID settes til
 * "estimert" av kalleren (aldri "beregnet") når denne funksjonen brukes.
 *
 * Fordelingen er bevisst ærlig om at den er oppdiktet — ingen ekte per-hull-
 * fakta presenteres, kun et rimelig startpunkt (samme filosofi som
 * `parTemplate`s egen kommentar).
 */
import { parTemplate } from "@/lib/portal-runder/par-template";
import { syntetiserHurtigHull } from "./syntetiser-hurtig";
import type { LoggetHull } from "./types";

const HOLES = 18;
const STANDARD_LENGDE: Record<number, number> = { 3: 150, 4: 350, 5: 480 };

export type EstimerFraTotalInput = {
  /** Brutto totalscore for runden. */
  score: number;
  /** Totalt antall putt, hvis oppgitt — fordeles jevnt over hullene. */
  putts?: number | null;
  /** Banens totale par. */
  coursePar: number;
};

/**
 * Fordeler total-slag (og ev. total-putt) over 18 syntetiske hull og bygger
 * en gyldig slag-kjede per hull — inngang til samme SG-motor
 * (`beregnSg`/`rundeTilSgShots`) som resten av runde-loggen.
 */
export function estimerHullFraTotal(input: EstimerFraTotalInput): LoggetHull[] {
  const pars = parTemplate(input.coursePar);
  const strokes = pars.slice();

  // Fordel avviket fra par-summen ett slag av gangen — samme mønster som
  // parTemplate selv bruker for sin par-justering (siste hull først).
  let avvik = Math.round(input.score) - strokes.reduce((a, b) => a + b, 0);
  let vakt = 0;
  while (avvik !== 0 && vakt < 500) {
    vakt++;
    for (let i = HOLES - 1; i >= 0 && avvik !== 0; i--) {
      if (avvik > 0 && strokes[i] < 15) {
        strokes[i]++;
        avvik--;
      } else if (avvik < 0 && strokes[i] > 1) {
        strokes[i]--;
        avvik++;
      }
    }
  }

  // Fordel total-putt jevnt (rest til de første hullene) — syntetiserHurtigHull
  // klemmer selv verdien mot hullets faktiske slagtall.
  const puttsPerHole: Array<number | undefined> = Array(HOLES).fill(undefined);
  if (typeof input.putts === "number" && Number.isFinite(input.putts)) {
    const total = Math.max(0, Math.round(input.putts));
    const grunn = Math.floor(total / HOLES);
    const rest = total - grunn * HOLES;
    for (let i = 0; i < HOLES; i++) {
      puttsPerHole[i] = grunn + (i < rest ? 1 : 0);
    }
  }

  return pars.map((par, idx) =>
    syntetiserHurtigHull({
      holeNumber: idx + 1,
      par,
      lengdeMeter: STANDARD_LENGDE[par] ?? 350,
      strokes: strokes[idx],
      putts: puttsPerHole[idx],
    }),
  );
}
