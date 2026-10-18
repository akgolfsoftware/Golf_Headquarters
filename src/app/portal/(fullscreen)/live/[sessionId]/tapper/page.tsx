import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { canAccessPlayer } from "@/lib/auth/own-or-coached";
import { resolveLiveSession } from "@/lib/portal-live/resolve-live-session";
import { canAccessResolved, liveHrefForStatus } from "@/lib/portal-live/live-route";
import { loadPH06TapperData } from "@/lib/portal-live/load-ph04-07";
import { PH06Slagteller } from "@/components/portal/precision/PH06Slagteller";

export default async function LiveTapperPage({ params }: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PLAYER" && user.tier === "GRATIS") redirect("/portal/meg/abonnement");
  const { sessionId } = await params;
  const session = await resolveLiveSession(sessionId, user.id);
  if (!session) notFound();
  const playerAccess = await canAccessPlayer(user, session.playerId);
  if (!canAccessResolved(session, user.id, playerAccess)) redirect("/portal/planlegge/workbench");
  if (!["ACTIVE", "PAUSED", "IN_PROGRESS"].includes(session.status)) {
    redirect(liveHrefForStatus(session.kind, session.status, sessionId));
  }
  const data = await loadPH06TapperData(sessionId);
  return <PH06Slagteller data={data} />;
}
