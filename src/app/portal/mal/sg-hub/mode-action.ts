"use server";

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences } from "@/lib/preferences";

export async function setSgHubMode(mode: "simple" | "advanced") {
  const user = await requireConsentingUser();

  const existing = lesPreferences(user);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      preferences: {
        ...existing,
        sgHubMode: mode,
      },
    },
  });

  revalidatePath("/portal/mal/sg-hub", "layout");
}
