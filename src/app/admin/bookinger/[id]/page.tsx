/**
 * AgencyOS — Booking-detalj (/admin/bookinger/[id]) i Precision Athletics
 * (29.09.2026). To kolonner på desktop: detaljer til venstre, handlinger til
 * høyre. Samme guard (ADMIN/COACH) og samme oppslag som før; notFound() hvis
 * bookingen ikke finnes.
 *
 * Handlingene er de samme som i AG-06 (BookingHandlinger): bekreft, avvis med
 * utkast i Innboks, foreslå ny tid, trekk tilbake forslag og avlys med full
 * refusjon. Hver handling sjekker coachens scope på serveren.
 *
 * Tider er naiv Oslo-veggklokke (policy.ts) og formateres uten tidssone.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { AG06BookingDetalj, type AG06BookingDetaljData } from "@/components/admin/precision/AG06BookingDetalj";
import { coachBookingScope } from "@/lib/auth/booking-scope";
import { betaling } from "../data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AgencyOS" };

const p2 = (n: number) => String(n).padStart(2, "0");
const DATO_FMT = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const kl = (d: Date) => `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}`;
const kort = (d: Date) => `${p2(d.getUTCDate())}.${p2(d.getUTCMonth() + 1)}`;

type Props = { params: Promise<{ id: string }> };

export default async function AdminBookingDetaljPage({ params }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, ...coachBookingScope(user) },
    include: {
      user: { select: { id: true, name: true } },
      coach: { select: { name: true } },
      serviceType: { select: { name: true, durationMin: true } },
      facility: { select: { name: true } },
      location: { select: { name: true } },
    },
  });
  if (!booking) notFound();

  const pay = betaling(booking);
  const data: AG06BookingDetaljData = {
    id: booking.id,
    tjeneste: booking.serviceType.name,
    varighetMin: booking.serviceType.durationMin,
    status: booking.status,
    spiller: booking.user ? { id: booking.user.id, navn: booking.user.name ?? "Uten navn" } : null,
    gjest: booking.user ? null : { navn: booking.guestName, epost: booking.guestEmail, telefon: booking.guestPhone },
    coachNavn: booking.coach?.name ?? null,
    dato: stor(DATO_FMT.format(booking.startAt)),
    tid: `${kl(booking.startAt)}–${kl(booking.endAt)}`,
    sted: [booking.facility?.name, booking.location?.name].filter(Boolean).join(" · ") || "—",
    prisOre: booking.priceOre,
    betaling: pay,
    notat: booking.notes,
    opprettet: stor(new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "long", year: "numeric" }).format(booking.createdAt)),
    forslag: booking.proposedStartAt ? `${stor(DATO_FMT.format(booking.proposedStartAt))} ${kl(booking.proposedStartAt)}` : null,
    handling: {
      id: booking.id,
      who: booking.user?.name ?? booking.guestName ?? "Gjest",
      date: kort(booking.startAt),
      t: kl(booking.startAt),
      dato: `${booking.startAt.getUTCFullYear()}-${p2(booking.startAt.getUTCMonth() + 1)}-${p2(booking.startAt.getUTCDate())}`,
      st: booking.status === "PENDING" ? "Venter" : booking.status === "CANCELLED" ? "Avvist" : "Bekreftet",
      pay,
      harSpiller: booking.userId != null,
      forslag: booking.proposedStartAt ? `${kort(booking.proposedStartAt)} ${kl(booking.proposedStartAt)}` : null,
      guardian: booking.user ? null : (booking.guestEmail ?? booking.guestPhone ?? null),
    },
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side>
        <SideHode
          kicker={`Booking · ${data.dato}`}
          title={data.tjeneste}
          sub={`${data.tid} · ${data.sted}`}
          actions={<KnappLenke href="/admin/bookinger" variant="ghost">Til bookinger</KnappLenke>}
        />
        <AG06BookingDetalj data={data} />
      </Side>
    </AgencyOSSkall>
  );
}
