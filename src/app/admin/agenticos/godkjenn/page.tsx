import { redirect } from "next/navigation";

/**
 * /admin/agenticos/godkjenn → /admin/ko?fane=agentgodkjenn
 *
 * MASTERPLAN 15.1 (beslutning 6.9, «én inngang per funksjon»): seks kø-adresser
 * ble til én. Adressen består som redirect — ingen lenke noe sted skal brekke.
 */
export default function AgenticosGodkjennRedirect(): never {
  redirect("/admin/ko?fane=agentgodkjenn");
}
