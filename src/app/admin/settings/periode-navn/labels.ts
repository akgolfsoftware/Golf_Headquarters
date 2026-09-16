/**
 * Periodetype-labels for AgencyOS · Innstillinger · Periodenavn.
 *
 * Egen fil uten server-action-direktivet — server actions kan kun eksportere
 * async funksjoner, så disse konstantene kan ikke bo i actions.ts.
 */

import type { PeriodeType } from "@/generated/prisma/client";

const PERIODE_LABEL: Record<PeriodeType, string> = {
  GRUNN: "Grunnperiode",
  SPESIAL: "Spesialiseringsperiode",
  TURNERING: "Turneringsperiode",
  EVALUERING: "Evaluering",
  TESTUKE: "Testuke",
  FERIE: "Ferie",
  TRENINGSSAMLING: "Treningssamling",
  HELDAGSSAMLING: "Heldagssamling",
};

export type PeriodeNavnLabel = { verdi: PeriodeType; navn: string };
export const PERIODE_NAVN_LABELS: PeriodeNavnLabel[] = (
  Object.keys(PERIODE_LABEL) as PeriodeType[]
).map((verdi) => ({ verdi, navn: PERIODE_LABEL[verdi] }));

export { PERIODE_LABEL };
