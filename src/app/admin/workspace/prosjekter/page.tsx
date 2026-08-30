import { redirect } from "next/navigation";

/**
 * /admin/workspace/prosjekter → /admin/oppgaver
 *
 * MASTERPLAN 15.2 (beslutning 6.9, «én inngang per funksjon»): oppgave-adressene
 * ble til faner på /admin/oppgaver. Adressen består som redirect.
 */
export default function WorkspaceProsjekterRedirect(): never {
  redirect("/admin/oppgaver");
}
