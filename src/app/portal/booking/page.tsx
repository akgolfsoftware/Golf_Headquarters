// PH23BookingHub — Precision Athletics PH-23.
/**
 * PlayerHQ Booking — oversikt og booking (/portal/booking).
 * Kilde: Claude Design Precision Athletics PH-23.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Booking } from "@/components/portal/precision/PH23Booking";
import { mapHubDataToPH23, type PH23Service } from "@/lib/portal-booking/ph23-booking-data";
import { cancelBooking } from "@/app/portal/meg/bookinger/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AK Golf" };

type Props = { searchParams: Promise<{ betalt?: string; avbrutt?: string; state?: string }> };

export default async function BookingHubPage({ searchParams }: Props) {
  const { state } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const [hub, dbServices] = await Promise.all([
    getBookingHubData(user.id),
    prisma.serviceType.findMany({
      where: { active: true },
      include: { coach: { select: { id: true, name: true } } },
      orderBy: { durationMin: "asc" },
    }),
  ]);

  const services: PH23Service[] = dbServices.map((s) => ({
    id: s.id,
    name: s.name,
    min: s.durationMin,
    coach: s.coach?.name ?? null,
    coachId: s.coach?.id ?? null,
    clip: s.priceOre === 0 || hub.credits.canUseCredits,
    price: s.priceOre > 0 ? s.priceOre / 100 : null,
    note: s.description ?? undefined,
  }));

  const bookingData = mapHubDataToPH23(hub, user.email ?? "spiller@akgolf.test", services);

  async function handleCancel(bookingId: string) {
    "use server";
    await cancelBooking(bookingId);
    return true;
  }

  const visningsTilstand = state === "tom" ? "tom" : state === "feil" ? "feil" : state === "laster" ? "laster" : "data";

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH23Booking
        initialData={bookingData}
        state={visningsTilstand}
        onCancelBooking={handleCancel}
      />
    </PlayerHQSkall>
  );
}
