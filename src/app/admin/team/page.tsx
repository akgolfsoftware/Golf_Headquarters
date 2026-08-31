/**
 * /admin/team er FOLDET INN i Oppsett → «Tilgang»-fanen (MASTERPLAN 15.3,
 * tidligere T13 26.08.2026 mot /admin/settings?rad=tilgang — den fanen er nå
 * eget toppnivå i /admin/oppsett, ikke en rad i Akademi-hub-en).
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminTeamRedirect() {
  redirect("/admin/oppsett?fane=tilgang");
}
