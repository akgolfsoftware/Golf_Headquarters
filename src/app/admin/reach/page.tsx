import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ReachClient, type ReachData } from "./reach-client";

export const dynamic = "force-dynamic";

type PlayerAggregate = {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastSeen: Date | null;
  active7d: boolean;
  active30d: boolean;
  sessionsPlanned: number;
  sessionsCompleted: number;
  compliancePct: number;
  messagesSent: number;
  messagesRead: number;
  readRatePct: number;
  aiCaddieThreads: number;
  roundsLogged: number;
  goalsTouched: number;
  engagementScore: number;
};

export default async function ReachPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const syvDager = new Date(now);
  syvDager.setDate(syvDager.getDate() - 7);
  const trettiDager = new Date(now);
  trettiDager.setDate(trettiDager.getDate() - 30);

  const [
    spillere,
    notifikasjoner,
    treningsPlanSesjoner,
    aiSesjoner,
    runder,
    goals,
  ] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        lastLoginAt: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.notification.findMany({
      where: { createdAt: { gte: trettiDager } },
      select: {
        userId: true,
        readAt: true,
        createdAt: true,
      },
    }),
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: trettiDager } },
      select: {
        status: true,
        scheduledAt: true,
        plan: { select: { userId: true } },
      },
    }),
    prisma.coachingSession.findMany({
      where: { kind: "AI", updatedAt: { gte: trettiDager } },
      select: { userId: true, updatedAt: true },
    }),
    prisma.round.findMany({
      where: { playedAt: { gte: trettiDager } },
      select: { userId: true, playedAt: true },
    }),
    prisma.goal.findMany({
      where: { updatedAt: { gte: trettiDager } },
      select: { userId: true, updatedAt: true },
    }),
  ]);

  const totalPlayers = spillere.length;
  const fallback = totalPlayers === 0;

  // Bygg per-spiller-aggregater
  const playersMap = new Map<string, PlayerAggregate>();
  for (const s of spillere) {
    playersMap.set(s.id, {
      id: s.id,
      name: s.name,
      avatarUrl: s.avatarUrl,
      lastSeen: s.lastLoginAt,
      active7d: !!(s.lastLoginAt && s.lastLoginAt >= syvDager),
      active30d: !!(s.lastLoginAt && s.lastLoginAt >= trettiDager),
      sessionsPlanned: 0,
      sessionsCompleted: 0,
      compliancePct: 0,
      messagesSent: 0,
      messagesRead: 0,
      readRatePct: 0,
      aiCaddieThreads: 0,
      roundsLogged: 0,
      goalsTouched: 0,
      engagementScore: 0,
    });
  }

  for (const n of notifikasjoner) {
    const p = playersMap.get(n.userId);
    if (!p) continue;
    p.messagesSent += 1;
    if (n.readAt) p.messagesRead += 1;
  }
  for (const t of treningsPlanSesjoner) {
    const p = playersMap.get(t.plan.userId);
    if (!p) continue;
    p.sessionsPlanned += 1;
    if (t.status === "COMPLETED") p.sessionsCompleted += 1;
  }
  for (const a of aiSesjoner) {
    const p = playersMap.get(a.userId);
    if (!p) continue;
    p.aiCaddieThreads += 1;
  }
  for (const r of runder) {
    const p = playersMap.get(r.userId);
    if (!p) continue;
    p.roundsLogged += 1;
  }
  for (const g of goals) {
    const p = playersMap.get(g.userId);
    if (!p) continue;
    p.goalsTouched += 1;
  }

  for (const p of playersMap.values()) {
    p.compliancePct =
      p.sessionsPlanned > 0
        ? Math.round((p.sessionsCompleted / p.sessionsPlanned) * 100)
        : 0;
    p.readRatePct =
      p.messagesSent > 0
        ? Math.round((p.messagesRead / p.messagesSent) * 100)
        : 0;
    // Enkel score: compliance + read-rate + features
    p.engagementScore =
      p.compliancePct * 0.4 +
      p.readRatePct * 0.3 +
      Math.min(p.aiCaddieThreads, 10) * 2 +
      Math.min(p.roundsLogged, 10) * 1.5 +
      Math.min(p.goalsTouched, 5) * 1.5;
  }

  // Bruk dummy-data hvis ingen ekte spillere
  const realData: ReachData = fallback
    ? buildFallbackData(now)
    : buildRealData(playersMap, notifikasjoner, treningsPlanSesjoner, aiSesjoner, runder, goals, now);

  return <ReachClient data={realData} />;
}

