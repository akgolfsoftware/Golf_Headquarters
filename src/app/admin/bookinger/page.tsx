/**
 * AgencyOS booking-oversikt (/admin/bookinger).
 * Pixel-port av design-handover/agencyos/components-agency-bookings.html.
 *
 * Server Component med live Prisma-data via loadBookinger. Tittel-rad +
 * toolbar-filtre + inline ny-booking-form + dag-gruppert tabell + paginering.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { BookingerView } from "@/components/admin/bookinger/bookinger-view";
import { loadBookinger } from "@/lib/admin/bookinger-data";

export const dynamic = "force-dynamic";

export default async function BookingerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const props = await loadBookinger();

  return (
    <div className="mx-auto max-w-[1240px]">
      <BookingerView {...props} />
    </div>
  );
}
