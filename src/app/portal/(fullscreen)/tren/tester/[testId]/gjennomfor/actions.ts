"use server";

/**
 * Server actions for test-gjennomføringen (scorekortet) — T5.
 *
 * Live-flyt via TestSession (modellen lå ubrukt til T5):
 *   startTestSession  → opprett/gjenoppta IN_PROGRESS-økt for (userId, testId)
 *   lagreSteg         → speil ett førte forsøk inn i scoringData (best effort
 *                       fra klienten — klient-staten er fasit til fullføring)
 *   fullforTestSession→ beregn fasit-score server-side (felles motor), opprett
 *                       TestResult, lukk økta (COMPLETED + testResultId),
 *                       synk talentprofilen (T4) og redirect til kvittering
 *   avbrytTestSession → ABORTED (fjerner «Pågår»-banneret uten å lagre)
 *
 * Scoren regnes ALLTID server-side via den felles motoren (test-scoring.ts) —
 * klienten sender kun rå slag-verdier + kontekst. Da kan ikke klient-preview
 * og lagret fasit være uenige.
 *
 * En test lagres KUN når de innsendte forsøkene alle har verdi (avbrutt test =
 * sammenhengende prefiks, håndhevet i klienten). Input valideres med zod
 * safeParse før skriving. Alle actions krever TALENT-tilgang (testene er åpne
 * for gratisprofilen) og eierskap (userId i where).
 */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { testTilgangWhere } from "@/lib/portal-tester/test-tilgang";
import {
  beregnCurrentStepIndex,
  mergeSteg,
  parseSessionScoring,
} from "@/lib/portal-tester/session-data";
import { triggerTestAgent } from "@/lib/agents/triggers";
import { scoreTest } from "@/lib/portal-tester/test-scoring";
import { syncTalentEtterTest } from "@/lib/talent/test-sync";
import { notify } from "@/lib/notifications";

/** «V»/«H» = registrert miss-retning (kun Gate-protokoller med miss_side, TE-04). */
const VerdiSchema = z.union([z.number().finite(), z.boolean(), z.enum(["V", "H"]), z.null()]);

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

const FullforSchema = z.object({
  testId: z.string().min(1),
  notes: z.string().max(2000).optional(),
  kontekst: KontekstSchema.optional(),
  forsok: z.array(ForsokSchema).min(1).max(200),
});

export type FullforTestSessionInput = z.infer<typeof FullforSchema>;

const StartSchema = z.object({ testId: z.string().min(1) });

const LagreStegSchema = z.object({
  sessionId: z.string().min(1),
  stegIndex: z.number().int().min(0).max(199),
  verdier: z.record(z.string(), VerdiSchema),
});

export type LagreStegInput = z.infer<typeof LagreStegSchema>;

const AvbrytSchema = z.object({ sessionId: z.string().min(1) });

function harVerdi(verdier: Record<string, number | boolean | "V" | "H" | null>): boolean {
  return Object.values(verdier).some((v) => v !== null);
}

/* ── startTestSession ─────────────────────────────────────────────────────── */

/**
 * Oppretter en IN_PROGRESS-økt for (userId, testId) — eller gjenopptar den
 * som allerede finnes (kalles lazy fra klienten ved første registrering).
 */
