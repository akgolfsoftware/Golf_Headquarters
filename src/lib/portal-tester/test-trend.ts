/** Retningsriktig sammenligning av samme testprotokoll. Ingen fritekstgjetting. */
import { parseForScoring, lavereErBedre, ScoringDetailsSchema, scoreTest } from "@/lib/portal-tester/test-scoring";
import { tnComparableResult, tnFromDefinitionId } from "@/lib/portal-tester/tn-integration";

type TestMaaling = { testId: string; score: number; details: unknown };
export function sammenlignbarTest(maaling: TestMaaling, protocol: unknown) {
  if (!Number.isFinite(maaling.score)) return null;
  if (tnFromDefinitionId(maaling.testId)) {
    const tn = tnComparableResult(maaling.testId, maaling.score, maaling.details);
    return tn ? { key: tn.comparisonKey, score: tn.score, lavere: tn.direction === "lower" } : null;
  }
  const spec = parseForScoring(protocol);
  const details = ScoringDetailsSchema.safeParse(maaling.details);
  // Gamle resultater uten metodebevis, eller en endret protokoll, gir ingen trend.
  if (spec.kind === "fallback" || !details.success || details.data.scoring !== spec.kind ||
    details.data.unit !== spec.unit || details.data.perSlag.length !== spec.shots.length ||
    details.data.retning !== (lavereErBedre(spec.kind) ? "lavere_bedre" : "hoyere_bedre")) return null;
  if (details.data.perSlag.some((shot, i) => shot.nr !== spec.shots[i].nr || shot.target !== spec.shots[i].target)) return null;
  const canonical = scoreTest(protocol, details.data.perSlag);
  if (Math.abs(canonical.score - maaling.score) > 0.00001) return null;
  return { key: `${maaling.testId}:v2:${spec.kind}:${spec.unit}:${spec.shots.length}`, score: maaling.score, lavere: lavereErBedre(spec.kind) };
}

/** Nyeste mot minst tre tidligere sammenlignbare målinger. Positivt = bedre. */
export function beregnTestTrend(siste: TestMaaling, tidligere: readonly TestMaaling[], protocol: unknown) {
  const ny = sammenlignbarTest(siste, protocol);
  if (!ny) return null;
  const baseline = tidligere.map(r => sammenlignbarTest(r, protocol));
  if (baseline.length < 3 || baseline.some(r => !r || r.key !== ny.key)) return null;
  const snitt = baseline.reduce((sum, r) => sum + r!.score, 0) / baseline.length;
  const delta = (ny.score - snitt) * (ny.lavere ? -1 : 1);
  return { delta, snitt, relativ: snitt === 0 ? null : delta / Math.abs(snitt), lavereErBedre: ny.lavere, antall: baseline.length + 1 };
}
