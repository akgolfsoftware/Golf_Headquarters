// PH23Booking «Book time» — Precision Athletics PH-23 (pakke 11).
/**
 * PlayerHQ · Book time (/portal/booking/ny).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «ny» (godkjent 14.10.2026).
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 *
 * Samme flyt som /portal/booking: «Bekreft booking» går til klipp-flyten eller Stripe Checkout (kort).
 * Spilleren sendes aldri ut av appen for å booke. Lenkene inn beholdes:
 *   ?service=<id eller slug> forhåndsvelger tjenesten (Coach-siden og eldre lenker),
 *   ?coachId=<id> velger coachens første tjeneste, ?betaling=1 (drop-in) åpner med kort.
 * ?dato= fra den gamle veiviseren brukes ikke: Book time viser de neste 14 dagene.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH23Booking } from "@/components/portal/precision/PH23Booking";
import { hentPH23Data } from "@/lib/portal-booking/ph23-side-data";
import { cancelBooking } from "@/app/portal/meg/bookinger/actions";
import { bekreftPH23BookingAction, flyttPH23Booking, hentPH23Slots } from "../ph23-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book time · AK Golf" };

type Props = {
  searchParams: Promise<{ service?: string; coachId?: string; betaling?: string }>;
};

export default async function NyBookingPage({ searchParams }: Props) {
  const { service, coachId, betaling } = await searchParams;
  const user = await requirePortalUser({ kreverTilgang: "TALENT", allow: ["PLAYER", "COACH", "ADMIN"] });
  if (user.role === "PARENT") redirect("/forelder");

  const bookingData = await hentPH23Data(user, { service, coachId });

  async function handleCancel(bookingId: string) {
    "use server";
    await cancelBooking(bookingId);
    return true;
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH23Booking
        initialData={bookingData}
        start="ny"
        startBetaling={betaling === "1" ? "Kort" : "Klipp"}
        onConfirmBooking={bekreftPH23BookingAction}
        onHentSlots={hentPH23Slots}
        onRescheduleBooking={flyttPH23Booking}
        onCancelBooking={handleCancel}
      />
    </PlayerHQSkall>
  );
}
