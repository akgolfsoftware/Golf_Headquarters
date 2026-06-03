/**
 * AgencyOS booking-oversikt (/admin/bookinger) — v10-design.
 *
 * Rendrer <Bookinger> (v10-fasit) med EKTE data fra loadBookinger (Prisma).
 * mapBookingerData oversetter loaderens BookingerViewProps → v10 BookingerData,
 * og bevarer tom-tilstander (tom periode → "ingen i perioden", tomme grupper).
 *
 * Server Component. Auth-guard via requirePortalUser (COACH/ADMIN).
 *
 * Bolk (3. juni): byttet fra BookingerView (eldre bespoke-port) til v10 Bookinger.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { Bookinger } from "@/components/admin/bookinger/bookinger";
import { loadBookinger } from "@/lib/admin/bookinger-data";
import { mapBookingerData } from "./map-bookinger-data";

export const dynamic = "force-dynamic";

export default async function BookingerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const props = await loadBookinger();

  return <Bookinger data={mapBookingerData(props)} />;
}
