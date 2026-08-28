/**
 * T7: booking-lista eies av Kalender som BOOKING-lag (KA-01).
 * Detalj (`[id]`) og ny booking (`/ny`) lever videre.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bookinger · AgencyOS" };

export default async function AdminBookingerRedirect() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  permanentRedirect("/admin/kalender?lag=BOOKING");
}
