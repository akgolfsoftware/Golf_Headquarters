/**
 * AgencyOS — Reach & engasjement (`/admin/reach`), v2.
 * Port av `(legacy)/reach/page.tsx` (2026-07-14, AgencyOS Bølge 3.16) —
 * datamodell/aggregeringslogikk er uendret, ny v2-presentasjon i
 * `AdminReachV2`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminReachV2, type ReachDataV2 } from "@/components/admin/v2/AdminReachV2";

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
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const syvDager = new Date(now);
  syvDager.setDate(syvDager.getDate() - 7);
  const trettiDager = new Date(now);
  trettiDager.setDate(trettiDager.getDate() - 30);

  const [spillere, notifikasjoner, treningsPlanSesjoner, aiSesjoner, runder, goals] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true, avatarUrl: true, lastLoginAt: true },
      orderBy: { name: "asc" },
    }),
    prisma.notification.findMany({
      where: { createdAt: { gte: trettiDager } },
      select: { userId: true, readAt: true, createdAt: true },
    }),
    prisma.trainingPlanSession.findMany({
      where: { scheduledAt: { gte: trettiDager } },
      select: { status: true, scheduledAt: true, plan: { select: { userId: true } } },
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
    p.compliancePct = p.sessionsPlanned > 0 ? Math.round((p.sessionsCompleted / p.sessionsPlanned) * 100) : 0;
    p.readRatePct = p.messagesSent > 0 ? Math.round((p.messagesRead / p.messagesSent) * 100) : 0;
    p.engagementScore =
      p.compliancePct * 0.4 +
      p.readRatePct * 0.3 +
      Math.min(p.aiCaddieThreads, 10) * 2 +
      Math.min(p.roundsLogged, 10) * 1.5 +
      Math.min(p.goalsTouched, 5) * 1.5;
  }

  const realData: ReachDataV2 = buildRealData(playersMap, notifikasjoner, treningsPlanSesjoner, aiSesjoner, runder, goals, now);

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminReachV2 data={realData} />
    </V2Shell>
  );
}

function buildRealData(
  playersMap: Map<string, PlayerAggregate>,
  notifikasjoner: { userId: string; readAt: Date | null; createdAt: Date }[],
  treningsPlanSesjoner: { status: string; scheduledAt: Date; plan: { userId: string } }[],
  aiSesjoner: { userId: string; updatedAt: Date }[],
  runder: { userId: string; playedAt: Date }[],
  goals: { userId: string; updatedAt: Date }[],
  now: Date,
): ReachDataV2 {
  const players = Array.from(playersMap.values());
  const totalPlayers = players.length;
  const active7d = players.filter((p) => p.active7d).length;
  const active30d = players.filter((p) => p.active30d).length;

  const totalPlanned = players.reduce((s, p) => s + p.sessionsPlanned, 0);
  const totalCompleted = players.reduce((s, p) => s + p.sessionsCompleted, 0);
  const avgCompliance = totalPlanned > 0 ? Math.round((totalCompleted / totalPlanned) * 100) : 0;

  const totalMessagesSent = players.reduce((s, p) => s + p.messagesSent, 0);
  const totalMessagesRead = players.reduce((s, p) => s + p.messagesRead, 0);
  const messageReadRate = totalMessagesSent > 0 ? Math.round((totalMessagesRead / totalMessagesSent) * 100) : 0;

  const daily: { date: string; active: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const dayEnd = new Date(day);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const activeIds = new Set<string>();
    for (const a of aiSesjoner) if (a.updatedAt >= day && a.updatedAt < dayEnd) activeIds.add(a.userId);
    for (const r of runder) if (r.playedAt >= day && r.playedAt < dayEnd) activeIds.add(r.userId);
    for (const t of treningsPlanSesjoner) if (t.status === "COMPLETED" && t.scheduledAt >= day && t.scheduledAt < dayEnd) activeIds.add(t.plan.userId);
    for (const g of goals) if (g.updatedAt >= day && g.updatedAt < dayEnd) activeIds.add(g.userId);
    for (const n of notifikasjoner) if (n.readAt && n.readAt >= day && n.readAt < dayEnd) activeIds.add(n.userId);

    daily.push({ date: day.toISOString().slice(0, 10), active: activeIds.size });
  }

  const liveLoggerUsers = new Set<string>();
  for (const t of treningsPlanSesjoner) if (t.status === "COMPLETED") liveLoggerUsers.add(t.plan.userId);
  const goalsUsers = new Set(goals.map((g) => g.userId));
  const sgHubUsers = new Set(runder.map((r) => r.userId));
  const aiCaddieUsers = new Set(aiSesjoner.map((a) => a.userId));
  const messagesUsers = new Set(notifikasjoner.filter((n) => !!n.readAt).map((n) => n.userId));

  const featureUsage = [
    { label: "Live Logger", count: liveLoggerUsers.size },
    { label: "Goals", count: goalsUsers.size },
    { label: "SG-Hub", count: sgHubUsers.size },
    { label: "Coach-meldinger", count: messagesUsers.size },
    { label: "AI-Caddie", count: aiCaddieUsers.size },
  ];

  const sortedByEngagement = [...players].sort((a, b) => b.engagementScore - a.engagementScore);
  const topEngaged = sortedByEngagement.slice(0, 3);
  const needsFollowup = [...players]
    .filter((p) => p.sessionsPlanned > 0 || p.messagesSent > 0)
    .sort((a, b) => a.engagementScore - b.engagementScore)
    .slice(0, 3);

  return {
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
        sessions7d: 0,
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

function statusFromCompliance(pct: number, lastSeen: Date | null, now: Date): "green" | "amber" | "red" {
  const dagerSiden = lastSeen ? Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  if (pct >= 75 && dagerSiden <= 7) return "green";
  if (pct >= 50 || dagerSiden <= 14) return "amber";
  return "red";
}
