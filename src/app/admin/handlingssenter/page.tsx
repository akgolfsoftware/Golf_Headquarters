import { redirect } from "next/navigation";

/**
 * /admin/handlingssenter → /admin/oppgaver?fane=tildelt
 *
 * MASTERPLAN 15.2 (beslutning 6.9, «én inngang per funksjon»): oppgave-adressene
 * ble til faner på /admin/oppgaver. Adressen består som redirect.
 */
export default function HandlingssenterRedirect(): never {
  redirect("/admin/oppgaver?fane=tildelt");
}
