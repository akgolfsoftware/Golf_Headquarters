import { z } from "zod";
import { formaterTestDelta, formaterTestMetrikk, formaterTestVerdi } from "./format-verdi";
import { lavereErBedre, parseForScoring } from "./test-scoring";
import { tnComparableResult } from "./tn-integration";

const RatioResult = z.object({
  version: z.literal(2),
  scoring: z.enum(["pei_average", "pei_total"]),
});

type LagretResultat = { testId: string; score: number; details: unknown; protocol: unknown };

/** Same stored result in player, coach and shared profiles. No name/size guessing. */
export function formaterLagretTestResultat(resultat: LagretResultat): string {
  if (resultat.testId.startsWith("tn-v3-")) {
    const tn = tnComparableResult(resultat.testId, resultat.score, resultat.details);
    // A broken/unknown version must not silently become a unitless raw fraction.
    return tn ? formaterTestMetrikk(tn.score, tn.unit) : "Resultatet må kontrolleres";
  }
  if (RatioResult.safeParse(resultat.details).success) {
    return formaterTestMetrikk(resultat.score, "PEI");
  }
  const spec = parseForScoring(resultat.protocol);
  return formaterTestVerdi({ kind: spec.kind, verdi: resultat.score, shotsCount: spec.shots.length });
}

/** Delta only within the same test identity, protocol version, count and unit. */
export function sammenlignLagredeTestresultater(ny: LagretResultat, gammel: LagretResultat) {
  if (ny.testId !== gammel.testId || !Number.isFinite(ny.score) || !Number.isFinite(gammel.score)) return null;
  const diff = ny.score - gammel.score;
  if (ny.testId.startsWith("tn-v3-")) {
    const a = tnComparableResult(ny.testId, ny.score, ny.details);
    const b = tnComparableResult(gammel.testId, gammel.score, gammel.details);
    if (!a || !b || a.comparisonKey !== b.comparisonKey) return null;
    const enhet = a.unit === "PEI" ? "pp" : a.unit;
    const verdi = Math.abs(diff) * (a.unit === "PEI" ? 100 : 1);
    return { diff, lavereErBedre: a.direction === "lower", tekst: `${diff < 0 ? "−" : "+"}${formaterTestMetrikk(verdi, enhet)}` };
  }
  const a = parseForScoring(ny.protocol);
  const b = parseForScoring(gammel.protocol);
  if (a.kind === "fallback" || a.kind !== b.kind) return null;
  const ratioA = RatioResult.safeParse(ny.details).success;
  const ratioB = RatioResult.safeParse(gammel.details).success;
  if (ratioA !== ratioB) return null;
  return {
    diff,
    lavereErBedre: lavereErBedre(a.kind),
    tekst: ratioA
      ? `${diff < 0 ? "−" : "+"}${formaterTestMetrikk(Math.abs(diff) * 100, "pp")}`
      : formaterTestDelta({ kind: a.kind, delta: diff }),
  };
}
