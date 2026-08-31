import { redirect } from "next/navigation";

/**
 * /admin/agenticos/projects → /admin/jarvis?fane=prosjekter
 *
 * MASTERPLAN 15.5 (beslutning 6.9, «én inngang per funksjon»): fire
 * agenticos-adresser ble til én. Adressen består som redirect — ingen lenke
 * noe sted skal brekke.
 */
export default function AgenticosProjectsRedirect(): never {
  redirect("/admin/jarvis?fane=prosjekter");
}
