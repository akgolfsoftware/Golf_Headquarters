/**
 * PlayerHQ · Live-økt aktiv — PH05Live i Precision Athletics (natt).
 * Kilde: ui_kits/playerhq/screens/PH-05.jsx.
 * Tilgang, stoppeklokke, øvelsesprogresjon, reps-logging og fullføring beholdes.
 * Visningen er PH05LiveAktiv.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadPH05ActiveData, loadWbLiveAktiv } from "@/lib/portal-live/load-ph04-07";
import { PH05LiveAktiv } from "@/components/portal/precision/PH05LiveAktiv";

export default async function LiveActivePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  if (user.tier === "GRATIS" && !isCoach) {
    redirect("/portal/meg/abonnement");
  }

  // Coach ser les-modus eller sendes til brief
  if (isCoach) {
    redirect(`/portal/live/${sessionId}/brief`);
  }

  const [v2, planSession, wbRow] = await Promise.all([
    prisma.trainingSessionV2.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true },
    }),
    prisma.trainingPlanSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true },
    }),
    prisma.workbenchSession.findUnique({
      where: { id: sessionId },
      select: { id: true, status: true, playerId: true, hiddenByPlayer: true },
    }),
  ]);

  // WorkbenchSession: bare eieren logger, og bare når økta er i gang.
  if (!v2 && !planSession && wbRow) {
    if (wbRow.playerId !== user.id) redirect("/portal/planlegge/workbench");
    if (wbRow.hiddenByPlayer || wbRow.status === "DRAFT") notFound();
    if (wbRow.status === "COMPLETED") redirect(`/portal/live/${sessionId}/summary`);
    if (wbRow.status !== "IN_PROGRESS") redirect(`/portal/live/${sessionId}/brief`);
    const wbData = await loadWbLiveAktiv(sessionId);
    if (!wbData) notFound();
    return <PH05LiveAktiv key={sessionId} data={wbData} />;
  }

  if (v2?.status === "COMPLETED" || planSession?.status === "COMPLETED" || wbRow?.status === "COMPLETED") {
    redirect(`/portal/live/${sessionId}/summary`);
  }

  const data = await loadPH05ActiveData(sessionId, user.id);

  return <PH05LiveAktiv key={sessionId} data={data} />;
}
