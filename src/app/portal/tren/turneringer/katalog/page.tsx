import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";
export default async function TurneringskatalogPage() {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  redirect("/portal/tren/turneringer");
}
