import { LoadChart } from "akgolf-hq-komponenter";

/* ACWR per uke (akutt/kronisk belastning), ukenummer fra `fra` og oppover. */
const uker = (acwr: number[], fra = 30) => acwr.map((a, i) => ({ uke: String(fra + i), acwr: a }));

/** Kanonisk bruk: åtte uker i trygg sone — grønt tall, rolig tekst. */
export function Trygg() {
  return <LoadChart uker={uker([0.82, 0.9, 0.95, 1.02, 0.98, 1.08, 1.1, 1.05])} />;
}

/** Siste uke over varselgrensen 1,3 — gult tall og «verdt å følge med». */
export function Varsel() {
  return <LoadChart uker={uker([0.9, 0.95, 1.05, 1.12, 1.2, 1.28, 1.34, 1.38])} />;
}

/** Siste uke over risikogrensen 1,5 — rødt tall og anbefaling om roligere uke (aldri en sperre). */
export function Risiko() {
  return <LoadChart uker={uker([0.95, 1.0, 1.1, 1.22, 1.3, 1.41, 1.48, 1.56])} />;
}

/** Under to uker logget: tom tilstand. */
export function ForLite() {
  return <LoadChart uker={uker([1.0], 37)} />;
}
