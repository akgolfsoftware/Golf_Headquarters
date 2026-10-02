import { TN_CATALOG, TN_VERSION, TN_RULES_VERSION, tnVersion, tnProtocol, isTnTestName, type TnProtocol } from "./tn-catalog";
import { TnResultSchema, tnScore, tnSameScore } from "./tn-scoring";

export const tnDefinitionId = (p: TnProtocol) => `tn-v3-${tnVersion(p) === TN_RULES_VERSION ? "20261002-" : ""}${p.id}`;
export function tnFromDefinitionId(id: string) {
  if (id.startsWith("tn-v3-20261002-")) return tnProtocol(id.slice(15), undefined, TN_RULES_VERSION);
  return id.startsWith("tn-v3-") ? tnProtocol(id.slice(6), undefined, TN_VERSION) : undefined;
}
export function tnDefinitionData(p: TnProtocol) {
  return { id: tnDefinitionId(p), name: p.name, description: `Team Norway · ${p.rows.length} forsøk · ${p.source}`,
    pyramidArea: tnVersion(p) === TN_RULES_VERSION ? "TEK" as const : "SLAG" as const, erCanon: false, scoringRule: tnVersion(p),
    protocol: { version: tnVersion(p), protocolId: p.id } };
}
/** Virtual catalog: coach can assign before a player has ever taken the test. No writes during page loads. */
export function withTnAssignments<T extends { id: string; name: string; description: string | null; pyramidArea: string; isCustom: boolean }>(tests: T[]) {
  return [...tests.filter(t => t.isCustom || (!tnFromDefinitionId(t.id) && !isTnTestName(t.name))),
    ...TN_CATALOG.filter(p => !p.blocked).map(p => ({ ...tnDefinitionData(p), isCustom: false }))];
}
export function tnComparableResult(testId: string, score: number, details: unknown) {
  const parsed = TnResultSchema.safeParse(details);
  if (!parsed.success || !tnSameScore(parsed.data.score, score)) return null;
  const r = parsed.data;
  const p = tnFromDefinitionId(testId);
  if (!p || tnVersion(p) !== r.version || r.count > 200 || p.blocked || p.id !== r.protocolId || (!p.variableCount && p.rows.length !== r.count)) return null;
  const actual = p.variableCount ? tnProtocol(p.id, r.count, r.version) : p;
  if (!actual) return null;
  try {
    const canonical = tnScore(actual, r.values);
    if (!tnSameScore(canonical.score, score) || canonical.unit !== r.unit) return null;
    const primary = canonical.metrics.find(m => m.value === canonical.score && m.unit === canonical.unit);
    if (!primary) return null;
    return { ...canonical, comparisonKey: `${r.version}:${r.protocolId}:${r.count}:${r.unit}`,
      direction: primary.lowerIsBetter ? "lower" as const : "higher" as const };
  } catch {
    return null;
  }
}
