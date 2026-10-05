// PH23MineBookinger — Precision Athletics PH-23.
/**
 * PlayerHQ · Mine bookinger (/portal/meg/bookinger).
 * Kilde: Claude Design Precision Athletics PH-23.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Booking } from "@/components/portal/precision/PH23Booking";
import { hentPH23Data } from "@/lib/portal-booking/ph23-side-data";
import { cancelBooking } from "./actions";
import { bekreftPH23BookingAction, flyttPH23Booking, hentPH23Slots } from "@/app/portal/booking/ph23-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mine bookinger · AK Golf" };

type Props = {
  searchParams: Promise<{ error?: string; state?: string }>;
};

export default async function MineBookingerPage({ searchParams }: Props) {
  const { state } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "INGEN", allow: ["PLAYER", "COACH", "ADMIN"] });

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
        onConfirmBooking={bekreftPH23BookingAction}
        onHentSlots={hentPH23Slots}
        onRescheduleBooking={flyttPH23Booking}
        onCancelBooking={handleCancel}
      />
    </PlayerHQSkall>
  );
}
