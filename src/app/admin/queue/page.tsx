/**
 * /admin/queue → /admin/innboks?filter=oppfolging
 *
 * Oppfølgingskøen (AG-03) er slått inn i Innboks › Oppfølging (AG-04-OPP,
 * beslutninger.md §SKJERMENE … RUNDE 8, «Én innboks»). Innboks dekker alt
 * denne siden gjorde: samme laster (src/lib/admin/oppfolging/last-oppfolging.ts),
 * kolonnene Risiko · Følg med · Sjekk · Løst med tall, dra-og-slipp og
 * statusvalg (settOppfolgingsstatus i ./actions.ts), og lenkene til
 * spilleren, booking og regler. Søkeparametrene følger med.
 */
import { redirect } from "next/navigation";
import { innboksHref } from "@/lib/admin/innboks/filter";

export const dynamic = "force-dynamic";

export default async function OppfolgingsKoRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect(innboksHref("oppfolging", await searchParams));
}
