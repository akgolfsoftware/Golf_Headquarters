/**
 * /portal/planlegge — inngang til Workbench (låst IA: ett trykkpunkt).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

export default async function PlanleggePage() {
  const user = await requirePortalUser();

  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  redirect("/portal/planlegge/workbench");
}