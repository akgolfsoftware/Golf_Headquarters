/**
 * Kalender uke — /admin/kalender/uke
 *
 * Uke-visning av alle bookinger på tvers av spillere. Bruker den godkjente
 * WeekCalendar-komponenten (samme DNA som /admin/kalender) med ekte Prisma-data
 * via loadKalenderUke (src/lib/admin/kalender-uke-data.ts). Tomstate håndteres
 * i komponenten (Book første time).
 *
 * Navigasjon mellom uker via ?uke=YYYY-MM-DD (mandag).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { WeekCalendar } from "@/components/admin/kalender/week-calendar";
import { loadKalenderUke } from "@/lib/admin/kalender-uke-data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ uke?: string }>;

export default async function KalenderUkePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const { uke } = await searchParams;
  const props = await loadKalenderUke(uke);

  return <WeekCalendar {...props} />;
}
