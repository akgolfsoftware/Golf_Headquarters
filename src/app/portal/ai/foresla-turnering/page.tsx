// PlayerHQ pakke 17 (utkast plan-hjelpere.html, 16.10.2026): turneringene velges i Turneringer.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function Videresend(): Promise<never> {
  // Rot-layouten krever bare innlogging; tilgangsnivået håndheves her, som før videresendingen.
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  redirect("/portal/tren/turneringer");
}
