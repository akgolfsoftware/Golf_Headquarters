/**
 * /booking/kvittering/[bookingId] — BK-03 i Precision Athletics (tegning: Claude
 * Design 7d7c2994, ui_kits/booking/screens/BK.jsx). Stripe success_url lander
 * her. Booking-oppslaget, CONFIRMED-sjekken og Europe/Oslo-formateringen er
 * uendret; presentasjon og PENDING-polling bor i `BookingKvittering`.
 *
 * Kontolenken for gjester har ikke lenger e-posten i adressen
 * (beslutninger.md §BOOKING BEKREFTES AUTOMATISK punkt 5).
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { cancellationDeadline } from "@/lib/booking/policy";
import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";
import { BookingKvittering } from "@/components/booking/precision/BookingKvittering";

export const metadata: Metadata = {
  title: "Bekreftet · AK Golf",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ bookingId: string }>;
};

export default async function Kvittering({ params }: Props) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: true,
      location: true,
      coach: { select: { name: true } },
    },
  });

  if (!booking) notFound();

  const user = await getCurrentUser();

  const dato = booking.startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tid = booking.startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const prisTekst = new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(booking.priceOre / 100);

  const frist = cancellationDeadline(booking.startAt);
  const fristTekst = `${frist.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" })} kl. ${frist.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;

  const start = naivOsloTilTidspunkt(booking.startAt);
  const slutt = new Date(start.getTime() + booking.serviceType.durationMin * 60_000);

  return (
    <BookingKvittering
      bekreftet={booking.status === "CONFIRMED"}
      innlogget={Boolean(user)}
      epost={booking.guestEmail ?? user?.email ?? null}
      referanse={`#${booking.id.slice(-8)}`}
      tjeneste={booking.serviceType.name}
      varighetMin={booking.serviceType.durationMin}
      dato={dato}
      klokkeslett={tid}
      coach={booking.coach?.name ?? null}
      spiller={null}
      sted={booking.location.name}
      prisTekst={prisTekst}
      fristTekst={fristTekst}
      startIso={start.toISOString()}
      sluttIso={slutt.toISOString()}
    />
  );
}
