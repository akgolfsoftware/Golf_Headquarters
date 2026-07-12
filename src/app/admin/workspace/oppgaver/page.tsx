import { redirect } from "next/navigation";

/**
 * /admin/workspace/oppgaver → /admin/handlingssenter (B3, 2026-07-12).
 * To flater viste samme OppgaveCache (Notion-synk). Handlingssenteret er
 * kanonisk (v2, hastegrad-gruppert + detaljpanel). Det som IKKE flyttes med
 * var ikke ekte funksjon: «Ny oppgave» var en toast («bruk Notion») og
 * kalendervisningen fordelte oppgaver på ukedager etter listeindeks, ikke dato.
 */
export default function OppgaverRedirect(): never {
  redirect("/admin/handlingssenter");
}
