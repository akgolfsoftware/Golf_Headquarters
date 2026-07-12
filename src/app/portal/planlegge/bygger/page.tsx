/**
 * v2 Plan-bygger — /portal/planlegge/bygger (under Plan-trykkpunktet).
 * 5-stegs wizard per godkjent mockup (ui_kits/v2/phq-plan-bygger, 10. juli):
 * Mål → Mal → Generer → Juster → Lagre. Erstatter legacy /portal/mal/bygger
 * som spillerens inngang; kjernene deles via src/lib/plan-builder/.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentByggerKontekstCore } from "@/lib/plan-builder";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { PlanByggerV2 } from "@/components/portal/v2/PlanByggerV2";
import { anbefalMalV2, genererPlanForslagV2, lagrePlanV2 } from "./actions";
import { TilbakeLenke } from "@/components/v2";

export const metadata = { title: "Plan-bygger — PlayerHQ" };

export default async function PlanByggerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  if (user.role === "GUEST") redirect("/admin/kalender");

  const kontekst = await hentByggerKontekstCore(user);

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name}>
      <TilbakeLenke href="/portal/planlegge">Plan</TilbakeLenke>
      <PlanByggerV2
        kontekst={kontekst}
        actions={{
          anbefalMal: anbefalMalV2,
          genererPlanForslag: genererPlanForslagV2,
          lagrePlan: lagrePlanV2,
        }}
      />
    </V2Shell>
  );
}
