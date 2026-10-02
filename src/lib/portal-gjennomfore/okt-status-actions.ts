"use server";

/**
 * C5b — én-trykks gjennomført/avvik fra Gjør-flaten (spiller-loopen).
 * «Gjort» → COMPLETED, «Hopp over» → SKIPPED — aldri sperre, aldri skjema.
 * Ved SKIPPED varsles coachen i klarspråk (Nordstjernen: avvik er
 * informasjon, ikke pekefinger). Håndterer begge økt-kildene i Gjør-lista:
 * TrainingPlanSession («plan») og TrainingSessionV2 («v2»), og holder
 * plan→v2-speilet i synk (generertFraId-koblingen fra v2-sync).
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { GENERERT_FRA, resolveCoachIdForPlayer } from "@/lib/workbench/v2-sync";

const InputSchema = z.object({
  id: z.string().min(1),
  kilde: z.enum(["plan", "v2"]),
  status: z.enum(["COMPLETED", "SKIPPED"]),
});

export async function markerOktStatus(input: {
  id: string;
  kilde: "plan" | "v2";
  status: "COMPLETED" | "SKIPPED";
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig input" };
  const { id, kilde, status } = parsed.data;

  const user = await requirePortalUser({ allow: ["PLAYER"] });

  // Kilde og speil må lagres samlet. Ellers kan en speilfeil etterlate
  // én side som ferdig; et nytt forsøk stopper da på terminalstatusen.
  const resultat = await prisma.$transaction(async (tx) => {
    if (kilde === "plan") {
      const okt = await tx.trainingPlanSession.findFirst({
        where: { id, plan: { userId: user.id } },
        select: { id: true, title: true, status: true },
      });
      if (!okt) return { ok: false as const, error: "Økten finnes ikke" };
      if (okt.status === "COMPLETED" || okt.status === "SKIPPED") {
        return { ok: true as const, endret: false, tittel: okt.title };
      }
      // Samtidige trykk: bare kalleren som fortsatt finner lest status,
      // får endre og sende varsel. Den andre får samme idempotente svar.
      const skrevet = await tx.trainingPlanSession.updateMany({
        where: { id, status: okt.status }, data: { status },
      });
      if (skrevet.count === 0) return { ok: true as const, endret: false, tittel: okt.title };
      // Manglende speil er tillatt; en faktisk skrivefeil ruller begge tilbake.
      await tx.trainingSessionV2.updateMany({
        where: { generertFra: GENERERT_FRA, generertFraId: id },
        data: { status },
      });
      return { ok: true as const, endret: true, tittel: okt.title };
    }

    const okt = await tx.trainingSessionV2.findFirst({
      where: { id, studentId: user.id },
      select: { id: true, title: true, status: true, generertFra: true, generertFraId: true },
    });
    if (!okt) return { ok: false as const, error: "Økten finnes ikke" };
    if (okt.status === "COMPLETED" || okt.status === "SKIPPED") {
      return { ok: true as const, endret: false, tittel: okt.title };
    }
    const skrevet = await tx.trainingSessionV2.updateMany({
      where: { id, status: okt.status }, data: { status },
    });
    if (skrevet.count === 0) return { ok: true as const, endret: false, tittel: okt.title };
    if (okt.generertFra === GENERERT_FRA && okt.generertFraId) {
      await tx.trainingPlanSession.updateMany({
        where: { id: okt.generertFraId, plan: { userId: user.id } },
        data: { status },
      });
    }
    return { ok: true as const, endret: true, tittel: okt.title };
  });
  if (!resultat.ok) return { ok: false, error: resultat.error };
  if (!resultat.endret) return { ok: true };
  const tittel = resultat.tittel;

  // Avvik → coachen får beskjed i klarspråk (aldri til selvbetjente uten coach).
  if (status === "SKIPPED") {
    try {
      const coachId = await resolveCoachIdForPlayer(user.id);
      if (coachId && coachId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: coachId,
            type: "okt_avvik",
            title: `${user.name ?? "Spiller"} hoppet over en økt`,
            body: `«${tittel}» ble hoppet over i dag. Ingen handling kreves — men verdt et blikk om det gjentar seg.`,
            link: `/admin/workbench/${user.id}`,
          },
        });
      }
    } catch {
      // varsling er best-effort — statusendringen står uansett
    }
  }

  revalidatePath("/portal/gjennomfore");
  revalidatePath("/portal");
  return { ok: true };
}
