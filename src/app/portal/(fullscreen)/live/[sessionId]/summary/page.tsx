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

export default async function LiveSummaryPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { sessionId } = await params;

  const isCoach = user.role === "COACH" || user.role === "ADMIN";
  const result = await loadLiveSession(sessionId, user.id, isCoach);
  if (!result.ok) {
    if (result.reason === "notfound") notFound();
    redirect("/portal/planlegge");
  }

  const { data } = result;

  // Ikke-fullførte økter skal ikke vise sammendrag (unntatt race-vindu).
  if (data.status !== "COMPLETED") {
    redirect(`/portal/live/${sessionId}/active`);
  }

  // Les lagret duration fra completedSummary hvis tilgjengelig.
  const storedSummary =
    data.completedSummary && typeof data.completedSummary === "object" && !Array.isArray(data.completedSummary)
      ? (data.completedSummary as Record<string, unknown>).liveSummary
      : null;
  const storedDurationSec =
    storedSummary && typeof storedSummary === "object" && !Array.isArray(storedSummary)
      ? Number((storedSummary as Record<string, unknown>).durationSec)
      : NaN;

  // Beregn sammendrag fra loggene.
  const totalReps = data.existingLogs.reduce((sum, l) => sum + l.repsTotal, 0);
  const drillsCompleted = data.existingLogs.length;
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
    pyramidSummary,
  };

  return (
    <LiveSessionShell title={data.title} subtitle="Oppsummering" closeHref="/portal/planlegge">
      <SessionSummary data={summaryData} />
    </LiveSessionShell>
  );
}
