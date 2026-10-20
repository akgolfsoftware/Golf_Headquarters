import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";
export default async function MittTeamPage() {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"], kreverTilgang: "INGEN" });
  redirect("/portal/meg/deling");
}
