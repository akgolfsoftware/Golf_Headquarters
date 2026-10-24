import { z } from "zod";
import { DrillFasilitet, FasilitetType, type SessionEnvironment } from "@/generated/prisma/client";
import type { AkBankkopi } from "./ak-bankkobling-format";

/** Minimal local projection, never names, notes or a model argument. Null is
 * unknown; a capability label is not evidence of a measured distance. */
export const akFasilitetSchema = z.object({
  capabilities: z.array(z.enum(DrillFasilitet)),
  type: z.enum(FasilitetType).nullable(),
  isIndoor: z.boolean(),
  rangeLengdeM: z.number().finite().nonnegative().nullable(),
  maksPuttLengdeM: z.number().finite().nonnegative().nullable(),
});
export type AkFasilitet = z.infer<typeof akFasilitetSchema>;
const maal = z.number().finite().nonnegative();
const kravSchema = z.object({
  longestShotM: maal,
  longestShotKind: z.enum(["NONE", "CARRY", "TOTAL", "PUTT_ROLL", "CHIP_ROLL", "THROW", "RUN", "OTHER"]),
  minimumFacilityLengthM: maal,
  minimumCeilingHeightM: maal.nullable().optional(),
  surface: z.enum(["ANY", "PUTTING_GREEN", "GRASS", "BUNKER", "RANGE", "COURSE", "GYM_FLOOR", "INDOOR_MAT"]).optional(),
}).strict();

type Grunn = "UGYLDIG_FASILITET" | "UKJENT_KRAV" | "UTSTYR_MANGLER" | "MILJO_MANGLER" |
  "MILJO_AVVIKER" | "INNENDORS_MANGLER" | "LENGDE_MANGLER" | "FOR_KORT" |
  "UNDERLAG_MANGLER" | "UNDERLAG_AVVIKER" | "TAKHOYDE_MANGLER";
export type AkFasilitetsvurdering = {
  status: "KRAV_OPPFYLT" | "AVVIK" | "MANGLER_GRUNNLAG";
  avvik: Grunn[];
  mangler: Grunn[];
};

/** Physical feasibility only, not approval, source proof, phase suitability,
 * access, booking, weather or a guarantee of safe execution. The caller must
 * establish the current trusted bank binding and sharing independently.
 * Unknown future structured requirements fail closed instead of being ignored.
 */
export function vurderAkBankfasilitet(bank: AkBankkopi, raw: unknown): AkFasilitetsvurdering {
  const avvik: Grunn[] = [], mangler: Grunn[] = [];
  const resultat = (): AkFasilitetsvurdering => ({
    status: avvik.length ? "AVVIK" : mangler.length ? "MANGLER_GRUNNLAG" : "KRAV_OPPFYLT", avvik, mangler,
  });
  const parsed = akFasilitetSchema.safeParse(raw);
  const parsedKrav = kravSchema.safeParse(bank.data.parametersJson.facilityRequirements);
  if (!parsed.success) mangler.push("UGYLDIG_FASILITET");
  if (!parsedKrav.success) mangler.push("UKJENT_KRAV");
  if (!parsed.success || !parsedKrav.success) return resultat();
  const f = parsed.data, krav = parsedKrav.data;
  const har = (cap: DrillFasilitet) => f.capabilities.includes(cap);
  if (!bank.data.fasilitetKrav.every(har)) avvik.push("UTSTYR_MANGLER");
  // A club may contain multiple environments; never infer a chosen range/course
  // from KLUBBANLEGG or from a union of capability labels.
  const miljo: SessionEnvironment | null = f.type === "SIMULATOR" ? "SIMULATOR" :
    f.type === "TRENINGSSENTER" ? "GYM" : f.type === "HJEMME" ? "HJEM" : null;
  if (!miljo) mangler.push("MILJO_MANGLER");
  else if (!bank.data.environment.includes(miljo)) avvik.push("MILJO_AVVIKER");
  if (bank.data.belastning === "INNENDORS" && !f.isIndoor) avvik.push("INNENDORS_MANGLER");

  const behov = Math.max(krav.longestShotM, krav.minimumFacilityLengthM);
  if (behov > 0) {
    // Range length does not prove chip roll, throwing distance or running space.
    const lengde = krav.longestShotKind === "PUTT_ROLL" ? f.maksPuttLengdeM :
      (krav.longestShotKind === "CARRY" || krav.longestShotKind === "TOTAL") && har("DRIVING_RANGE") ? f.rangeLengdeM : null;
    if (lengde === null) mangler.push("LENGDE_MANGLER");
    else if (lengde < behov) avvik.push("FOR_KORT");
  }
  // Only exact structured surface capabilities count. A club is not proof of
  // grass, nor is a simulator proof of a mat or a gym proof of its floor.
  const overflate = krav.surface;
  if (overflate && overflate !== "ANY") {
    const kjent = overflate === "PUTTING_GREEN" ? har("PUTTING_GREEN_KORT") || har("PUTTING_GREEN_LANG") :
      overflate === "BUNKER" ? har("BUNKER") : overflate === "RANGE" ? har("DRIVING_RANGE") :
      overflate === "COURSE" ? har("BANE") : null;
    if (kjent === null) mangler.push("UNDERLAG_MANGLER");
    else if (!kjent) avvik.push("UNDERLAG_AVVIKER");
  }
  // No ceiling measurement exists in PlayerFacility. isIndoor=false has a DB
  // default and cannot be upgraded into verified open-sky clearance.
  if ((krav.minimumCeilingHeightM ?? 0) > 0) mangler.push("TAKHOYDE_MANGLER");
  return resultat();
}

/** Each index refers to one concrete entry in the authorized snapshot. Never
 * combine one place's length with another place's equipment or surface. */
export function vurderAkBankfasiliteter(bank: AkBankkopi, fasiliteter: readonly AkFasilitet[]) {
  return fasiliteter.map((f, indeks) => ({ indeks, ...vurderAkBankfasilitet(bank, f) }));
}