export async function startTestSession(
  input: unknown,
): Promise<{ ok: true; sessionId: string } | { ok: false; error: string }> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const parsed = StartSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig forespørsel." };
  const { testId } = parsed.data;

  // Tilgang: CANON + egne tester — samme regel som katalogen (K6).
  const test = await prisma.testDefinition.findFirst({
    where: { id: testId, AND: [testTilgangWhere(user.id)] },
    select: { id: true },
  });
  if (!test) return { ok: false, error: "Testen finnes ikke." };

  const eksisterende = await prisma.testSession.findFirst({
    where: { userId: user.id, testId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  if (eksisterende) return { ok: true, sessionId: eksisterende.id };

  const opprettet = await prisma.testSession.create({
    data: { userId: user.id, testId },
    select: { id: true },
  });
  revalidatePath("/portal/tren/tester");
  return { ok: true, sessionId: opprettet.id };
}

/* ── lagreSteg ────────────────────────────────────────────────────────────── */

/**
 * Speiler ETT forsøk (0-indeksert steg) inn i øktas scoringData og oppdaterer
 * currentStepIndex. Best effort fra klienten — feil her velter aldri selve
 * gjennomføringen (klient-staten er fasit til fullføring).
 */
export async function lagreSteg(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const parsed = LagreStegSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig steg." };
  const { sessionId, stegIndex, verdier } = parsed.data;

  // Eierskap: userId i where — andres økter finnes ikke for denne brukeren.
  const okt = await prisma.testSession.findFirst({
    where: { id: sessionId, userId: user.id, status: "IN_PROGRESS" },
    select: { id: true, scoringData: true },
  });
  if (!okt) return { ok: false, error: "Økta finnes ikke eller er avsluttet." };

  const neste = mergeSteg(parseSessionScoring(okt.scoringData), stegIndex, verdier);
  await prisma.testSession.updateMany({
    where: { id: sessionId, userId: user.id, status: "IN_PROGRESS" },
    data: { scoringData: neste, currentStepIndex: beregnCurrentStepIndex(neste) },
  });
  return { ok: true };
}

/* ── fullforTestSession ───────────────────────────────────────────────────── */

/**
 * Fullfører gjennomføringen: fasit-score via felles motor → TestResult (samme
 * datasti som logTest, inkl. talent-sync T4) → alle åpne økter for testen
 * settes COMPLETED med peker til resultatet. Ved suksess: redirect til
 * testsiden med ?lagret=1 (kvitteringen bor der).
 */
export async function fullforTestSession(
  input: FullforTestSessionInput,
): Promise<{ ok: false; error: string }> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });

  const parsed = FullforSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Ugyldig resultat — sjekk feltene og prøv igjen." };
  }
  const { testId, notes, kontekst, forsok } = parsed.data;

  // Krav: verdi på ALLE innsendte slag — halvferdig rad lagres aldri.
  if (!forsok.every((f) => harVerdi(f.verdier))) {
    return { ok: false, error: "Alle slag må føres før du kan lagre." };
  }

  // Tilgang: samme regel som katalogen — kan ikke lagre mot andres/skjulte tester (K6).
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

  // Lukk ALLE åpne økter for testen (dekker også foreldreløse fra tidligere
  // besøk) — resultat-pekeren gjør økta sporbar til fasiten.
  await prisma.testSession.updateMany({
    where: { userId: user.id, testId, status: "IN_PROGRESS" },
    data: { status: "COMPLETED", completedAt: new Date(), testResultId: created.id },
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

  // T4: fullført CANON-resultat oppdaterer talentprofilen — best effort, en
  // feilet synk skal aldri velte registreringen av selve resultatet.
  await syncTalentEtterTest(user.id).catch((err) => {
    console.error("[fullforTestSession] talent-sync feilet", err);
  });

  revalidatePath(`/portal/tren/tester/${testId}`);
  revalidatePath("/portal/tren/tester");
  revalidatePath("/portal/talent");
  redirect(`/portal/tren/tester/${testId}?lagret=1`);
}

/* ── avbrytTestSession ────────────────────────────────────────────────────── */

/** Avbryter en pågående økt (ABORTED) — ingenting lagres som resultat. */
export async function avbrytTestSession(
  input: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const parsed = AvbrytSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig forespørsel." };

  await prisma.testSession.updateMany({
    where: { id: parsed.data.sessionId, userId: user.id, status: "IN_PROGRESS" },
    data: { status: "ABORTED", abortedAt: new Date() },
  });
  revalidatePath("/portal/tren/tester");
  return { ok: true };
}
