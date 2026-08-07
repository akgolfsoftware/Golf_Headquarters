/**
 * Drill-bank status for Masterbrain-fasiten.
 *
 * Hard law: så lenge knowledge/entities/drills.json.entities er tom, skal
 * ingen agent finne på drill-navn, lagre CaddieDraft med oppdiktede drills,
 * eller generere «demo»-drills. Beskriv hva som bør trenes — ikke hvilken
 * navngitt drill.
 *
 * Oppdater ALDRI drills.json her — endre i masterbrain-repo og sync.
 */

import drills from "./knowledge/entities/drills.json";

export const DRILL_BANK_EMPTY_CODE = "DRILL_BANK_EMPTY" as const;

export const DRILL_BANK_EMPTY_MELDING_NO =
  "Drill-banken i Masterbrain er under oppbygging. Ingen navngitte drills foreslås før de er godkjent av Anders. Beskriv hva som bør trenes (område, posisjon), ikke en oppdiktet øvelse.";

/** Antall FASIT-drills i Masterbrain (entities-nøkler). */
export function masterbrainDrillAntall(): number {
  const entities = drills.entities;
  if (!entities || typeof entities !== "object") return 0;
  return Object.keys(entities).length;
}

/** True når banken er tom — invent-guards skal stoppe. */
export function erMasterbrainDrillBankTom(): boolean {
  return masterbrainDrillAntall() === 0;
}

export function masterbrainDrillBankStatus(): {
  tom: boolean;
  antall: number;
  status: string;
  agentRegel: string;
} {
  const antall = masterbrainDrillAntall();
  return {
    tom: antall === 0,
    antall,
    status: typeof drills.status === "string" ? drills.status : "ukjent",
    agentRegel:
      typeof drills.agent_regel === "string"
        ? drills.agent_regel
        : DRILL_BANK_EMPTY_MELDING_NO,
  };
}
