import { completedLiveDrills } from "@/lib/portal-live/live-summary";
import { prisma } from "@/lib/prisma";
import { canAccessPlayer } from "@/lib/auth/own-or-coached";
/**
 * PlayerHQ · Live-økt oppsummering V2 — TrainingSessionV2.
 *
 * Viser fullført økt med total reps, tid, drills fullført og pyramide-fordeling.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadLiveSession } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";
import { LiveSessionShell, SessionSummary } from "@/components/portal/live";
import type { LiveV2Summary } from "@/components/portal/live";
import type { PyramidArea } from "@/generated/prisma/client";
import { loadNesteOkt } from "@/lib/portal/load-neste-okt";
import { nesteOktTekst } from "@/lib/portal/neste-okt-tekst";
import { loadWorkbenchForLive } from "@/lib/portal-live/resolve-live-session";
import { mapWbToLiveSummary } from "@/lib/portal-live/wb-live-map";

export default async function LiveSummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  const result = await loadLiveSession(sessionId);
  if (!result.ok) {
    if (result.reason === "forbidden") redirect("/portal/planlegge");
    const wb = await loadWorkbenchForLive(sessionId);
    if (!wb) {
      const plan = await prisma.trainingPlanSession.findUnique({
        where: { id: sessionId },
        include: { plan: { select: { userId: true } }, drills: { include: { exercise: true } } },
      });
      if (plan) {
        if (!(await canAccessPlayer(user, plan.plan.userId))) redirect("/portal/planlegge");
        if (plan.status !== "COMPLETED") redirect(`/portal/live/${sessionId}`);
        const counts = await prisma.sessionBallLog.findMany({ where: { planSessionId: sessionId }, select: { count: true } });
        const summary = mapWbToLiveSummary({
          id: plan.id, title: plan.title, status: plan.status, pyramid: plan.pyramidArea,
          durationMinutes: plan.durationMin, date: plan.scheduledAt,
          startMinute: plan.scheduledAt.getUTCHours() * 60 + plan.scheduledAt.getUTCMinutes(),
          location: plan.location, notes: plan.rationale, publishedAt: null, createdAt: plan.createdAt,
          drills: plan.drills.map((d) => ({ id: d.id, title: d.exercise.name, description: d.notes,
            durationMinutes: d.exercise.durationMin ?? 0, sortOrder: d.orderIndex })),
        }, counts);
        return <LiveSessionShell odId="playerhq-live-summary" title="Etter økta" subtitle={plan.title} backHref="/portal" closeHref="/portal">
          <SessionSummary data={summary} lagredeOrd="Økt gjennomført." />
        </LiveSessionShell>;
      }
      if (result.reason === "notfound") notFound();
      redirect("/portal/planlegge");
    }
    if (!(await canAccessPlayer(user, wb.playerId))) redirect("/portal/planlegge/workbench");
    if (wb.status === "IN_PROGRESS") redirect(`/portal/live/${sessionId}/tapper`);
    if (wb.status !== "COMPLETED") redirect(`/portal/live/${sessionId}`);

    const ballCounts = await prisma.sessionBallLog.findMany({ where: { planSessionId: sessionId }, select: { count: true } });
    const summaryData = mapWbToLiveSummary({
      id: wb.id,
      title: wb.title,
      status: wb.status,
      pyramid: wb.pyramid,
      durationMinutes: wb.durationMinutes,
      date: wb.date,
      startMinute: wb.startMinute,
      location: wb.location,
      notes: wb.notes,
      publishedAt: wb.publishedAt,
      createdAt: wb.createdAt,
      drills: wb.drills,
    }, ballCounts);
    const naa = new Date();
    const { okt, href } = await loadNesteOkt(user.id, naa);
    const nesteOkt = nesteOktTekst(okt, href, naa);
    return (
      <LiveSessionShell
        odId="playerhq-live-summary"
        title="Etter økta"
        subtitle={wb.title}
        backHref="/portal"
        closeHref="/portal"
      >
        <SessionSummary
          data={summaryData}
          nesteOkt={nesteOkt}
          lagredeOrd="Økt gjennomført."
        />
      </LiveSessionShell>
    );
  }

  const { data } = result;

  // Ikke-fullførte økter skal ikke vise sammendrag (unntatt race-vindu).
  if (data.status !== "COMPLETED") {
    redirect(`/portal/live/${sessionId}/active`);
  }

  // Les lagret duration + spiller-vurdering fra completedSummary hvis tilgjengelig.
  const summaryRoot =
    data.completedSummary && typeof data.completedSummary === "object" && !Array.isArray(data.completedSummary)
      ? (data.completedSummary as Record<string, unknown>)
      : null;
  const storedSummary = summaryRoot?.liveSummary ?? null;
  const storedDurationSec =
    storedSummary && typeof storedSummary === "object" && !Array.isArray(storedSummary)
      ? Number((storedSummary as Record<string, unknown>).durationSec)
      : NaN;
  const rawDineOrd = summaryRoot?.dineOrd;
  const lagredeOrd =
    rawDineOrd && typeof rawDineOrd === "object" && !Array.isArray(rawDineOrd) &&
    typeof (rawDineOrd as Record<string, unknown>).tekst === "string"
      ? ((rawDineOrd as Record<string, unknown>).tekst as string)
      : null;
  const rawVurdering = summaryRoot?.spillerVurdering;
  const spillerVurdering =
    rawVurdering && typeof rawVurdering === "object" && !Array.isArray(rawVurdering)
      ? {
          kvalitet: Number((rawVurdering as Record<string, unknown>).kvalitet) || 0,
          nesteFokus: String((rawVurdering as Record<string, unknown>).nesteFokus ?? ""),
          folelse:
            typeof (rawVurdering as Record<string, unknown>).folelse === "string"
              ? ((rawVurdering as Record<string, unknown>).folelse as string)
              : null,
          rpe: Number((rawVurdering as Record<string, unknown>).rpe) || null,
        }
      : null;

  // Beregn sammendrag fra loggene.
  const totalReps = data.existingLogs.reduce((sum, l) => sum + l.repsTotal, 0);
  const completedDrillIds = completedLiveDrills(data);
  const drillsCompleted = completedDrillIds.length;
  const pyramidSummary = data.drills.reduce<Record<PyramidArea, number>>(
    (acc, drill) => {
      const log = data.existingLogs.find((l) => l.drillId === drill.id);
      acc[drill.pyramide] = (acc[drill.pyramide] ?? 0) + (log?.repsTotal ?? 0);
      return acc;
    },
    { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
  );

  const firstLog = data.existingLogs[0];
  const lastLog = data.existingLogs[data.existingLogs.length - 1];
  const computedDurationSec =
    firstLog && lastLog
      ? Math.max(
          0,
          Math.round(
            (new Date(lastLog.loggedAt).getTime() - new Date(firstLog.loggedAt).getTime()) / 1000,
          ),
        )
      : 0;
  const durationSec = Number.isFinite(storedDurationSec) ? storedDurationSec : computedDurationSec;

  const summaryData: LiveV2Summary = {
    ...data,
    durationSec,
    totalReps,
    drillsCompleted,
    completedDrillIds,
    pyramidSummary,
  };

  const naa = new Date();
  const { okt, href } = await loadNesteOkt(user.id, naa);
  const nesteOkt = nesteOktTekst(okt, href, naa);

  return (
    <LiveSessionShell odId="playerhq-live-summary" title="Etter økta" subtitle={data.title} backHref={`/portal/live/${sessionId}/active`} closeHref="/portal">
      <SessionSummary
        data={summaryData}
        nesteOkt={nesteOkt}
        spillerVurdering={spillerVurdering && spillerVurdering.kvalitet >= 1 ? spillerVurdering : null}
        lagredeOrd={lagredeOrd}
      />
    </LiveSessionShell>
  );
}
