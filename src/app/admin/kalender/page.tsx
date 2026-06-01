/**
 * AgencyOS Kalender — uke-visning, lese-modus (/admin/kalender).
 *
 * Server Component med live booking-data via loadWeekCalendar. Coach ser uka i
 * ett blikk: 1-til-1 (lime), gruppe (forest) og live-økt (cream-gull).
 * Klikk på event åpner booking-detalj. Auth via canAccessMissionControl (ADMIN).
 *
 * Navigasjon mellom uker via ?uke=YYYY-MM-DD (mandag).
 */

import { redirect } from "next/navigation";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { WeekCalendar } from "@/components/admin/kalender/week-calendar";
import { loadWeekCalendar } from "@/lib/admin-kalender/week-data";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ uke?: string }>;

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await canAccessMissionControl();
  if (!user) redirect("/admin");

  const { uke } = await searchParams;
  const props = await loadWeekCalendar(uke);

  return <WeekCalendar {...props} />;
}
