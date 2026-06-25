import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const metadata = {
  title: "Planlegge",
};

export default async function TrenRedirectPage() {
  await requirePortalUser();
  redirect("/portal/planlegge/workbench");
}