function buildRealData(
  playersMap: Map<string, PlayerAggregate>,
  notifikasjoner: { userId: string; readAt: Date | null; createdAt: Date }[],
  treningsPlanSesjoner: { status: string; scheduledAt: Date; plan: { userId: string } }[],
  aiSesjoner: { userId: string; updatedAt: Date }[],
  runder: { userId: string; playedAt: Date }[],
  goals: { userId: string; updatedAt: Date }[],
  now: Date,
): ReachData {
  const players = Array.from(playersMap.values());
  const totalPlayers = players.length;
  const active7d = players.filter((p) => p.active7d).length;
  const active30d = players.filter((p) => p.active30d).length;

  const totalPlanned = players.reduce((s, p) => s + p.sessionsPlanned, 0);
  const totalCompleted = players.reduce((s, p) => s + p.sessionsCompleted, 0);
  const avgCompliance =
    totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  const totalMessagesSent = players.reduce((s, p) => s + p.messagesSent, 0);
  const totalMessagesRead = players.reduce((s, p) => s + p.messagesRead, 0);
  const messageReadRate =
    totalMessagesSent > 0
      ? Math.round((totalMessagesRead / totalMessagesSent) * 100)
      : 0;

  // Daglig aktivitet siste 30 dager (basert på lastLoginAt for spillere kombinert
  // med faktiske aktivitets-events: AI, runder, økter, mål, notifikasjoner-lest).
  const daily: { date: string; active: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const activeIds = new Set<string>();
    for (const a of aiSesjoner) {
      if (a.updatedAt >= day && a.updatedAt < dayEnd) activeIds.add(a.userId);
    }
    for (const r of runder) {
      if (r.playedAt >= day && r.playedAt < dayEnd) activeIds.add(r.userId);
    }
    for (const t of treningsPlanSesjoner) {
      if (
        t.status === "COMPLETED" &&
        t.scheduledAt >= day &&
        t.scheduledAt < dayEnd
      )
        activeIds.add(t.plan.userId);
    }
    for (const g of goals) {
      if (g.updatedAt >= day && g.updatedAt < dayEnd) activeIds.add(g.userId);
    }
    for (const n of notifikasjoner) {
      if (n.readAt && n.readAt >= day && n.readAt < dayEnd)
        activeIds.add(n.userId);
    }

    daily.push({
      date: day.toISOString().slice(0, 10),
      active: activeIds.size,
    });
  }

  // Feature-bruk siste 30 dager (antall unike spillere som har brukt featuret)
  const liveLoggerUsers = new Set<string>();
  for (const t of treningsPlanSesjoner) {
    if (t.status === "COMPLETED") liveLoggerUsers.add(t.plan.userId);
  }
  const goalsUsers = new Set(goals.map((g) => g.userId));
  const sgHubUsers = new Set(runder.map((r) => r.userId));
  const aiCaddieUsers = new Set(aiSesjoner.map((a) => a.userId));
  const messagesUsers = new Set(
    notifikasjoner.filter((n) => !!n.readAt).map((n) => n.userId),
  );

  const featureUsage = [
    { label: "Live Logger", count: liveLoggerUsers.size },
    { label: "Goals", count: goalsUsers.size },
    { label: "SG-Hub", count: sgHubUsers.size },
    { label: "Coach-meldinger", count: messagesUsers.size },
    { label: "AI-Caddie", count: aiCaddieUsers.size },
  ];

  // Sortér spillere etter engasjement
  const sortedByEngagement = [...players].sort(
    (a, b) => b.engagementScore - a.engagementScore,
  );
  const topEngaged = sortedByEngagement.slice(0, 3);
  const needsFollowup = [...players]
    .filter((p) => p.sessionsPlanned > 0 || p.messagesSent > 0)
    .sort((a, b) => a.engagementScore - b.engagementScore)
    .slice(0, 3);

  return {
    isDummy: false,
    totalPlayers,
    active7d,
    active30d,
    avgCompliance,
    messageReadRate,
    daily,
    players: players
      .sort((a, b) => a.compliancePct - b.compliancePct)
      .map((p) => ({
        id: p.id,
        name: p.name,
        avatarUrl: p.avatarUrl,
        sessions7d: 0, // beregnes nedenfor
        compliancePct: p.compliancePct,
        lastSeen: p.lastSeen?.toISOString() ?? null,
        status: statusFromCompliance(p.compliancePct, p.lastSeen, now),
      })),
    topEngaged: topEngaged.map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      compliancePct: p.compliancePct,
      readRatePct: p.readRatePct,
      aiCaddieThreads: p.aiCaddieThreads,
    })),
    needsFollowup: needsFollowup.map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      compliancePct: p.compliancePct,
      readRatePct: p.readRatePct,
      lastSeen: p.lastSeen?.toISOString() ?? null,
    })),
    featureUsage,
  };
}

