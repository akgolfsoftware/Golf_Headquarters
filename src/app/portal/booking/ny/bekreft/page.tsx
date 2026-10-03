/** PH23NyBekreft — bekreft booking i PlayerHQSkall.
 * Samme guards, queries og ledig-sjekk (isSlotStillAvailable).
 * URL-kontrakten ?service=&start=&coach=&betaling= er uendret.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingBekreftData } from "@/lib/portal-booking/bekreft-data";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { BookingNyBekreftInnhold } from "./bekreft-innhold";

type Props = {
  searchParams: Promise<{ service?: string; start?: string; coach?: string; betaling?: string }>;
};

export default async function BekreftCreditBookingPage({
  searchParams,
}: Props) {
  const { service: serviceSlug, start, coach: coachId, betaling } = await searchParams;

  if (!serviceSlug || !start || !coachId) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const [resultat, ulest] = await Promise.all([
    byggBookingBekreftData({
      eierId: user.id,
      wizardBase: "/portal/booking/ny",
      bekreftetBase: "/portal/booking/bekreftet",
      serviceSlug,
      start,
      coachId,
      betaling,
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (resultat.status === "krever_credits_redirect") redirect("/portal/booking/ny");
  if (resultat.status === "ikke_funnet") notFound();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <BookingNyBekreftInnhold data={resultat.data} />
      </div>
    </PlayerHQSkall>
  );
}
