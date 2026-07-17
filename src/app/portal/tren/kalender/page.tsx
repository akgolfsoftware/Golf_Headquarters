import { redirect } from "next/navigation";

/**
 * /portal/tren/kalender (gammel adresse) → /portal/kalender.
 * Kalenderen er kanonisk på /portal/kalender; den gamle ukekalenderen
 * under Tren er erstattet av den nye kalender-flaten.
 */
export default function TrenKalenderRedirect(): never {
  redirect("/portal/kalender");
}
