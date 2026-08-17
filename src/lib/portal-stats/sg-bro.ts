/**
 * SG-broen (T6): syncer spillerens runde-SG inn i BrukerSgInput slik at
 * DataGolf-sammenligningen («Deg mot touren») får grunnlag uten at spilleren
 * må taste tallene manuelt på /stats/sg-sammenlign/start.
 *
 * Aggregerer de siste 20 rundene med SG-data (sgTotal registrert) til snitt
 * per kategori + snittscore + periode, og skriver ÉN BrukerSgInput-rad med
 * kilde "PLAYERHQ": nyeste PLAYERHQ-rad oppdateres hvis den finnes, ellers
 * opprettes ny (modellen har ingen unik nøkkel per kilde). Manuelle rader
 * (kilde MANUELL/TRACKMAN/NLB) røres aldri.
 *
 * Best-effort: `synkroniserSgFraRunder` kaster ALDRI — runde-lagringen skal
 * aldri velte på broen. Eksportert også for cron-bruk (mandags-synk kobles i
 * senere PR).
 */

import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/error-tracking";

const MAKS_RUNDER = 20;

/** Kilde-verdien broen eier i BrukerSgInput. */
export const SG_BRO_KILDE = "PLAYERHQ";

export type SgBroRunde = {
  playedAt: Date;
  score: number;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

export type SgAggregat = {
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
  sgTotal: number | null;
  snittScore: number;
  antallRunder: number;
  periodeFra: Date;
  periodeTil: Date;
};

const rund2 = (v: number) => Math.round(v * 100) / 100;
const rund1 = (v: number) => Math.round(v * 10) / 10;

/** Snitt av registrerte verdier (null ignoreres), 2 desimaler. Alle null = null — aldri fabrikkert. */
function snittAv(verdier: Array<number | null>): number | null {
  const tall = verdier.filter((v): v is number => v != null);
  if (tall.length === 0) return null;
  return rund2(tall.reduce((sum, v) => sum + v, 0) / tall.length);
}

/**
 * Ren aggregering: snitt per SG-kategori (kun runder der kategorien faktisk
 * er registrert), snitt brutto-score (1 desimal) og periode fra eldste til
 * nyeste runde — uavhengig av input-rekkefølge. Tom liste = null (no-op).
 */
export function beregnSgAggregat(runder: SgBroRunde[]): SgAggregat | null {
  if (runder.length === 0) return null;
  const tider = runder.map((r) => r.playedAt.getTime());
  return {
    sgOtt: snittAv(runder.map((r) => r.sgOtt)),
    sgApp: snittAv(runder.map((r) => r.sgApp)),
    sgArg: snittAv(runder.map((r) => r.sgArg)),
    sgPutt: snittAv(runder.map((r) => r.sgPutt)),
    sgTotal: snittAv(runder.map((r) => r.sgTotal)),
    snittScore: rund1(runder.reduce((sum, r) => sum + r.score, 0) / runder.length),
    antallRunder: runder.length,
    periodeFra: new Date(Math.min(...tider)),
    periodeTil: new Date(Math.max(...tider)),
  };
}

/**
 * Synk: les spillerens siste 20 runder med SG → oppdater/opprett
 * BrukerSgInput-raden med kilde PLAYERHQ. Null runder med SG = no-op.
 * Kaster aldri — feil logges via logError.
 */
export async function synkroniserSgFraRunder(userId: string): Promise<void> {
  try {
    const runder = await prisma.round.findMany({
      where: { userId, sgTotal: { not: null } },
      orderBy: { playedAt: "desc" },
      take: MAKS_RUNDER,
      select: {
        playedAt: true,
        score: true,
        sgTotal: true,
        sgOtt: true,
        sgApp: true,
        sgArg: true,
        sgPutt: true,
      },
    });

    const aggregat = beregnSgAggregat(runder);
    if (!aggregat) return;

    const data = {
      sgOtt: aggregat.sgOtt,
      sgApp: aggregat.sgApp,
      sgArg: aggregat.sgArg,
      sgPutt: aggregat.sgPutt,
      sgTotal: aggregat.sgTotal,
      snittScore: aggregat.snittScore,
      antallRunder: aggregat.antallRunder,
      periodeFra: aggregat.periodeFra,
      periodeTil: aggregat.periodeTil,
      // dato settes til nå slik at PLAYERHQ-raden sorterer som ferskest
      // i alle `orderBy: { dato: "desc" }`-loadere (sg-gap, benchmark m.fl.).
      dato: new Date(),
      kommentar: `Automatisk snitt av siste ${aggregat.antallRunder} runder med SG`,
    };

    const eksisterende = await prisma.brukerSgInput.findFirst({
      where: { userId, kilde: SG_BRO_KILDE },
      orderBy: { dato: "desc" },
      select: { id: true },
    });

    if (eksisterende) {
      await prisma.brukerSgInput.update({ where: { id: eksisterende.id }, data });
    } else {
      await prisma.brukerSgInput.create({
        data: { userId, kilde: SG_BRO_KILDE, ...data },
      });
    }
  } catch (error) {
    await logError({
      context: "portal-stats.synkroniserSgFraRunder",
      error,
      meta: { userId },
    });
  }
}
