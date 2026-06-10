"use server";

/**
 * Server action for lagring av test-resultat fra scorekort-gjennomføringen.
 * Input valideres med zod safeParse før skriving (jf. CLAUDE.md JSON-regel).
 * Ved suksess: redirect til testsiden med ?lagret=1 (kvittering vises der).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { triggerTestAgent } from "@/lib/agents/triggers";

const VerdiSchema = z.union([z.number().finite(), z.boolean(), z.null()]);

/** Per-forsøk-detaljer slik scorekort-klienten bygger dem. */
const DetaljerSchema = z.object({
  versjon: z.literal(1),
  unit: z.string().max(40).optional(),
  beregning: z.enum(["antall", "snitt", "sum", "verdi"]),
  forsok: z
    .array(
      z.object({
        nr: z.number().int().min(1),
        label: z.string().max(200),
        verdier: z.record(z.string(), VerdiSchema),
      }),
    )
    .min(1)
    .max(200),
});

const InputSchema = z.object({
  testId: z.string().min(1),
  score: z.number().finite(),
  notes: z.string().max(2000).optional(),
  details: DetaljerSchema,
});

export type LagreTestResultatInput = z.infer<typeof InputSchema>;

export async function lagreTestResultat(
  input: LagreTestResultatInput,
): Promise<{ ok: false; error: string }> {
  const user = await requirePortalUser();

  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig resultat — sjekk feltene og prøv igjen." };
  }
  const { testId, score, notes, details } = parsed.data;

  const test = await prisma.testDefinition.findUnique({
    where: { id: testId },
    select: { id: true },
  });
  if (!test) return { ok: false, error: "Testen finnes ikke." };

  const trimmedNotes = notes?.trim();
  await prisma.testResult.create({
    data: {
      userId: user.id,
      testId,
      takenAt: new Date(),
      score,
      notes: trimmedNotes ? trimmedNotes : null,
      details,
    },
  });

  // Samme oppfølging som eksisterende registrerResultat (tester/actions.ts).
  triggerTestAgent(user.id);

  revalidatePath(`/portal/tren/tester/${testId}`);
  revalidatePath("/portal/tren/tester");
  redirect(`/portal/tren/tester/${testId}?lagret=1`);
}
