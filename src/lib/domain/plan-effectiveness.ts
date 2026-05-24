/**
 * Plan-effektivitet: måler hvor godt en plan-mal (PlanTemplate) faktisk virker.
 *
 * Bruker PlanEffectiveness-snapshots — pre-/post-målinger som lagres når en
 * spiller fullfører en plan basert på malen. Vi aggregerer hcpDelta på tvers
 * av alle brukere og beregner snitt.
 *
 * Signifikans: krever ≥ 5 brukere og snittendring større enn ±0,3 HCP.
 */

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type PlanEffektivitet = {
  /** Antall brukere som har fullført en plan basert på denne malen */
  antallBrukere: number;
  /** Gjennomsnittlig HCP-endring (post − pre). Negativ = forbedring. */
  gjennomsnittligHcpEndring: number;
  /** True hvis utvalget er stort nok og effekten er målbar */
  signifikant: boolean;
};

// ---------------------------------------------------------------------------
// Konstanter
// ---------------------------------------------------------------------------

const MIN_UTVALG = 5;
const SIGNIFIKANS_TERSKEL = 0.3;

const TOMT_RESULTAT: PlanEffektivitet = {
  antallBrukere: 0,
  gjennomsnittligHcpEndring: 0,
  signifikant: false,
};

/** Rådata-rad — eksponert for testing. */
export type PlanEffektivitetRaa = {
  hcpDelta: number | null;
  userId: string;
};

// ---------------------------------------------------------------------------
// Eksporterte funksjoner
// ---------------------------------------------------------------------------

/**
 * Ren aggregeringsfunksjon — eksponert separat fra Prisma-spørringen så den
 * kan testes uten databasekobling.
 */
export function aggregerPlanEffektivitet(
  rader: ReadonlyArray<PlanEffektivitetRaa>,
): PlanEffektivitet {
  if (rader.length === 0) return { ...TOMT_RESULTAT };

  const unikeBrukere = new Set(rader.map((r) => r.userId));
  const deltas = rader
    .map((r) => r.hcpDelta)
    .filter((d): d is number => d !== null && Number.isFinite(d));

  if (deltas.length === 0) {
    return {
      antallBrukere: unikeBrukere.size,
      gjennomsnittligHcpEndring: 0,
      signifikant: false,
    };
  }

  const sum = deltas.reduce((acc, d) => acc + d, 0);
  const snitt = sum / deltas.length;
  const snittAvrundet = Math.round(snitt * 100) / 100;

  const signifikant =
    unikeBrukere.size >= MIN_UTVALG &&
    Math.abs(snittAvrundet) >= SIGNIFIKANS_TERSKEL;

  return {
    antallBrukere: unikeBrukere.size,
    gjennomsnittligHcpEndring: snittAvrundet,
    signifikant,
  };
}

/**
 * Beregner effektivitet for en gitt plan-mal.
 *
 * @param planId — `PlanTemplate.id` å beregne for
 * @returns aggregert effektivitet, eller tomt resultat hvis ingen data
 */
export async function beregnPlanEffektivitet(
  planId: string,
): Promise<PlanEffektivitet> {
  if (!planId) return { ...TOMT_RESULTAT };

  const effekter = await prisma.planEffectiveness.findMany({
    where: { templateId: planId },
    select: { hcpDelta: true, userId: true },
  });

  return aggregerPlanEffektivitet(effekter);
}
