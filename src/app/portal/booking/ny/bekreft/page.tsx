/**
 * Bekreft credit-booking (/portal/booking/ny/bekreft) — v2 (retning C),
 * Team G-A 17. juli 2026.
 *
 * RESTYLING ONLY av legacy-siden: samme guards, queries og ledig-sjekk
 * (isSlotStillAvailable) — kopiert uendret. Kun presentasjonen er ny
 * (V2Shell + BookingNyBekreftV2, som kaller createCreditBooking som før).
 * URL-kontrakten ?service=&start=&coach= er uendret.
 */

import { notFound, redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { kanBrukeCredits } from "@/lib/booking/credits-tilgang";
import { isSlotStillAvailable } from "@/lib/booking/availability";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  BookingNyBekreftV2,
  type BookingNyBekreftV2Data,
} from "@/components/portal/v2/BookingNyBekreftV2";

type Props = {
  searchParams: Promise<{ service?: string; start?: string; coach?: string }>;
};

export default async function BekreftCreditBookingPage({
  searchParams,
}: Props) {
  const { service: serviceSlug, start, coach: coachId } = await searchParams;

  if (!serviceSlug || !start || !coachId) notFound();

  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  if (
    !subscription ||
    !kanBrukeCredits(subscription) ||
    subscription.monthlyCredits === 0
  ) {
    redirect("/coaching");
  }
  if (subscription.creditsRemaining <= 0) {
    redirect("/portal/booking/ny");
  }

  const service = await prisma.serviceType.findUnique({
    where: { slug: serviceSlug },
  });
  if (!service || !service.active) notFound();

  const startAt = new Date(start);
  if (isNaN(startAt.getTime())) notFound();

  const coachUser = await prisma.user.findUnique({
    where: { id: coachId },
    select: { id: true, name: true },
  });
  if (!coachUser) notFound();

  // Sjekk slot fortsatt ledig — vis feilmelding hvis ikke
  const ledig = await isSlotStillAvailable(service.id, startAt, coachId);

  const dato = startAt.toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const klokkeslett = startAt.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const datoTid = `${dato.charAt(0).toUpperCase()}${dato.slice(1)} · ${klokkeslett}`;

  const saldoEtter = subscription.creditsRemaining - 1;

  const backHref = `/portal/booking/ny?service=${serviceSlug}&dato=${
    startAt.toISOString().split("T")[0]
  }`;

  const data: BookingNyBekreftV2Data = {
    serviceTypeId: service.id,
    coachId,
    startIso: startAt.toISOString(),
    backHref,
    ledig,
    rader: [
      { label: "Økt-type", verdi: service.name },
      { label: "Coach", verdi: coachUser.name ?? "Coach" },
      { label: "Dato/tid", verdi: datoTid },
      { label: "Varighet", verdi: `${service.durationMin} min` },
      { label: "Kostnad", verdi: "1 av månedens timer" },
    ],
    creditsRemaining: subscription.creditsRemaining,
    saldoEtter,
  };

  return (
    <V2Shell nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href={backHref}>Velg annen tid</TilbakeLenke>
      <BookingNyBekreftV2 data={data} />
    </V2Shell>
  );
}
