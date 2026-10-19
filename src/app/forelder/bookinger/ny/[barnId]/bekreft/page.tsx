// FO03NyBarnBekreft — Precision Athletics (FO03BookingBekreft). Data og handlinger er beholdt.
/**
 * Foreldreportal · Bekreft booking for barnet (STEG 9.8). Speiler
 * /portal/booking/ny/bekreft via samme byggBookingBekreftData-loader —
 * eneste forskjell er eier (barnet) og hvor «Bekreft booking» sender
 * spilleren videre (bekreftetBase). barnId sendes med i dataen slik at
 * FO03BookingBekreft gir det videre til opprettBooking-actionene, som
 * verifiserer forelder→barn-koblingen på nytt før noe skrives.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnHvisTilhoerer } from "@/lib/forelder";
import { byggBookingBekreftData } from "@/lib/portal-booking/bekreft-data";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { FO03BookingBekreft } from "@/components/forelder/FO03BookingBekreft";
import { AVBESTILLING_FRIST_TIMER } from "@/lib/booking/policy";

type Props = {
  params: Promise<{ barnId: string }>;
  searchParams: Promise<{ service?: string; start?: string; coach?: string; betaling?: string }>;
};

export default async function ForelderBekreftBookingPage({ params, searchParams }: Props) {
  const { barnId } = await params;
  const { service: serviceSlug, start, coach: coachId, betaling } = await searchParams;

  if (!serviceSlug || !start || !coachId) notFound();

  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnHvisTilhoerer(user.id, barnId);
  if (!barn) notFound();

  const wizardBase = `/forelder/bookinger/ny/${barnId}`;
  const resultat = await byggBookingBekreftData({
    eierId: barn.id,
    barnId,
    wizardBase,
    bekreftetBase: "/forelder/bookinger/bekreftet",
    serviceSlug,
    start,
    coachId,
    betaling,
  });

  if (resultat.status === "krever_credits_redirect") redirect(wizardBase);
  if (resultat.status === "ikke_funnet") notFound();

  return (
    <ForelderSkall>
      <div className="pa-side">
        <FO03BookingBekreft data={resultat.data} barnNavn={barn.name} avbestillingTimer={AVBESTILLING_FRIST_TIMER} />
      </div>
    </ForelderSkall>
  );
}
