/**
 * T7: måned-visningen er samlet i `/admin/kalender?visning=maned`.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ mnd?: string }>;

export default async function KalenderManedRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { mnd } = await searchParams;
  permanentRedirect(
    mnd
      ? `/admin/kalender?visning=maned&maaned=${encodeURIComponent(mnd)}`
      : "/admin/kalender?visning=maned",
  );
}
