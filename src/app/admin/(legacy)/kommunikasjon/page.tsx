/**
 * /admin/kommunikasjon — utdatert kombinert hub. Var en ren launcher med 4
 * faner (Innboks / E-postmaler / Notion-prosjekter / Notion-oppgaver) der hver
 * fane bare lenket videre til en kanonisk rute som nå finnes hver for seg i nav.
 * Konsolidert 2026-06-28: redirecter til Innboks (de andre nås fra nav/Innboks).
 */
import { permanentRedirect } from "next/navigation";

export default function KommunikasjonRedirect() {
  permanentRedirect("/admin/innboks");
}
