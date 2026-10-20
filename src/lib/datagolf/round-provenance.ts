import type { Prisma } from '@/generated/prisma/client';
import { isDataGolfSource } from './access-rules';
const SG_FIELDS = ['sgTotal','sgOtt','sgApp','sgArg','sgPutt','sgTee','sgApp200','sgApp150','sgApp100','sgApp50','sgChip','sgPitch','sgLob','sgBunker','sgPutt0_3','sgPutt3_5','sgPutt5_10','sgPutt10_15','sgPutt15_25','sgPutt25_40','sgPutt40plus','sgReferenceSetId','sgEngineVersion','benchmarkLevelSnapshot','sgSource'] as const;
type Provenance = { source: string; sourceVersion: string } | null;
/** Keep the player's recorded score/hole data; remove only ineligible SG derivatives. */
export function withoutDataGolfRoundSg<T extends { sgSource?: string|null; source?:string|null; sgReferenceSet?: Provenance }>(row: T): T {
  const reference = row.sgReferenceSet;
  const ineligible = isDataGolfSource(row.source) || isDataGolfSource(row.sgSource) || isDataGolfSource(reference?.source) || isDataGolfSource(reference?.sourceVersion) || (row.sgSource !== 'manual' && !reference);
  if (!ineligible) return row;
  const safe = { ...row };
  for (const key of SG_FIELDS) if (key in safe) Object.assign(safe, { [key]: null });
  if ('sgReferenceSet' in safe) Object.assign(safe,{sgReferenceSet:null});
  return safe;
}

/** SG-only aggregates must exclude DG before SQL averages/counts. Own scores use their own unfiltered read. */
export function independentReferenceSetWhere(): Prisma.SgReferenceSetWhereInput {
  const prohibited = ['datagolf','data_golf','data-golf','data golf'];
  const independentReference: Prisma.SgReferenceSetWhereInput = { publishedAt:{not:null}, AND: [
    ...prohibited.flatMap(source => [{source:{mode:'insensitive' as const,not:{contains:source}}}, {sourceVersion:{mode:'insensitive' as const,not:{contains:source}}}]),
    {source:{mode:'insensitive',not:{startsWith:'DG_'}}}, {sourceVersion:{mode:'insensitive',not:{startsWith:'DG_'}}},
    {source:{mode:'insensitive',not:{startsWith:'DG-'}}}, {sourceVersion:{mode:'insensitive',not:{startsWith:'DG-'}}},
  ] };
  return independentReference;
}
export function independentRoundSgWhere(): Prisma.RoundWhereInput {
  const independentReference = independentReferenceSetWhere();
  return { OR: [
    { sgSource: 'manual', OR: [{sgReferenceSetId:null},{sgReferenceSet:{is:independentReference}}] },
    { sgSource:'beregnet', sgReferenceSet:{is:independentReference} },
  ] };
}

/** Legacy PLAYERHQ cache has no reference provenance; use original rounds instead. */
export function independentSgInputWhere(): Prisma.BrukerSgInputWhereInput { return {kilde:{in:['MANUELL','TRACKMAN','NLB','PLAYERHQ_INDEPENDENT_V1']}}; }
