/**
 * /portal/talent → /portal/talent/mitt-niva (A1.2, 2026-08-18).
 *
 * Huben var en mellomside: den oppsummerte de fire underskjermene og la ett
 * trykk mellom spilleren og innholdet han var på vei til. Verre var det at
 * halve innholdet ikke var ekte — nivåstigen markerte «D» som spillerens nivå
 * uansett hvem som var logget inn, reisen Klubb→Tour var en fast oppslagstabell
 * per aldersnivå, og SG-percentilen var en grov lineær mapping skjermen selv
 * merket «pre-beta».
 *
 * Den var også den eneste talent-ruten UTEN `FEATURES.TALENT`-sjekk og uten
 * «ikke i programmet»-tilstand: en spiller utenfor talentprogrammet som skrev
 * adressen direkte fikk tomme ringer og et falskt nivå. Begge vaktene arves nå
 * gratis fra målskjermen.
 *
 * Fasiten (fase2/playerhq/playerhq-talent.html) tegner kun underskjermene —
 * huben er ikke tegnet, så den kunne ikke bygges ferdig uten å finne på design.
 * Manifestets vedtak er faner i én flate; til det er bygget er dette veien.
 *
 * Ikke tapt, men parkert: 14-dagers streak-varmekartet på den gamle huben var
 * ekte data og finnes ikke andre steder i appen. Implementasjonen ligger i
 * git-historikken (src/components/portal/v2/TalentV2.tsx, slettet her) og skal
 * hentes inn i «Mitt nivå» når talent-fanene bygges.
 */

import { redirect } from "next/navigation";

export default function TalentHubRedirect(): never {
  redirect("/portal/talent/mitt-niva");
}
