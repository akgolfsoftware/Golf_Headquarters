/**
 * T7: booking-uka eies av Kalender (KA-01). Gammel tavle pensjoneres.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AgencyosUkaRedirect() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  permanentRedirect("/admin/kalender");
}
