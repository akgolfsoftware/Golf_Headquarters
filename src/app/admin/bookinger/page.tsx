/**
 * AG-06 Booking i Precision Athletics (bolk A4). Samme guard (ADMIN/COACH) og
 * samme datakilder (Booking, ServiceType, Location, User) som før.
 *
 * 29.09.2026: detaljpanel i to kolonner, avlys med full refusjon, avvisning med
 * utkast i Innboks, flytteforslag, hele bookingveiviseren med betalingsvalg og
 * redigering av tjenester i et ark.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentAG06Bookinger, hentAG06Tjenester } from "./data";
import { hentNyBookingData } from "./ny-data";
import { AG06Booking } from "@/components/admin/precision/AG06Booking";

export const dynamic = "force-dynamic";
export const metadata = { title: "Booking · AgencyOS" };

type SearchParams = Promise<{ fane?: string }>;
const FANER = ["foresp", "alle", "ny", "tj"] as const;

export default async function AdminBookingerPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane } = await searchParams;
  const [bookinger, tjenester, nyBooking] = await Promise.all([
    hentAG06Bookinger(user),
    hentAG06Tjenester(),
    hentNyBookingData(user),
  ]);

  return (
    <AG06Booking
      navn={user.name ?? "Coach"}
      bookinger={bookinger}
      tjenester={tjenester}
      nyBooking={nyBooking}
      fane={(FANER as readonly string[]).includes(fane ?? "") ? (fane as (typeof FANER)[number]) : undefined}
    />
  );
}
