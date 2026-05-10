"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { triggerPeriodiseringsAgent } from "@/lib/agents/triggers";
import type { PyramidArea } from "@/generated/prisma/client";

export type NyOktInput = {
  title: string;
  pyramidArea: PyramidArea;
  scheduledAt: string; // ISO
  durationMin: number;
  rationale?: string;
  exerciseIds: string[];
};

export async function createAdHocSession(input: NyOktInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  if (user.tier === "GRATIS") {
    throw new Error("upgrade-required");
  }
  if (input.exerciseIds.length === 0) {
    throw new Error("no-drills");
  }

  // Sørg for at brukeren har en aktiv plan — opprett "Egne økter" hvis ikke.
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
      drills: {
        create: input.exerciseIds.map((exerciseId, idx) => ({
          exerciseId,
          repsSets: "3x10",
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
