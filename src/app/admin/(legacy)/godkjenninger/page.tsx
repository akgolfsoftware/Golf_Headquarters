/**
 * AgencyOS — Godkjenninger (INNBOKS · GODKJENNINGER)
 */

import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { computeDelta, type PlanContext } from "@/lib/agents/plan-action-executor";
import { AgAvatar, AgChip, AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { ApprovalActions } from "@/app/admin/(legacy)/approvals/approval-actions";
import { BatchApproveButton } from "@/app/admin/(legacy)/approvals/batch-approve-button";
import { LOW_RISK_ACTION_TYPES } from "@/lib/training/skills";

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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

export default async function Godkjenninger() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

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

  const rows = await Promise.all(
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
        who: a.user.name,
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

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Innboks · Godkjenninger"
        title={`${rows.length} venter`}
        italic="på deg."
        lead="Plan-endringer fra agenter. Godkjenn eller avvis — endringer skrives til planen ved godkjenning."
      />
      {lowRiskCount > 0 && (
        <div className="mb-4 max-w-[820px]">
          <BatchApproveButton count={lowRiskCount} />
        </div>
      )}
      <div className="flex max-w-[820px] flex-col gap-[10px]">
        {rows.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground">
            Ingenting venter på deg — alt er behandlet.
          </div>
        )}
        {rows.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-border bg-card p-4"
            style={m.urgent ? { borderLeft: "3px solid hsl(var(--accent))" } : undefined}
          >
            <div className="grid grid-cols-[40px_1fr] items-start gap-[14px]">
              <AgAvatar initials={initials(m.who)} size={40} tone={m.urgent ? "pri" : "neu"} />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-bold tracking-[-0.01em] text-foreground">
                    {m.title}
                  </span>
                  {m.urgent && <AgChip tone="lime">Haster</AgChip>}
                  {m.lowRisk && <AgChip tone="neu">Lav risiko</AgChip>}
                </div>
                <div className="mb-[6px] mt-[2px] font-mono text-[10px] text-muted-foreground">
                  {m.who} · {m.when} · {m.actionType}
                </div>
                {m.detail && (
                  <div className="text-[13px] leading-normal text-foreground">{m.detail}</div>
                )}
                {m.signalKind && (
                  <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                    Signal: {m.signalKind}
                    {m.signalValue != null ? ` = ${m.signalValue}` : ""}
                  </div>
                )}
                {m.diffPreview && (
                  <div className="mt-2 rounded-md border border-border bg-secondary/40 px-3 py-2 font-mono text-[11px] text-foreground">
                    Diff: {m.diffPreview}
                  </div>
                )}
                <ApprovalActions actionId={m.id} playerId={m.playerId} detailHref={`/admin/godkjenninger/${m.id}`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AgPage>
  );
}