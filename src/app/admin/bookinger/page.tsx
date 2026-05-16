/**
 * Norsk alias for /admin/bookings.
 *
 * Hovedimplementasjonen ligger i `src/app/admin/bookings/page.tsx` og følger
 * V2-designet fra `wireframe/design-files-v2/final/04-bookinger.html`.
 * Denne ruten finnes så norske URL-er fungerer; ressursen er den samme.
 */
import { redirect } from "next/navigation";

export default function BookingerRedirect() {
  redirect("/admin/bookings");
}
