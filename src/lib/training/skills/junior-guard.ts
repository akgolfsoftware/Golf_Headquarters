import { z } from "zod";

export const juniorGuardInputSchema = z.object({
  dateOfBirth: z.coerce.date().nullable().optional(),
  planlagteOkterNesteUke: z.number().int().min(0),
  csTarget: z.number().int().min(0).max(100).optional(),
  sessionsToAdd: z.number().int().min(0).default(0),
});

export type JuniorGuardInput = z.input<typeof juniorGuardInputSchema>;

export type JuniorGuardOutput = {
  erJunior: boolean;
  alder: number | null;
  tillatt: boolean;
  avslagGrunn: string | null;
  maxOkterPerUke: number;
  maxCs: number;
};

function alderFraDob(dob: Date, ref = new Date()): number {
  let alder = ref.getFullYear() - dob.getFullYear();
  const m = ref.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < dob.getDate())) alder--;
  return alder;
}

export function runJuniorGuardSkill(input: JuniorGuardInput): JuniorGuardOutput {
  const parsed = juniorGuardInputSchema.parse(input);
  const alder =
    parsed.dateOfBirth != null ? alderFraDob(parsed.dateOfBirth) : null;
  const erJunior = alder != null && alder < 16;
  const maxOkterPerUke = erJunior ? 4 : 7;
  const maxCs = erJunior ? 90 : 100;

  const totalt = parsed.planlagteOkterNesteUke + parsed.sessionsToAdd;
  let tillatt = true;
  let avslagGrunn: string | null = null;

  if (erJunior && totalt > maxOkterPerUke) {
    tillatt = false;
    avslagGrunn = `Junior under 16: maks ${maxOkterPerUke} økter/uke (forsøk ${totalt}).`;
  }
  if (erJunior && parsed.csTarget != null && parsed.csTarget > maxCs) {
    tillatt = false;
    avslagGrunn = `Junior under 16: CS-mål over ${maxCs} er ikke tillatt.`;
  }

  return {
    erJunior,
    alder,
    tillatt,
    avslagGrunn,
    maxOkterPerUke,
    maxCs,
  };
}