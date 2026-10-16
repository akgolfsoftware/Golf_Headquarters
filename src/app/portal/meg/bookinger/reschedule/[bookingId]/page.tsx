// PH23FlyttTime — Precision Athletics PH-23, nytt design (pakke 11).
/**
 * PlayerHQ · Flytt time (/portal/meg/bookinger/reschedule/[bookingId]).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, arket «Flytt time».
 * Tilgang og regler som før: eier eller coach/admin, spilleren kan ikke flytte under 24 timer før,
 * avbestilte bookinger kan ikke flyttes. Ledige tider fra availability-motoren, bare hos timens coach.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { beregnSlotVindu } from "@/lib/portal-booking/slot-vindu";
import { byggSlotData } from "@/lib/portal-booking/ph23-booking-data";
import { AVBESTILLING_FRIST_TIMER, hoursUntil } from "@/lib/booking/policy";
import { logError } from "@/lib/error-tracking";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23FlyttTime } from "@/components/portal/precision/PH23FlyttTime";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ bookingId: string }>;
};

const tidFmt = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });
const dagFmt = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long" });

export default async function ReschedulePage({ params }: Props) {
  const { bookingId } = await params;
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: { select: { id: true, name: true, durationMin: true, coachUserId: true } },
      location: { select: { name: true } },
    },
  });
  if (!booking) notFound();

  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (booking.userId !== user.id && !erStaff) notFound();

  if (!erStaff && hoursUntil(booking.startAt) <= AVBESTILLING_FRIST_TIMER) {
    redirect("/portal/meg/bookinger?error=24t");
  }
  if (booking.status === "CANCELLED") {
    redirect("/portal/meg/bookinger?error=cancelled");
  }

  const coachId = booking.coachId ?? booking.serviceType.coachUserId;
  const coach = coachId ? await prisma.user.findUnique({ where: { id: coachId }, select: { name: true } }) : null;

  let vindu = null;
  try {
    vindu = await beregnSlotVindu(booking.serviceType.id, 14);
  } catch (error) {
    await logError({ context: "portal.booking.flytt.slots", error, meta: { bookingId }, severity: "warn" });
  }
  // Bare tider hos timens coach (spilleren flytter innenfor coachens tilgjengelighet).
  const egneTider = vindu && coachId
    ? { ...vindu, dager: vindu.dager.map((d) => ({ ...d, tider: d.tider.filter((t) => t.coachId === coachId) })) }
    : vindu;
  const slotData = byggSlotData(egneTider, 7);
  const naaDag = dagFmt.format(booking.startAt);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH23FlyttTime
        tilbakeHref={booking.userId === user.id ? `/portal/booking/${booking.id}` : "/portal/meg/bookinger"}
        data={{
          bookingId: booking.id,
          tjeneste: booking.serviceType.name,
          varighetMin: booking.serviceType.durationMin,
          sted: booking.location?.name ?? null,
          naaDag: naaDag.charAt(0).toUpperCase() + naaDag.slice(1),
          naaKl: tidFmt.format(booking.startAt),
          coachNavn: coach?.name ?? null,
          avbestillingTimer: AVBESTILLING_FRIST_TIMER,
          ...slotData,
        }}
      />
    </PlayerHQSkall>
  );
}
