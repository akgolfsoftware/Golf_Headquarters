import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Gammel adresse — TrackMan-lista bor under Analyse. */
export default async function TrackManListeRedirect(): Promise<never> {
  // Samme nivå som den gamle lista hadde (FULL) — undersidene [id]/gapping er
  // også FULL, så prefikset kan ikke på talent-allowlisten. TALENT når den nye
  // lista direkte via /portal/analysere/trackman.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/analysere/trackman");
}
