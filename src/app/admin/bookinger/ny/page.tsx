/**
 * /admin/bookinger/ny — coachens bookingveiviser i Precision (AG-06-NY,
 * 29.09.2026). Erstatter NyBookingWizard (V2) med samme data og handlinger:
 * se src/app/admin/bookinger/ny-data.ts og AG06NyBooking.
 *
 * Adresseparametrene fra før virker fortsatt: ?groupId= (gruppebooking fra
 * gruppesiden), ?start= (trykk på tom kalenderluke) og ?coachId=.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { KnappLenke } from "@/components/precision/pa";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { AG06NyBooking } from "@/components/admin/precision/AG06NyBooking";
import { hentNyBookingData } from "../ny-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny booking · AgencyOS" };

export default async function NyBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ groupId?: string; start?: string; coachId?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { groupId, start, coachId } = await searchParams;
  const data = await hentNyBookingData(user);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side>
        <SideHode
          kicker="Booking · ny booking"
          title="Ny booking"
          sub={data.erAdmin ? "Team-booking: velg coach via tjenesten. Fasilitet er valgfritt." : "Book en spiller eller en gruppe. Fasilitet er valgfritt."}
          actions={<KnappLenke href="/admin/bookinger" variant="ghost">Til bookinger</KnappLenke>}
        />
        <AG06NyBooking data={data} startGruppeId={groupId} startTid={start} startCoachId={coachId} />
      </Side>
    </AgencyOSSkall>
  );
}
