import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { navngittTrenerHarTilgang } from "@/lib/deling/navngitt";

/** Kalles inne i medAkProfiler, som allerede holder konto-/foresattgrunnlaget.
 * Hold også det navngitte miljøet stabilt gjennom IUP-lesingen. TN kan få
 * uttrykkelig deling fra en WANG-elev; derfor låses elevens medlemsgrupper,
 * ikke bare mottakergruppen. Ingen medlems-ID er i seg selv en tillatelse. */
export async function harSpiller360IupTilgang(
  tx: Prisma.TransactionClient, trener: { id: string; epost: string }, spillerId: string, gruppeId: string,
): Promise<boolean> {
  await tx.$queryRaw`SELECT id FROM groups WHERE id = ${gruppeId} OR id IN
    (SELECT "groupId" FROM group_members WHERE "userId" = ${spillerId}) ORDER BY id FOR SHARE`;
  await tx.$queryRaw`SELECT id FROM group_members WHERE "userId" = ${spillerId}
    OR ("groupId" = ${gruppeId} AND "userId" = ${trener.id}) ORDER BY id FOR SHARE`;
  return navngittTrenerHarTilgang(tx, trener, spillerId, gruppeId);
}
