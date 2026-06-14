"use server";

/**
 * Server action for lagring av test-resultat fra scorekort-gjennomføringen.
 *
 * Scoren regnes ALLTID server-side via den felles motoren (test-scoring.ts) —
 * klienten sender kun rå slag-verdier + kontekst. Da kan ikke klient-preview
 * og lagret fasit være uenige.
 *
 * En test lagres KUN når den er fullført med resultat på alle slag (jf. Anders:
 * halvferdig test lagres aldri). Input valideres med zod safeParse før skriving.
 * Ved suksess: redirect til testsiden med ?lagret=1.
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import { triggerTestAgent } from "@/lib/agents/triggers";
import { scoreTest } from "@/lib/portal-tester/test-scoring";
import { notify } from "@/lib/notifications";

const VerdiSchema = z.union([z.number().finite(), z.boolean(), z.null()]);

/** Per-slag-verdier slik scorekortet fører dem (rå — ingen forhåndsregnet score). */
const ForsokSchema = z.object({
  nr: z.number().int().min(1),
  label: z.string().max(200).optional(),
  verdier: z.record(z.string(), VerdiSchema),
});

/** Test-kontekst (header) — påvirker tolkning, lagres med resultatet. */
const KontekstSchema = z
  .object({
    dato: z.string().max(40).optional(),
    lokasjon: z.string().max(120).optional(),
    vanskelighet: z.enum(["lett", "middels", "vanskelig"]).optional(),
    vaer: z.string().max(120).optional(),
    greenfart: z.string().max(60).optional(),
    greenfasthet: z.enum(["myk", "medium", "hard"]).optional(),
  })
  .partial();

const InputSchema = z.object({
  testId: z.string().min(1),
  notes: z.string().max(2000).optional(),
  kontekst: KontekstSchema.optional(),
  forsok: z.array(ForsokSchema).min(1).max(200),
});

export type LagreTestResultatInput = z.infer<typeof InputSchema>;

function harVerdi(verdier: Record<string, number | boolean | null>): boolean {
  return Object.values(verdier).some((v) => v !== null);
}

export async function lagreTestResultat(
  input: LagreTestResultatInput,
): Promise<{ ok: false; error: string }> {
  const user = await requirePortalUser();

  const parsed = InputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig resultat — sjekk feltene og prøv igjen." };
  }
  const { testId, notes, kontekst, forsok } = parsed.data;

  // Krav: resultat på ALLE slag — halvferdig test lagres aldri.
  if (!forsok.every((f) => harVerdi(f.verdier))) {
    return { ok: false, error: "Alle slag må føres før du kan lagre." };
  }

  // Tilgang: samme regel som katalogen — kan ikke lagre mot andres private tester (K6).
  const test = await prisma.testDefinition.findFirst({
    where: { id: testId, AND: [testTilgangWhere(user.id)] },
    select: { id: true, name: true, protocol: true },
  });
  if (!test) return { ok: false, error: "Testen finnes ikke." };

  // Fasit-score regnes server-side fra protokollen + de rå slag-verdiene.
  const { score, details } = scoreTest(test.protocol, forsok);

  const trimmedNotes = notes?.trim();
  const takenAt = kontekst?.dato ? new Date(kontekst.dato) : new Date();

  const created = await prisma.testResult.create({
    data: {
      userId: user.id,
      testId,
      takenAt: Number.isNaN(takenAt.getTime()) ? new Date() : takenAt,
      score,
      notes: trimmedNotes ? trimmedNotes : null,
      details: { ...details, ...(kontekst ? { kontekst } : {}) },
    },
    select: { id: true },
  });

  // Lukk en evt. åpen coach-tildeling for denne testen + varsle coachen.
  const assignment = await prisma.testAssignment.findFirst({
    where: { playerId: user.id, testId, status: "OPEN" },
    orderBy: { createdAt: "asc" },
    select: { id: true, coachId: true },
  });
  if (assignment) {
    await prisma.testAssignment.update({
      where: { id: assignment.id },
      data: { status: "COMPLETED", completedResultId: created.id },
    });
    await notify({
      userId: assignment.coachId,
      type: "melding",
      title: "Test fullført",
      body: `${user.name} fullførte «${test.name}».`,
      link: `/admin/tester/${created.id}`,
    });
  }

  // AI-/achievement-oppfølging (eksisterende krok).
  triggerTestAgent(user.id);

  revalidatePath(`/portal/tren/tester/${testId}`);
  revalidatePath("/portal/tren/tester");
  redirect(`/portal/tren/tester/${testId}?lagret=1`);
}
