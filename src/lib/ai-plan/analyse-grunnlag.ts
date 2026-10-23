/** Rene kvalitetsregler for individuelle før/etter-observasjoner. */
export const MIN_SG_RUNDER = 5;
export const SG_FELT = ["sgTotal", "sgOtt", "sgApp", "sgArg", "sgPutt"] as const;
export type RoundSg = Record<(typeof SG_FELT)[number], number | null>;
export function sgSnapshot(rounds: readonly RoundSg[]) {
  const antall = Object.fromEntries(SG_FELT.map(k => [k, rounds.filter(r => r[k] !== null && Number.isFinite(r[k])).length]));
  const snitt = (key: keyof RoundSg) => {
    const xs = rounds.map(r => r[key]).filter((v): v is number => v !== null && Number.isFinite(v));
    return xs.length >= MIN_SG_RUNDER ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  };
  return { sgTotal: snitt("sgTotal"), sgOtt: snitt("sgOtt"), sgApp: snitt("sgApp"), sgArg: snitt("sgArg"), sgPutt: snitt("sgPutt"),
    antallRunder: rounds.length, antallPerOmrade: antall, minimumRunder: MIN_SG_RUNDER, analyseVersjon: "2026-10-23.1", evidens: "observasjon" };
}

export type SgKilde = {
  playStatus: string; partialSave: boolean; sgReferenceSetId: string | null;
  benchmarkLevelSnapshot: string | null; sgEngineVersion: string | null;
  sgSource: string | null; roundType: string | null; dataQuality: string | null;
  holeScores: readonly { holeNumber: number; strokes: number }[];
};
/** Bare hele, beregnede 18-hullsrunder med kjent sammenligningsgrunnlag.
 * Runder uten bevis beholdes i spillerhistorikken, men brukes ikke til effektpåstander. */
export function sgSammenligningsnokkel(r: SgKilde): string | null {
  if (r.playStatus !== "COMPLETED" || r.partialSave || r.sgSource !== "beregnet" ||
    r.dataQuality !== "slag_for_slag_komplett" || !r.sgReferenceSetId || !r.benchmarkLevelSnapshot || !r.sgEngineVersion ||
    !["turnering", "trening"].includes(r.roundType ?? "") || r.holeScores.length !== 18 ||
    new Set(r.holeScores.map(h => h.holeNumber)).size !== 18 ||
    r.holeScores.some(h => !Number.isInteger(h.holeNumber) || h.holeNumber < 1 || h.holeNumber > 18 || !Number.isInteger(h.strokes) || h.strokes <= 0)) return null;
  return JSON.stringify([r.sgReferenceSetId, r.benchmarkLevelSnapshot, r.sgEngineVersion, r.roundType]);
}

export const SG_ANALYSE_SELECT = {
  id: true, playedAt: true, score: true,
  sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true,
  playStatus: true, partialSave: true, sgReferenceSetId: true,
  benchmarkLevelSnapshot: true, sgEngineVersion: true, sgSource: true,
  roundType: true, dataQuality: true, holeScores: { select: { holeNumber: true, strokes: true } },
} as const;

/** Før og etter må bruke samme referanse/metode/rundetype. Velg siste gyldige før-runde. */
export function sammenlignbareSgRunder<T extends SgKilde>(pre: readonly T[], post: readonly T[]) {
  const siste = pre.find(r => sgSammenligningsnokkel(r) !== null);
  const key = siste ? sgSammenligningsnokkel(siste) : null;
  return { key, pre: key ? pre.filter(r => sgSammenligningsnokkel(r) === key).slice(0, MIN_SG_RUNDER) : [],
    post: key ? post.filter(r => sgSammenligningsnokkel(r) === key).slice(0, MIN_SG_RUNDER) : [] };
}
