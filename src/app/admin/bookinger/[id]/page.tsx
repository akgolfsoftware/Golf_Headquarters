/**
 * AgencyOS — Booking-detalj (/admin/bookinger/[id]), v2-design (retning C).
 *
 * Kalender (uke/måned), ukelista og admin-søket har alltid generert lenker
 * hit, men ruten fantes ikke (alle detaljklikk ga 404). Denne siden lukker
 * gapet: samme requirePortalUser-guard (ADMIN/COACH) som booking-lista og én
 * Prisma-oppslag med relasjonene lista allerede bruker. notFound() hvis
 * bookingen ikke finnes.
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminBookingDetaljV2,
  type AdminBookingDetaljV2Data,
  type BookingDetaljStatus,
} from "@/components/admin/v2/AdminBookingDetaljV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AgencyOS" };

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const KL_FMT = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });

function storForbokstav(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtPris(priceOre: number): string {
  const kr = priceOre / 100;
  return `${kr.toLocaleString("nb-NO", { maximumFractionDigits: 2 })} kr`;
}

type Props = { params: Promise<{ id: string }> };

export default async function AdminBookingDetaljPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      coach: { select: { name: true } },
      serviceType: { select: { name: true } },
      facility: { select: { name: true } },
      location: { select: { name: true } },
    },
  });
  if (!booking) notFound();

  const sted = [booking.facility?.name, booking.location?.name].filter(Boolean).join(" · ") || "—";

  const data: AdminBookingDetaljV2Data = {
    tjeneste: booking.serviceType.name,
    status: booking.status as BookingDetaljStatus,
    spiller: booking.user ? { id: booking.user.id, navn: booking.user.name ?? "Uten navn" } : null,
    gjest: booking.user
      ? null
      : { navn: booking.guestName, epost: booking.guestEmail, telefon: booking.guestPhone },
    coachNavn: booking.coach?.name ?? null,
    dato: storForbokstav(DATO_FMT.format(booking.startAt)),
    tid: `${KL_FMT.format(booking.startAt)}–${KL_FMT.format(booking.endAt)}`,
    sted,
    pris: fmtPris(booking.priceOre),
    notat: booking.notes,
    opprettet: storForbokstav(DATO_FMT.format(booking.createdAt)),
  };

  return (
    <V2Shell aktiv="bookinger" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminBookingDetaljV2 data={data} />
    </V2Shell>
  );
}
