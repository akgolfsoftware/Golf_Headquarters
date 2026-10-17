import { canAccessPlayer } from "@/lib/auth/own-or-coached";
/**
 * PlayerHQ · Live-økt oppsummering — PH-07 Etter økten i nytt design (lyst tema).
 * Tall, pyramide, notater, vurdering og lagring beholdes. Workbench-økter får Belastning/Fokus eller «Hvor tungt».
 * Visningen er PH07Oktoppsummering.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadPH07SummaryData } from "@/lib/portal-live/load-ph04-07";
import { PH07Oktoppsummering } from "@/components/portal/precision/PH07Oktoppsummering";
import { lagreDineOrd } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { lagreVurderingEtterOkt } from "@/lib/workbench/wb-session-life-actions";
import { lesFokus, oktTypeFraPyramide } from "@/lib/workbench/etter-okta";

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
      select: { id: true, status: true, playerId: true, pyramid: true, perceivedEffort: true, liveSnapshot: true },
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
    // Feil sendes videre, så skjermen sier «Ikke lagret» i stedet for å late som.
    if (note.trim().length > 0) {
      const res = await lagreDineOrd(sessionId, note);
      if (!res.ok) throw new Error(res.error ?? "Ikke lagret");
    }
  }

  async function lagreVurdering(input: { belastning: number; fokus: number | null }) {
    "use server";
    const res = await lagreVurderingEtterOkt({ sessionId, ...input });
    return res.ok ? { ok: true } : { ok: false, error: res.error };
  }

  const vurdering = wbRow && wbRow.status === "COMPLETED" && wbRow.playerId === user.id
    ? { type: oktTypeFraPyramide(wbRow.pyramid), belastning: wbRow.perceivedEffort, fokus: lesFokus(wbRow.liveSnapshot), onLagre: lagreVurdering }
    : undefined;

  return (
    <PH07Oktoppsummering
      key={sessionId}
      data={data}
      onSave={_v2 ? handleSave : undefined}
      onCloseHref="/portal"
      vurdering={vurdering}
    />
  );
}
