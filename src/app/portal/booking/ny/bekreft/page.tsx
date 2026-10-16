// PH23NyBekreft — Precision Athletics PH-23, nytt design (pakke 11).
/**
 * Bekreft credit-booking (/portal/booking/ny/bekreft) — v2 (retning C),
 * Team G-A 17. juli 2026.
 *
 * Samme guards, spørringer og ledig-sjekk (isSlotStillAvailable) som før.
 * Presentasjonen er PH23NyBekreft, som kaller createCreditBooking eller Stripe Checkout som før.
 * URL-kontrakten ?service=&start=&coach= er uendret.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingBekreftData } from "@/lib/portal-booking/bekreft-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23NyBekreft } from "@/components/portal/precision/PH23NyBekreft";
import { AVBESTILLING_FRIST_TIMER } from "@/lib/booking/policy";

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
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH23NyBekreft data={resultat.data} avbestillingTimer={AVBESTILLING_FRIST_TIMER} />
    </PlayerHQSkall>
  );
}
