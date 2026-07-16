/**
 * Kalender måned — /admin/kalender/maned. v2-port 16. juli 2026.
 *
 * Måned-visning av alle bookinger på tvers av spillere. Bruker
 * MonthCalendarV2 med ekte Prisma-data via loadKalenderManed
 * (src/lib/admin/kalender-maned-data.ts). 6-rad grid med maks 3
 * event-piller per dag + "+N til"-overflow. Tomstate i komponenten.
 *
 * Navigasjon mellom måneder via ?mnd=YYYY-MM.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { MonthCalendarV2 } from "@/components/admin/v2/AdminKalenderManedV2";
import { loadKalenderManed } from "@/lib/admin/kalender-maned-data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ mnd?: string }>;

export default async function KalenderManedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { mnd } = await searchParams;
  const props = await loadKalenderManed(mnd);

  return <MonthCalendarV2 {...props} />;
}
