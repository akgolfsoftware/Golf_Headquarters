// PlayerHQ steg 1 (docs/planer/playerhq-alle-sider-nytt-design-2026-10-16.md): PH-02 utgår 28.09, slått sammen med I dag.
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function Videresend(): Promise<never> {
  // Rot-layouten krever bare innlogging; tilgangsnivået håndheves her, som før videresendingen.
  await requirePortalUser();
  redirect("/portal");
}
