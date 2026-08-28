/**
 * Norske etiketter for Jarvis-merge-eval (C6 / JV-01–03).
 * Domain returnerer sjekk-id; UI leser herfra.
 */

import type { JarvisSjekkId } from "./eval";

export const JV_SJEKK_TITTEL: Record<JarvisSjekkId, string> = {
  ACWR: "Volum innenfor vindu",
  KOLLISJON: "Ingen tidskollisjon",
  MOTOR: "Motorer adskilt",
  DRILLS: "Drills komplette",
};

export const JV_SJEKK_TITTEL_FEIL: Record<JarvisSjekkId, string> = {
  ACWR: "Volum utenfor vindu",
  KOLLISJON: "Tidskollisjon",
  MOTOR: "Motorer blandet",
  DRILLS: "Drills mangler",
};

export const JV_STATUS_LABEL = {
  AAPEN: "Åpen for merge",
  STENGT: "Merge stengt",
} as const;
