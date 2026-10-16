// FO03BookingBekreftet — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
/**
 * Foreldreportal · Booking bekreftet (STEG 9.8). Speiler
 * /portal/booking/bekreftet — eneste forskjell er eierskaps-sjekken: her må
 * bookingen tilhøre ETT AV forelderens koblede barn, ikke den innloggede
 * selv (booking.userId !== user.id ville alltid feilet for en forelder).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
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

export default async function ForelderBekreftetPage({ searchParams }: Props) {
  const { bookingId } = await searchParams;
  if (!bookingId) notFound();

  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const barnIder = new Set(barn.map((b) => b.child.id));

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: { select: { id: true, name: true, durationMin: true, coachUserId: true } },
      location: { select: { name: true } },
    },
  });

  if (!booking || !barnIder.has(booking.userId ?? "")) notFound();

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
        <ForelderSkall>
      <div className="pa-side">
      <BookingBekreftetV2
        data={{
          linje: `${booking.serviceType.name} · ${dato} · ${klokkeslett}`,
          coachNavn: coach?.name ?? null,
          sted: booking.location.name,
          varighetMin: booking.serviceType.durationMin,
          kalenderUrl: googleKalenderUrl(booking),
          mineBookingerHref: "/forelder/bookinger",
          merkelapp: "Foreldreportal",
        }}
      />
          </div>
    </ForelderSkall>
  );
}
