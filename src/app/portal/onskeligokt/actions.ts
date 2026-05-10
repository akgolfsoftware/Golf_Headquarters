"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type OnskeligOktInput = {
  preferredAt?: string;
  pyramidArea?: string;
  notes?: string;
  coachId?: string;
};

export async function sendOnskeligOkt(input: OnskeligOktInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

  await prisma.sessionRequest.create({
    data: {
      userId: user.id,
      coachId: input.coachId || null,
      preferredAt: input.preferredAt ? new Date(input.preferredAt) : null,
      pyramidArea: input.pyramidArea || null,
      notes: input.notes || null,
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/onskeligokt");
  redirect("/portal/onskeligokt?sent=1");
}
