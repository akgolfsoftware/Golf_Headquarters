/**
 * Belastning — selv-relativ treningsbelastning (ACWR-stil).
 *
 * Følger samme prinsipp som FYS-score: INGEN hardkodede ytelses-/referanse-
 * terskler. Vi sammenligner kun spillerens egen siste uke mot sitt eget
 * 4-ukers snitt — «% av normalt». 100 % = som vanlig, > 100 % = mer enn vanlig.
 *
 * Belastning = fullførte trenings-økt-minutter + golfrunder. En runde teller som
 * et rent TIDS-estimat (≈ 4 t aktivitet) — ikke en god/dårlig-terskel.
 *
 * HRV bygges IKKE her: HealthEntry har ingen HRV-felt (ingen datakilde ennå).
 */

import { prisma } from "@/lib/prisma";

const RUNDE_LOAD_MIN = 240; // tids-estimat per 18-hulls runde
const AKUTT_DAGER = 7;
const KRONISK_DAGER = 28;
const MS_PER_DAG = 86_400_000;

export type BelastningResultat = {
  /** true når det finnes nok historikk (kronisk last > 0) til en meningsfull ratio. */
  harData: boolean;
  /** ACWR: akutt (7d snitt/dag) ÷ kronisk (28d snitt/dag). ~1 = normalt. null uten data. */
  ratio: number | null;
  /** ratio × 100, avrundet. «% av normalt». null uten data. */
  prosentAvNormalt: number | null;
  akuttMin: number;
  kroniskMin: number;
};

const TOM: BelastningResultat = {
  harData: false,
  ratio: null,
  prosentAvNormalt: null,
  akuttMin: 0,
  kroniskMin: 0,
};

/**
 * Ren beregning fra last-hendelser (minutter + tidspunkt). Skilt ut for å
 * kunne enhetstestes uten DB.
 */
export function beregnBelastning(
  hendelser: { at: Date; min: number }[],
  naa: Date,
): BelastningResultat {
  const akuttGrense = new Date(naa.getTime() - AKUTT_DAGER * MS_PER_DAG);
  let akuttMin = 0;
  let kroniskMin = 0;
  for (const h of hendelser) {
    kroniskMin += h.min;
    if (h.at > akuttGrense) akuttMin += h.min; // strengt nyere enn 7 dager
  }
  if (kroniskMin <= 0) return { ...TOM, akuttMin, kroniskMin };

  const akuttPerDag = akuttMin / AKUTT_DAGER;
  const kroniskPerDag = kroniskMin / KRONISK_DAGER;
  if (kroniskPerDag <= 0) return { ...TOM, akuttMin, kroniskMin };

  const ratio = akuttPerDag / kroniskPerDag;
  return {
    harData: true,
    ratio,
    prosentAvNormalt: Math.round(ratio * 100),
    akuttMin,
    kroniskMin,
  };
}

/** Henter siste 28 dagers trening + runder og returnerer belastnings-ratioen. */
export async function hentBelastning(
  userId: string,
  naa: Date = new Date(),
): Promise<BelastningResultat> {
  const kroniskStart = new Date(naa.getTime() - KRONISK_DAGER * MS_PER_DAG);

  const [okter, runder] = await Promise.all([
    prisma.trainingPlanSession.findMany({
      where: {
        plan: { userId },
        status: "COMPLETED",
        scheduledAt: { gte: kroniskStart, lte: naa },
      },
      select: { scheduledAt: true, durationMin: true },
    }),
    prisma.round.findMany({
      where: { userId, playedAt: { gte: kroniskStart, lte: naa } },
      select: { playedAt: true },
    }),
  ]);

  const hendelser = [
    ...okter.map((o) => ({ at: o.scheduledAt, min: o.durationMin })),
    ...runder.map((r) => ({ at: r.playedAt, min: RUNDE_LOAD_MIN })),
  ];
  return beregnBelastning(hendelser, naa);
}
