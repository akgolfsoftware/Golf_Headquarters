"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type UpdatePeriodeInput = {
  id: string;
  name?: string;
  type?: "Forberedelse" | "Konkurranse" | "Restitusjon" | "Off-season";
  color?: string;
  startDate: string;
  endDate: string;
  sgFocus?: string[];
  pyramidFocus?: string[];
  goals?: string[];
  volume?: number;
  load?: number;
  coachNote?: string;
};

/**
 * updatePeriode — oppdaterer en periodeblokk i årsplanen.
 * Mapper UI-felter til schema-kolonnene (PeriodBlock).
 */
export async function updatePeriode(input: UpdatePeriodeInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  // IDOR-vern: periodeblokken eies via seasonPlan.userId — verifiser eierskap.
  const periode = await prisma.periodBlock.findUnique({
    where: { id: input.id },
    include: { seasonPlan: { select: { userId: true } } },
  });
  if (!periode || periode.seasonPlan.userId !== user.id) throw new Error("not_found");

  await prisma.periodBlock.update({
    where: { id: input.id },
    data: {
      startDate: new Date(input.startDate),
      endDate: new Date(input.endDate),
      focus: input.name ?? periode.focus,
      notes: input.coachNote ?? periode.notes,
    },
  });

  revalidatePath("/portal/tren/aarsplan");
  redirect("/portal/tren/aarsplan");
}

export async function deletePeriode(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  // IDOR-vern: verifiser eierskap før sletting.
  const periode = await prisma.periodBlock.findUnique({
    where: { id },
    include: { seasonPlan: { select: { userId: true } } },
  });
  if (!periode || periode.seasonPlan.userId !== user.id) throw new Error("not_found");
  await prisma.periodBlock.delete({ where: { id } });
  revalidatePath("/portal/tren/aarsplan");
  redirect("/portal/tren/aarsplan");
}
