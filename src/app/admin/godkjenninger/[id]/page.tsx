/**
 * AgencyOS — Godkjenning-detalj (`/admin/godkjenninger/[id]`), v2.
 * Port av `(legacy)/godkjenninger/[id]/page.tsx` (2026-07-14, AgencyOS
 * Bølge 3.6) — samme datamodell (`PlanAction` + `computeDelta`), ny
 * v2-presentasjon i `AdminGodkjenningDetaljV2`. `(legacy)/approvals/
 * actions.ts` bor fortsatt der — delt server actions, uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { computeDelta, type PlanContext } from "@/lib/agents/plan-action-executor";
import { AdminGodkjenningDetaljV2, AdminGodkjenningNotFoundV2, type AdminGodkjenningDetaljV2Data } from "@/components/admin/v2/AdminGodkjenningDetaljV2";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  TRAINING_GAP: "Treningsgap",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  FOCUS_CHANGE: "Endre fokus",
  PERIOD_SWITCH: "Bytt periode",
  DRILL_SWAP: "Bytt drill",
  REST_DAY_ADD: "Hviledag",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function relativeTimeNb(d: Date): string {
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "Opprettet nå";
  if (min < 60) return `Opprettet ${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `Opprettet ${t} timer siden`;
  const dg = Math.floor(t / 24);
  return `Opprettet ${dg} dager siden`;
}

export default async function GodkjenningDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const action = await prisma.planAction.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true } }, plan: { select: { id: true, name: true } } },
  });

  if (!action) {
    return (
      <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <AdminGodkjenningNotFoundV2 />
      </V2Shell>
    );
  }

  const suggestion = action.suggestion && typeof action.suggestion === "object" ? (action.suggestion as Record<string, unknown>) : {};
  const forklaring = typeof suggestion.forklaring === "string" ? suggestion.forklaring : ACTION_LABEL[action.actionType] ?? action.actionType;
  const signalSnapshot = suggestion.signalSnapshot && typeof suggestion.signalSnapshot === "object" ? (suggestion.signalSnapshot as { kind: string; value?: string | number }) : null;

  let diffPreview: string | null = null;
  let beforeSummary: string | null = null;

  const plan = action.planId != null
    ? await prisma.trainingPlan.findUnique({ where: { id: action.planId } })
    : await prisma.trainingPlan.findFirst({ where: { userId: action.userId, isActive: true }, orderBy: { updatedAt: "desc" } });

  if (plan) {
    const now = new Date();
    const sessions = await prisma.trainingPlanSession.findMany({
      where: { planId: plan.id, scheduledAt: { gte: now }, status: { in: ["PLANNED", "ACTIVE", "PAUSED"] } },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, pyramidArea: true, skillArea: true, scheduledAt: true, status: true, durationMin: true, title: true },
    });
    const ukeSlutt = new Date(now);
    ukeSlutt.setDate(ukeSlutt.getDate() + 7);
    const ctx: PlanContext = {
      planId: plan.id,
      userId: action.userId,
      futureSessions: sessions,
      planlagteOkterNesteUke: sessions.filter((s) => s.scheduledAt <= ukeSlutt && s.status === "PLANNED").length,
    };
    beforeSummary = `${sessions.filter((s) => s.status === "PLANNED").length} planlagte økter fremover`;
    const delta = computeDelta(action.actionType, action.suggestion, ctx);
    const parts: string[] = [];
    if (delta.sessionsToAdd.length > 0) parts.push(`Etter: +${delta.sessionsToAdd.length} økt(er) — ${delta.sessionsToAdd.map((s) => `${s.title} (${s.pyramidArea})`).join("; ")}`);
    if (delta.sessionsToRemove.length > 0) parts.push(`Etter: fjerner ${delta.sessionsToRemove.length} planlagt(e) økt(er)`);
    if (delta.sessionsToModify.length > 0) parts.push(`Etter: endrer ${delta.sessionsToModify.length} økt(er)`);
    if (delta.planMeta?.periodNote) parts.push(`Periode-notat: ${delta.planMeta.periodNote}`);
    diffPreview = parts.length > 0 ? parts.join(" · ") : delta.summary;
  }

  const detail: AdminGodkjenningDetaljV2Data = {
    id: action.id,
    status: action.status,
    agentName: action.agentName,
    opprettetTekst: relativeTimeNb(action.createdAt),
    spillerId: action.user.id,
    spillerNavn: action.user.name,
    spillerInitialer: initials(action.user.name),
    tittelLead: forklaring,
    tittelTrail: ` · ${action.user.name.split(" ")[0]}`,
    rationale: forklaring,
    signalTekst: signalSnapshot ? `${signalSnapshot.kind}${signalSnapshot.value != null ? ` = ${signalSnapshot.value}` : ""}` : null,
    beforeSummary,
    diffPreview,
  };

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminGodkjenningDetaljV2 {...detail} />
    </V2Shell>
  );
}
