// PlayerHQ pakke 17b (plan-hjelpere.html): FYS-planene blir Fysisk program under Plan.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PLAN_HJELPERE_VIDERESENDING } from "@/lib/portal/plan-hjelpere-videresending";

export default async function Videresend(): Promise<never> {
  // Samme rollesperre som siden hadde før videresendingen.
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  redirect(PLAN_HJELPERE_VIDERESENDING["/portal/tren/fys-plan"]);
}
