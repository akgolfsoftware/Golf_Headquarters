// FO03BookingBekreftet — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
/**
 * Foreldreportal · Booking bekreftet (STEG 9.8). Speiler
 * /portal/booking/bekreftet — eneste forskjell er eierskaps-sjekken: her må
 * bookingen tilhøre ETT AV forelderens koblede barn, ikke den innloggede
 * selv (booking.userId !== user.id ville alltid feilet for en forelder).
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { BookingBekreftetV2 } from "@/components/portal/v2/BookingBekreftetV2";
import { forelderKontekstHref } from "@/lib/forelder-kontekst";
import { datoTekst, klokkeTekst, googleKalenderUrl as lagKalenderUrl } from "@/lib/email/booking-bekreftelse";

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
  return lagKalenderUrl({ tjeneste: booking.serviceType.name, start: booking.startAt, slutt: booking.endAt, sted: booking.location.name, referanse: "Booking via AK Golf HQ" });
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
  if (booking.status !== "CONFIRMED") redirect(forelderKontekstHref(`/forelder/bookinger/${booking.id}`, booking.userId));

  const coach = booking.serviceType.coachUserId
    ? await prisma.user.findUnique({
        where: { id: booking.serviceType.coachUserId },
        select: { name: true },
      })
    : null;

  const dato = datoTekst(booking.startAt);
  const klokkeslett = klokkeTekst(booking.startAt);

  return (
        <ForelderSkall barnId={booking.userId}>
      <div className="pa-side">
      <BookingBekreftetV2
        data={{
          linje: `${booking.serviceType.name} · ${dato} · ${klokkeslett}`,
          coachNavn: coach?.name ?? null,
          sted: booking.location.name,
          varighetMin: Math.round((booking.endAt.getTime() - booking.startAt.getTime()) / 60000),
          kalenderUrl: googleKalenderUrl(booking),
          mineBookingerHref: forelderKontekstHref("/forelder/bookinger", booking.userId),
          merkelapp: "Foreldreportal",
        }}
      />
          </div>
    </ForelderSkall>
  );
}
