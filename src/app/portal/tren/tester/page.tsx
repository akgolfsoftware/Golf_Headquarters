/**
 * PlayerHQ · Tren · Tester — pixel-perfekt port av Claude Design-handoff
 * docs/design-handoff/test-modul/tester-dashboard.html
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TesterDashboardScreen } from "@/components/test-modul-v2/tester-dashboard-screen";

export const dynamic = "force-dynamic";

export default async function TesterPage() {
  const user = await requirePortalUser();
  const initials =
    user.name
      ?.split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "??";

  return (
    <TesterDashboardScreen
      playerName={user.name ?? "Spiller"}
      playerInitials={initials}
      hcp={user.hcp ?? null}
      isPro={user.tier === "PRO"}
    />
  );
}
