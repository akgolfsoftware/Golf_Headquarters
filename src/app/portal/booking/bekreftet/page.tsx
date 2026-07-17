/**
 * PlayerHQ · Booking bekreftet (/portal/booking/bekreftet?bookingId=…) — v2.
 * v2-port 17. juli 2026 (Team G-B): `BookingBekreftetV2` erstatter legacy-
 * siden, ruten flyttet ut av (legacy). Kvitteringsside etter credit-booking
 * (bekreft-form router.push-er hit). Uendret logikk: eierskaps-sjekk
 * (`booking.userId !== user.id` → notFound) og googleKalenderUrl()-
 * genereringen. COPY-FIKS: legacy-tittelen «Forespørsel sendt!» var uærlig —
 * credit-bookingen opprettes CONFIRMED, ny tittel er «Booking bekreftet».
 * Datoformatering har fått eksplisitt Europe/Oslo (gotcha: Vercel kjører UTC).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { BookingBekreftetV2 } from "@/components/portal/v2/BookingBekreftetV2";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ bookingId?: string }>;
};

function googleKalenderUrl(booking: {
  startAt: Date;
  endAt: Date;
  serviceType: { name: string };
  location: { name: string };
}): string {
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
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

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: {
        select: {
          id: true,
          name: true,
          durationMin: true,
          coachUserId: true,
        },
      },
      location: { select: { name: true } },
    },
  });

  if (!booking || booking.userId !== user.id) notFound();

  const coach = booking.serviceType.coachUserId
    ? await prisma.user.findUnique({
        where: { id: booking.serviceType.coachUserId },
        select: { name: true },
      })
    : null;

  const dato = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  });
  const klokkeslett = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });

  return (
    // Ingen eksplisitt aktiv-nøkkel: booking-hubben (/portal/booking) lar
    // V2Shell auto-utlede fra pathname — samme her.
    <V2Shell nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <BookingBekreftetV2
        data={{
          linje: `${booking.serviceType.name} · ${dato} · ${klokkeslett}`,
          coachNavn: coach?.name ?? null,
          sted: booking.location.name,
          varighetMin: booking.serviceType.durationMin,
          kalenderUrl: googleKalenderUrl(booking),
        }}
      />
    </V2Shell>
  );
}
