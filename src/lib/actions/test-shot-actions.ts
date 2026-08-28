/**
 * src/lib/actions/test-shot-actions.ts — server actions for TestShot
 *
 * Handler for opprettelse, spørring og migrering av test-slag.
 * MERK: disse operasjonene antas å være innkapslet i godkjente test-flater
 * (Workbench, live test). Skjermoppsett står for tilgangskontroll.
 */

"use server";

import { prisma } from "@/lib/prisma";
import {
  CreateTestShotInputSchema,
  TestShotSchema,
  type TestShot,
  type TestShotQueryResult,
} from "@/lib/domain/test-shot";
import { publicAction } from "@/lib/auth/action-guards";

publicAction(); // Markør for gate-sjekk

/**
 * Opprett ett testslag.
 */
export async function createTestShot(input: unknown) {
  const validated = CreateTestShotInputSchema.parse(input);

  const shot = await prisma.testShot.create({
    data: {
      testResultId: validated.testResultId,
      shotNumber: validated.shotNumber,
      pei: validated.pei,
      sg: validated.sg,
      pgaPutts: validated.pgaPutts,
      x: validated.x,
      y: validated.y,
      retning: validated.retning,
    },
  });

  return shot;
}

/**
 * Opprett flere slag atomisk (eller ingen).
 */
export async function createTestShotsTransaction(
  shots: Array<{ testResultId: string; shotNumber: number; pei?: number; sg?: number; pgaPutts?: number; x?: number; y?: number; retning?: string }>
) {
  if (shots.length === 0) {
    return [];
  }

  // Valider alle før vi lagrer noen
  const validated = shots.map((s) => CreateTestShotInputSchema.parse(s));

  const result = await prisma.$transaction(
    validated.map((s) =>
      prisma.testShot.create({
        data: {
          testResultId: s.testResultId,
          shotNumber: s.shotNumber,
          pei: s.pei,
          sg: s.sg,
          pgaPutts: s.pgaPutts,
          x: s.x,
          y: s.y,
          retning: s.retning,
        },
      })
    )
  );

  return result;
}

/**
 * Hent alle slag for en TestResult.
 */
export async function getTestShots(
  testResultId: string
): Promise<TestShotQueryResult> {
  const rader = await prisma.testShot.findMany({
    where: { testResultId },
    orderBy: { shotNumber: "asc" },
  });
  const shots: TestShot[] = rader.map((s) => TestShotSchema.parse(s));

  const hasAllPei = shots.length > 0 && shots.every((s) => s.pei !== null);
  const hasAllSg = shots.length > 0 && shots.every((s) => s.sg !== null);

  return {
    testResultId,
    shotCount: shots.length,
    shots,
    hasAllPei,
    hasAllSg,
  };
}

/**
 * Slett alle slag for en TestResult (f.eks. ved feilsøking eller omregistrering).
 */
export async function deleteTestShotsForResult(testResultId: string) {
  const result = await prisma.testShot.deleteMany({
    where: { testResultId },
  });

  return { deleted: result.count };
}

/**
 * Migrering fra TestResult.details Json til TestShot-tabellen.
 *
 * Forventer details-format som:
 * {
 *   shots: [
 *     { pei, sg, pgaPutts, x, y, retning, ... },
 *     ...
 *   ]
 * }
 *
 * Idempotent: hvis slag allerede finnes for denne TestResult, gjøres ingenting.
 */
export async function migrateDetailsJsonToTestShots(testResultId: string) {
  // Sjekk om slag allerede finnes
  const existing = await prisma.testShot.count({
    where: { testResultId },
  });

  if (existing > 0) {
    return { alreadyMigrated: true, migrated: 0 };
  }

  // Hent TestResult med details Json
  const testResult = await prisma.testResult.findUniqueOrThrow({
    where: { id: testResultId },
  });

  if (!testResult.details || typeof testResult.details !== "object") {
    return { alreadyMigrated: false, migrated: 0 };
  }

  const details = testResult.details as Record<string, unknown>;
  const shotsArray = details.shots;

  if (!Array.isArray(shotsArray) || shotsArray.length === 0) {
    return { alreadyMigrated: false, migrated: 0 };
  }

  // Lag TestShot-rader fra details
  interface RawShot {
    pei?: number;
    sg?: number;
    pgaPutts?: number;
    x?: number;
    y?: number;
    retning?: string;
  }

  const shotsToCreate = shotsArray.map((shot: unknown, index: number) => {
    const s = shot as RawShot;
    return {
      testResultId,
      shotNumber: index,
      pei: s.pei !== undefined ? Number(s.pei) : undefined,
      sg: s.sg !== undefined ? Number(s.sg) : undefined,
      pgaPutts: s.pgaPutts !== undefined ? Number(s.pgaPutts) : undefined,
      x: s.x !== undefined ? Number(s.x) : undefined,
      y: s.y !== undefined ? Number(s.y) : undefined,
      retning: s.retning !== undefined ? String(s.retning) : undefined,
    };
  });

  const created = await createTestShotsTransaction(shotsToCreate);

  return { alreadyMigrated: false, migrated: created.length };
}
