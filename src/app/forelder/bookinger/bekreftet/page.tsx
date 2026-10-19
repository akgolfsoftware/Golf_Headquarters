// FO03BookingBekreftet — Precision Athletics (FO03Bekreftet). Data og handlinger er beholdt.
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
import { FO03Bekreftet } from "@/components/forelder/FO03Bekreftet";
import { AVBESTILLING_FRIST_TIMER } from "@/lib/booking/policy";

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

  const oslo = (o: Intl.DateTimeFormatOptions) =>
    booking.startAt.toLocaleDateString("nb-NO", { ...o, timeZone: "Europe/Oslo" });
  const datoLang = oslo({ weekday: "long", day: "numeric", month: "long" });
  const klokkeslett = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
  const barnNavn = barn.find((b) => b.child.id === booking.userId)?.child.name ?? null;

  return (
    <ForelderSkall>
      <div className="pa-side">
        <FO03Bekreftet
          data={{
            barnFornavn: barnNavn?.split(" ")[0] ?? null,
            tjeneste: booking.serviceType.name,
            ukedagKort: oslo({ weekday: "short" }).replace(".", ""),
            dagTall: oslo({ day: "numeric" }).replace(".", ""),
            maanedKort: oslo({ month: "short" }).replace(".", ""),
            datoLang: datoLang.charAt(0).toUpperCase() + datoLang.slice(1),
            klokkeslett,
            coachNavn: coach?.name ?? null,
            sted: booking.location.name,
            varighetMin: booking.serviceType.durationMin,
            kalenderUrl: googleKalenderUrl(booking),
            avbestillingTimer: AVBESTILLING_FRIST_TIMER,
          }}
        />
      </div>
    </ForelderSkall>
  );
}
