import { isDataGolfSource } from './access-rules';
import { withoutDataGolfRoundSg } from './round-provenance';
const SOURCE_KEYS = ['source','sourceOrigin','sourceVersion','sourceReference','sgSource','kilde'];
const DG_KEYS = /^(dataGolf|datagolf|dgId|dgPlayerId|dgReference)/i;
function object(value: unknown): value is Record<string,unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date); }
function project(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(project).filter(v=>v !== undefined);
  if (!object(value)) return value;
  if (SOURCE_KEYS.some(k=>typeof value[k] === 'string' && isDataGolfSource(value[k] as string))) return undefined;
  if (['tournament','referenceSet','sgReferenceSet'].some(key=>object(value[key]) && SOURCE_KEYS.some(k=>isDataGolfSource((value[key] as Record<string,unknown>)[k] as string|undefined)))) return undefined;
  if ([value.id,value.planId,value.trainingPlanId,value.sessionId].some(v=>typeof v === 'string' && (/^datagolf-praksis-/i.test(v) || /^dg-/i.test(v)))) return undefined;
  // Shot SG requires recorded reference provenance. Untraceable calculated results stay out.
  const referenceSet = value.referenceSet;
  if ('sgValue' in value && (!object(referenceSet) || SOURCE_KEYS.some(k=>isDataGolfSource(referenceSet[k] as string|undefined)))) return undefined;
  return Object.fromEntries(Object.entries(value).filter(([key])=>!DG_KEYS.test(key)).flatMap(([key,child])=>{
    const projected = project(child); return projected === undefined ? [] : [[key,projected]];
  }));
}
/** D19 applies equally to the analyst's normal account export. No raw/derived DG leaves this room. */
export function withoutDataGolfExport(payload: Record<string,unknown>): Record<string,unknown> {
  const rounds = Array.isArray(payload.rounds) ? payload.rounds.flatMap(row=>object(row) ? [withoutDataGolfRoundSg(row)] : []) : payload.rounds;
  return project({...payload,rounds}) as Record<string,unknown>;
}
