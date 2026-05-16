"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences } from "@/lib/preferences";

export async function setSgHubMode(mode: "simple" | "advanced") {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");

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
