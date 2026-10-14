import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

/** Gammel adresse — gapping bor i Stats › TrackMan › Alle køller (pakke 6). */
export default async function GappingRedirect(): Promise<never> {
  // Samme nivå som før (FULL): TrackMan-aliasene under /portal/mal er låst for gratisprofilen.
  await requirePortalUser({ kreverTilgang: "FULL" });
  redirect("/portal/analysere/trackman/koller");
}
