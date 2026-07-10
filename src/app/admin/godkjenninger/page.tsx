/**
 * v2-preview: AgencyOS Godkjenninger (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/godkjenninger-flaten: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme Prisma-loader (PENDING
 * PlanAction + zod-validert suggestion + buildDiffPreview). Mapper til
 * AdminGodkjenningerV2Data (ærlige tomrom, ingen fabrikerte tall).
 *
 * Server component.
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { computeDelta, type PlanContext } from "@/lib/agents/plan-action-executor";
import { LOW_RISK_ACTION_TYPES } from "@/lib/training/skills";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminGodkjenningerV2,
  type AdminGodkjenningerV2Data,
  type AdminGodkjenningV2Row,
} from "@/components/admin/v2/AdminGodkjenningerV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Godkjenninger · AgencyOS (v2)" };

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  TRAINING_GAP: "Treningsgap",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  SESSION_SWAP: "Bytte økt",
  INTENSITY_ADJUST: "Juster intensitet",
  FOCUS_CHANGE: "Endre fokus",
  PERIOD_SWITCH: "Bytt periode",
  DRILL_SWAP: "Bytt drill",
  REST_DAY_ADD: "Hviledag",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
  TOURNAMENT_ENTRY: "Turneringspåmelding",
  PLAN_CHANGE: "Plan-endring",
};

function erHaster(actionType: string): boolean {
  return (
    actionType === "WITHDRAW" ||
    actionType.includes("ESCALATION") ||
    actionType === "TAPER_ENGAGE" ||
    actionType === "PERIOD_SWITCH" ||
    actionType === "SESSION_SWAP"
  );
}

const suggestionSchema = z
  .object({
    title: z.string().optional(),
    tittel: z.string().optional(),
    forklaring: z.string().optional(),
    detail: z.string().optional(),
    signalSnapshot: z
      .object({
        kind: z.string(),
        value: z.union([z.number(), z.string()]).optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough()
  .nullable();

function nårTekst(d: Date): string {
  const dager = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (dager === 0)
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  if (dager === 1) return "i går";
  return `${dager} dg siden`;
}

async function buildDiffPreview(
  actionType: string,
  suggestion: unknown,
  userId: string,
  planId: string | null,
): Promise<string | null> {
  try {
    const plan =
      planId != null
        ? await prisma.trainingPlan.findUnique({ where: { id: planId } })
        : await prisma.trainingPlan.findFirst({
            where: { userId, isActive: true },
            orderBy: { updatedAt: "desc" },
          });
    if (!plan) return null;

    const now = new Date();
    const sessions = await prisma.trainingPlanSession.findMany({
      where: {
        planId: plan.id,
        scheduledAt: { gte: now },
        status: { in: ["PLANNED", "ACTIVE", "PAUSED"] },
      },
      orderBy: { scheduledAt: "asc" },
      select: {
        id: true,
        pyramidArea: true,
        skillArea: true,
        scheduledAt: true,
        status: true,
        durationMin: true,
        title: true,
      },
    });

    const ukeSlutt = new Date(now);
    ukeSlutt.setDate(ukeSlutt.getDate() + 7);
    const ctx: PlanContext = {
      planId: plan.id,
      userId,
      futureSessions: sessions,
      planlagteOkterNesteUke: sessions.filter(
        (s) => s.scheduledAt <= ukeSlutt && s.status === "PLANNED",
      ).length,
    };

    const delta = computeDelta(actionType, suggestion, ctx);
    const parts: string[] = [];
    if (delta.sessionsToAdd.length > 0) {
      parts.push(
        `+${delta.sessionsToAdd.length} økt(er): ${delta.sessionsToAdd.map((s) => s.title).join(", ")}`,
      );
    }
    if (delta.sessionsToRemove.length > 0) {
      parts.push(`−${delta.sessionsToRemove.length} planlagt(e) økt(er)`);
    }
    if (delta.sessionsToModify.length > 0) {
      parts.push(`~${delta.sessionsToModify.length} økt(er) endres`);
    }
    if (delta.planMeta?.periodNote) {
      parts.push(`Periode → ${delta.planMeta.periodNote}`);
    }
    return parts.length > 0 ? parts.join(" · ") : delta.summary;
  } catch {
    return null;
  }
}

export default async function V2AdminGodkjenningerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const actions = await prisma.planAction.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { id: true, name: true } },
      plan: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const lowRiskCount = actions.filter((a) =>
    LOW_RISK_ACTION_TYPES.has(a.actionType),
  ).length;

  const rows: AdminGodkjenningV2Row[] = await Promise.all(
    actions.map(async (a) => {
      const parsed = suggestionSchema.safeParse(a.suggestion);
      const sugg = parsed.success ? parsed.data : null;
      const diffPreview = await buildDiffPreview(
        a.actionType,
        a.suggestion,
        a.userId,
        a.planId,
      );
      return {
        id: a.id,
        actionType: a.actionType,
        playerId: a.user.id,
        who: a.user.name ?? "Spiller",
        title:
          sugg?.title ??
          sugg?.tittel ??
          ACTION_LABEL[a.actionType] ??
          a.actionType,
        detail:
          sugg?.forklaring ??
          sugg?.detail ??
          (a.plan ? `Gjelder planen «${a.plan.name}».` : ""),
        signalKind: sugg?.signalSnapshot?.kind ?? null,
        signalValue:
          sugg?.signalSnapshot?.value != null
            ? String(sugg.signalSnapshot.value)
            : null,
        diffPreview,
        when: nårTekst(a.createdAt),
        urgent: erHaster(a.actionType),
        lowRisk: LOW_RISK_ACTION_TYPES.has(a.actionType),
      };
    }),
  );

  const data: AdminGodkjenningerV2Data = { rows, lowRiskCount };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminGodkjenningerV2 data={data} />
    </V2Shell>
  );
}
