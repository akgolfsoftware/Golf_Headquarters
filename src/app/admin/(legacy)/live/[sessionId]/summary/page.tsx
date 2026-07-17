/**
 * AgencyOS · Live-økt summary — coach-perspektiv (v2-port 16. juli 2026).
 *
 * Post-økt sammendrag: coach vurderer øktens kvalitet,
 * skriver observasjoner og lagrer til spillerprofilen.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { PyramidArea } from "@/generated/prisma/client";
import { AdminLiveSummaryV2, type AdminLiveSummaryV2Data } from "@/components/admin/v2/AdminLiveSummaryV2";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

function fmtVarighet(sek: number): string {
  const min = Math.round(sek / 60);
  return `${min} min`;
}

export default async function CoachLiveSummaryPage({ params }: Props) {
  const { sessionId } = await params;
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: {
      drills: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, pyramide: true } },
    },
  });

  if (!session) notFound();

  const spiller = session.studentId
    ? await prisma.user.findUnique({
        where: { id: session.studentId },
        select: { id: true, name: true },
      })
    : null;

  const logs = await prisma.drillLogV2.findMany({
    where: { drill: { sessionId } },
    select: { drillId: true },
  });
  const loggedDrillIds = new Set(logs.map((l) => l.drillId));

  const pyramideCounts = session.drills.reduce<Record<string, number>>((acc, d) => {
    acc[d.pyramide] = (acc[d.pyramide] ?? 0) + 1;
    return acc;
  }, {});
  const akse =
    (Object.entries(pyramideCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as PyramidArea) ?? "TEK";

  // Les ev. eksisterende coach-vurdering + varighet fra completedSummary-JSON.
  const rawSummary: unknown = session.completedSummary;
  const summaryObj =
    rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)
      ? (rawSummary as Record<string, unknown>)
      : {};
  const initialRating =
    typeof summaryObj.coachRating === "number" ? summaryObj.coachRating : null;
  const liveSummary =
    summaryObj.liveSummary && typeof summaryObj.liveSummary === "object" && !Array.isArray(summaryObj.liveSummary)
      ? (summaryObj.liveSummary as Record<string, unknown>)
      : null;
  const varighetLabel =
    typeof liveSummary?.durationSec === "number" ? fmtVarighet(liveSummary.durationSec) : "–";

  const data: AdminLiveSummaryV2Data = {
    sessionId,
    tittel: session.title,
    spillerNavn: spiller?.name ?? null,
    spillerHref: spiller ? `/admin/spillere/${spiller.id}` : "/admin/agencyos",
    akse,
    varighetLabel,
    drills: session.drills.map((d) => ({ id: d.id, navn: d.name, logget: loggedDrillIds.has(d.id) })),
    initialRating,
    initialNotat: session.notes ?? "",
  };

  return <AdminLiveSummaryV2 data={data} />;
}
