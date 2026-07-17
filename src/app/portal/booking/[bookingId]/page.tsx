/**
 * PlayerHQ · Booking · Økt-detalj (/portal/booking/[bookingId]) — v2.
 * v2-port 17. juli 2026 (Team G-B): `BookingDetaljV2` erstatter legacy-siden,
 * ruten flyttet ut av (legacy). Auth + lese-query (findUnique m/ eierskaps-
 * sjekk `booking.userId !== user.id`) er uendret — kun presentasjonslaget er
 * nytt. Legacy-sidens hardkodede TIMELINE/MÅL/UTSTYR-plassholdere er SLETTET
 * (ærlig-data-prinsippet): kun ekte booking-felter vises. Datoformatering har
 * fått eksplisitt Europe/Oslo (gotcha: Vercel kjører UTC).
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, type StatusTone } from "@/components/v2";
import { BookingDetaljV2 } from "@/components/portal/v2/BookingDetaljV2";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ bookingId: string }>;
};

// Ekte booking-status → lesbar etikett (samme vokabular som Mine bookinger).
const STATUS_LABEL: Record<string, string> = {
  PENDING: "Behandler",
  CONFIRMED: "Bekreftet",
  CANCELLED: "Avbestilt",
  COMPLETED: "Gjennomført",
};

const STATUS_TONE: Record<string, StatusTone> = {
  PENDING: "warn",
  CONFIRMED: "lime",
  CANCELLED: "down",
  COMPLETED: "up",
};

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
}

export default async function OktDetalj({ params }: Props) {
  const { bookingId } = await params;
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: true,
      location: true,
    },
  });

  if (!booking || booking.userId !== user.id) notFound();

  const coach =
    booking.serviceType.coachUserId
      ? await prisma.user.findUnique({
          where: { id: booking.serviceType.coachUserId },
          select: { name: true },
        })
      : null;

  return (
    // Ingen eksplisitt aktiv-nøkkel: booking-hubben (/portal/booking) lar
    // V2Shell auto-utlede fra pathname — samme her.
    <V2Shell nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/bookinger">Mine bookinger</TilbakeLenke>
      <BookingDetaljV2
        data={{
          tjeneste: booking.serviceType.name,
          statusLabel: STATUS_LABEL[booking.status] ?? "Planlagt",
          statusTone: STATUS_TONE[booking.status] ?? "info",
          dato: formatDato(booking.startAt),
          tid: `${formatTid(booking.startAt)}–${formatTid(booking.endAt)}`,
          varighetMin: booking.serviceType.durationMin,
          sted: booking.location.name,
          coachNavn: coach?.name ?? null,
          notat: booking.notes,
        }}
      />
    </V2Shell>
  );
}
