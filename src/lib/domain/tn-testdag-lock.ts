import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

/**
 * Testdag-mutasjoner (opprett/sett status/avslutt/føring) leser og skriver
 * flere rader (TestDay + TestDayParticipant + TestSession/TestResult) som
 * MÅ være konsistente med hverandre — vanlig READ COMMITTED gjør IKKE
 * "les dagstatus, siden skriv deltaker" atomisk mot en samtidig
 * konkurrerende transaksjon på de samme radene. Samme mønster som
 * `medSerialiserbarTilgangsoppdatering` (tn-tilgang.ts) — Serializable +
 * avgrenset retry på P2034/40001/40P01, brukt KONSEKVENT av alle tre
 * mutasjonsstiene (saveTnTestSomCoach, settTestdagDeltakerStatus,
 * avsluttTestdag), ikke bare "inni en transaksjon" (det løser ikke
 * kappløpet alene).
 */
export async function medSerialisertTestdagTransaksjon<T>(
  arbeid: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let forsok = 0; forsok < 3; forsok++) {
    try {
      return await prisma.$transaction(arbeid, { isolationLevel: "Serializable" });
    } catch (error) {
      const kode = (error as { code?: string } | null)?.code;
      const kanProveIgjen = kode === "P2034" || kode === "40001" || kode === "40P01";
      if (!kanProveIgjen || forsok === 2) throw error;
    }
  }
  throw new Error("Testdag-transaksjonen kunne ikke fullføres.");
}
