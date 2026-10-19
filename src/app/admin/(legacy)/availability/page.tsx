/**
 * /admin/availability → Kalender › Tilgjengelighet (pakke 3, #1401).
 *
 * Alt den gamle siden gjorde, finnes nå i fanen (AG05Tilg + AG05GoogleSynk):
 * ukevinduer og dato-vinduer med sted, gyldighet og gjentakelse, hel uke på
 * én gang, fridager, buffer og Google Calendar-koblingen. Årsoversikten var
 * en tegning av de samme vinduene; gyldigheten står nå på hvert vindu.
 */
import { redirect } from "next/navigation";

export default function AvailabilityRedirect(): never {
  redirect("/admin/kalender?fane=tilg");
}
