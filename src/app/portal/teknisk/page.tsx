/**
 * /portal/teknisk — viste en demoplan med faste tall (27.09.2026). Spillerens
 * egen tekniske plan ligger under utviklingsplanen.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function TekniskRedirect() {
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/utviklingsplan");
}
