/**
 * PH23Bekreftet — kvittering etter booking i PlayerHQSkall.
 * Samme eierskapssjekk og samme kalenderlenke. Kun eieren ser bookingen.
 */

import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { BookingBekreftetV2 } from "@/components/portal/v2/BookingBekreftetV2";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ bookingId?: string }> };

function googleKalenderUrl(booking: {
  startAt: Date;
  endAt: Date;
  serviceType: { name: string };
  location: { name: string };
}): string {
  const fmt = (d: Date) => naivOsloTilTidspunkt(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `AK Golf — ${booking.serviceType.name}`,
    dates: `${fmt(booking.startAt)}/${fmt(booking.endAt)}`,
    location: booking.location.name,
    details: "Booking via AK Golf HQ",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default async function BekreftetPage({ searchParams }: Props) {
  const { bookingId } = await searchParams;
  if (!bookingId) notFound();

  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  const [booking, ulest] = await Promise.all([
    prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        serviceType: { select: { id: true, name: true, durationMin: true, coachUserId: true } },
        location: { select: { name: true } },
      },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (!booking || booking.userId !== user.id) notFound();

  const coach = booking.serviceType.coachUserId
    ? await prisma.user.findUnique({ where: { id: booking.serviceType.coachUserId }, select: { name: true } })
    : null;
  const dato = booking.startAt.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" });
  const klokkeslett = booking.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <BookingBekreftetV2
          data={{
            linje: `${booking.serviceType.name} · ${dato} · ${klokkeslett}`,
            coachNavn: coach?.name ?? null,
            sted: booking.location.name,
            varighetMin: booking.serviceType.durationMin,
            kalenderUrl: googleKalenderUrl(booking),
          }}
        />
      </div>
    </PlayerHQSkall>
  );
}
