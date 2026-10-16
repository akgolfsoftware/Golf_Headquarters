/**
 * /portal/toppidrett — viste demoanalyse med faste tall (26.09.2026). Spillerens
 * egne tall ligger i Analyse.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function ToppidrettRedirect() {
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/analysere");
}
