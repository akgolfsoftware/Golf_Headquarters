/**
 * PlayerHQ · Booking · detalj (/portal/booking/[bookingId]) — Precision Athletics PH-23
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-23.jsx, «Mine timer»).
 * Auth og eierskapssjekk (`booking.userId !== user.id` → notFound) er uendret; bare
 * visningen er ny. Avbestilling håndheves server-side i cancelBooking (24-timersregelen, policy.ts).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { kr, naivDatoLang, naivKlokke } from "@/lib/portal-booking/ph23-format";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Detalj, type PH23Rad } from "@/components/portal/precision/PH23Booking";
import { AVBESTILLING_FRIST_TIMER, hoursUntil } from "@/lib/booking/policy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · PlayerHQ" };

type Props = { params: Promise<{ bookingId: string }> };

export default async function OktDetalj({ params }: Props) {
  const { bookingId } = await params;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { serviceType: true, location: true },
  });
  if (!booking || booking.userId !== user.id) notFound();

  const timerTilStart = hoursUntil(booking.startAt);
  const kanAvbestille = (booking.status === "PENDING" || booking.status === "CONFIRMED") && timerTilStart > 0;
  const kanRefusjon = timerTilStart > AVBESTILLING_FRIST_TIMER;

  const [coach, uleste] = await Promise.all([
    booking.serviceType.coachUserId
      ? prisma.user.findUnique({ where: { id: booking.serviceType.coachUserId }, select: { id: true, name: true } })
      : null,
    hentUleste(user.id),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH23Detalj
        data={{
          bookingId: booking.id,
          tjeneste: booking.serviceType.name,
          status: booking.status as PH23Rad["status"],
          dato: naivDatoLang(booking.startAt),
          tid: `${naivKlokke(booking.startAt)}–${naivKlokke(booking.endAt)}`,
          varighetMin: booking.serviceType.durationMin,
          sted: booking.location.name,
          stedId: booking.location.id,
          coachNavn: coach?.name ?? null,
          coachId: coach?.id ?? null,
          notat: booking.notes,
          kanAvbestille,
          kanRefusjon,
          betaling: booking.subscriptionId ? "Klipp" : kr(booking.priceOre),
        }}
      />
    </PlayerHQSkall>
  );
}
