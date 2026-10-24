import { z } from "zod";
import { LPhase } from "@/generated/prisma/client";
import type { AkBankkopi } from "./ak-bankkobling-format";
import type { AkUkegrunnlag } from "./ak-ukegrunnlag";
import { ovelseMatcherAkNiva } from "./ak-spillerniva";
import { vurderAkBankfasiliteter } from "./ak-bankfasilitet";

type Grunnlag = Pick<AkUkegrunnlag, "niva" | "fasiliteter" | "budsjett" | "harManedsEllerUkevalg" | "modell">;

/** Advisory observations, never exercise ranking or a new training veto.
 * The planning master retires old L-phases; LPhase is only the legacy DB enum
 * for the recorded period type. No per-exercise period prescription exists in
 * the approved-bank contract, so period suitability remains explicitly unset.
 */
export function vurderAkUkekandidat(bank: AkBankkopi, grunnlag: Grunnlag) {
  const periode = z.enum(LPhase).safeParse(grunnlag.modell.signals.aktivFase);
  const passerNiva = ovelseMatcherAkNiva(bank.data, grunnlag.niva);
  const fasiliteter = vurderAkBankfasiliteter(bank, grunnlag.fasiliteter);
  return {
    omrade: bank.data.pyramidArea,
    niva: {
      status: passerNiva ? "INNENFOR_OPPGITT_SPENN" as const : grunnlag.niva.kategori === null ?
        "MANGLER_GRUNNLAG" as const : "UTENFOR_OPPGITT_SPENN" as const,
      kilde: grunnlag.niva.kilde,
    },
    periode: { type: periode.success ? periode.data : null, ovelsesSamsvar: "IKKE_VURDERT" as const },
    ukebudsjett: { omradeErPlanlagt: grunnlag.budsjett ? (grunnlag.budsjett[bank.data.pyramidArea] ?? 0) > 0 : null,
      harManedsEllerUkevalg: grunnlag.harManedsEllerUkevalg },
    fasiliteter,
    fasilitetsstatus: !fasiliteter.length ? "INGEN_REGISTRERTE_STEDER" as const :
      fasiliteter.some(f => f.status === "KRAV_OPPFYLT") ? "KRAV_OPPFYLT_VED_ETT_STED" as const :
      fasiliteter.some(f => f.status === "MANGLER_GRUNNLAG") ? "MANGLER_GRUNNLAG" as const : "AVVIK_VED_ALLE_STEDER" as const,
    fagligVurdering: "GJENSTAR" as const,
  };
}
