"use server";

/**
 * D-55 (07.10.2026): WANG-elevens svar på testsamtykket for én WANG-gruppe.
 * Brukeren hentes fra sesjonen, så eleven kan bare svare for seg selv, og
 * gruppa må være en aktiv WANG-gruppe eleven er medlem i (sjekkes i
 * `registrerWangTestsvar`). Foresatt-varianten ligger i
 * src/app/forelder/samtykke/actions.ts.
 */

import { revalidatePath } from "next/cache";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { WANG_PLAN_SCOPE, type WangDelingsomfang, type WangTestdelingStatus } from "@/lib/deling/samtykke-regler";
import { registrerWangTestsvar } from "@/lib/portal-tester/wang-resultat-tilgang";

export type WangTestsvarResultat = { ok: true; status: WangTestdelingStatus } | { ok: false; feil: string };

export async function svarWangTestforesporsel(
  gruppeId: string,
  gitt: boolean,
  omfang: WangDelingsomfang = "TEST_RESULTATER",
): Promise<WangTestsvarResultat> {
  const user = await requireSpillerActionUser();
  // Klienten kan sende hva som helst: bare de to omfangene godtas.
  if (omfang !== "TEST_RESULTATER" && omfang !== WANG_PLAN_SCOPE) return { ok: false, feil: "Ukjent deling." };
  try {
    const deling = await registrerWangTestsvar({ userId: user.id, gruppeId, gitt, gittAvUserId: user.id, gittAvRolle: "SELV", omfang });
    revalidatePath("/portal");
    revalidatePath("/portal/meg/innstillinger/personvern");
    revalidatePath("/team-norway/wang-resultater");
    revalidatePath("/team-wang/coach/tester");
    revalidatePath("/team-wang/coach");
    return { ok: true, status: deling.status };
  } catch (err) {
    return { ok: false, feil: err instanceof Error ? err.message : "Kunne ikke lagre svaret." };
  }
}
