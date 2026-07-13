"use server";

/**
 * Coach-vendte server actions for spiller-plan-detalj (/admin/spillere/[id]/plan/[planId]).
 *
 * Disse er adskilt fra de spiller-vendte actionene i
 * src/app/portal/tren/teknisk-plan/actions.ts fordi de opererer på en ANNEN
 * brukers plan (coachen redigerer spillerens plan). Auth er derfor COACH/ADMIN-
 * sjekk, ikke eierskap.
 *
 * "Legg til drill" gjenbruker den eksisterende createTask-actionen direkte
 * (den eier sin egen COACH/ADMIN-authz) — se drills-panel.tsx.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { assertCoachTilgangTilSpiller } from "@/lib/auth/coached";
import type { Prisma } from "@/generated/prisma/client";

const IdSchema = z.string().min(1, "ID er påkrevd");

/** COACH/ADMIN-guard + henter planen. Kaster ved manglende tilgang. */
async function ensureCoach(planId: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Ikke innlogget");
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    throw new Error("Ingen tilgang");
  }
  const plan = await prisma.technicalPlan.findUnique({
    where: { id: planId },
    select: { id: true, userId: true },
  });
  if (!plan) throw new Error("Plan ikke funnet");
  await assertCoachTilgangTilSpiller(user, plan.userId);
  return { user, plan };
}

/**
 * Publiser plan — setter status ACTIVE.
 * TechnicalPlan.status er TechPlanStatus (DRAFT | ACTIVE | ARCHIVED).
 * "Publiser" = gjør planen aktiv for spilleren.
 */
export async function publiserTekniskPlan(planId: string) {
  IdSchema.parse(planId);
  const { user, plan } = await ensureCoach(planId);

  await prisma.technicalPlan.update({
    where: { id: planId },
    data: { status: "ACTIVE" },
  });

  await prisma.technicalPlanAudit.create({
    data: {
      planId,
      actorId: user.id,
      action: "STATUS_CHANGE",
      payload: { status: "ACTIVE" },
    },
  });

  revalidatePath(`/admin/spillere/${plan.userId}/plan/${planId}`);
  return { ok: true };
}

/**
 * Dupliser plan — kopierer planen med posisjoner, oppgaver (inkl. tmGoals) og
 * club-targets. Den nye planen blir et DRAFT som tilhører samme spiller, med
 * den innloggede coachen som opprettetAv. Redirecter til den nye planen.
 *
 * Kopierer IKKE: audits, logs, suggestions, planSessions, progress-felt
 * (repsGjort*, currentValue osv.) — duplikatet starter på null.
 */
export async function dupliserTekniskPlan(planId: string) {
  IdSchema.parse(planId);
  const { user, plan: planRef } = await ensureCoach(planId);

  const plan = await prisma.technicalPlan.findUnique({
    where: { id: planId },
    include: {
      positions: {
        orderBy: { sortOrder: "asc" },
        include: {
          tasks: {
            orderBy: { sortOrder: "asc" },
            include: { tmGoals: true },
          },
        },
      },
      clubTargets: true,
    },
  });
  if (!plan) throw new Error("Plan ikke funnet");

  const nyPlan = await prisma.$transaction(async (tx) => {
    const created = await tx.technicalPlan.create({
      data: {
        userId: plan.userId,
        periodBlockId: plan.periodBlockId,
        navn: `${plan.navn} (kopi)`,
        status: "DRAFT",
        startDato: plan.startDato,
        sluttDato: plan.sluttDato,
        opprettetAvId: user.id,
        clubTargets: {
          create: plan.clubTargets.map((ct) => ({
            club: ct.club,
            primaryMetric: ct.primaryMetric,
            primaryGoalMin: ct.primaryGoalMin,
            primaryGoalMax: ct.primaryGoalMax,
            secondaryGoals: (ct.secondaryGoals ?? []) as Prisma.InputJsonValue,
          })),
        },
      },
    });

    for (const pos of plan.positions) {
      const nyPos = await tx.technicalPlanPosition.create({
        data: {
          planId: created.id,
          pNummer: pos.pNummer,
          navn: pos.navn,
          sortOrder: pos.sortOrder,
          hovedfokus: pos.hovedfokus,
        },
      });

      for (const task of pos.tasks) {
        await tx.positionTask.create({
          data: {
            positionId: nyPos.id,
            sortOrder: task.sortOrder,
            tittel: task.tittel,
            beskrivelse: task.beskrivelse,
            bildeUrl: task.bildeUrl,
            videoUrl: task.videoUrl,
            pyramide: task.pyramide,
            omraade: task.omraade,
            koller: task.koller,
            lFase: task.lFase,
            cs: task.cs,
            miljo: task.miljo,
            prPress: task.prPress,
            slagType: task.slagType,
            repsMaalDry: task.repsMaalDry,
            repsMaalLav: task.repsMaalLav,
            repsMaalFull: task.repsMaalFull,
            diagnosticMetrics:
              (task.diagnosticMetrics as Prisma.InputJsonValue | null) ?? undefined,
            diagnosticOverride: task.diagnosticOverride,
            tmGoals: {
              create: task.tmGoals.map((g) => ({
                metric: g.metric,
                klubb: g.klubb,
                baselineValue: g.baselineValue,
                baselineFrom: g.baselineFrom,
                baselineDate: g.baselineDate,
                baselineN: g.baselineN,
                targetValue: g.targetValue,
                targetType: g.targetType,
                comparison: g.comparison,
                rangeMax: g.rangeMax,
                protocol: g.protocol,
                windowSize: g.windowSize,
                requiredHits: g.requiredHits,
                corridorMin: g.corridorMin,
                corridorMax: g.corridorMax,
              })),
            },
          },
        });
      }
    }

    return created;
  });

  await prisma.technicalPlanAudit.create({
    data: {
      planId: nyPlan.id,
      actorId: user.id,
      action: "PLAN_DUPLICATE",
      payload: { fromPlanId: planId },
    },
  });

  revalidatePath(`/admin/spillere/${planRef.userId}/plan/${planId}`);
  redirect(`/admin/spillere/${plan.userId}/plan/${nyPlan.id}`);
}
