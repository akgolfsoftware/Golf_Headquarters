import { redirect } from "next/navigation";

/**
 * /admin/agenticos/ko → /admin/ko?fane=agentko
 *
 * MASTERPLAN 15.1 (beslutning 6.9, «én inngang per funksjon»): seks kø-adresser
 * ble til én. Adressen består som redirect — ingen lenke noe sted skal brekke.
 */
export default function AgenticosKoRedirect(): never {
  redirect("/admin/ko?fane=agentko");
}
