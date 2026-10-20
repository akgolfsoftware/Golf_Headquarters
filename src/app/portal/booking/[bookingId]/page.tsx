// PH23BookingDetalj — Precision Athletics PH-23, nytt design (pakke 11).
/**
 * PlayerHQ · Bookingen (/portal/booking/[bookingId]).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «detalj».
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 * Eierskapssjekk og spørring som før (bare spillerens egen booking). Bare ekte felter vises.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23BookingDetalj, type PH23BookingDetaljData } from "@/components/portal/precision/PH23BookingDetalj";
import { AVBESTILLING_FRIST_TIMER, hoursUntil } from "@/lib/booking/policy";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ bookingId: string }>;
};

const STATUS: Record<string, PH23BookingDetaljData["status"]> = {
  PENDING: "Venter på betaling",
  CONFIRMED: "Bekreftet",
  CANCELLED: "Avbestilt",
  COMPLETED: "Gjennomført",
  NO_SHOW: "Uteblitt",
};

const tidFmt = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit" });
const dagFmt = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long" });
const stor = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function betalingTekst(b: {
  paymentMethod: string | null;
  subscriptionId: string | null;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
}): string | null {
  if (b.paymentMethod === "KLIPP" || (!b.paymentMethod && b.subscriptionId)) return "1 klipp";
  if (b.paymentMethod === "STRIPE" || (!b.paymentMethod && (b.stripeCheckoutSessionId || b.stripePaymentIntentId))) return "Kort";
  if (b.paymentMethod === "FAKTURA") return "Faktura";
  if (b.paymentMethod === "GRATIS") return "Gratis";
  return null;
}

export default async function OktDetalj({ params }: Props) {
  const { bookingId } = await params;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      serviceType: true,
      location: true,
    },
  });

  if (!booking || booking.userId !== user.id) notFound();

  const coachId = booking.coachId ?? booking.serviceType.coachUserId;
  const coach = coachId
    ? await prisma.user.findUnique({ where: { id: coachId }, select: { id: true, name: true } })
    : null;

  const timerTilStart = hoursUntil(booking.startAt);
  const aktiv = booking.status === "PENDING" || booking.status === "CONFIRMED";

  const data: PH23BookingDetaljData = {
    bookingId: booking.id,
    tjeneste: booking.serviceType.name,
    status: STATUS[booking.status] ?? "Bekreftet",
    dag: stor(dagFmt.format(booking.startAt)),
    klokkeslett: tidFmt.format(booking.startAt),
    tid: `${tidFmt.format(booking.startAt)}–${tidFmt.format(booking.endAt)}`,
    varighetMin: booking.serviceType.durationMin,
    sted: booking.location?.name ?? null,
    stedId: booking.location?.id ?? null,
    coachNavn: coach?.name ?? null,
    coachId: coach?.id ?? null,
    betaling: betalingTekst(booking),
    notat: booking.notes,
    kanAvbestille: aktiv && timerTilStart > 0,
    kanFlytte: aktiv && timerTilStart > AVBESTILLING_FRIST_TIMER,
    kanFaaRefusjon: timerTilStart > AVBESTILLING_FRIST_TIMER,
    avbestillingTimer: AVBESTILLING_FRIST_TIMER,
    // Et forslag gjelder en ny tid, så det vises uansett hvor nær den gamle tiden er.
    flytteforslag:
      booking.proposedStartAt && aktiv
        ? `${dagFmt.format(booking.proposedStartAt)} kl. ${tidFmt.format(booking.proposedStartAt)}`
        : null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH23BookingDetalj data={data} />
    </PlayerHQSkall>
  );
}
