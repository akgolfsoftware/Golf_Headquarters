import { TN_CATALOG, TN_VERSION, tnProtocol, isTnTestName, type TnProtocol } from "./tn-catalog";
import { TnResultSchema } from "./tn-scoring";

export const tnDefinitionId = (p: TnProtocol) => `tn-v3-${p.id}`;
export function tnFromDefinitionId(id: string) {
  return id.startsWith("tn-v3-") ? tnProtocol(id.slice(6)) : undefined;
}
export function tnDefinitionData(p: TnProtocol) {
  return { id: tnDefinitionId(p), name: p.name, description: `Team Norway · ${p.rows.length} forsøk · ${p.source}`,
    pyramidArea: "SLAG" as const, erCanon: false, scoringRule: TN_VERSION,
    protocol: { version: TN_VERSION, protocolId: p.id } };
}
/** Virtual catalog: coach can assign before a player has ever taken the test. No writes during page loads. */
export function withTnAssignments<T extends { id: string; name: string; description: string | null; pyramidArea: string; isCustom: boolean }>(tests: T[]) {
  return [...tests.filter(t => t.isCustom || (!tnFromDefinitionId(t.id) && !isTnTestName(t.name))),
    ...TN_CATALOG.filter(p => !p.blocked).map(p => ({ ...tnDefinitionData(p), isCustom: false }))];
}
export function tnComparableResult(testId: string, score: number, details: unknown) {
  const parsed = TnResultSchema.safeParse(details);
  if (!parsed.success || parsed.data.score !== score) return null;
  const r = parsed.data;
  const p = tnFromDefinitionId(testId);
  if (!p || r.count > 200 || p.blocked || p.id !== r.protocolId || (!p.variableCount && p.rows.length !== r.count)) return null;
  return { ...r, comparisonKey: `${r.version}:${r.protocolId}:${r.count}:${r.unit}`,
    direction: p.points8Ball ? "higher" as const : "lower" as const };
}
