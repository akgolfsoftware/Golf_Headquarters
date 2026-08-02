/**
 * SG-baseline fra onboarding steg 4 «Dine tall» (2026-07-27).
 * Spilleren skriver inn tall som tekst (norsk komma tillatt) — her gjøres de
 * om til tallene BrukerSgInput lagres med. Steget kan hoppes over, så alt er
 * valgfritt: tomme felt gir undefined, aldri 0.
 */

export type SgSkjema = {
  sgOtt: string;
  sgApp: string;
  sgArg: string;
  sgPutt: string;
};

export const TOMT_SG_SKJEMA: SgSkjema = { sgOtt: "", sgApp: "", sgArg: "", sgPutt: "" };

export type SgBaseline = {
  sgOtt?: number;
  sgApp?: number;
  sgArg?: number;
  sgPutt?: number;
  sgTotal?: number;
  snittScore?: number;
};

/** Tall fra tekstfelt. Tomt eller ugyldig gir undefined — aldri 0. */
export function tolkTall(verdi: string): number | undefined {
  if (!verdi.trim()) return undefined;
  const n = parseFloat(verdi.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Bygger SG-baseline for én periode. sgTotal summeres kun når alle fire
 * kategoriene er fylt ut — en delsum ville vært misvisende som «total».
 */
export function byggSgBaseline(skjema: SgSkjema, snittScore?: number): SgBaseline {
  const deler = {
    sgOtt: tolkTall(skjema.sgOtt),
    sgApp: tolkTall(skjema.sgApp),
    sgArg: tolkTall(skjema.sgArg),
    sgPutt: tolkTall(skjema.sgPutt),
  };
  const verdier = Object.values(deler).filter((v): v is number => v !== undefined);
  return {
    ...deler,
    sgTotal:
      verdier.length === 4
        ? Number(verdier.reduce((a, b) => a + b, 0).toFixed(2))
        : undefined,
    snittScore,
  };
}

/** True når spilleren ikke fylte ut noe — da skal ingen rad lagres. */
export function erTomBaseline(baseline: SgBaseline): boolean {
  return Object.values(baseline).every((v) => v === undefined);
}
