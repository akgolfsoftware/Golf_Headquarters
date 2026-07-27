/**
 * Snitt-SG per område for en spiller — kilden SG-mål måles mot.
 *
 * Samme vindu som Hjem-heroen (siste 10 runder), så tallet en spiller ser
 * som «form» og tallet målet måles mot ikke spriker.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { SgOmrade } from "@/lib/domain/maal-fremdrift";

export type SgSnittPerOmrade = Record<SgOmrade, number | null>;

export const TOMT_SG_SNITT: SgSnittPerOmrade = {
  OTT: null, APP: null, ARG: null, PUTT: null,
};

/** Antall runder snittet regnes over — speiler getKpiStats/Hjem-heroen. */
export const SG_SNITT_RUNDER = 10;

export async function hentSgSnittPerOmrade(userId: string): Promise<SgSnittPerOmrade> {
  const runder = await prisma.round
    .findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      take: SG_SNITT_RUNDER,
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    })
    .catch(() => [] as { sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null }[]);

  if (runder.length === 0) return { ...TOMT_SG_SNITT };

  const snitt = (verdier: (number | null)[]): number | null => {
    const tall = verdier.filter((v): v is number => v != null);
    if (tall.length === 0) return null;
    return Math.round((tall.reduce((s, v) => s + v, 0) / tall.length) * 100) / 100;
  };

  return {
    OTT: snitt(runder.map((r) => r.sgOtt)),
    APP: snitt(runder.map((r) => r.sgApp)),
    ARG: snitt(runder.map((r) => r.sgArg)),
    PUTT: snitt(runder.map((r) => r.sgPutt)),
  };
}
