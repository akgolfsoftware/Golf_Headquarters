/**
 * PH-23 Booking, kvittering (Precision Athletics, Claude Design 7d7c2994). Under: opprinnelig kommentar.
 * PlayerHQ · Booking bekreftet (/portal/booking/bekreftet?bookingId=…) — v2.
 * v2-port 17. juli 2026 (Team G-B): `BookingBekreftetV2` erstatter legacy-
 * siden, ruten flyttet ut av (legacy). Kvitteringsside etter credit-booking
 * (bekreft-form router.push-er hit). Uendret logikk: eierskaps-sjekk
 * (`booking.userId !== user.id` → notFound) og googleKalenderUrl()-
 * genereringen. COPY-FIKS: legacy-tittelen «Forespørsel sendt!» var uærlig —
 * credit-bookingen opprettes CONFIRMED, ny tittel er «Booking bekreftet».
 * Klokkeslett følger lagret veggklokke; ingen ekstra Oslo-konvertering av naive tider.
 */

import { naivOsloTilTidspunkt } from "@/lib/google-calendar-tid";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { kr, naivDatoLang, naivKlokke } from "@/lib/portal-booking/ph23-format";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Kvittering } from "@/components/portal/precision/PH23Booking";

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
    naivOsloTilTidspunkt(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
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

  const uleste = await hentUleste(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH23Kvittering
        data={{
          linje: `${booking.serviceType.name} · ${naivDatoLang(booking.startAt)} kl. ${naivKlokke(booking.startAt)}`,
          coachNavn: coach?.name ?? null,
          sted: booking.location.name,
          varighetMin: booking.serviceType.durationMin,
          betaling: booking.subscriptionId ? "Klipp" : kr(booking.priceOre),
          kalenderUrl: googleKalenderUrl(booking),
        }}
      />
    </PlayerHQSkall>
  );
}
