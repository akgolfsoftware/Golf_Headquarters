/**
 * /portal/tren/fys-plan er et lag i Plan (PH-WB-FYS, IA 28.09.2026): Plan åpner
 * på neste fysiske økt og viser de fysiske planene under kalenderen.
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

export default async function FysPlanVideresending() {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  redirect("/portal/planlegge?lag=fys");
}
