// Venner skjules til neste versjon (beslutninger.md §VENNER SKJULES TIL NESTE VERSJON, 16.10.2026).
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export default async function Videresend(): Promise<never> {
  // Rot-layouten krever bare innlogging; tilgangsnivået håndheves her, som før videresendingen.
  await requirePortalUser();
  redirect("/portal/meg");
}
