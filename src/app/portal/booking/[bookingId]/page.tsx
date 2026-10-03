/**
 * PH23Detalj — én booking i PlayerHQSkall.
 * Samme eierskapssjekk. Kun ekte felter. Avbestilling følger samme frist.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { BookingDetaljV2 } from "@/components/portal/v2/BookingDetaljV2";
import { AVBESTILLING_FRIST_TIMER, hoursUntil } from "@/lib/booking/policy";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ bookingId: string }> };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Behandler",
  CONFIRMED: "Bekreftet",
  CANCELLED: "Avbestilt",
  COMPLETED: "Gjennomført",
};

const STATUS_TONE = {
  PENDING: "warn",
  CONFIRMED: "ok",
  CANCELLED: "signal",
  COMPLETED: "ok",
} as const;

function formatTid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
}

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default async function OktDetalj({ params }: Props) {
  const { bookingId } = await params;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  const [booking, ulest] = await Promise.all([
    prisma.booking.findUnique({ where: { id: bookingId }, include: { serviceType: true, location: true } }),
    getUnreadNotifications(user.id, 1),
  ]);

  if (!booking || booking.userId !== user.id) notFound();

  const timerTilStart = hoursUntil(booking.startAt);
  const coach = booking.serviceType.coachUserId
    ? await prisma.user.findUnique({ where: { id: booking.serviceType.coachUserId }, select: { id: true, name: true } })
    : null;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/meg/bookinger" className="ph-tilbake">Mine bookinger</Link>
        <BookingDetaljV2
          data={{
            bookingId: booking.id,
            tjeneste: booking.serviceType.name,
            statusLabel: STATUS_LABEL[booking.status] ?? "Planlagt",
            statusTone: STATUS_TONE[booking.status as keyof typeof STATUS_TONE] ?? "neutral",
            dato: formatDato(booking.startAt),
            tid: `${formatTid(booking.startAt)}–${formatTid(booking.endAt)}`,
            varighetMin: booking.serviceType.durationMin,
            sted: booking.location.name,
            stedId: booking.location.id,
            coachNavn: coach?.name ?? null,
            coachId: coach?.id ?? null,
            notat: booking.notes,
            kanAvbestille: (booking.status === "PENDING" || booking.status === "CONFIRMED") && timerTilStart > 0,
            kanFaaRefusjon: timerTilStart > AVBESTILLING_FRIST_TIMER,
          }}
        />
      </div>
    </PlayerHQSkall>
  );
}
