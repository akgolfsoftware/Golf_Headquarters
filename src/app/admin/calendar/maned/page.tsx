import { redirect } from "next/navigation";

/**
 * /admin/calendar/maned (gammel adresse) → /admin/kalender.
 * Måned-visningen finnes ikke i det nye kalender-treet ennå,
 * så aliaset peker på kalender-hovedsiden.
 */
export default function CalendarManedRedirect(): never {
  redirect("/admin/kalender");
}
