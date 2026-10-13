// Én abonnementsvisning med bekreftede data, også fra Innstillinger.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innstillinger · PlayerHQ" };

export default async function InnstillingerPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");
  redirect("/portal/meg/abonnement");
}
