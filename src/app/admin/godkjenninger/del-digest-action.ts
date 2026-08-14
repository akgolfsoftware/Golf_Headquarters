"use server";

/**
 * D3 · «Del digest med spillere og foresatte».
 *
 * Manuell coach-handling — fasitens regel er at deling ALDRI skjer automatisk.
 * Ingen agent kaller denne; den fyrer bare når et menneske trykker.
 */

import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { delUkesdigest } from "@/lib/admin/ukesrapport-deling";

export async function delUkesdigestAction(): Promise<{
  ok: boolean;
  antall: number;
  melding: string;
}> {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Deler kun med spillere coachen faktisk har — samme scope som køen selv.
  const spillere = await prisma.user.findMany({
    where: coachScopedPlayerWhere(user),
    select: { id: true },
  });

  if (spillere.length === 0) {
    return { ok: false, antall: 0, melding: "Du har ingen spillere å dele med." };
  }

  const antall = await delUkesdigest(
    user.id,
    spillere.map((s) => s.id),
  );

  revalidatePath("/admin/godkjenninger");

  return {
    ok: true,
    antall,
    melding:
      antall === 0
        ? "Uka var allerede delt — ingen fikk den på nytt."
        : `Digesten er delt med ${antall} ${antall === 1 ? "spiller" : "spillere"}.`,
  };
}
