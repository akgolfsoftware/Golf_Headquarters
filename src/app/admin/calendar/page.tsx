import { redirect } from "next/navigation";

/**
 * /admin/calendar (gammel adresse) → /admin/kalender.
 * Kalenderen er kanonisk på norsk adresse.
 */
export default function CalendarRedirect(): never {
  redirect("/admin/kalender");
}
