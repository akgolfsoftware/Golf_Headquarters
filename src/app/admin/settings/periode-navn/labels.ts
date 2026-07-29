/**
 * Etiketter for periodetyper — bevisst i egen modul, ikke i actions.ts.
 *
 * En "use server"-fil kan KUN eksportere async funksjoner. Ligger konstanten
 * der, bygger ikke ruten («A "use server" file can only export async
 * functions, found object»). Både siden og server-actions importerer herfra.
 */

import type { PeriodeType } from "@/generated/prisma/client";

export const PERIODE_LABEL: Record<PeriodeType, string> = {
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

export type LagretPeriodeNavn = {
  navn: string;
  periodeType: PeriodeType;
  periodeTypeLabel: string;
};

export type PeriodeNavnOversikt = {
  /** Coach-lagte mappinger — kan slettes. */
  lagrede: LagretPeriodeNavn[];
  /** Navn funnet i faktiske TrainingPeriod-rader som ikke gjenkjennes ennå. */
  ukjente: string[];
};
