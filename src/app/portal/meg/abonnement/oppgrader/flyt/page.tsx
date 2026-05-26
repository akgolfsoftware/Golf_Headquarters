import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function OppgraderFlytPage() {
  await requirePortalUser();
  redirect("/portal/meg/abonnement/oppgrader");
}
