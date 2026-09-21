"use server";

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { krevManuellHelseSamtykke } from "@/lib/health/samtykke";

export type LogSymptomInput = {
  region: string;
  side: "Venstre" | "Høyre" | "Midt / begge";
  vas: number;
  varighet: "Akutt" | "Kronisk";
  occurence: "Kun trening" | "Kun spill" | "Alltid";
  triggers: string[];
  daytimeTriggers: string[];
  note?: string;
  requestFysio: boolean;
};

/** Meldingen skjermen viser i stedet for et lagringsløfte appen ikke kan holde. */
export const SYMPTOM_IKKE_TILGJENGELIG =
  "Symptomregistrering er ikke i drift ennå. Ingenting av det du har skrevet er lagret. " +
  "Si fra til coachen din om plagen i mellomtiden.";

/**
 * logSymptom — IKKE I DRIFT.
 *
 * Det finnes ingen tabell å skrive symptomet til ennå. Fram til 21.09.2026
 * gjorde denne handlingen `void input` og sendte spilleren tilbake til
 * helsesiden, som så ut nøyaktig som en vellykket lagring: skjemaet lukket
 * seg, ingen feil kom. Spilleren satt igjen og trodde plagen var registrert,
 * og coachen så den aldri. Et lagringsløfte appen ikke kan holde er verre enn
 * ingen funksjon, særlig for en helseopplysning, så handlingen sier nå fra.
 *
 * Samtykkeporten står før avvisningen med vilje: smerte, kroppsregion og
 * ønske om fysio er helseopplysninger (art. 9), og porten skal være på plass
 * den dagen skrivingen faktisk kobles på.
 */
export async function logSymptom(input: LogSymptomInput) {
  const user = await requireConsentingUser();
  await krevManuellHelseSamtykke(user.id);

  void input;
  throw new Error(SYMPTOM_IKKE_TILGJENGELIG);
}
