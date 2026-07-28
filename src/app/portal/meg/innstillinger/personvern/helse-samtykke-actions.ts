"use server";

/**
 * Server actions for spillerens EGET helsedata-samtykke (GDPR art. 9-2 a).
 *
 * Foresatt-varianten ligger i src/app/forelder/samtykke/actions.ts — den
 * må verifisere ParentRelation, og hører derfor hjemme der.
 */

import { revalidatePath } from "next/cache";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { registrerHelseSamtykke } from "@/lib/health/samtykke";
import { erHelseSamtykkeType } from "@/lib/health/samtykke-regler";

/**
 * Spilleren gir eller trekker sitt eget samtykke.
 *
 * Merk at det ikke finnes noen `userId`-parameter: en spiller kan kun endre
 * sitt eget samtykke, og brukeren hentes fra sesjonen. Da finnes det ingen
 * parameter å manipulere for å treffe en annen spiller.
 */
export async function settEgetHelseSamtykke(
  type: string,
  gitt: boolean,
): Promise<{ ok: true } | { ok: false; feil: string }> {
  const user = await requireSpillerActionUser();

  if (!erHelseSamtykkeType(type)) {
    return { ok: false, feil: "Ukjent samtykketype." };
  }

  try {
    await registrerHelseSamtykke({
      userId: user.id,
      type,
      gitt,
      gittAvUserId: user.id,
      gittAvRolle: "SELV",
    });
  } catch (err) {
    // Forventet tilfelle: spiller under 16 prøver å samtykke selv. Meldingen
    // fra regel-laget er allerede skrevet for å vises rett i UI.
    return {
      ok: false,
      feil: err instanceof Error ? err.message : "Kunne ikke lagre samtykket.",
    };
  }

  revalidatePath("/portal/meg/innstillinger/personvern");
  revalidatePath("/portal/meg/innstillinger/integrasjoner");
  revalidatePath("/portal/meg/helse");

  return { ok: true };
}
