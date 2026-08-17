// Mål for tilgangs-redirecten i requirePortalUser (plan T2): en TALENT-
// eller INGEN-bruker som treffer en låst flate lander her. Vi sender rett
// videre til oppgrader-flyten (én primær vei, færrest trykk — produktprinsipp)
// i stedet for å bygge en mellomside.

import { redirect } from "next/navigation";

export default function OppgraderPage() {
  redirect("/portal/meg/abonnement/oppgrader/flyt");
}
