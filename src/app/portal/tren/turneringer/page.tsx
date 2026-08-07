/**
 * PlayerHQ Turneringsplanlegger — i dag + fremtid.
 * Katalog, plan A/B/C, dobbel påmeldingsbekreftelse (spilleransvar).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  loadPlanleggerKatalog,
  loadMinTurneringsplan,
} from "@/lib/portal-turnering/planlegger-data";
import { TurneringPlanleggerV2 } from "@/components/portal/v2/TurneringPlanleggerV2";

export const dynamic = "force-dynamic";

export default async function TurneringerPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [katalog, minPlan] = await Promise.all([
    loadPlanleggerKatalog(user.id),
    loadMinTurneringsplan(user.id),
  ]);

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="analyse"
      nav={PLAYERHQ_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <TilbakeLenke href="/portal">Hjem</TilbakeLenke>
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <TurneringPlanleggerV2
          katalog={katalog}
          minPlan={minPlan}
          spillerNavn={user.name}
        />
      </div>
    </V2Shell>
  );
}
