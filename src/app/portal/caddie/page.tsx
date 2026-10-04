import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

export default async function CaddieRedirectPage() {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  redirect("/portal/coach/ai");
}
