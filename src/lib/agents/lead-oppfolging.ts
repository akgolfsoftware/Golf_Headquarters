/**
 * B3 (Bølge 4) — lead-løypa: gjeste-bookinger (prøvetimer uten konto) skal
 * aldri dø i stillhet. Daglig cron:
 *   1. Finner gjennomførte gjeste-bookinger (userId null + guestEmail,
 *      startAt passert, siste 14 dager) → upsert i Lead-pipelinen
 *      (source «provetime-booking», dedup på e-post).
 *   2. Varsler coachen med ferdig pakketilbud-tekst (kopierbar fra
 *      varselet) — SENDING skjer alltid av et menneske (Del 3-regelen:
 *      kunderettet auto-sending kun etter kø-godkjenning; dette er ikke
 *      purring, så ingen auto-e-post).
 * Pipeline-tellerne bor i Lead-tabellen (NEW/CONTACTED/CONVERTED) og
 * flates ut i M1-marketing-flaten når den kommer.
 */

import { prisma } from "@/lib/prisma";

const KILDE = "provetime-booking";

export async function runLeadOppfolging(): Promise<{
  kandidater: number;
  nyeLeads: number;
  hoppet: number;
  feilet: number;
}> {
  const now = new Date();
  const fjortenDagerSiden = new Date(now.getTime() - 14 * 86_400_000);

  const kandidater = await prisma.booking.findMany({
    where: {
      userId: null,
      guestEmail: { not: null },
      startAt: { gte: fjortenDagerSiden, lte: now },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    select: {
      id: true,
      guestEmail: true,
      guestName: true,
      startAt: true,
      serviceType: { select: { name: true } },
    },
    orderBy: { startAt: "desc" },
    take: 50,
  });

  let nyeLeads = 0;
  let hoppet = 0;
  let feilet = 0;

  for (const b of kandidater) {
    try {
      const email = b.guestEmail as string;

      // Har gjesten alt fått konto, er hen ikke lead lenger.
      const harKonto = await prisma.user.findFirst({
        where: { email, deletedAt: null },
        select: { id: true },
      });
      if (harKonto) {
        hoppet++;
        continue;
      }

      const eksisterende = await prisma.lead.findFirst({
        where: { email, source: KILDE },
        select: { id: true },
      });
      if (eksisterende) {
        hoppet++;
        continue;
      }

      await prisma.lead.create({
        data: {
          email,
          name: b.guestName,
          source: KILDE,
          status: "NEW",
          metadata: { bookingId: b.id, tjeneste: b.serviceType.name, dato: b.startAt.toISOString() },
        },
      });

      // Coach-varsel med ferdig tilbudstekst — mennesket sender.
      const fornavn = b.guestName?.trim().split(/\s+/)[0] ?? "der";
      const coach = await prisma.user.findFirst({
        where: { role: "ADMIN", deletedAt: null },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });
      if (coach) {
        await prisma.notification.create({
          data: {
            userId: coach.id,
            type: "lead_oppfolging",
            title: `Prøvetime-lead: ${b.guestName ?? email}`,
            body:
              `${b.guestName ?? email} tok «${b.serviceType.name}» uten konto. ` +
              `Forslag å sende: «Hei ${fornavn}! Takk for timen — vil du fortsette utviklingen, ` +
              `setter jeg gjerne opp en coaching-pakke (Performance) eller PlayerHQ-tilgang. ` +
              `Svar her, så finner vi et opplegg.»`.slice(0, 280),
            link: "/admin/bookinger",
          },
        });
      }
      nyeLeads++;
    } catch {
      feilet++;
    }
  }

  return { kandidater: kandidater.length, nyeLeads, hoppet, feilet };
}
