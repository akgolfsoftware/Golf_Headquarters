"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { triggerPeriodiseringsAgent } from "@/lib/agents/triggers";
import type {
  LPhase,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/client";

export type AdHocDrill = {
  exerciseId: string;
  sets?: number;
  reps?: number;
  csTarget?: number;
  notes?: string;
};

export type NyOktInput = {
  title: string;
  pyramidArea: PyramidArea;
  scheduledAt: string; // ISO
  durationMin: number;
  rationale?: string;
  skillArea?: SkillArea;
  environment?: SessionEnvironment;
  lPhase?: LPhase;
  // Ny strukturert form (foretrukket).
  drills?: AdHocDrill[];
  // Bakoverkompatibilitet — gammel form med bare IDer.
  exerciseIds?: string[];
};

function repsSetsString(sets?: number, reps?: number): string {
  if (sets && reps) return `${sets}x${reps}`;
  if (reps) return `${reps}`;
  if (sets) return `${sets} sett`;
  return "3x10";
}

export async function createAdHocSession(input: NyOktInput) {
  const user = await requireConsentingUser();

  if (user.tier === "GRATIS") {
    throw new Error("upgrade-required");
  }

  // Normaliser drills til strukturert form
  const drills: AdHocDrill[] =
    input.drills && input.drills.length > 0
      ? input.drills
      : (input.exerciseIds ?? []).map((id) => ({ exerciseId: id }));

  if (drills.length === 0) {
    throw new Error("no-drills");
  }

  let plan = await prisma.trainingPlan.findFirst({
    where: { userId: user.id, isActive: true, name: "Egne økter" },
  });
  let planNyOpprettet = false;
  if (!plan) {
    plan = await prisma.trainingPlan.create({
      data: {
        userId: user.id,
        name: "Egne økter",
        startDate: new Date(),
        isActive: true,
      },
    });
    planNyOpprettet = true;
  }

  const session = await prisma.trainingPlanSession.create({
    data: {
      planId: plan.id,
      scheduledAt: new Date(input.scheduledAt),
      durationMin: input.durationMin,
      title: input.title,
      rationale: input.rationale ?? null,
      pyramidArea: input.pyramidArea,
      skillArea: input.skillArea ?? null,
      environment: input.environment ?? null,
      lPhase: input.lPhase ?? null,
      drills: {
        create: drills.map((d, idx) => ({
          exerciseId: d.exerciseId,
          repsSets: repsSetsString(d.sets, d.reps),
          sets: d.sets ?? null,
          reps: d.reps ?? null,
          csTarget: d.csTarget ?? null,
          notes: d.notes ?? null,
          orderIndex: idx,
        })),
      },
    },
  });

  if (planNyOpprettet) {
    await triggerPeriodiseringsAgent(plan.id);
  }

  revalidatePath("/portal");
  revalidatePath("/portal/tren");
  redirect(`/portal/tren?dato=${session.scheduledAt.toISOString().split("T")[0]}`);
}