function statusFromCompliance(
  pct: number,
  lastSeen: Date | null,
  now: Date,
): "green" | "amber" | "red" {
  const dagerSiden = lastSeen
    ? Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  if (pct >= 75 && dagerSiden <= 7) return "green";
  if (pct >= 50 || dagerSiden <= 14) return "amber";
  return "red";
}

function buildFallbackData(now: Date): ReachData {
  // Realistic dummy-data — 38 spillere
  const playerNames = [
    "Øyvind R.",
    "Joachim Therkelsen",
    "Emma Solberg",
    "Henrik Bakke",
    "Maria Kristoffersen",
    "Tobias Sørensen",
    "Aksel Berg",
    "Mathilde Holm",
    "Filip Olsen",
    "Sofie Lund",
    "Oliver Dahl",
    "Nora Andersen",
    "Sander Iversen",
    "Ida Pedersen",
    "Magnus Eriksen",
    "Linnea Hansen",
    "Theodor Nilsen",
    "Vilde Karlsen",
    "Jonas Larsen",
    "Frida Strand",
    "Kasper Moen",
    "Selma Aune",
    "William Vik",
    "Hedda Berge",
    "Lucas Foss",
    "Amalie Lie",
    "Isak Holmen",
    "Tuva Bjørk",
    "Mikkel Sand",
    "Maja Ruud",
    "Adrian Tveit",
    "Live Stene",
    "Sebastian Røed",
    "Astrid Vold",
    "Daniel Bråten",
    "Iben Krogh",
    "Noah Tønnessen",
    "Olivia Sæther",
  ];

  const players = playerNames.map((name, i) => {
    // Spre compliance: noen lave, noen middels, noen høye
    let compliancePct: number;
    if (i < 3) compliancePct = 95 - i * 5; // topp
    else if (i >= playerNames.length - 3) compliancePct = 25 + (playerNames.length - 1 - i) * 8; // bunn
    else compliancePct = 50 + ((i * 37) % 35); // midten

    const dagerSidenLogin = (i * 3) % 30;
    const lastSeen = new Date(now);
    lastSeen.setDate(lastSeen.getDate() - dagerSidenLogin);
    lastSeen.setHours(lastSeen.getHours() - (i % 12));

    return {
      id: `dummy-${i}`,
      name,
      avatarUrl: null,
      sessions7d: Math.max(0, Math.round((compliancePct / 100) * 5) - (i % 3)),
      compliancePct,
      lastSeen: lastSeen.toISOString(),
      status: statusFromCompliance(compliancePct, lastSeen, now),
    };
  });

  // Daily active users — opp/ned-trend
  const daily: { date: string; active: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const wave = Math.sin((i / 30) * Math.PI * 2) * 4;
    const trend = (30 - i) * 0.15;
    const base = 14 + Math.round(wave + trend + ((i * 7) % 5));
    daily.push({
      date: day.toISOString().slice(0, 10),
      active: Math.max(8, Math.min(30, base)),
    });
  }

  const topEngaged = [
    {
      id: "dummy-0",
      name: "Øyvind R.",
      avatarUrl: null,
      compliancePct: 95,
      readRatePct: 100,
      aiCaddieThreads: 12,
    },
    {
      id: "dummy-1",
      name: "Joachim Therkelsen",
      avatarUrl: null,
      compliancePct: 90,
      readRatePct: 96,
      aiCaddieThreads: 9,
    },
    {
      id: "dummy-2",
      name: "Emma Solberg",
      avatarUrl: null,
      compliancePct: 85,
      readRatePct: 92,
      aiCaddieThreads: 8,
    },
  ];

  const needsFollowup = [
    {
      id: "dummy-37",
      name: "Olivia Sæther",
      avatarUrl: null,
      compliancePct: 25,
      readRatePct: 40,
      lastSeen: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "dummy-36",
      name: "Noah Tønnessen",
      avatarUrl: null,
      compliancePct: 33,
      readRatePct: 50,
      lastSeen: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "dummy-35",
      name: "Iben Krogh",
      avatarUrl: null,
      compliancePct: 41,
      readRatePct: 62,
      lastSeen: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return {
    isDummy: true,
    totalPlayers: 38,
    active7d: 28,
    active30d: 35,
    avgCompliance: 78,
    messageReadRate: 92,
    daily,
    players: players.sort((a, b) => a.compliancePct - b.compliancePct),
    topEngaged,
    needsFollowup,
    featureUsage: [
      { label: "Live Logger", count: 31 },
      { label: "Goals", count: 27 },
      { label: "SG-Hub", count: 22 },
      { label: "Coach-meldinger", count: 35 },
      { label: "AI-Caddie", count: 19 },
    ],
  };
}
