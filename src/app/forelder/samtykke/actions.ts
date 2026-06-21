"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

/**
 * Lagre samtykker for et barn. Krever at innloggede bruker er foresatt
 * for barnet (via ParentRelation).
 */
export async function lagreSamtykker(
  childId: string,
  samtykker: Record<string, boolean>,
): Promise<{ ok: true }> {
  const user = await requirePortalUser({ allow: ["PARENT", "ADMIN"] });

  if (user.role === "PARENT") {
    const relasjon = await prisma.parentRelation.findFirst({
      where: { parentId: user.id, childId, approved: true },
    });
    if (!relasjon) throw new Error("Du er ikke godkjent foresatt for dette barnet");
  }

  // Hent eksisterende preferences og merge inn nye samtykker
  const child = await prisma.user.findUnique({
    where: { id: childId },
    select: { preferences: true },
  });
  if (!child) throw new Error("Barn finnes ikke");

  const eksisterende = (child.preferences as Record<string, unknown> | null) ?? {};
  const nye: Record<string, unknown> = { ...eksisterende, ...samtykker };

  await prisma.user.update({
    where: { id: childId },
    data: { preferences: nye as object },
  });

  await audit({
    actorId: user.id,
    action: "samtykke.updated",
    target: `User:${childId}`,
    metadata: { samtykker, role: user.role },
  });

  revalidatePath("/forelder/samtykke");
  revalidatePath(`/admin/spillere/${childId}`);

  return { ok: true };
}
