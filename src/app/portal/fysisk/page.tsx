// PlayerHQ (plan-hjelpere.html, «Sendes videre»): fysisk sendes til Fysisk program. Økta føres fra programmet.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PLAN_HJELPERE_VIDERESENDING } from "@/lib/portal/plan-hjelpere-videresending";

export default async function Videresend(): Promise<never> {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  redirect(PLAN_HJELPERE_VIDERESENDING["/portal/fysisk"]);
}
