/**
 * /admin/bookinger — CoachHQ bookings-oversikt (kanonisk URL).
 *
 * Implementasjonen ligger i `src/app/admin/bookings/page.tsx` av historiske
 * årsaker (subroutes som `/admin/bookings/ny` refereres fra mange steder i
 * kodebasen). Vi re-eksporterer den her slik at `/admin/bookinger` er den
 * kanoniske norske URL-en. `next.config.ts` redirects `/admin/bookings` hit.
 */

import BookingerImpl from "@/app/admin/bookings/page";

export const dynamic = "force-dynamic";

export default BookingerImpl;
