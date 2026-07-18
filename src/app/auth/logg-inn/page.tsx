import { permanentRedirect } from "next/navigation";

/**
 * /auth/logg-inn — norsk stavemåte er den naturlige gjetningen (rutene er
 * ellers norske: logget-ut, samtykke-venter). Den ekte siden er engelsk
 * /auth/login (historisk navngiving). Redirect så adressen alltid virker,
 * uansett hvem som skriver den norske varianten.
 */
export default function LoggInnRedirect() {
  permanentRedirect("/auth/login");
}
