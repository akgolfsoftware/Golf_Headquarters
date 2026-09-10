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
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { tnFromDefinitionId, tnDefinitionData } from "@/lib/portal-tester/tn-integration";
import { isTnTestName } from "@/lib/portal-tester/tn-catalog";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

const Schema = z.object({
  spillerId: z.string().min(1),
  testId: z.string().min(1),
  note: z.string().max(2000).optional(),
  dueDate: z.string().max(40).optional(),
});

export async function tildelTest(
  input: z.infer<typeof Schema>,
): Promise<{ ok: boolean; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig tildeling — sjekk valgene." };
  const { spillerId, testId, note, dueDate } = parsed.data;

  const protocol = tnFromDefinitionId(testId);
  if (protocol?.blocked) return { ok: false, error: protocol.blocked };
  const [player, existingTest] = await Promise.all([
    // Coach-scoping: rolle-sjekk alene lot en coach tildele test — og sende
    // varsel — til en hvilken som helst bruker-id.
    prisma.user.findFirst({
      where: { AND: [coachScopedPlayerWhere(coach), { id: spillerId }] },
      select: { id: true },
    }),
    prisma.testDefinition.findUnique({ where: { id: testId }, select: { id: true, name: true, isCustom: true, visibility: true, createdById: true } }),
  ]);
  if (!player || (!existingTest && !protocol)) return { ok: false, error: "Fant ikke spiller eller test." };
  if (coach.role !== "ADMIN" && existingTest?.isCustom && existingTest.visibility === "PRIVATE" && existingTest.createdById !== coach.id) return { ok: false, error: "Denne testen er privat." };
  if (!protocol && existingTest && !existingTest.isCustom && isTnTestName(existingTest.name)) return { ok: false, error: "Velg en versjonert Team Norway-test fra katalogen." };
  if (dueDate && Number.isNaN(new Date(dueDate).getTime())) return { ok: false, error: "Velg en gyldig frist." };
  const test = protocol ? await prisma.testDefinition.upsert({ where: { id: testId }, update: {}, create: tnDefinitionData(protocol), select: { id: true, name: true } }) : existingTest!;

  const trimmet = note?.trim();
  const due = dueDate ? new Date(dueDate) : null;
  await prisma.testAssignment.create({
    data: {
      playerId: player.id,
      coachId: coach.id,
      testId: test.id,
      note: trimmet ? trimmet : null,
      dueDate: due && !Number.isNaN(due.getTime()) ? due : null,
    },
  });

  await notify({
    userId: player.id,
    type: "melding",
    title: "Ny test tildelt",
    body: `${coach.name} har tildelt deg testen «${test.name}».`,
    link: protocol ? `/portal/tren/tester/team-norway?test=${protocol.id}${protocol.variableCount ? `&count=${protocol.rows.length}` : ""}` : `/portal/tren/tester/${test.id}`,
  });

  revalidatePath("/admin/tester");
  revalidatePath(`/admin/spillere/${player.id}/tester`);
  return { ok: true };
}
