// PlayerHQ steg 1 (docs/planer/playerhq-alle-sider-nytt-design-2026-10-16.md): rangerer spilleren mot andre (28.09).
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function Videresend(): Promise<never> {
  // Rot-layouten krever bare innlogging; tilgangsnivået håndheves her, som før videresendingen.
  await requirePortalUser();
  redirect("/portal/analysere");
}
