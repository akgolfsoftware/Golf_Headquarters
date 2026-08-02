// periode-navn-mapping.ts — DB-lag oppå den hardkodede ordboken i periode-navn.ts.
//
// Et ukjent periodenavn valideres ikke (se periode-navn.ts). Denne resolveren lar
// en coach legge til navnet i stedet for å endre kode — mønsteret speiler
// periode-fordeling.ts: finnes ingen rad → ordboken i periode-navn.ts gjelder alene.

import type { PeriodeType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { normaliserNavn } from "./periode-navn";

/** Alle coach-lagte navn→type-mappinger, nøkkelnormalisert (trim+lowercase). */
export async function hentEkstraPeriodeNavn(): Promise<Record<string, PeriodeType>> {
  const rader = await prisma.periodeNavnMapping.findMany();
  const ut: Record<string, PeriodeType> = {};
  for (const r of rader) {
    ut[normaliserNavn(r.navn)] = r.periodeType as PeriodeType;
  }
  return ut;
}
