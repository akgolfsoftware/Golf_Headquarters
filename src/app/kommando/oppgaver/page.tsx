import { redirect } from "next/navigation";

/**
 * /kommando/oppgaver → /admin/agent-team (B8, 2026-07-16).
 * TaskList (opprett/fullfør/slett) er montert på /admin/agent-team ved siden
 * av ProjectList — ingen funksjonstap.
 */
export default function KommandoOppgaverRedirect(): never {
  redirect("/admin/agent-team");
}
