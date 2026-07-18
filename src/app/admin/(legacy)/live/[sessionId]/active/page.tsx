/**
 * AgencyOS · Live-økt Coach — v2-port 16. juli 2026.
 *
 * Coach følger spillerens pågående økt i sanntid.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { PyramidArea } from "@/generated/prisma/client";
import { AdminLiveActiveV2, type AdminLiveActiveV2Data } from "@/components/admin/v2/AdminLiveActiveV2";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ sessionId: string }> };

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planlagt",
  IN_PROGRESS: "Aktiv",
  COMPLETED: "Fullført",
  CANCELLED: "Avlyst",
  SKIPPED: "Hoppet over",
};

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
  RANDOM: "Tilfeldig",
  KONKURRANSE: "Konkurranse",
  SPILL_TEST: "Spilltest",
};

function fmtTid(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { timeStyle: "short" }).format(d);
}

function varighetMinutter(start: Date, slutt: Date): number {
  return Math.round((slutt.getTime() - start.getTime()) / 60000);
}

export default async function CoachLiveActivePage({ params }: Props) {
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
    ? await prisma.user.findUnique({ where: { id: session.studentId }, select: { id: true, name: true } })
    : null;

  const pyramideCounts = session.drills.reduce<Record<string, number>>((acc, d) => {
    acc[d.pyramide] = (acc[d.pyramide] ?? 0) + 1;
    return acc;
  }, {});
  const akse =
    (Object.entries(pyramideCounts).sort(([, a], [, b]) => b - a)[0]?.[0] as PyramidArea) ?? "TEK";

  const erAktiv = session.status === "IN_PROGRESS";
  const antallDrills = session.drills.length;
  // Plan-fremdrift: enkel proxy basert på antall drills (ingen per-rep-logging synlig for coach her ennå).
  const planFremdriftPct = antallDrills > 0 ? Math.min(Math.round((antallDrills / 5) * 100), 100) : 0;

  const data: AdminLiveActiveV2Data = {
    sessionId,
    tittel: session.title,
    spillerNavn: spiller?.name ?? null,
    akse,
    statusLabel: STATUS_LABEL[session.status] ?? session.status,
    erAktiv,
    startetLabel: erAktiv ? fmtTid(session.startTime) : null,
    varighetMin: varighetMinutter(session.startTime, session.endTime),
    tidIgjenMin: Math.max(0, varighetMinutter(new Date(), session.endTime)),
    miljoLabel: MILJO_LABEL[session.miljo] ?? session.miljo,
    praksisLabel: PRACTICE_LABEL[session.practiceType] ?? session.practiceType,
    drills: session.drills.map((d, i) => ({ id: d.id, navn: d.name, aktiv: i === 0 })),
    planFremdriftPct,
    briefHref: `/admin/live/${sessionId}/brief`,
    summaryHref: `/admin/live/${sessionId}/summary`,
  };

  return <AdminLiveActiveV2 data={data} />;
}
