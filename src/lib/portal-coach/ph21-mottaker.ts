/**
 * PH-21: hvem spilleren kan skrive til i Innboks.
 *
 * Én kilde for både visningen (getPH21Data) og send-handlingen
 * (sendPH21MeldingAction), så serveren aldri godtar en annen mottaker enn
 * den spilleren faktisk ser. Valgt coach via resolveValgtCoachId; finnes
 * ingen, brukes eldste aktive COACH/ADMIN (samme fallback som skjermen har
 * hatt siden PH-21 ble portert).
 */
import { prisma } from "@/lib/prisma";
import { resolveValgtCoachId } from "@/lib/domain/valgt-coach";

export async function hentPH21MottakerCoachId(userId: string): Promise<string | null> {
  const valgt = await resolveValgtCoachId(userId);
  if (valgt) return valgt;

  const standard = await prisma.user.findFirst({
    where: { role: { in: ["COACH", "ADMIN"] }, deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  return standard?.id ?? null;
}
