/**
 * AgencyOS Varsler — redirect (T3, 26.08.2026; oppdatert MASTERPLAN 15.7).
 *
 * Var en egen duplikat-flate (VarslerClientV2, Paper) med samme underliggende
 * saker som Innboks (agent-forslag, signaler, uleste meldinger). Train-lock-
 * fasiten (AG-03 Innboks.dc.html) har ingen egen Varsler-skjerm — Innboksen
 * viser alt i én liste. Denne ruten er derfor bare et filter-alias inn i
 * Innboks-fanen på /admin/kommunikasjon (?filter=varsler viser kun
 * Meldinger-seksjonen: drift + varsel — "innboks" er standardfanen, så ingen
 * ?fane= trengs). Gamle lenker/bokmerker/⌘K-treff på /admin/varsler
 * fortsetter å virke.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VarslerRedirect() {
  redirect("/admin/kommunikasjon?filter=varsler");
}
