import { redirect } from "next/navigation";

/**
 * /admin/workspace/oppgaver → /admin/oppgaver?fane=tildelt
 * (B3 2026-07-12 pekte hit via /admin/handlingssenter; MASTERPLAN 15.2
 * gjorde handlingssenteret til en fane 30.08.2026).
 * To flater viste samme OppgaveCache (Notion-synk). Handlingssenteret er
 * kanonisk (v2, hastegrad-gruppert + detaljpanel). Det som IKKE flyttes med
 * var ikke ekte funksjon: «Ny oppgave» var en toast («bruk Notion») og
 * kalendervisningen fordelte oppgaver på ukedager etter listeindeks, ikke dato.
 */
export default function OppgaverRedirect(): never {
  redirect("/admin/oppgaver?fane=tildelt");
}
