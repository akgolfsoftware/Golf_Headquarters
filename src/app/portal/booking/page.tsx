/**
 * PlayerHQ · Booking-hub (/portal/booking) — mobil-first 430px.
 *
 * HUB-en i bookingflyten: primær "Book"-CTA → /portal/booking/ny (ekte
 * credit-aware wizard), mine credits (ekte abonnement), kommende bookinger
 * (ekte prisma.booking) og book-direkte-med-coach (ekte coach-User).
 *
 * Wizard-stegene (ny, coach/[id], anlegg/[id]) er egne ruter — de eier
 * booking-flyt-actions. Denne siden samler bare inngangene.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { BookingHub } from "@/components/portal/booking/booking-hub";

export const metadata = {
  title: "Book økt · AK Golf",
};

export default async function BookingHubPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { credits, upcoming, past, coaches } = await getBookingHubData(user.id);

  return <BookingHub credits={credits} upcoming={upcoming} past={past} coaches={coaches} />;
}
