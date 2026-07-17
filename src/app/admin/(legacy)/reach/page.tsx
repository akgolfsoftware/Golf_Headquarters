/**
 * AgencyOS — Reach & engasjement (/admin/reach). v2-port 16. juli 2026.
 * Samme aggregeringslogikk som før (User/Notification/TrainingPlanSession/
 * CoachingSession/Round/Goal) — kun presentasjonslaget flyttet til
 * AdminReachV2.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminReachV2, type AdminReachV2Data } from "@/components/admin/v2/AdminReachV2";

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

function daysSince(iso: string): number {
  const then = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function formatRelative(iso: string): string {
  const d = daysSince(iso);
  if (d === 0) return "i dag";
  if (d === 1) return "i går";
  if (d < 7) return `${d}d siden`;
  if (d < 30) return `${Math.floor(d / 7)}u siden`;
  return `${Math.floor(d / 30)}mnd siden`;
}

function statusFromCompliance(pct: number, lastSeen: Date | null, now: Date): "green" | "amber" | "red" {
  const dagerSiden = lastSeen ? Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)) : 999;
  if (pct >= 75 && dagerSiden <= 7) return "green";
  if (pct >= 50 || dagerSiden <= 14) return "amber";
  return "red";
}

export default async function ReachPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

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
      p.compliancePct * 0.4 + p.readRatePct * 0.3 + Math.min(p.aiCaddieThreads, 10) * 2 + Math.min(p.roundsLogged, 10) * 1.5 + Math.min(p.goalsTouched, 5) * 1.5;
  }

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
    for (const t of treningsPlanSesjoner)
      if (t.status === "COMPLETED" && t.scheduledAt >= day && t.scheduledAt < dayEnd) activeIds.add(t.plan.userId);
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

  const data: AdminReachV2Data = {
    totaltSpillere: totalPlayers,
    aktiv7d: active7d,
    aktiv30d: active30d,
    snittCompliance: avgCompliance,
    meldingLesRate: messageReadRate,
    daglig: daily.map((d) => ({ dato: d.date, aktive: d.active })),
    spillere: players
      .sort((a, b) => a.compliancePct - b.compliancePct)
      .map((p) => ({
        id: p.id,
        navn: p.name,
        avatarUrl: p.avatarUrl,
        compliancePct: p.compliancePct,
        sistSett: p.lastSeen ? formatRelative(p.lastSeen.toISOString()) : null,
        status: statusFromCompliance(p.compliancePct, p.lastSeen, now),
      })),
    toppEngasjerte: topEngaged.map((p) => ({
      id: p.id,
      navn: p.name,
      avatarUrl: p.avatarUrl,
      compliancePct: p.compliancePct,
      readRatePct: p.readRatePct,
      aiCaddieThreads: p.aiCaddieThreads,
    })),
    trengerOppfolging: needsFollowup.map((p) => ({
      id: p.id,
      navn: p.name,
      avatarUrl: p.avatarUrl,
      compliancePct: p.compliancePct,
      readRatePct: p.readRatePct,
      sistSett: p.lastSeen ? formatRelative(p.lastSeen.toISOString()) : null,
    })),
    featureBruk: featureUsage.map((f) => ({ label: f.label, antall: f.count })),
  };

  return <AdminReachV2 data={data} />;
}
