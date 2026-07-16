/**
 * AgencyOS · Live-økt brief — coach-perspektiv (v2-port 16. juli 2026).
 *
 * Coach ser sesjonens detaljer og kan legge til et fokuspunkt
 * som vises til spilleren før økten starter.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { PyramidArea } from "@/generated/prisma/client";
import { AdminLiveBriefV2, type AdminLiveBriefV2Data } from "@/components/admin/v2/AdminLiveBriefV2";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

const MILJO_LABEL: Record<string, string> = {
  M0: "Innendørs",
  M1: "Driving range",
  M2: "Korte banen",
  M3: "Banen",
  M4: "Turnering",
  M5: "Simulator",
};

const PRACTICE_LABEL: Record<string, string> = {
  BLOKK: "Blokkpraksis",
  RANDOM: "Tilfeldig praksis",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

export default async function CoachLiveBriefPage({ params }: Props) {
  const { sessionId } = await params;
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const session = await prisma.trainingSessionV2.findUnique({
    where: { id: sessionId },
    include: { drills: { select: { pyramide: true } } },
  });

  if (!session) notFound();

  const spiller = session.studentId
    ? await prisma.user.findUnique({
        where: { id: session.studentId },
        select: { id: true, name: true },
      })
    : null;

  const tidLabel = `${new Intl.DateTimeFormat("nb-NO", { dateStyle: "short", timeStyle: "short" }).format(session.startTime)} – ${new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(session.endTime)}`;

  // Økt-pyramide utledes fra drills (flertall), samme mønster som portal-siden.
  const pyramideCounts = session.drills.reduce<Record<string, number>>((acc, d) => {
    acc[d.pyramide] = (acc[d.pyramide] ?? 0) + 1;
    return acc;
  }, {});
  const akse =
    (Object.entries(pyramideCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as PyramidArea) ?? "TEK";

  // Les ev. tidligere sendt brief-melding fra completedSummary.coachBrief.
  const rawSummary: unknown = session.completedSummary;
  const summaryObj =
    rawSummary && typeof rawSummary === "object" && !Array.isArray(rawSummary)
      ? (rawSummary as Record<string, unknown>)
      : {};
  const briefObj =
    summaryObj.coachBrief &&
    typeof summaryObj.coachBrief === "object" &&
    !Array.isArray(summaryObj.coachBrief)
      ? (summaryObj.coachBrief as Record<string, unknown>)
      : {};
  const initialMelding = typeof briefObj.melding === "string" ? briefObj.melding : "";

  const data: AdminLiveBriefV2Data = {
    sessionId,
    tittel: session.title,
    spillerNavn: spiller?.name ?? null,
    spillerHref: spiller ? `/admin/spillere/${spiller.id}` : "/admin/agencyos",
    akse,
    stedLabel: MILJO_LABEL[session.miljo] ?? session.miljo,
    praksisLabel: PRACTICE_LABEL[session.practiceType] ?? session.practiceType,
    tidLabel,
    notater: session.notes,
    initialMelding,
    aktivHref: `/admin/live/${sessionId}/active`,
  };

  return <AdminLiveBriefV2 data={data} />;
}
