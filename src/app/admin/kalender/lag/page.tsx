/**
 * T7: `/admin/kalender/lag` var C3-flaten. Kalender-lagene bor nå på
 * `/admin/kalender` — behold bokmerket med redirect.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ uke?: string }>;

export default async function KalenderLagRedirect({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { uke } = await searchParams;
  permanentRedirect(uke ? `/admin/kalender?uke=${encodeURIComponent(uke)}` : "/admin/kalender");
}
