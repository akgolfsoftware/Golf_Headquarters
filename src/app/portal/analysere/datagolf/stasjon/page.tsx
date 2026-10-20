import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Bevar gammel lenke. D-19: DataGolf-referanser hører til Anders sitt interne analytikerrom. */
export default async function DatagolfStasjonPage(): Promise<never> {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");
  redirect("/portal/analysere/trackman");
}
