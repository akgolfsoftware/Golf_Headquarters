import { Scorekort } from "akgolf-hq-komponenter";

/** Par 72: 4 4 3 5 4 4 3 4 5 · 4 3 4 5 4 4 3 5 4 */
const PAR = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 5, 4];
const runde = (diff: number[], sg: (number | null)[]) =>
  PAR.map((par, i) => ({ nr: i + 1, par, score: par + diff[i], sg: sg[i] }));

/** 73 (+1): birdie grønn, bogey gul, dobbel rød. SG per hull under scoren. */
export function Standard() {
  return (
    <Scorekort
      hull={runde(
        [0, 0, -1, 0, 1, 0, 0, -1, 0, 0, 1, 0, 0, 2, 0, 0, -1, 0],
        [0.1, 0, 0.6, 0.1, -0.8, 0.2, 0, 0.7, -0.1, 0.1, -0.9, 0, 0.2, -1.6, 0.1, 0, 0.8, 0.1],
      )}
      baseline="Broadie scratch"
      hjelp="sgTotal"
    />
  );
}

/** 68 (−4): fem birdier, én bogey — SG-tallet grønt. */
export function SterkRunde() {
  return (
    <Scorekort
      hull={runde(
        [-1, 0, 0, -1, 0, 0, -1, 0, -1, 0, 0, -1, 0, 0, 0, 0, 1, 0],
        [0.7, 0.1, 0.2, 0.8, 0, 0.1, 0.6, 0.2, 0.5, 0.1, 0, 0.7, 0.1, 0.2, 0, 0.1, -0.7, 0.1],
      )}
      baseline="Broadie scratch"
    />
  );
}

/** 81 (+9): tre dobler — rødt dominerer, SG dypt negativ. */
export function TungRunde() {
  return (
    <Scorekort
      hull={runde(
        [1, 0, 2, 1, 0, 1, 0, 2, 0, 1, 0, 0, 0, 0, 2, 0, -1, 0],
        [-0.8, 0.1, -1.7, -0.9, 0, -0.7, 0.1, -1.5, 0.1, -0.8, 0.2, 0, 0.1, 0, -1.6, 0.1, 0.7, 0],
      )}
      baseline="Broadie scratch"
    />
  );
}

/** GolfBox-runde: score finnes, SG ikke — tankestrek i hodet og på hvert hull. */
export function UtenSg() {
  return (
    <Scorekort
      hull={runde([0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0], PAR.map(() => null))}
      sammendrag={{ score: 75, par: 72, sg: null }}
      baseline="Broadie scratch"
    />
  );
}

/** Ingen runder → tom tilstand med én vei videre. */
export function Tom() {
  return <Scorekort hull={[]} />;
}
