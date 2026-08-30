import { redirect } from "next/navigation";

/**
 * /admin/tournaments/dubletter → /admin/ko?fane=dubletter
 *
 * MASTERPLAN 15.1 (beslutning 6.9, «én inngang per funksjon»): seks kø-adresser
 * ble til én. Adressen består som redirect — ingen lenke noe sted skal brekke.
 */
export default function DubletterRedirect(): never {
  redirect("/admin/ko?fane=dubletter");
}
