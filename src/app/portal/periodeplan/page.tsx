/**
 * /portal/periodeplan — viste en demoplan med faste tall (27.09.2026). Spillerens
 * egen plan ligger i Plan.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function PeriodeplanRedirect() {
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/planlegge");
}
