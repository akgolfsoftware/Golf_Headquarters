/**
 * PH-14 Tester i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «tester».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH14Tester.tsx.
 * Samme data som før: loadTesterScreen (spillerens testunivers, resultater og tildelinger).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { loadTesterScreen } from "@/lib/portal-tester/tester-data";
import { byggPH14 } from "@/lib/portal-tester/ph14-tester-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH14Tester } from "@/components/portal/precision/PH14Tester";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tester · PlayerHQ" };

export default async function TesterHubPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [screen, ulest] = await Promise.all([
    loadTesterScreen({ id: user.id, name: user.name, hcp: user.hcp, tier: user.tier }),
    getUnreadNotifications(user.id, 1),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH14Tester data={byggPH14(screen.groups.flatMap((g) => g.rows), new Date())} />
    </PlayerHQSkall>
  );
}
