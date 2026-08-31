import { redirect } from "next/navigation";

/**
 * /admin/godkjenninger → /admin/ko?fane=godkjenninger
 *
 * MASTERPLAN 15.1 (beslutning 6.9, «én inngang per funksjon»): seks kø-adresser
 * ble til én. Adressen består som redirect — ingen lenke noe sted skal brekke.
 */
export default function GodkjenningerRedirect(): never {
  redirect("/admin/ko");
}
