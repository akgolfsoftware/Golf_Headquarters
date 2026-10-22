import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hentSpillerprofil } from "@/lib/profil-kobling/data";
import { tilTurneringer } from "@/lib/profil-kobling/til-turneringer";
import type { Spillerprofil } from "@/lib/profil-kobling/typer";
import { beregnBruttoSnitt, osloAar, type BruttoSnitt } from "./brutto-snitt";

type Db = Pick<Prisma.TransactionClient, "$queryRaw" | "round">;

/**
 * Brutto snitt for én spiller (se brutto-snitt.ts). Ingen tilgangskontroll her: KALLEREN må ha
 * sjekket at betrakteren får se spilleren, og sende transaksjonen som `db` når en delingslås holdes.
 * `profil` kan sendes inn når kalleren alt har lest den. `kunDelteRunder`: for trenere, så runder
 * merket «Bare deg» ikke teller i treningstallet.
 */
export async function hentBruttoSnitt(
  spillerId: string,
  { aar = osloAar(new Date()), db = prisma, profil, kunDelteRunder = false }: { aar?: number; db?: Db; profil?: Spillerprofil | null; kunDelteRunder?: boolean } = {},
): Promise<BruttoSnitt> {
  const fra = new Date(Date.UTC(aar - 1, 11, 31)), til = new Date(Date.UTC(aar + 1, 0, 2));
  const [lest, runder] = await Promise.all([
    profil === undefined ? hentSpillerprofil(spillerId, {}, db) : Promise.resolve(profil),
    db.round.findMany({
      where: { userId: spillerId, playStatus: "COMPLETED", playedAt: { gte: fra, lt: til }, ...(kunDelteRunder ? { sharedWithCoach: true } : {}) },
      select: { playedAt: true, score: true, roundType: true, _count: { select: { holeScores: true } } },
    }),
  ]);
  return beregnBruttoSnitt({
    turneringer: tilTurneringer(lest?.turneringer ?? []),
    treningsrunder: runder.map((r) => ({ playedAt: r.playedAt, score: r.score, roundType: r.roundType, hull: r._count.holeScores })),
    aar,
  });
}
