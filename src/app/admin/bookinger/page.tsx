/**
 * AG-06 Booking i Precision Athletics (bolk A4). Erstatter den tidligere
 * redirecten til /admin/kalender?lag=BOOKING (T7) — den fantes fordi det ikke
 * fantes noen egen bookingflate; nå gjør det det. Kalenderens BOOKING-lag i
 * /admin/kalender står urørt og viser fortsatt bookinger som hendelser der.
 *
 * Samme guard (ADMIN/COACH) og samme datakilder (Booking, ServiceType,
 * Location, User) som før. Fanen «Tjenester og pris» redigerer tjenestene
 * (bookingplanen steg 2); `?fane=tjenester` åpner den direkte.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentAG06Bookinger, hentAG06Tjenester, naaMs } from "./data";
import { hentBookingValg } from "@/app/admin/kalender/booking-actions";
import { AG06Booking, type AG06Props } from "@/components/admin/precision/AG06Booking";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AgencyOS" };

/** `?fane=tjenester` (fra den gamle /admin/services) og de interne fanenavnene. */
const FANER: Record<string, NonNullable<AG06Props["fane"]>> = {
  foresp: "bookinger", alle: "bookinger", bookinger: "bookinger", ny: "ny", tj: "tj", tjenester: "tj",
};

export default async function AdminBookingerPage({ searchParams }: { searchParams: Promise<{ fane?: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane } = await searchParams;
  const [bookinger, valg, tjenesteData] = await Promise.all([
    hentAG06Bookinger(user),
    hentBookingValg(),
    hentAG06Tjenester(),
  ]);

  return (
    <AG06Booking
      navn={user.name ?? "Coach"}
      bookinger={bookinger}
      valg={valg}
      tjenester={tjenesteData.tjenester}
      tjenesteValg={tjenesteData.valg}
      fane={fane ? FANER[fane] : undefined}
      naaMs={naaMs()}
    />
  );
}
