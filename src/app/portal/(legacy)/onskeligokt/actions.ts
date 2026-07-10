"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { PyramidArea } from "@/generated/prisma/client";

export type OnskeligOktInput = {
  preferredAt?: string;
  pyramidArea?: string;
  notes?: string;
  coachId?: string;
};

const PYRAMID_VALUES = new Set<string>(Object.values(PyramidArea));

export async function sendOnskeligOkt(input: OnskeligOktInput) {
  const user = await requireConsentingUser();

  const preferredArea =
    input.pyramidArea && PYRAMID_VALUES.has(input.pyramidArea)
      ? (input.pyramidArea as PyramidArea)
      : null;

  await prisma.sessionRequest.create({
    data: {
      userId: user.id,
      coachId: input.coachId || null,
      preferredDate: input.preferredAt ? new Date(input.preferredAt) : null,
      preferredArea,
      reason: input.notes ?? "",
    },
  });

  revalidatePath("/portal");
  revalidatePath("/portal/onskeligokt");
  redirect("/portal/onskeligokt?sent=1");
}
