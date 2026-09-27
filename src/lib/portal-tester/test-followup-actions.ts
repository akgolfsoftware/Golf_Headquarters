"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { hentGodkjenteOvelsesbankElementer } from "@/lib/masterbrain/drill-bank";
import { addDrill } from "@/lib/workbench/wb-actions";
import { osloDatoOgMinutt } from "@/lib/workbench/min-calendar";
import { foreslaGodkjenteOvelser, ovelsesNavn } from "./test-anbefaling";
import { tnComparableResult } from "./tn-integration";

const InputSchema = z.object({
  playerId: z.string().min(1).max(100),
  resultId: z.string().min(1).max(100),
  ovelseId: z.string().min(1).max(160),
  sessionId: z.string().min(1).max(100),
  durationMinutes: z.coerce.number().int().min(1).max(120),
});

export type LeggTilTestOvelseResultat = { ok: true } | { ok: false; error: string };

/** Coachens uttrykkelige valg. Verken testresultat eller forslag publiserer en plan. */
export async function leggTilOvelseFraTest(formData: FormData): Promise<LeggTilTestOvelseResultat> {
  const viewer = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const parsed = InputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Ugyldige valg. Kontroller økt og varighet." };
  const { playerId, resultId, ovelseId, sessionId, durationMinutes } = parsed.data;

  const player = await prisma.user.findFirst({
    where: { AND: [coachScopedPlayerWhere(viewer), { id: playerId }] },
    select: {
      id: true,
      playerFacilities: { select: { capabilities: true, maksPuttLengdeM: true, rangeLengdeM: true } },
    },
  });
  if (!player) return { ok: false, error: "Du har ikke tilgang til denne spilleren." };

  const [result, session] = await Promise.all([
    prisma.testResult.findFirst({
      where: { id: resultId, userId: playerId },
      select: {
        id: true, testId: true, score: true, details: true,
        test: { select: { id: true, omraade: true } },
      },
    }),
    prisma.workbenchSession.findFirst({
      where: { id: sessionId, playerId },
      select: {
        id: true, date: true, startMinute: true, status: true, blockType: true,
        environment: true, drills: { select: { sourceId: true } },
      },
    }),
  ]);
  if (!result || !session) return { ok: false, error: "Fant ikke testresultatet eller økten." };
  const now = osloDatoOgMinutt(new Date());
  const dato = session.date.toISOString().slice(0, 10);
  if (session.status !== "DRAFT" || session.blockType !== "OEKT" ||
      dato < now.date || (dato === now.date && session.startMinute <= now.minute)) {
    return { ok: false, error: "Velg en fremtidig økt som fortsatt er utkast." };
  }
  if (!session.environment) {
    return { ok: false, error: "Velg treningssted i økten før øvelsen legges til." };
  }
  if (result.testId.startsWith("tn-v3-") && !tnComparableResult(result.testId, result.score, result.details)) {
    return { ok: false, error: "Testresultatet er ikke verifisert for denne protokollen." };
  }

  const forslag = foreslaGodkjenteOvelser({
    test: result.test,
    bank: hentGodkjenteOvelsesbankElementer(),
    fasiliteter: player.playerFacilities,
    spillerKategori: null,
    environment: session.environment,
  }).find((item) => item.ovelse.id === ovelseId && item.kanLeggesTil);
  if (!forslag) return { ok: false, error: "Øvelsen er ikke godkjent eller passer ikke spillerens fasilitet." };

  const sourceId = `test-result/${result.id}/godkjent/${forslag.ovelse.id}`;
  if (session.drills.some((drill) => drill.sourceId === sourceId)) {
    return { ok: false, error: "Øvelsen er allerede lagt i denne økten fra dette resultatet." };
  }

  const lagtTil = await addDrill({
    sessionId,
    drill: {
      title: ovelsesNavn(forslag.ovelse.navn),
      description: forslag.ovelse.beskrivelse,
      durationMinutes,
      akFormel: {
        pyramid: forslag.ovelse.akFormel.pyramidArea,
        area: forslag.ovelse.akFormel.omraade === "TEE_TOTAL" ? "TEE" : forslag.ovelse.akFormel.omraade,
        label: `${forslag.ovelse.akFormel.pyramidArea} · ${forslag.ovelse.akFormel.omraade}`,
      },
      sourceId,
    },
  });
  if (!lagtTil.ok) return { ok: false, error: lagtTil.error };
  revalidatePath(`/admin/spillere/${playerId}/tester`);
  return { ok: true };
}

export async function leggTilOvelseFraTestForm(
  _previous: LeggTilTestOvelseResultat | null,
  formData: FormData,
): Promise<LeggTilTestOvelseResultat> {
  return leggTilOvelseFraTest(formData);
}
