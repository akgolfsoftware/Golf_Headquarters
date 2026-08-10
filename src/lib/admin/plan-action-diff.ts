/**
 * PlanAction → lesbar forhåndsvisning av hva et forslag faktisk endrer.
 *
 * Løftet ut av src/app/admin/godkjenninger/page.tsx 10.08.2026 (PP-2.2) fordi
 * Innboks-fasiten trenger den samme «Hva»-linja i anbefalingskontrakten.
 * Innholdet er flyttet verbatim — ingen atferdsendring, kun ny adresse.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { computeDelta, type PlanContext } from "@/lib/agents/plan-action-executor";

/** Handlingstyper som ikke tåler å ligge og vente. */
export function erHasterHandling(actionType: string): boolean {
  return (
    actionType === "WITHDRAW" ||
    actionType.includes("ESCALATION") ||
    actionType === "TAPER_ENGAGE" ||
    actionType === "PERIOD_SWITCH" ||
    actionType === "SESSION_SWAP"
  );
}

export const planActionSuggestionSchema = z
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

/** «09:04» i dag, «i går», ellers «3 dg siden». */
export function narTekst(d: Date, now: Date = new Date()): string {
  const dager = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (dager === 0)
    return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
  if (dager === 1) return "i går";
  return `${dager} dg siden`;
}

export async function buildDiffPreview(
  actionType: string,
  suggestion: unknown,
  userId: string,
  planId: string | null,
): Promise<string | null> {
  // B2: churn-melding er ikke en plan-endring — forhåndsvis meldingsutkastet.
  if (actionType === "CHURN_MESSAGE") {
    const m = z
      .object({ melding: z.object({ subject: z.string(), body: z.string() }) })
      .safeParse(suggestion);
    return m.success
      ? `Sender melding: «${m.data.melding.subject}» — ${m.data.melding.body.slice(0, 120)}…`
      : null;
  }
  // Test → full sving TM-baseline
  if (actionType === "TM_BASELINE_PROPOSE") {
    const m = z
      .object({
        taskTittel: z.string().optional(),
        metric: z.string().optional(),
        proposedBaseline: z.number().optional(),
        currentBaseline: z.number().optional(),
        testName: z.string().optional(),
        forklaring: z.string().optional(),
      })
      .safeParse(suggestion);
    if (!m.success) return null;
    const s = m.data;
    if (s.forklaring) return s.forklaring;
    return `Baseline ${s.metric ?? "mål"} på «${s.taskTittel ?? "oppgave"}»: ${s.currentBaseline ?? "—"} → ${s.proposedBaseline ?? "—"} (fra ${s.testName ?? "test"}).`;
  }
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
