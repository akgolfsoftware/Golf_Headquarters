/**
 * Bekreft booking (/portal/booking/ny/bekreft) — Precision Athletics PH-23 (steg 3).
 * Samme guards, queries og ledig-sjekk (isSlotStillAvailable) som før; PH23Bekreft
 * kaller createCreditBooking / opprettBookingMedKort med samme argumenter.
 * URL-kontrakten ?service=&start=&coach= er uendret.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingBekreftData } from "@/lib/portal-booking/bekreft-data";
import { PH23Skall } from "@/components/portal/precision/PH23Skall";
import { PH23Bekreft } from "@/components/portal/precision/PH23Booking";

type Props = {
  searchParams: Promise<{ service?: string; start?: string; coach?: string; betaling?: string }>;
};

export default async function BekreftCreditBookingPage({
  searchParams,
}: Props) {
  const { service: serviceSlug, start, coach: coachId, betaling } = await searchParams;

  if (!serviceSlug || !start || !coachId) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const resultat = await byggBookingBekreftData({
    eierId: user.id,
    wizardBase: "/portal/booking/ny",
    bekreftetBase: "/portal/booking/bekreftet",
    serviceSlug,
    start,
    coachId,
    betaling,
  });

  if (resultat.status === "krever_credits_redirect") redirect("/portal/booking/ny");
  if (resultat.status === "ikke_funnet") notFound();

  return (
    <PH23Skall userId={user.id}>
      <PH23Bekreft data={resultat.data} />
    </PH23Skall>
  );
}
