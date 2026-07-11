// Ren lib (ingen Prisma) for treningspreferansene spilleren oppgir i steg 3
// av onboardingen — antall økter/uke, foretrukne dager, tid på døgnet,
// drivkraft. Lagres i User.preferences.trening (JSON) og valideres alltid
// med zod ved lesing (prosjektregel: JSON-blober valideres, aldri
// `as unknown as T`).

import { z } from "zod";

// ---------- Ukedager ----------

/** Rekkefølgen matcher onboarding-wizardens UKEDAGER-array. */
export const UKEDAG_TIL_DAGNR: Record<string, number> = {
  man: 1,
  tir: 2,
  ons: 3,
  tor: 4,
  fre: 5,
  lør: 6,
  søn: 7,
};

export function ukedagerTilDagNr(dager: string[]): number[] {
  return dager
    .map((d) => UKEDAG_TIL_DAGNR[d])
    .filter((n): n is number => typeof n === "number")
    .sort((a, b) => a - b);
}

// ---------- Fasiliteter ----------

/**
 * Mapping fra onboarding-wizardens fasilitet-id-er til FacilityPrefs-felt.
 * Kun feltene spilleren faktisk ble spurt om settes — range/shortgame/
 * yoga/pool/video røres aldri herfra (spilleren har ikke uttalt seg).
 * MATTE_PUTTING setter kun putting=true (fravalg betyr ikke «ingen tilgang»
 * — spilleren kan ha tilgang uten å ha krysset av).
 */
export const FASILITET_TIL_PREFS: Record<string, Partial<{
  trackman: boolean;
  course9: boolean;
  course18: boolean;
  gym: boolean;
  putting: boolean;
}>> = {
  TRACKMAN: { trackman: true },
  GRESS_BANE: { course9: true, course18: true },
  STUDIO: { gym: true },
  MATTE_PUTTING: { putting: true },
};

export function fasiliteterTilFacilityPrefs(
  fasiliteter: string[],
): Partial<{ trackman: boolean; course9: boolean; course18: boolean; gym: boolean; putting: boolean }> {
  const ut: Record<string, boolean> = {};
  for (const f of fasiliteter) {
    const mapping = FASILITET_TIL_PREFS[f];
    if (mapping) Object.assign(ut, mapping);
  }
  return ut;
}

// ---------- Sesongmål → klarspråk (Goal.title er spillervendt) ----------

export const SESONGMAAL_TITTEL: Record<string, string> = {
  "SENKE HCP": "Senke handicap",
  "VINNE KLUBBM.": "Vinne klubbmesterskapet",
  "SPILLE NM": "Spille NM",
  "COLLEGE USA": "College i USA",
  "UNDER PAR": "Spille under par",
  "BEDRE PUTTING": "Bedre putting",
  "BEDRE IRON-SPILL": "Bedre jernspill",
  "MENTAL ROBUSTHET": "Mental robusthet",
  "BLI PROFF": "Bli proff",
};

export function sesongmaalTilTittel(maal: string): string {
  return SESONGMAAL_TITTEL[maal] ?? maal;
}

// ---------- Zod-kontrakt for preferences.trening ----------

export const TID_PAA_DAGEN = ["TIDLIG", "DAG", "ETTER_SKOLE"] as const;

export const TreningPreferanserSchema = z.object({
  okterPerUke: z.number().int().min(1).max(14),
  dager: z.array(z.number().int().min(1).max(7)).max(7),
  tidPaaDagen: z.enum(TID_PAA_DAGEN).nullable(),
  drivkraft: z.array(z.string()).max(10),
});

export type TreningPreferanser = z.infer<typeof TreningPreferanserSchema>;

/** Trygg lesing av preferences.trening — ugyldig/manglende data gir null, kaster aldri. */
export function lesTreningPreferanser(preferences: unknown): TreningPreferanser | null {
  if (!preferences || typeof preferences !== "object") return null;
  const trening = (preferences as Record<string, unknown>).trening;
  if (!trening || typeof trening !== "object") return null;
  const parsed = TreningPreferanserSchema.safeParse(trening);
  return parsed.success ? parsed.data : null;
}

/** Bygger preferences.trening-payloaden fra onboarding-wizardens rå felt. */
export function byggTreningPreferanser(input: {
  sessionFrequency?: number;
  traningsdager?: string[];
  tidPaaDagen?: string;
  drivkraft?: string[];
}): TreningPreferanser {
  const tid = TID_PAA_DAGEN.includes(input.tidPaaDagen as (typeof TID_PAA_DAGEN)[number])
    ? (input.tidPaaDagen as (typeof TID_PAA_DAGEN)[number])
    : null;
  return {
    okterPerUke: input.sessionFrequency && input.sessionFrequency >= 1 ? Math.min(14, input.sessionFrequency) : 1,
    dager: ukedagerTilDagNr(input.traningsdager ?? []),
    tidPaaDagen: tid,
    drivkraft: input.drivkraft ?? [],
  };
}
