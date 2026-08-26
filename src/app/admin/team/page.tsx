/**
 * /admin/team er FOLDET INN i Oppsett → «Tilgang og roller» (T13, 26.08.2026).
 *
 * Duplikatet mellom denne ruten og /admin/settings?tab=team (gammel Paper-
 * fane) er løst ved å samle begge i AdminOppsettHubTrainLock («Tilgang og
 * roller»-panelet i /admin/settings). Samme datakontrakt/spørring lever nå
 * i src/app/admin/settings/page.tsx.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function AdminTeamRedirect() {
  redirect("/admin/settings?rad=tilgang");
}
