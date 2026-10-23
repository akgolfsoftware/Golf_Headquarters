import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { bookingSpillerWhere } from "@/lib/auth/booking-spiller-scope";
import { prisma } from "@/lib/prisma";

type Ressurs = { type: "booking"; id: unknown } | { type: "faktura"; id: unknown };
const avvist = () => new Error("Du har ikke tilgang til denne ressursen.");

/** Administrativ rett, aldri profilinnsyn eller godkjenning av handlingen. */
export async function medCaddieAdministrasjon<T>(
  aktorId: string, ressurs: Ressurs, handling: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  if (typeof aktorId !== "string" || !aktorId.trim() ||
      typeof ressurs.id !== "string" || !ressurs.id.trim()) throw avvist();
  const id = ressurs.id;
  return prisma.$transaction(async tx => {
    // Rolle/sletting kan ikke endres mens den godkjente databasehandlingen kjører.
    await tx.$queryRaw`SELECT id FROM users WHERE id = ${aktorId} FOR SHARE`;
    const aktor = await tx.user.findFirst({ where: { id: aktorId, deletedAt: null,
      role: { in: ressurs.type === "faktura" ? ["ADMIN"] : ["ADMIN", "COACH"] } },
      select: { id: true, role: true } });
    if (!aktor) throw avvist();
    if (ressurs.type === "booking") {
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} FOR SHARE`;
      const spiller = await tx.user.findFirst({ where: { AND: [{ id }, bookingSpillerWhere(aktor)] }, select: { id: true } });
      if (!spiller) throw avvist();
    } else {
      // Status må fortsatt være ubetalt når utføreren vurderer purringen.
      const rader = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM payments WHERE id = ${id} FOR SHARE`;
      if (rader.length !== 1) throw avvist();
    }
    return handling(tx);
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 10_000, timeout: 20_000 });
  // Ingen automatisk retry eller eksterne kall: konflikt feiler lukket.
}
