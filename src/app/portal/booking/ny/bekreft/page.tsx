// PH23NyBekreft — Precision Athletics PH-23.
/**
 * Bekreft credit-booking (/portal/booking/ny/bekreft) — v2 (retning C),
 * Team G-A 17. juli 2026.
 *
 * RESTYLING ONLY av legacy-siden: samme guards, queries og ledig-sjekk
 * (isSlotStillAvailable) — kopiert uendret. Kun presentasjonen er ny
 * (V2Shell + BookingNyBekreftV2, som kaller createCreditBooking som før).
 * URL-kontrakten ?service=&start=&coach= er uendret.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { byggBookingBekreftData } from "@/lib/portal-booking/bekreft-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { TilbakeLenke } from "@/components/v2";
import { BookingNyBekreftV2 } from "@/components/portal/v2/BookingNyBekreftV2";

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
      <div className="pa-side">
        <TilbakeLenke href={resultat.data.backHref}>Velg annen tid</TilbakeLenke>
        <BookingNyBekreftV2 data={resultat.data} />
      </div>
    </PlayerHQSkall>
  );
}
