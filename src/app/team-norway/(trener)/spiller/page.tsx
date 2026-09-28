import { redirect } from "next/navigation";

import { TN_RUTER } from "@/components/team-norway/tn-ruter";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";

/**
 * TN-02 Spillerprofil — inngangen fra menyen. Midlertidig: sender til
 * Spillerutvikling, der en spiller velges. Skjermagenten for TN-02 erstatter
 * denne med spillervelgeren fra «Team Norway App.dc.html».
 */
export default async function TnSpillerInngang() {
  await krevTnTrenerflate();
  redirect(TN_RUTER.spillere);
}
