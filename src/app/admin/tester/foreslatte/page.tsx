import { redirect } from "next/navigation";

/**
 * /admin/tester/foreslatte → /admin/ko?fane=tester
 *
 * MASTERPLAN 15.1 (beslutning 6.9, «én inngang per funksjon»): seks kø-adresser
 * ble til én. Adressen består som redirect — ingen lenke noe sted skal brekke.
 */
export default function ForeslatteTesterRedirect(): never {
  redirect("/admin/ko?fane=tester");
}
