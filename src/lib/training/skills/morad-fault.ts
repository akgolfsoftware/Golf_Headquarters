import type { SgCategory } from "@/generated/prisma/client";
import sgToMoradFaults from "@/lib/domain/rules/sg-to-morad-faults.json";

const SG_TO_KEY: Record<SgCategory, string> = {
  OTT: "ott",
  APP: "app",
  ARG: "arg",
  PUTT: "putt",
};

/** Mapper SG-område til primær MORAD fault-id (første i listen). */
export function mapSgBandToFault(sgArea: SgCategory): string | null {
  const root = sgToMoradFaults as Record<string, string[]>;
  const faults = root[SG_TO_KEY[sgArea]];
  if (!faults || faults.length === 0) return null;
  return faults[0] ?? null;
}