import { redirect } from "next/navigation";

/**
 * /admin/turnering-kart → /admin/turnering?fane=kart
 *
 * MASTERPLAN 15.6 (beslutning 6.9, «én inngang per funksjon»): fire
 * turnering-adresser ble til én. Adressen består som redirect.
 */
export default function TurneringKartRedirect(): never {
  redirect("/admin/turnering?fane=kart");
}
