import "server-only";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hentMinKurve } from "@/lib/portal/min-kurve-data";
import { beregnVekstrate, MIN_SPILLERE_KOHORT, type Vekstrate, type KohortSesongSnitt } from "@/lib/domain/vekstrate";

export type VekstrateData = Vekstrate & {
  dataSistHentet: Date | null;
};

const kohortRadSchema = z.object({
  sesong: z.coerce.number().int(),
  snitt: z.coerce.number(),
  antall_spillere: z.coerce.number().int(),
});

/**
 * Kullets snitt til-par per sesong for spillerens fødselsår — coach-only
 * referanse (PRODUKTRETNING pkt. 3). Leser den nattlig oppfriskede
 * `dashboard.mv_topar_grunnlag` (STEG 16.1) — ikke direkte Prisma-spørring,
 * siden dette ER en kohort-aggregering over mange spillere, den bruken
 * viewet faktisk ble bygget for (jf. kommentaren på
 * `mv_topar_grunnlag_kohort_idx`, `scripts/lag-topar-grunnlag-2026-08-30.ts`).
 */
async function hentKohortPerSesong(country: string, birthYear: number): Promise<KohortSesongSnitt[]> {
  const rader = await prisma.$queryRaw<unknown[]>`
    select
      sesong,
      avg(topar_snitt_runde) as snitt,
      count(distinct player_id) as antall_spillere
    from dashboard.mv_topar_grunnlag
    where country = ${country} and birth_year = ${birthYear}
    group by sesong
    having count(distinct player_id) >= ${MIN_SPILLERE_KOHORT}
    order by sesong asc
  `;
  return rader.map((rad) => {
    const r = kohortRadSchema.parse(rad);
    return { aar: r.sesong, snitt: r.snitt, antallSpillere: r.antall_spillere };
  });
}

/**
 * Henter grunnlaget for «Vekstrate» (A-19a) for én spiller, sett fra coach.
 *
 * Spillerens egen kurve gjenbruker «Min kurve» sin loader (samme filtre,
 * samme tall som spilleren selv ser) — ingen ny spørring for den siden.
 * Kullsnittet hentes kun når spilleren er koblet til en PublicPlayer med
 * kjent fødselsår; uten det vises spillerens egen rate likevel, bare uten
 * sammenligningslinjen (TruthLayer: mangler grunnlag, fabriker ikke et).
 */
export async function hentVekstrateData(userId: string): Promise<VekstrateData> {
  const [minKurve, bruker] = await Promise.all([
    hentMinKurve(userId, "alle"),
    prisma.user.findUnique({
      where: { id: userId },
      select: { publicPlayer: { select: { country: true, birthYear: true } } },
    }),
  ]);

  const punkter = minKurve.punkter.map((p) => ({ dato: p.dato, snitt: p.snitt }));

  const identitet = bruker?.publicPlayer;
  const kohortPerSesong =
    identitet?.birthYear != null ? await hentKohortPerSesong(identitet.country, identitet.birthYear) : [];

  return { ...beregnVekstrate(punkter, kohortPerSesong), dataSistHentet: minKurve.dataSistHentet };
}
