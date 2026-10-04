import { canAccessPlayer } from "@/lib/auth/own-or-coached";
/**
 * PlayerHQ · Live-økt oppsummering — PH07Summary i Precision Athletics (natt).
 * Kilde: ui_kits/playerhq/screens/PH-07.jsx.
 * Tall, pyramide, notater, vurdering og lagring beholdes.
 * Visningen er PH07Oktoppsummering.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadPH07SummaryData } from "@/lib/portal-live/load-ph04-07";
import { PH07Oktoppsummering } from "@/components/portal/precision/PH07Oktoppsummering";
import { lagreDineOrd } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

export default async function LiveSummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  const [_v2, planSession, wbRow] = await Promise.all([
    prisma.trainingSessionV2.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true },
    }),
    prisma.trainingPlanSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true, plan: { select: { userId: true } } },
    }),
    prisma.workbenchSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true, playerId: true },
    }),
  ]);

  if (planSession && !(await canAccessPlayer(user, planSession.plan.userId))) {
    redirect("/portal/planlegge");
  }
  if (wbRow && !(await canAccessPlayer(user, wbRow.playerId))) {
    redirect("/portal/planlegge/workbench");
  }

  const fornavn = user.name?.split(" ")[0] || "spiller";
  const data = await loadPH07SummaryData(sessionId, user.id, fornavn);

  async function handleSave(note: string, _shareWithCoach: boolean) {
    "use server";
    try {
      if (note.trim().length > 0) {
        await lagreDineOrd(sessionId, note);
      }
    } catch {
      // Ignorer
    }
  }

  return (
    <PH07Oktoppsummering
      key={sessionId}
      data={data}
      onSave={handleSave}
      onCloseHref="/portal"
    />
  );
}
