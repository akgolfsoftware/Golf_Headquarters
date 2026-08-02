"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

/**
 * logSymptom — registrerer et nytt symptom i helse-loggen.
 * Lagrer som rad i HealthCheck-tabellen (eller dedikert SymptomLog
 * dersom skjemaet utvides). For nå brukes en stub som validerer auth.
 */
export async function logSymptom(input: LogSymptomInput) {
  const user = await requireConsentingUser();

  // Smerte, kroppsregion og ønske om fysio er helseopplysninger (art. 9) —
  // porten må stå her allerede nå, ellers er den glemt den dagen stubben
  // under byttes ut med en ekte skriving.
  await krevManuellHelseSamtykke(user.id);

  void input;
  // I produksjon: prisma.symptomLog.create({ ... })
  revalidatePath("/portal/meg/helse");
  redirect("/portal/meg/helse");
}
