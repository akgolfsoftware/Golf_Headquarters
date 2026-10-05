"use server";

/**
 * D-13 (05.10.2026): WANG-elevens svar på «Del testene med Team Norway».
 * Brukeren hentes fra sesjonen, så eleven kan bare svare for seg selv.
 * Foresatt-varianten ligger i src/app/forelder/samtykke/actions.ts.
 */

import { revalidatePath } from "next/cache";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import type { WangTnTestdelingStatus } from "@/lib/deling/samtykke-regler";
import { registrerWangTnTestsvar } from "@/lib/portal-tester/wang-resultat-tilgang";

export type WangTnTestsvarResultat = { ok: true; status: WangTnTestdelingStatus } | { ok: false; feil: string };

export async function svarWangTnTestforesporsel(gitt: boolean): Promise<WangTnTestsvarResultat> {
  const user = await requireSpillerActionUser();
  try {
    const deling = await registrerWangTnTestsvar({ userId: user.id, gitt, gittAvUserId: user.id, gittAvRolle: "SELV" });
    revalidatePath("/portal");
    revalidatePath("/portal/meg/innstillinger/personvern");
    revalidatePath("/team-norway/wang-resultater");
    return { ok: true, status: deling.status };
  } catch (err) {
    return { ok: false, feil: err instanceof Error ? err.message : "Kunne ikke lagre svaret." };
  }
}
