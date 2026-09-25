/**
 * PlayerHQ Fysisk / Styrkeprogram — Precision Athletics standard.
 * 6-ukers bølgeperiodisering, baseløft, skivekalkulator og 1RM-estimat.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { StyrkeProgramView } from "@/components/portal/toppidrett/StyrkeProgramView";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fysisk trening · PlayerHQ" };

export default async function V2FysiskPreviewPage() {
  const user = await requirePortalUser({ kreverTilgang: "FULL" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  return (
    <V2Shell bredde="full" aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? "Spiller"} avatarUrl={user.avatarUrl}>
      <div className="max-w-5xl mx-auto py-4">
        <StyrkeProgramView />
      </div>
    </V2Shell>
  );
}

