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

  let tittel: string | null = null;

  if (kilde === "plan") {
    const okt = await prisma.trainingPlanSession.findFirst({
      where: { id, plan: { userId: user.id } },
      select: { id: true, title: true, status: true },
    });
    if (!okt) return { ok: false, error: "Økten finnes ikke" };
    if (okt.status === "COMPLETED" || okt.status === "SKIPPED") {
      return { ok: true };
    }
    tittel = okt.title;
    await prisma.trainingPlanSession.update({ where: { id }, data: { status } });
    // Hold v2-speilet i synk (best-effort — speilet kan mangle).
    await prisma.trainingSessionV2.updateMany({
      where: { generertFra: GENERERT_FRA, generertFraId: id },
      data: { status },
    });
  } else {
    const okt = await prisma.trainingSessionV2.findFirst({
      where: { id, studentId: user.id },
      select: { id: true, title: true, status: true, generertFra: true, generertFraId: true },
    });
    if (!okt) return { ok: false, error: "Økten finnes ikke" };
    if (okt.status === "COMPLETED" || okt.status === "SKIPPED") {
      return { ok: true };
    }
    tittel = okt.title;
    await prisma.trainingSessionV2.update({ where: { id }, data: { status } });
    // Speil tilbake til plan-økta — etterlevelsen (adherence) leser plan-sida.
    if (okt.generertFra === GENERERT_FRA && okt.generertFraId) {
      await prisma.trainingPlanSession.updateMany({
        where: { id: okt.generertFraId, plan: { userId: user.id } },
        data: { status },
      });
    }
  }

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
            link: `/admin/spillere/${user.id}/workbench`,
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
