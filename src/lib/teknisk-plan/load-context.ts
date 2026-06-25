import "server-only";

import { prisma } from "@/lib/prisma";
import { computePStability, findWeakestP } from "./p-stability";
import type { TekniskPlanWorkbenchContext, TaskRow } from "./types";

/** Henter aktiv teknisk plan for Workbench Teknisk plan-fanen. */
export async function loadTekniskPlanContext(
  userId: string,
): Promise<TekniskPlanWorkbenchContext | null> {
  const plan = await prisma.technicalPlan.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { updatedAt: "desc" },
    include: {
      opprettetAv: { select: { name: true, role: true } },
      positions: {
        orderBy: { sortOrder: "asc" },
        include: {
          tasks: {
            orderBy: { sortOrder: "asc" },
            include: { tmGoals: true },
          },
        },
      },
      audits: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { actor: { select: { name: true } } },
      },
    },
  });

  if (!plan) return null;

  const pStability = computePStability(
    plan.positions.map((p) => ({
      pNummer: p.pNummer,
      navn: p.navn,
      hovedfokus: p.hovedfokus,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        tittel: t.tittel,
        beskrivelse: t.beskrivelse,
        pyramide: t.pyramide,
        omraade: t.omraade,
        koller: t.koller,
        status: t.status,
        repsMaalDry: t.repsMaalDry,
        repsMaalLav: t.repsMaalLav,
        repsMaalFull: t.repsMaalFull,
        repsGjortDry: t.repsGjortDry,
        repsGjortLav: t.repsGjortLav,
        repsGjortFull: t.repsGjortFull,
        tmGoals: t.tmGoals.map((g) => ({
          id: g.id,
          metric: g.metric,
          klubb: g.klubb,
          baselineValue: g.baselineValue,
          targetValue: g.targetValue,
          currentValue: g.currentValue,
          progressPct: g.progressPct,
          inTarget: g.inTarget,
        })),
      })),
    })),
  );

  const allTasks = pStability.flatMap((p) => p.tasks);
  const repsCurrent = allTasks.reduce((s, t) => s + t.repsCurrent, 0);
  const repsTarget = allTasks.reduce((s, t) => s + t.repsTarget, 0);
  const progressPct =
    repsTarget > 0 ? Math.min(100, Math.round((repsCurrent / repsTarget) * 100)) : 0;

  const weakestP = findWeakestP(pStability);

  const focusPos =
    plan.positions.find((p) => p.hovedfokus) ??
    (weakestP
      ? plan.positions.find((p) => p.pNummer === weakestP.pNummer)
      : plan.positions[0]);

  const focusTasks: TaskRow[] = focusPos
    ? (pStability.find((b) => b.pNummer === focusPos.pNummer)?.tasks ?? []).slice(0, 6)
    : [];

  const latestAudit = plan.audits[0];
  const coachName =
    plan.opprettetAv?.role !== "PLAYER" ? (plan.opprettetAv?.name ?? null) : null;

  const coachNote =
    latestAudit?.action === "COACH_NOTE" && latestAudit.payload
      ? String(
          (latestAudit.payload as { note?: string }).note ??
            (latestAudit.payload as { message?: string }).message ??
            "",
        ) || null
      : null;

  return {
    planId: plan.id,
    navn: plan.navn,
    status: plan.status,
    coachName,
    coachNote,
    coachNoteDate: latestAudit
      ? latestAudit.createdAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })
      : null,
    repsCurrent,
    repsTarget,
    progressPct,
    pStability,
    weakestP,
    focusTasks,
  };
}