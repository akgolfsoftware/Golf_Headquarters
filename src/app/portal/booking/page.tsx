// PH23BookingHub — Precision Athletics PH-23.
/**
 * PlayerHQ Booking — oversikt og booking (/portal/booking).
 * Kilde: Claude Design Precision Athletics PH-23.
 *
 * Bare ekte data og ekte handlinger: «Bekreft booking» går til credit-flyten
 * (klipp) eller Stripe Checkout (kort), «Flytt time» til rescheduleBooking og
 * «Avbestill» til cancelBooking. Ingen demodata i denne ruten.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Booking } from "@/components/portal/precision/PH23Booking";
import { hentPH23Data } from "@/lib/portal-booking/ph23-side-data";
import { cancelBooking } from "@/app/portal/meg/bookinger/actions";
import { bekreftPH23BookingAction, flyttPH23Booking, hentPH23Slots } from "./ph23-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AK Golf" };

type Props = { searchParams: Promise<{ betalt?: string; avbrutt?: string; state?: string }> };

export default async function BookingHubPage({ searchParams }: Props) {
  const { state, betalt, avbrutt } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const bookingData = await hentPH23Data(user);

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
        betaling={betalt === "1" ? "betalt" : avbrutt === "1" ? "avbrutt" : undefined}
        onConfirmBooking={bekreftPH23BookingAction}
        onHentSlots={hentPH23Slots}
        onRescheduleBooking={flyttPH23Booking}
        onCancelBooking={handleCancel}
      />
    </PlayerHQSkall>
  );
}
