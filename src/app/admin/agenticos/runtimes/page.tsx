import { redirect } from "next/navigation";

/**
 * /admin/agenticos/runtimes → /admin/jarvis?fane=runtimes
 *
 * MASTERPLAN 15.5 (beslutning 6.9, «én inngang per funksjon»): fire
 * agenticos-adresser ble til én. Adressen består som redirect — ingen lenke
 * noe sted skal brekke.
 */
export default function AgenticosRuntimesRedirect(): never {
  redirect("/admin/jarvis?fane=runtimes");
}
