import { z } from "zod";

const score = z.number().int().positive().nullable();
const blobSchema = z.object({
  version: z.literal(2), source: z.literal("GOLFBOX"),
  complete: z.boolean(), grossRanking: z.boolean(),
  fetchedAt: z.string().datetime(), positionText: z.string().nullable(),
  roundScores: z.array(score).max(8),
  roundToPar: z.array(z.number().int().nullable()).max(8),
  roundHoles: z.array(z.number().int().nullable()).max(8),
  roundCompleted: z.array(z.boolean()).max(8),
});

export type Resultatrunde = {
  nummer: number; brutto: number | null; motPar: number | null;
  hull: number | null; fullfort: boolean | null;
};

export type OffentligResultat = {
  status: string; position: number | null; scoreToPar: number | null; totalScore: number | null;
  rounds: unknown;
  klasseNavn?: string | null;
  roundDetails: { roundNumber: number; score: number | null; toPar: number | null; source: string | null }[];
};

/** Kildeformatet eier betydningen. Gamle rader får ikke oppdiktet fullføringsbevis. */
export function lesTurneringsresultat(entry: OffentligResultat) {
  const parsed = blobSchema.safeParse(entry.rounds);
  const blob = parsed.success ? parsed.data : null;
  const nettoklasse = /\bnetto?\b|(?:\s|-)N$|\(N\)$/i.test(entry.klasseNavn ?? "");
  const runder: Resultatrunde[] = blob ? blob.roundScores.map((brutto, i) => ({
    nummer: i + 1, brutto, motPar: blob.roundToPar[i] ?? null,
    hull: blob.roundHoles[i] ?? null, fullfort: blob.roundCompleted[i] ?? false,
  })) : entry.roundDetails.toSorted((a, b) => a.roundNumber - b.roundNumber).map(r => ({
    nummer: r.roundNumber, brutto: r.score && Number.isSafeInteger(r.score) && r.score > 0 ? r.score : null,
    motPar: r.toPar, hull: null, fullfort: r.source === "DATAGOLF" && r.score != null ? true : null,
  }));
  const ferdig = entry.status === "FINISHED";
  const fullstendig = !!blob && blob.complete && runder.length > 0
    && [blob.roundCompleted, blob.roundHoles, blob.roundToPar].every(a => a.length === runder.length)
    && runder.every(r => r.fullfort && r.brutto != null)
    && entry.totalScore === runder.reduce((sum, r) => sum + (r.brutto ?? 0), 0);
  const brutto = ferdig && (!blob || fullstendig) && entry.totalScore != null && Number.isSafeInteger(entry.totalScore) && entry.totalScore > 0 ? entry.totalScore : null;
  const plassering = ferdig && !nettoklasse && (!blob || blob.grossRanking) && entry.position != null && Number.isSafeInteger(entry.position) && entry.position > 0 ? entry.position : null;
  return {
    runder, brutto, plassering, fullstendig,
    motPar: nettoklasse || (blob && !blob.grossRanking) ? null : entry.scoreToPar,
    plasseringTekst: plassering != null ? blob?.positionText ?? String(plassering) : null,
    kildeDato: blob ? new Date(blob.fetchedAt) : null,
    kildeDelvis: blob ? !blob.complete : false,
  };
}

export function resultatStatus(status: string | null): string {
  return ({ FINISHED: "Fullført", TEED_OFF: "Pågår", REGISTERED: "Påmeldt", CUT: "Misset cut", WITHDREW: "Trakk seg", DQ: "Diskvalifisert", DNF: "Brøt", PLANNED: "Planlagt", CONFIRMED: "Bekreftet av spiller", COMPLETED: "Fullført", WITHDRAWN: "Avmeldt" } as Record<string, string>)[status ?? ""] ?? "Status mangler";
}

export function resultatKilde(kilde: string | null): string {
  if (["GOLFBOX", "SRIXON", "NORGESCUP", "OLYO", "NARVESEN", "MIDAM", "SENIOR", "NM", "OSTLANDS", "REGIONTOUR"].includes(kilde ?? "")) return "GolfBox";
  return kilde === "DATAGOLF" ? "DataGolf" : kilde === "MANUAL" ? "Egen registrering" : kilde ?? "Kilde mangler";
}
