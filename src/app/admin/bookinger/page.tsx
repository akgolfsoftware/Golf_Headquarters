/**
 * AG-06 Booking i Precision Athletics (bolk A4). Erstatter den tidligere
 * redirecten til /admin/kalender?lag=BOOKING (T7) — den fantes fordi det ikke
 * fantes noen egen bookingflate; nå gjør det det. Kalenderens BOOKING-lag i
 * /admin/kalender står urørt og viser fortsatt bookinger som hendelser der.
 *
 * Samme guard (ADMIN/COACH) og samme datakilder (Booking, ServiceType,
 * Location, User) som før.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentAG06Bookinger } from "./data";
import { hentBookingValg } from "@/app/admin/kalender/booking-actions";
import { AG06Booking } from "@/components/admin/precision/AG06Booking";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AgencyOS" };

export default async function AdminBookingerPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const [bookinger, valg] = await Promise.all([
    hentAG06Bookinger(user),
    hentBookingValg(),
  ]);

  return <AG06Booking navn={user.name ?? "Coach"} bookinger={bookinger} valg={valg} />;
}
