/**
 * Periodetype-labels for AgencyOS · Innstillinger · Periodenavn.
 *
 * Egen fil uten server-action-direktivet — server actions kan kun eksportere
 * async funksjoner, så disse konstantene kan ikke bo i actions.ts.
 */

import type { PeriodeType } from "@/generated/prisma/client";

const PERIODE_LABEL: Record<PeriodeType, string> = {
  GRUNN: "Grunnperiode",
  SPESIALISERING: "Spesialisering",
  TURNERING: "Turneringsfase",
  EVALUERING: "Evaluering",
  FERIE: "Ferie",
};

export type PeriodeNavnLabel = { verdi: PeriodeType; navn: string };
export const PERIODE_NAVN_LABELS: PeriodeNavnLabel[] = (
  Object.keys(PERIODE_LABEL) as PeriodeType[]
).map((verdi) => ({ verdi, navn: PERIODE_LABEL[verdi] }));

export { PERIODE_LABEL };
