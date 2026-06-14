"use server";

/**
 * Server action — coach tildeler en test til en spiller.
 * Oppretter en TestAssignment (OPEN) og varsler spilleren. Kun COACH/ADMIN.
 * Spilleren ser varselet i /portal/varsler; fullføring kobles tilbake i
 * lagreTestResultat (markerer assignment COMPLETED + varsler coach).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

const Schema = z.object({
  spillerId: z.string().min(1),
  testId: z.string().min(1),
  note: z.string().max(2000).optional(),
});

export async function tildelTest(
  input: z.infer<typeof Schema>,
): Promise<{ ok: boolean; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig tildeling — sjekk valgene." };
  const { spillerId, testId, note } = parsed.data;

  const [player, test] = await Promise.all([
    prisma.user.findFirst({ where: { id: spillerId, deletedAt: null }, select: { id: true } }),
    prisma.testDefinition.findUnique({ where: { id: testId }, select: { id: true, name: true } }),
  ]);
  if (!player || !test) return { ok: false, error: "Fant ikke spiller eller test." };

  const trimmet = note?.trim();
  await prisma.testAssignment.create({
    data: {
      playerId: player.id,
      coachId: coach.id,
      testId: test.id,
      note: trimmet ? trimmet : null,
    },
  });

  await notify({
    userId: player.id,
    type: "melding",
    title: "Ny test tildelt",
    body: `${coach.name} har tildelt deg testen «${test.name}».`,
    link: `/portal/tren/tester/${test.id}`,
  });

  revalidatePath("/admin/tester");
  revalidatePath(`/admin/spillere/${player.id}/tester`);
  return { ok: true };
}
