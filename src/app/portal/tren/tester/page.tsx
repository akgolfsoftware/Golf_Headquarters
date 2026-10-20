/**
 * PH-14 Tester-oversikt: testbatteriet i designløftet 20.10.2026 (se PH14Tester.tsx).
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH14Tester.tsx.
 * Samme data som før: loadTesterScreen (spillerens testunivers, resultater og tildelinger).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { loadTesterScreen } from "@/lib/portal-tester/tester-data";
import { byggBatteri } from "@/lib/portal-tester/ph14-batteri-data";
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
      <PH14Tester data={byggBatteri(screen.groups.flatMap((g) => g.rows))} />
    </PlayerHQSkall>
  );
}
