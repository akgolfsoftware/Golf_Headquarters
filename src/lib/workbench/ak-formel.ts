import type { LFase, MMiljo, CSNivaa, PressureLevel } from "@/generated/prisma/client";

/**
 * AK-formel — felles validering for Workbench-skrivestiene (Fase 0, 2026-06-30).
 *
 * Klient-feltene (WbSession/PaletteItem) er løse strenger. Her renses de mot de
 * faktiske enum-verdiene FØR DB-skriving, så vi aldri skriver ugyldige verdier.
 * P-posisjoner valideres mot P1–P10. Ugyldig/utelatt → null (eller tom liste).
 */

export type AkFormelInput = {
  /** L-fase: L_KROPP | L_ARM | L_KOLLE | L_BALL | L_AUTO */
  lFase?: string | null;
  /** Miljø: M0–M5 */
  miljo?: string | null;
  /** Køllehastighet: CS50–CS100 */
  csNivaa?: string | null;
  /** Press: PR1–PR5 (skrives til pressureLevel-kolonnen på kanon, prPress på V2) */
  pressureLevel?: string | null;
  /** P-posisjoner: P1–P10 */
  pPosisjoner?: string[] | null;
};

export type AkFormelData = {
  lFase: LFase | null;
  miljo: MMiljo | null;
  csNivaa: CSNivaa | null;
  pressureLevel: PressureLevel | null;
  pPosisjoner: string[];
};

const L_FASE = new Set(["L_KROPP", "L_ARM", "L_KOLLE", "L_BALL", "L_AUTO"]);
const MILJO = new Set(["M0", "M1", "M2", "M3", "M4", "M5"]);
const CS = new Set(["CS50", "CS60", "CS70", "CS80", "CS90", "CS100"]);
const PRESS = new Set(["PR1", "PR2", "PR3", "PR4", "PR5"]);
const P_POS = /^P([1-9]|10)$/;

function pick<T extends string>(value: string | null | undefined, allowed: Set<string>): T | null {
  return typeof value === "string" && allowed.has(value) ? (value as T) : null;
}

/** Renser løse klient-strenger til gyldige enum-verdier (ugyldig → null / tom liste). */
export function sanitizeAkFormel(input?: AkFormelInput | null): AkFormelData {
  const v = input ?? {};
  return {
    lFase: pick<LFase>(v.lFase, L_FASE),
    miljo: pick<MMiljo>(v.miljo, MILJO),
    csNivaa: pick<CSNivaa>(v.csNivaa, CS),
    pressureLevel: pick<PressureLevel>(v.pressureLevel, PRESS),
    pPosisjoner: Array.isArray(v.pPosisjoner)
      ? v.pPosisjoner.filter((p): p is string => typeof p === "string" && P_POS.test(p)).slice(0, 10)
      : [],
  };
}
