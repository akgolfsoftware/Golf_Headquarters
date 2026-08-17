/**
 * TestResult → TalentTracking-synk, IO-laget (plan T4).
 *
 * Idempotent FULL RECOMPUTE: leser alle CANON-testresultater for spilleren,
 * beregner testNivaaer på nytt (ren logikk i domain/talent-sync.ts) og
 * upserter TalentTracking. Milepæler APPENDES (aldri overskriv historikk).
 *
 * Auto-innmelding: aktivt spiller-medlemskap i AK Golf-administrert gruppe
 * + ingen TalentTracking → raden opprettes (autoInnmeldt=true) med nivå fra
 * fødselsår og klubb fra profilen. Uten gruppe: synk kun hvis coachen
 * allerede har meldt spilleren inn (discovery-flaten).
 *
 * Kalles best-effort fra logTest — en feilet synk skal ALDRI velte
 * registreringen av selve testresultatet.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { parseBenchmarks } from "@/lib/admin/test-benchmarks";
import {
  beregnTestNivaaer,
  utledMilepaeler,
  testNivaaerSchema,
  type CanonResultat,
  type Milepael,
} from "@/lib/domain/talent-sync";
import { aktivtAkGruppeMedlemskapWhere } from "@/lib/domain/grupper";

/** Aldersnivå per kalenderår (golf-konvensjon: alder ved årets slutt). */
export function nivaFraFodselsdato(fodt: Date | null, naa: Date = new Date()): string {
  if (!fodt) return "Senior";
  const alderVedAarsslutt = naa.getFullYear() - fodt.getFullYear();
  if (alderVedAarsslutt <= 10) return "U10";
  if (alderVedAarsslutt <= 12) return "U12";
  if (alderVedAarsslutt <= 14) return "U14";
  if (alderVedAarsslutt <= 16) return "U16";
  if (alderVedAarsslutt <= 18) return "U18";
  return "Senior";
}

export async function syncTalentEtterTest(userId: string): Promise<void> {
  const eksisterende = await prisma.talentTracking.findUnique({
    where: { userId },
    select: { id: true, testNivaaer: true, milepaeler: true },
  });

  // Auto-innmelding kun for spillere i AK Golf-administrerte grupper.
  if (!eksisterende) {
    const iAkGruppe = await prisma.groupMember.findFirst({
      where: { userId, ...aktivtAkGruppeMedlemskapWhere() },
      select: { id: true },
    });
    if (!iAkGruppe) return;
  }

  const rader = await prisma.testResult.findMany({
    where: { userId, test: { erCanon: true } },
    select: {
      score: true,
      takenAt: true,
      test: { select: { id: true, name: true, pyramidArea: true, protocol: true } },
    },
    orderBy: { takenAt: "desc" },
    take: 500,
  });
  if (rader.length === 0) return;

  const resultater: CanonResultat[] = rader.map((r) => ({
    testId: r.test.id,
    testNavn: r.test.name,
    pyramidArea: r.test.pyramidArea,
    score: r.score,
    takenAt: r.takenAt,
    benchmarks: parseBenchmarks(r.test.protocol),
  }));

  const nyeNivaaer = beregnTestNivaaer(resultater);

  // Forrige tilstand valideres med zod — korrupt JSON behandles som tom.
  const gamleParsed = testNivaaerSchema.safeParse(eksisterende?.testNivaaer ?? null);
  const gamle = gamleParsed.success ? gamleParsed.data : null;

  const naa = new Date();
  const nyeMilepaeler = utledMilepaeler(gamle, nyeNivaaer, resultater, naa);
  const gamleMilepaeler = Array.isArray(eksisterende?.milepaeler)
    ? (eksisterende.milepaeler as unknown as Milepael[])
    : [];

  if (eksisterende) {
    await prisma.talentTracking.update({
      where: { id: eksisterende.id },
      data: {
        // zod-validert struktur -> trygg JSON-skriving (Prisma InputJsonValue).
        testNivaaer: nyeNivaaer as Prisma.InputJsonValue,
        sisteTestSyncAt: naa,
        ...(nyeMilepaeler.length
          ? { milepaeler: [...gamleMilepaeler, ...nyeMilepaeler] as unknown as Prisma.InputJsonValue }
          : {}),
      },
    });
    return;
  }

  const bruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { dateOfBirth: true, homeClub: true },
  });
  await prisma.talentTracking.create({
    data: {
      userId,
      niva: nivaFraFodselsdato(bruker?.dateOfBirth ?? null, naa),
      klubb: bruker?.homeClub ?? null,
      autoInnmeldt: true,
      testNivaaer: nyeNivaaer as Prisma.InputJsonValue,
      sisteTestSyncAt: naa,
      milepaeler: nyeMilepaeler.length
        ? (nyeMilepaeler as unknown as Prisma.InputJsonValue)
        : undefined,
    },
  });
}
