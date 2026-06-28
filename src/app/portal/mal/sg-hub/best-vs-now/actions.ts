"use server";

import { revalidatePath } from "next/cache";
import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";

export async function pinSession(input: {
  trackmanSessionId: string;
  notes?: string | null;
  autoSuggested?: boolean;
}) {
  const user = await requireConsentingUser();

  // Verifiser at økten tilhører brukeren
  const session = await prisma.trackManSession.findFirst({
    where: { id: input.trackmanSessionId, userId: user.id },
    select: { id: true },
  });
  if (!session) throw new Error("session-not-found");

  await prisma.bestSessionReference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      trackmanSessionId: input.trackmanSessionId,
      pinnedBy: user.id,
      notes: input.notes ?? null,
      autoSuggested: input.autoSuggested ?? false,
    },
    update: {
      trackmanSessionId: input.trackmanSessionId,
      pinnedBy: user.id,
      pinnedAt: new Date(),
      notes: input.notes ?? null,
      autoSuggested: input.autoSuggested ?? false,
    },
  });

  revalidatePath("/portal/mal/sg-hub/best-vs-now");
}

export async function unpinSession() {
  const user = await requireConsentingUser();

  await prisma.bestSessionReference
    .delete({ where: { userId: user.id } })
    .catch(() => {
      // Stille feil hvis ingen pin finnes — operasjon er idempotent.
    });

  revalidatePath("/portal/mal/sg-hub/best-vs-now");
}
