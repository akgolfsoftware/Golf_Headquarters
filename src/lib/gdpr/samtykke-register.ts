/**
 * R-J: maskinlesbar oversikt over samtykkeformål mot faktisk kode.
 * Tekst i UI endres ikke her. Aldersgrensen er 16, ikke 13.
 */

import { GDPR_SAMTYKKE_ALDER } from "@/lib/auth/minor";
import {
  DELING_SCOPES,
  SAMTYKKE_TEKST_VERSJON,
} from "@/lib/deling/samtykke-regler";
import {
  HELSE_SAMTYKKE_TYPER,
  HELSE_SAMTYKKE_VERSJON,
} from "@/lib/health/samtykke-regler";
import { LYD_SAMTYKKE_ORDLYD_VERSJON } from "@/lib/recording/lyd-samtykke-ordlyd";

export const SAMTYKKE_ALDER = GDPR_SAMTYKKE_ALDER;

export type SamtykkeHistorikk = "append-only" | "oppdater-rad" | "felt-på-bruker";

export type SamtykkeFormaal = {
  id: string;
  formaal: string;
  opplysningstype: string;
  alder: number;
  roller: readonly string[];
  deling: string;
  lagringssted: string;
  historikk: SamtykkeHistorikk;
  tekstVersjon: string;
};

export const SAMTYKKE_REGISTER: readonly SamtykkeFormaal[] = [
  {
    id: "konto-foresatt",
    formaal: "Behandle konto for spiller under 16 år",
    opplysningstype: "Identitet og konto",
    alder: SAMTYKKE_ALDER,
    roller: ["FORESATT"],
    deling: "Ikke delt eksternt via denne raden",
    lagringssted: "User.requiresGuardianConsent / guardianConsentGivenAt",
    historikk: "felt-på-bruker",
    tekstVersjon: "art-8-16",
  },
  {
    id: "helse",
    formaal: "Lagre og vise helsetall (klokke eller manuell) og coach-innsyn",
    opplysningstype: "Særlig kategori: søvn, puls, HRV, vekt, skade",
    alder: SAMTYKKE_ALDER,
    roller: ["SELV", "FORESATT"],
    deling: "Coach ser status eller tall bare med egne formål; aldri via ekstern leser",
    lagringssted: "helse_samtykker",
    historikk: "append-only",
    tekstVersjon: HELSE_SAMTYKKE_VERSJON,
  },
  {
    id: "deling",
    formaal: "Dele tester, statistikk eller komplett profil med Team Norway/WANG",
    opplysningstype: "Tester, runde-SG, plan/TrackMan/analyse ved komplett profil",
    alder: SAMTYKKE_ALDER,
    roller: ["SELV", "FORESATT"],
    deling: "Per mottakergruppe og scope. Helsedata og private notater er utenfor",
    lagringssted: "delings_samtykker",
    historikk: "append-only",
    tekstVersjon: SAMTYKKE_TEKST_VERSJON,
  },
  {
    id: "lyd",
    formaal: "Ta opp coaching-økt, transkribere og lage sammendrag",
    opplysningstype: "Lyd, transkript og AI-sammendrag",
    alder: SAMTYKKE_ALDER,
    roller: ["SELV", "FORESATT"],
    deling: "Coach i økta. Ikke ekstern leser",
    lagringssted: "lyd_samtykker",
    historikk: "oppdater-rad",
    tekstVersjon: LYD_SAMTYKKE_ORDLYD_VERSJON,
  },
];

export const HELSE_FORMÅL = HELSE_SAMTYKKE_TYPER;
export const DELING_FORMÅL = DELING_SCOPES;
