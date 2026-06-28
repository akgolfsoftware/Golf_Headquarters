/**
 * Coach-varsler-senter (/admin/varsler) — datalag.
 *
 * Samler tre kilder coachen ellers må lete etter i hver sin meny:
 *  1. PENDING PlanActions  — agent-forslag som venter coach-handling (godta/avvis).
 *  2. Ferske Signals       — siste signal pr (spiller, kind) siste 14 d (faktisk verdi,
 *                            ingen oppdiktet terskel — FYS/referanseverdier er ikke låst).
 *  3. Uleste Notifications — coachens egne uleste varsler.
 *
 * Enkelt-org: alle PENDING PlanActions/Signals gjelder coachens spillere (samme scope
 * som /admin/spillere, som lister alle PLAYER). Notifications scopes til coachens egen userId.
 */

import { prisma } from "@/lib/prisma";

export type VarselPlanAction = {
  id: string;
  playerName: string;
  initials: string;
  actionLabel: string;
  agentName: string;
  summary: string | null;
  when: string;
};

export type VarselSignal = {
  id: string;
  playerName: string;
  initials: string;
  kindLabel: string;
  value: number | null;
  when: string;
};

export type VarselNotification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  when: string;
};

export type VarslerData = {
  planActions: VarselPlanAction[];
  signals: VarselSignal[];
  notifications: VarselNotification[];
  counts: { actions: number; signals: number; notifications: number };
};

const ACTION_LABELS: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start nedtrapping",
  WITHDRAW: "Trekk fra turnering",
  DRILL_SUGGEST: "Foreslå drill",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign med likesinnede",
  RECOVERY_ADD: "Legg til restitusjon",
};

const SIGNAL_LABELS: Record<string, string> = {
  SG_TOTAL: "SG totalt",
  SG_AREA: "SG-område",
  HCP_TREND: "HCP-trend",
  CLUB_AVG: "Køllesnitt",
  PYRAMID_AREA: "Pyramide-område",
  STREAK: "Streak",
};

function initialer(navn: string | null): string {
  if (!navn) return "?";
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return "?";
  const first = deler[0][0] ?? "";
  const last = deler.length > 1 ? deler[deler.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

function tidSiden(d: Date, now: Date): string {
  const sek = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (sek < 60) return "nå";
  const min = Math.floor(sek / 60);
  if (min < 60) return `${min} min`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t} t`;
  const dg = Math.floor(t / 24);
  if (dg < 30) return `${dg} d`;
  return `${Math.floor(dg / 30)} mnd`;
}

/** Leser en lesbar oppsummering ut av suggestion-JSON uten å anta hele formen. */
function lesSummary(suggestion: unknown): string | null {
  if (suggestion && typeof suggestion === "object" && !Array.isArray(suggestion)) {
    const s = suggestion as Record<string, unknown>;
    for (const k of ["summary", "note", "begrunnelse", "reason", "title"]) {
      const v = s[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

export async function loadVarsler(coachUserId: string): Promise<VarslerData> {
  const now = new Date();
  const signalCutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [planActions, signalsRaw, notifications] = await Promise.all([
    prisma.planAction.findMany({
      where: { status: "PENDING" },
      select: {
        id: true,
        actionType: true,
        agentName: true,
        suggestion: true,
        createdAt: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.signal.findMany({
      where: { computedAt: { gte: signalCutoff } },
      select: {
        id: true,
        kind: true,
        value: true,
        computedAt: true,
        userId: true,
        user: { select: { name: true } },
      },
      // Siste rad pr (spiller, kind): distinct krever disse først i orderBy.
      orderBy: [{ userId: "asc" }, { kind: "asc" }, { computedAt: "desc" }],
      distinct: ["userId", "kind"],
      take: 60,
    }),
    prisma.notification.findMany({
      where: { userId: coachUserId, readAt: null },
      select: { id: true, title: true, body: true, link: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const signals = [...signalsRaw]
    .sort((a, b) => b.computedAt.getTime() - a.computedAt.getTime())
    .slice(0, 24)
    .map<VarselSignal>((s) => ({
      id: s.id,
      playerName: s.user?.name ?? "Ukjent spiller",
      initials: initialer(s.user?.name ?? null),
      kindLabel: SIGNAL_LABELS[s.kind] ?? s.kind,
      value: s.value,
      when: tidSiden(s.computedAt, now),
    }));

  return {
    planActions: planActions.map<VarselPlanAction>((a) => ({
      id: a.id,
      playerName: a.user?.name ?? "Ukjent spiller",
      initials: initialer(a.user?.name ?? null),
      actionLabel: ACTION_LABELS[a.actionType] ?? a.actionType,
      agentName: a.agentName,
      summary: lesSummary(a.suggestion),
      when: tidSiden(a.createdAt, now),
    })),
    signals,
    notifications: notifications.map<VarselNotification>((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      link: n.link,
      when: tidSiden(n.createdAt, now),
    })),
    counts: {
      actions: planActions.length,
      signals: signals.length,
      notifications: notifications.length,
    },
  };
}
