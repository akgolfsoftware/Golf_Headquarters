// PlayerHQ pakke 17 (utkast plan-hjelpere.html, 16.10.2026): utviklingsplanen er Teknisk plan (PH-TP-01) og IUP.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function Videresend(): Promise<never> {
  // Rot-layouten krever bare innlogging; tilgangsnivået håndheves her, som før videresendingen.
  await requirePortalUser();
  redirect("/portal/tren/teknisk-plan");
}
