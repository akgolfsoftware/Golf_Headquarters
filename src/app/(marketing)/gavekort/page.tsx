/**
 * /gavekort — kjøp av gavekort (bookingplanen steg 7, Anders 15.10.2026).
 * Samme åpning som innebygd booking: pauset for publikum til BOOKING_PUBLIC=true,
 * åpen for ADMIN for testing. Verdi i kroner, gjelder alle tjenester og alle coacher.
 */
import type { Metadata } from "next";
import { BOOKING_ACUITY_URL, kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { GavekortKjop } from "@/components/booking/precision/GavekortKjop";

export const metadata: Metadata = {
  title: "Gavekort · AK Golf Academy",
  description: "Gi bort en time hos AK Golf Academy. Du velger beløpet, mottakeren får koden på e-post.",
};

export default async function GavekortPage() {
  const apen = await kanBrukeInnebygdBooking();
  return <GavekortKjop apen={apen} acuityUrl={BOOKING_ACUITY_URL} />;
}
