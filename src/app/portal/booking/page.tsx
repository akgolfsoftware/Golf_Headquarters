/**
 * PlayerHQ · Booking-hub (/portal/booking) — hybrid design-port.
 *
 * Design-kilde: public/design-handover/prosjektgjennomgang-2026-06-17/
 *   prosjektgjennomgang-og-wireframing/project/PlayerHQ Booking (hybrid).dc.html
 *
 * Hybrid-mønster: editorial lyst øverst (hero + mini-kalender),
 * terminal data nedenfor (mine bookinger). Kalender er klient-interaktiv —
 * dag-klikk navigerer til /portal/booking/ny?dato=YYYY-MM-DD.
 *
 * Server Component: henter auth + hub-data via Prisma, sender til
 * klient-komponenten BookingHubHybrid som håndterer kalender-state.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBookingHubData } from "@/lib/portal-booking/hub-data";
import { BookingHubHybrid } from "@/components/portal/booking/booking-hub-hybrid";

export const metadata = {
  title: "Book økt · AK Golf",
};

export default async function BookingHubPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { credits, upcoming, past, coaches } = await getBookingHubData(user.id);

  return (
    <BookingHubHybrid
      userName={user.name}
      credits={credits}
      upcoming={upcoming}
      past={past}
      coaches={coaches}
    />
  );
}
