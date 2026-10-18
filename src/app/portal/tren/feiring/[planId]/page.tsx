// PlayerHQ pakke 17b (plan-hjelpere.html): «feiring» blir «Perioden er ferdig», som vises for alle perioder.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PLAN_HJELPERE_VIDERESENDING } from "@/lib/portal/plan-hjelpere-videresending";

export default async function Videresend(): Promise<never> {
  await requirePortalUser();
  // Planen (4-ukersplan) har ingen periode; den sist avsluttede perioden åpnes.
  redirect(PLAN_HJELPERE_VIDERESENDING["/portal/tren/feiring/[planId]"]);
}
