import { z } from "zod";
import { AK_BANDS, akKategoriFraTall } from "@/lib/domain/ak-kategori";
import { beregnBruttoSnitt } from "@/lib/domain/brutto-snitt";
import { tilTurneringer } from "@/lib/profil-kobling/til-turneringer";

/** Minimal projection of the confirmed profile's result contract. No names,
 * membership IDs, venues, free notes or historical profile statistics. */
export const akNivaTurneringerSchema = z.array(z.object({
  start_date: z.string().nullable(), year: z.number().int().nullable(),
  klasse: z.string().nullable(), plassering: z.number().int().nullable(),
  total_score: z.number().int().nullable(),
  runder: z.array(z.object({ runde: z.number().int(), score: z.number().int().nullable() })).nullable(),
}));

/** Same gross-score adapter and A–K rule as PlayerHQ, with explicit provenance.
 * Missing result data permits the existing HCP estimate, never a measured claim.
 * Source errors must be rejected by the caller, not converted to empty results. */
export function beregnAkSpillerniva(turneringer: z.infer<typeof akNivaTurneringerSchema>, hcp: unknown, aar: number) {
  const parsedHcp = z.number().min(-10).max(54).safeParse(hcp);
  const gyldigHcp = parsedHcp.success ? parsedHcp.data : null;
  const snitt = beregnBruttoSnitt({ aar, treningsrunder: [], turneringer: tilTurneringer(turneringer.map(t => ({
    ...t,
    // The shared adapter requires display metadata. These unused fields are
    // intentionally empty; no names or identifying tournament IDs are fetched.
    tournament_id: 0, turnering: "", kilde: null, series: null, to_par: null,
    runder: t.runder?.map(r => ({ ...r, til_par: null, mot_felt: null })) ?? null,
  }))) }).turnering;
  return {
    kategori: akKategoriFraTall({ snitt: snitt.snitt, hcp: gyldigHcp }),
    kilde: snitt.snitt !== null ? "BRUTTO_TURNERING" as const : gyldigHcp !== null ? "HCP_ESTIMAT" as const : "UKJENT" as const,
    aar, runder: snitt.runder, bruttoSnitt: snitt.snitt, hcp: gyldigHcp,
  };
}
export type AkSpillerniva = ReturnType<typeof beregnAkSpillerniva>;

/** Check the exercise's declared bounds, not a claim of overall suitability. */
export function ovelseMatcherAkNiva(ovelse: { minKategori: string | null; maxKategori: string | null;
  minHcp: number | null; maxHcp: number | null }, niva: AkSpillerniva): boolean {
  const fra = ovelse.minKategori === null ? 0 : AK_BANDS.findIndex(b => b.kategori === ovelse.minKategori);
  const til = ovelse.maxKategori === null ? AK_BANDS.length - 1 : AK_BANDS.findIndex(b => b.kategori === ovelse.maxKategori);
  if (fra < 0 || til < fra) return false;
  const aktuell = AK_BANDS.findIndex(b => b.kategori === niva.kategori);
  if (aktuell < 0 ? fra !== 0 || til !== AK_BANDS.length - 1 : aktuell < fra || aktuell > til) return false;
  const { minHcp, maxHcp } = ovelse;
  if ((minHcp !== null && !Number.isFinite(minHcp)) || (maxHcp !== null && !Number.isFinite(maxHcp))) return false;
  if (minHcp !== null && maxHcp !== null && minHcp > maxHcp) return false;
  if ((minHcp !== null || maxHcp !== null) && niva.hcp === null) return false;
  return niva.hcp === null || ((minHcp === null || niva.hcp >= minHcp) && (maxHcp === null || niva.hcp <= maxHcp));
}
