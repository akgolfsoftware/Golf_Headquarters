/**
 * PH-26 Utenfor banen utgår (IA 28.09.2026, docs/design-handoff/regler/skjermliste.md).
 * Fysisk trening ligger i Plan; venner og utfordringer ligger i Meg.
 * Den gamle adressen sender videre til Meg.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function UtenforBanenPage() {
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/meg");
}
