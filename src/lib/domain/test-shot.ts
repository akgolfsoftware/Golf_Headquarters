/**
 * src/lib/domain/test-shot.ts — domene for TestShot-lagring og spørring
 *
 * TestShot er en normalisert slag-tabell som erstatter Json-lagring i
 * TestResult.details. Hver slag har:
 *   - pei (Proximity/Precision Efficiency Index — lavere er bedre)
 *   - sg (Strokes Gained per Broadie)
 *   - pgaPutts (forventede putts fra PGA-baseline)
 *   - x, y (lateral og langs-avstand til mål)
 *   - retning (compass-retning som string)
 *
 * Invariant: TestShot skal aldri lagre eller blande ulike SG-kilder
 * (Broadie-SG, DataGolf, PEI) i samme rad.
 */

import { z } from "zod";

export const TestShotSchema = z.object({
  id: z.string(),
  testResultId: z.string(),
  shotNumber: z.number().int().min(0),
  pei: z.number().nullable(),
  sg: z.number().nullable(),
  pgaPutts: z.number().nullable(),
  x: z.number().nullable(),
  y: z.number().nullable(),
  retning: z.string().nullable(),
  createdAt: z.date(),
});

export type TestShot = z.infer<typeof TestShotSchema>;

/**
 * Input-type for opprettelse av TestShot.
 * testResultId og shotNumber er obligatorisk; resten er valgfritt.
 */
export const CreateTestShotInputSchema = z.object({
  testResultId: z.string(),
  shotNumber: z.number().int().min(0),
  pei: z.number().optional(),
  sg: z.number().optional(),
  pgaPutts: z.number().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  retning: z.string().optional(),
});

export type CreateTestShotInput = z.infer<typeof CreateTestShotInputSchema>;

/**
 * Resultat fra spørring på TestShot-array per TestResult.
 */
export interface TestShotQueryResult {
  testResultId: string;
  shotCount: number;
  shots: TestShot[];
  hasAllPei: boolean; // true hvis alle slag har PEI-verdi
  hasAllSg: boolean; // true hvis alle slag har SG-verdi
}
