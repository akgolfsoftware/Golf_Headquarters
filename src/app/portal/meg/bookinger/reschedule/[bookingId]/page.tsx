/**
 * Flytt time (/portal/meg/bookinger/reschedule/[bookingId]) — Precision Athletics PH-23
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-23.jsx, «Flytt time»).
 * Guards, 24-timersregelen og getAvailableSlots er uendret; bare visningen er ny.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/lib/booking/availability";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { dagerFremover, naivDatoKort, naivDatoLang, naivKlokke } from "@/lib/portal-booking/ph23-format";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Bytt } from "@/components/portal/precision/PH23Booking";

type Props = {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ dato?: string }>;
};

export default async function ReschedulePage({ params, searchParams }: Props) {
  const { bookingId } = await params;
  const { dato: datoParam } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: {
        select: {
          id: true,
          slug: true,
          name: true,
          durationMin: true,
        },
      },
      location: { select: { name: true } },
    },
  });
  if (!booking) notFound();

  const erStaff = user.role === "ADMIN" || user.role === "COACH";
  if (booking.userId !== user.id && !erStaff) notFound();

  // eslint-disable-next-line react-hooks/purity
  const tidTilStart = booking.startAt.getTime() - Date.now();
  if (!erStaff && tidTilStart <= 24 * 60 * 60 * 1000) {
    redirect("/portal/meg/bookinger?error=24t");
  }

  if (booking.status === "CANCELLED") {
    redirect("/portal/meg/bookinger?error=cancelled");
  }

  const valgtDato = parseDatoQuery(datoParam) ?? startOfDay(addDays(new Date(), 1));
  const slots = await getAvailableSlots(booking.serviceType.id, valgtDato);

  const uleste = await hentUleste(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH23Bytt
        tilstand="data"
        bookingId={booking.id}
        tjeneste={booking.serviceType.name}
        naaTekst={`${naivDatoLang(booking.startAt)} kl. ${naivKlokke(booking.startAt)}`}
        sted={booking.location.name}
        varighetMin={booking.serviceType.durationMin}
        dager={dagerFremover(14, valgtDato)}
        slots={slots.map((s) => ({ start: s.start.toISOString(), coachId: s.coachId, coachName: s.coachName, kl: naivKlokke(s.start), datoTid: `${naivDatoKort(s.start)} kl. ${naivKlokke(s.start)}` }))}
      />
    </PlayerHQSkall>
  );
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function parseDatoQuery(s?: string): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return startOfDay(d);
}
