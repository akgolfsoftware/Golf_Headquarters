/**
 * Spiller-detalj — /portal/spiller/[spillerId]
 *
 * Public-visning av en spillers profil — brukes fra "stall", lag-sider
 * og søkeresultater. Tabs: Oversikt · Plan · Statistikk · Runder · Coaching-historikk.
 *
 * Design-kilde: 01 Spiller-detalj.html
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SpillerDetaljClient, type SpillerData } from "./spiller-detalj-client";

type Props = {
  params: Promise<{ spillerId: string }>;
};

export default async function SpillerDetaljPage({ params }: Props) {
  const { spillerId } = await params;
  await requirePortalUser(); // sikrer innlogging

  const spiller = await prisma.user.findFirst({
    where: { id: spillerId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      hcp: true,
      homeClub: true,
      playingYears: true,
      ambition: true,
      createdAt: true,
    },
  });

  if (!spiller) notFound();

  // Hent rounds separat for å unngå Prisma-select-kompleksitet
  const rounds = await prisma.round.findMany({
    where: { userId: spillerId },
    orderBy: { playedAt: "desc" },
    take: 10,
    select: {
      id: true,
      score: true,
      playedAt: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
      course: { select: { name: true, par: true } },
    },
  });

  const trainingPlans = await prisma.trainingPlan.findMany({
    where: { userId: spillerId, status: "ACTIVE" },
    take: 1,
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true },
  });

  const coachingSessions = await prisma.coachingSession.findMany({
    where: { userId: spillerId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      createdAt: true,
      kind: true,
      coach: { select: { id: true, name: true } },
    },
  });

  const goals = await prisma.goal.findMany({
    where: { userId: spillerId, status: "ACTIVE" },
    take: 5,
    select: {
      id: true,
      title: true,
      type: true,
      targetValue: true,
      targetDate: true,
    },
  });

  // Beregn stats
  const snittScore =
    rounds.length > 0
      ? rounds.reduce((s: number, r: { score: number }) => s + r.score, 0) / rounds.length
      : null;

  const sgRunder = rounds.filter((r: { sgTotal: number | null }) => r.sgTotal !== null);
  const sgSnitt =
    sgRunder.length > 0
      ? sgRunder.reduce((s: number, r: { sgTotal: number | null }) => s + (r.sgTotal ?? 0), 0) / sgRunder.length
      : null;

  const data: SpillerData = {
    id: spiller.id,
    navn: spiller.name,
    initial: (spiller.name.trim().charAt(0) ?? "?").toUpperCase(),
    avatarUrl: spiller.avatarUrl ?? null,
    hcp: spiller.hcp ?? null,
    homeClub: spiller.homeClub ?? null,
    playingYears: spiller.playingYears ?? null,
    ambition: spiller.ambition ?? null,
    memberSince: spiller.createdAt.toISOString(),
    runder: rounds.map((r) => ({
      id: r.id,
      score: r.score,
      relativ: r.score - (r.course.par ?? 72),
      kursNavn: r.course.name,
      playedAt: r.playedAt.toISOString(),
      sgTotal: r.sgTotal ?? null,
      sgPutt: r.sgPutt ?? null,
      sgOtt: r.sgOtt ?? null,
      sgApp: r.sgApp ?? null,
      sgArg: r.sgArg ?? null,
    })),
    aktivPlan: trainingPlans[0] ?? null,
    coachingHistorikk: coachingSessions.map((s) => ({
      id: s.id,
      scheduledAt: s.createdAt.toISOString(),
      type: s.kind,
      summary: null,
      coachNavn: s.coach.name,
    })),
    mal: goals.map((g) => ({
      id: g.id,
      title: g.title,
      type: g.type,
      targetValue: g.targetValue ?? null,
      currentValue: null,
      deadline: g.targetDate?.toISOString() ?? null,
    })),
    stats: {
      antallRunder: rounds.length,
      snittScore: snittScore !== null ? Math.round(snittScore * 10) / 10 : null,
      sgSnitt: sgSnitt !== null ? Math.round(sgSnitt * 100) / 100 : null,
      antallOkter: coachingSessions.length,
    },
  };

  return <SpillerDetaljClient data={data} />;
}
