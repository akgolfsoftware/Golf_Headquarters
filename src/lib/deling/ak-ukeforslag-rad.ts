import { z } from "zod";

const kode = z.enum(["UKESBUDSJETT_MANGLER", "UKESBUDSJETT_AVVIKER", "PERIODE_MANGLER",
  "OVELSESNIVA_BOR_VURDERES", "FASILITET_IKKE_BEKREFTET", "BANKFASILITET_BOR_VURDERES", "FAGLIG_VURDERING_GJENSTAR"]);
export const akUkeradSchema = z.array(z.object({ kode,
  omrade: z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]).optional(),
  oktIndeks: z.number().int().min(0).max(20).optional(),
  exerciseId: z.string().trim().min(1).max(200).optional(),
// At most 21 sessions × 12 exercises × 4 advice codes, plus 7 week-level codes.
}).strict()).max(21 * 12 * 4 + 7);
export type AkUkerad = z.infer<typeof akUkeradSchema>;
const tekst: Record<z.infer<typeof kode>, string> = {
  BANKFASILITET_BOR_VURDERES: "Bankøvelsens målte anleggs- og miljøkrav er ikke bekreftet ved ett registrert sted; vurder avvik eller manglende opplysninger.",
  FAGLIG_VURDERING_GJENSTAR: "Bankkilden er kontrollert. Vurder fortsatt øvelsesvalg, periode, dose og hele øktens egnethet.",
  UKESBUDSJETT_MANGLER: "Uken mangler et registrert øktbudsjett.",
  UKESBUDSJETT_AVVIKER: "Antall foreslåtte økter avviker fra registrert øktbudsjett.",
  PERIODE_MANGLER: "Periodetype er ikke registrert eller kunne ikke tolkes.",
  OVELSESNIVA_BOR_VURDERES: "Vurder øvelsenes oppgitte nivåspenn mot spillerens grunnlag; nivået kan avvike eller være ukjent.",
  FASILITET_IKKE_BEKREFTET: "Ingen enkelt registrert treningsplass bekrefter alle oppgitte anleggskrav for øvelsene.",
};

/** Fixed display copy; no model-generated warning text, raw profile or DB IDs.
 * Several exercises with the same advice in one session share one visible line.
 */
export function akUkeradTekst(rad: AkUkerad): string[] {
  return [...new Set(rad.map(r => `${r.oktIndeks !== undefined ? `Økt ${r.oktIndeks + 1}: ` : ""}${r.omrade ? `${r.omrade}: ` : ""}${tekst[r.kode]}`))];
}
export function forklaringMedAkUkerad(forklaring: string, rad: AkUkerad | undefined) {
  const linjer = akUkeradTekst(rad ?? []);
  return linjer.length ? `${forklaring}\n\nFaglige råd – veiledende:\n${linjer.join("\n")}` : forklaring;
}
