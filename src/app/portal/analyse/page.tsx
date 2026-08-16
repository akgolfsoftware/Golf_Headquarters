import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/**
 * /portal/analyse (gammel adresse) → /portal/analysere.
 * Analysere er kanonisk analyse-flate i PlayerHQ.
 *
 * Nivået følger MÅLRUTEN, ikke default: /portal/analysere er åpen for TALENT
 * (talent-allowlist.ts). Ble aliaset låst til FULL, ville en TALENT-bruker med
 * et gammelt bokmerke havnet på oppgraderingssiden i stedet for på flaten han
 * faktisk har tilgang til.
 */
export default async function AnalyseRedirect(): Promise<never> {
  await requirePortalUser({ kreverTilgang: "TALENT" });
  redirect("/portal/analysere");
}
