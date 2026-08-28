import { redirect } from "next/navigation";

/**
 * /admin/calendar/maned (gammel adresse) → /admin/kalender måned.
 */
export default function CalendarManedRedirect(): never {
  redirect("/admin/kalender?visning=maned");
}
