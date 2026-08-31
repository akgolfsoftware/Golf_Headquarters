/**
 * AgencyOS e-post-innboks — redirect (MASTERPLAN 15.7).
 *
 * Slått sammen til /admin/kommunikasjon (fane "utkast" — det denne siden
 * åpnet på: `epost[0]`, nyeste først, uansett status). Innholdet lever nå
 * fordelt på to statusfaner ("utkast"/"sendt") på samme InnboksEpost-tabell.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InnboksEpostRedirect() {
  redirect("/admin/kommunikasjon?fane=utkast");
}
