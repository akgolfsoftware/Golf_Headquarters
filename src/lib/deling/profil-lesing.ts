import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { krevNavngittTrener, navngittTrenerHarTilgang } from "./navngitt";

type Tx = Prisma.TransactionClient;

async function trenerFor(brukerId: string) {
  try {
    const trener = await krevNavngittTrener();
    return trener.id === brukerId ? trener : null;
  } catch (error) {
    if (error instanceof Error && ["forbidden", "unauthenticated"].includes(error.message)) return null;
    throw error;
  }
}

/** Tillatelsen lever bare gjennom dette oppslaget, under samme lås som tilbaketrekking. */
export async function medNavngittProfil<T>(
  brukerId: string,
  spillerId: string,
  gruppeId: string,
  les: (tx: Tx) => Promise<T>,
): Promise<T | null> {
  const trener = await trenerFor(brukerId);
  if (!trener) return null;
  return prisma.$transaction(async (tx) => {
    if (!(await navngittTrenerHarTilgang(tx, trener, spillerId, gruppeId))) return null;
    return les(tx);
  });
}

/** Kandidat-ID-er er ikke en rettighet. Hver profil kontrolleres på nytt før data leses. */
export async function lesNavngitteProfiler<T>(
  brukerId: string,
  gruppeId: string,
  les: (tx: Tx, spillerId: string) => Promise<T | null>,
): Promise<T[]> {
  const trener = await trenerFor(brukerId);
  if (!trener) return [];
  const kandidater = await prisma.trenerDelingsInvitasjon.findMany({
    where: { mottakerGruppeId: gruppeId, mottakerEpost: trener.epost, acceptedByUserId: trener.id, acceptedAt: { not: null }, revokedAt: null },
    select: { userId: true }, distinct: ["userId"], orderBy: { userId: "asc" },
  });
  const resultat: T[] = [];
  // Hver transaksjon holder bare én spillerlås; ingen langvarig lås av hele skolen.
  for (const { userId } of kandidater) {
    const rad = await prisma.$transaction(async (tx) => {
      if (!(await navngittTrenerHarTilgang(tx, trener, userId, gruppeId))) return null;
      return les(tx, userId);
    });
    if (rad !== null) resultat.push(rad);
  }
  return resultat;
}
