/**
 * PlayerHQ · Live-økt aktiv — PH05Live i Precision Athletics (natt).
 * Kilde: ui_kits/playerhq/screens/PH-05.jsx.
 * Tilgang, stoppeklokke, øvelsesprogresjon, reps-logging og fullføring beholdes.
 * Visningen er PH05LiveAktiv.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadAuthorizedLiveSource } from "@/lib/portal-live/session-source";
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

  // Bruk den samme innsynsporten som brief og registrering før status avgjøres.
  // En fremmed økt skal ikke kunne avsløre sin status gjennom en omdirigering.
  let source: Awaited<ReturnType<typeof loadAuthorizedLiveSource>>;
  try { source = await loadAuthorizedLiveSource(sessionId); }
  catch (error) {
    if (error instanceof Error && ["forbidden", "not-found"].includes(error.message)) notFound();
    throw error;
  }
  if (source.kind === "workbench" && source.row.playerId !== user.id) redirect("/portal/planlegge/workbench");
  if (source.row.status === "COMPLETED") redirect(`/portal/live/${sessionId}/summary`);
  const aktiv = source.kind === "plan"
    ? source.row.status === "ACTIVE" || source.row.status === "PAUSED"
    : source.row.status === "IN_PROGRESS";
  if (!aktiv) redirect(`/portal/live/${sessionId}/brief`);
  if (source.kind === "workbench") {
    const wbData = await loadWbLiveAktiv(sessionId);
    if (!wbData) notFound();
    return <PH05LiveAktiv key={sessionId} data={wbData} />;
  }

  const data = await loadPH05ActiveData(sessionId, user.id);

  return <PH05LiveAktiv key={sessionId} data={data} />;
}
