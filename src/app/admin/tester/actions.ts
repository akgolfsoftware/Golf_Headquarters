"use server";

/**
 * Tester i AgencyOS: coachen merker en egenført test som kontrollert
 * (beslutninger.md §TESTBATTERIET: «Resten fører spilleren som «Egenført», og
 * treneren kan merke det kontrollert»). «Kontrollert» betyr at coachen har sett
 * testen bli tatt eller sjekket scorekortet.
 *
 * Tilgang: COACH/ADMIN med MANAGE_TESTS, og resultatet må tilhøre en spiller
 * coachen når (coachScopedPlayerWhere). Verdiene i resultatet endres aldri her.
 */
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";

const Schema = z.object({ resultatId: z.string().min(1).max(64) });

export async function merkTestKontrollert(input: z.infer<typeof Schema>): Promise<{ ok: boolean; error?: string }> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(coach, Capability.MANAGE_TESTS);
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig test." };

  const resultat = await prisma.testResult.findFirst({
    where: { id: parsed.data.resultatId, user: coachScopedPlayerWhere(coach) },
    select: { id: true, recordedById: true, witnessStatus: true },
  });
  if (!resultat) return { ok: false, error: "Fant ikke testen blant spillerne dine." };
  if (resultat.recordedById || resultat.witnessStatus === "ATTESTED") return { ok: true };

  await prisma.testResult.update({
    where: { id: resultat.id },
    data: { witnessStatus: "ATTESTED", witnessUserId: coach.id, attestationMode: "DIGITAL" },
  });
  revalidatePath("/admin/tester");
  return { ok: true };
}
